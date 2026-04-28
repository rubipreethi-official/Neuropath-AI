// ─── DNS: fix SRV-only lookup via Google DNS (OS resolver handles everything else) ─
const dns = require('dns');
const { Resolver } = require('dns');
const _srvResolver = new Resolver();
_srvResolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const _origResolveSrv = dns.resolveSrv.bind(dns);
dns.resolveSrv = (hostname, cb) => _srvResolver.resolveSrv(hostname, cb);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8 // 100 MB payload limit for large resumes
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('file-pick-up', (data) => {
    socket.to(data.roomId).emit('file-picked-up', data);
  });
  
  socket.on('request-file-release', (data) => {
    socket.to(data.roomId).emit('file-released', data);
  });
});

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────────────────────
// In-memory scraper cache (legacy, kept for old routes)
// ─────────────────────────────────────────────────────────────────────────────
const scraperCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 min

function getCached(key) {
  const entry = scraperCache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) {
  scraperCache[key] = { data, timestamp: Date.now() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Multer — memory storage, 10 MB limit
// ─────────────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and .docx files are allowed'));
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared request headers for scraping (mimic browser)
// ─────────────────────────────────────────────────────────────────────────────
const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
};

// ─────────────────────────────────────────────────────────────────────────────
// LLM helpers — Gemini primary, NVIDIA Qwen fallback
// ─────────────────────────────────────────────────────────────────────────────
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY_QWEN;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── Gemini (primary) ─────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userMessage) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userMessage);
  return result.response.text();
}

// ── NVIDIA Qwen (fallback) ────────────────────────────────────────────────────
async function callNvidiaQwen(systemPrompt, userMessage, maxTokens = 2048) {
  const response = await axios.post(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.35,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 90000,
    }
  );
  return response.data.choices[0].message.content;
}

// ── Unified callLLM: tries Gemini first, falls back to NVIDIA ─────────────────
async function callLLM(systemPrompt, userMessage, maxTokens = 2048) {
  // Try Gemini first (free tier, reliable)
  if (GEMINI_API_KEY) {
    try {
      const text = await callGemini(systemPrompt, userMessage);
      return text;
    } catch (e) {
      console.warn('[LLM] Gemini failed, trying NVIDIA:', e.message);
    }
  }
  // Fallback to NVIDIA Qwen
  return callNvidiaQwen(systemPrompt, userMessage, maxTokens);
}

function safeParseJson(raw) {
  try {
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Connection
// ─────────────────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rubipreethi:preethi04@cluster0.jpityqm.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  dbName: 'neuropath_db',
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  family: 4,
  maxPoolSize: 5,
})
  .then(() => console.log('✅ Connected to MongoDB — neuropath_db'))
  .catch((err) => console.error('❌ MongoDB connection error (non-fatal):', err.message));

// ─────────────────────────────────────────────────────────────────────────────
// User Schema
// ─────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// ─────────────────────────────────────────────────────────────────────────────
// CareerData Schema — NEW — stores live-scraped+LLM-enriched career data
// ─────────────────────────────────────────────────────────────────────────────
const careerDataSchema = new mongoose.Schema({
  field: { type: String, required: true },
  fieldSlug: { type: String, required: true },
  courses: { type: Array, default: [] },
  scholarships: { type: Array, default: [] },
  institutions: { type: Array, default: [] },
  training: { type: Array, default: [] },
  liveLinks: { type: Array, default: [] },
  source: { type: String, default: 'llm' },
  enrichedAt: { type: Date, default: Date.now },
});

careerDataSchema.index({ fieldSlug: 1 }, { unique: true });
const CareerData = mongoose.model('CareerData', careerDataSchema);

// Helper: normalise field to a slug
function fieldSlug(field) {
  return field.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ENRICHMENT PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Step 1: Ask LLM to recommend the best public URLs to scrape for <field>.
 * Returns array of URL strings.
 */
async function getLLMRecommendedUrls(field) {
  const sys = 'You are a web research assistant. Return ONLY valid JSON, no markdown, no explanation.';
  const usr = `I need to find the LATEST information about career opportunities in: "${field}"

Return JSON with a list of real, currently working public URLs to scrape. Choose from:
- Coursera public search (https://www.coursera.org/search?query=...)
- edX search (https://www.edx.org/search?q=...)
- Unstop hackathons (https://unstop.com/hackathons?domain=...)
- Devpost hackathons (https://devpost.com/hackathons?search=...)
- National Scholarship Portal India (https://scholarships.gov.in/)
- AICTE scholarships (https://www.aicte-india.org/)
- Naukri jobs (https://www.naukri.com/${field.toLowerCase().replace(/\s+/g, '-')}-jobs)
- Google News RSS for this field (https://news.google.com/rss/search?q=${encodeURIComponent(field + ' courses scholarships 2025')})
- Reddit relevant subreddit (https://www.reddit.com/r/learnprogramming/search.json?q=${encodeURIComponent(field)}&sort=hot&limit=10)
- MIT OpenCourseWare (https://ocw.mit.edu/search/?q=${encodeURIComponent(field)})

Return exactly:
{
  "urls": [
    { "url": "https://...", "purpose": "courses|scholarships|jobs|training|news" }
  ]
}

Provide 6-8 URLs that are MOST LIKELY to have content for "${field}". Use real, properly encoded URLs.`;

  try {
    const raw = await callLLM(sys, usr, 1024);
    const parsed = safeParseJson(raw);
    if (parsed && Array.isArray(parsed.urls)) return parsed.urls;
  } catch (e) {
    console.warn('[getLLMRecommendedUrls] LLM failed:', e.message);
  }

  // Fallback: hardcoded reliable URLs
  const q = encodeURIComponent(field);
  return [
    { url: `https://www.coursera.org/search?query=${q}`, purpose: 'courses' },
    { url: `https://www.edx.org/search?q=${q}`, purpose: 'courses' },
    { url: `https://unstop.com/hackathons?domain=${q}`, purpose: 'training' },
    { url: `https://scholarships.gov.in/`, purpose: 'scholarships' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(field + ' scholarship 2025')}`, purpose: 'scholarships' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(field + ' online course 2025')}`, purpose: 'courses' },
    { url: `https://www.reddit.com/r/learnprogramming/search.json?q=${q}&sort=hot&limit=8`, purpose: 'training' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent('site:quora.com ' + field + ' courses best')}`, purpose: 'reviews' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent('site:twitter.com OR site:x.com ' + field + ' trends 2025')}`, purpose: 'news' },
    { url: `https://ocw.mit.edu/search/?q=${q}`, purpose: 'courses' },
  ];
}

/**
 * Step 2: Fetch each URL and extract raw text + links using Cheerio.
 * Returns combined raw context string.
 */
async function fetchAndExtractText(urlItems) {
  const snippets = [];

  await Promise.all(
    urlItems.map(async ({ url, purpose }) => {
      try {
        const resp = await axios.get(url, {
          headers: {
            ...SCRAPE_HEADERS,
            // Reddit JSON API needs no special auth
            ...(url.includes('reddit.com') ? { Accept: 'application/json' } : {}),
          },
          timeout: 12000,
          maxRedirects: 3,
        });

        let text = '';
        const ct = resp.headers['content-type'] || '';

        if (url.includes('reddit.com') && url.endsWith('.json')) {
          // Reddit JSON response
          try {
            const posts = resp.data?.data?.children || [];
            const titles = posts.slice(0, 8).map(p => p.data?.title || '').filter(Boolean);
            text = titles.join('\n');
          } catch { text = ''; }

        } else if (ct.includes('xml') || url.includes('rss') || url.includes('/rss')) {
          // Google News RSS — parse XML for titles
          const $ = cheerio.load(resp.data, { xmlMode: true });
          const items = [];
          $('item').each((_, el) => {
            const title = $(el).find('title').text().trim();
            const link = $(el).find('link').text().trim();
            if (title) items.push(`${title} — ${link}`);
          });
          text = items.slice(0, 12).join('\n');

        } else {
          // HTML — extract meaningful text
          const $ = cheerio.load(resp.data);
          $('script, style, nav, footer, header, aside, iframe, noscript').remove();

          const candidates = [];

          // Course-card selectors (Coursera, edX, OCW style)
          $('h1, h2, h3, h4, .course-title, .card-title, [class*="title"], [class*="course"], [class*="scholar"], [class*="program"]').each((_, el) => {
            const t = $(el).text().trim();
            if (t.length > 10 && t.length < 200) candidates.push(t);
          });

          // Link texts
          $('a').each((_, el) => {
            const href = $(el).attr('href') || '';
            const t = $(el).text().trim();
            if (t.length > 15 && t.length < 150 && (href.startsWith('http') || href.startsWith('/'))) {
              candidates.push(`LINK: ${t} → ${href.startsWith('http') ? href : url + href}`);
            }
          });

          text = candidates.slice(0, 40).join('\n');
        }

        if (text.trim().length > 20) {
          snippets.push(`=== SOURCE: ${url} (${purpose.toUpperCase()}) ===\n${text.slice(0, 1500)}`);
          console.log(`  ✓ Scraped ${url} — got ${text.length} chars`);
        } else {
          console.log(`  ✗ Scraped ${url} — empty/JS-rendered`);
        }
      } catch (e) {
        console.warn(`  ✗ Fetch failed for ${url}: ${e.message}`);
      }
    })
  );

  return snippets.join('\n\n');
}

/**
 * Step 3a: Community fallback — Reddit/Quora search pages for field.
 * Called if direct scraping yielded < 500 chars.
 */
async function fetchCommunityFallback(field) {
  const q = encodeURIComponent(field);
  const communityUrls = [
    { url: `https://www.reddit.com/search.json?q=${encodeURIComponent(field + ' courses scholarships')}&sort=hot&type=link&limit=10`, purpose: 'community' },
    { url: `https://www.reddit.com/r/learnprogramming/search.json?q=${q}&sort=relevance&limit=8`, purpose: 'community' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(field + ' best course 2025 india')}`, purpose: 'news' },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(field + ' scholarship 2025 apply')}`, purpose: 'news' },
  ];
  console.log('  ↪ Trying community fallback (Reddit/Google News RSS)…');
  return fetchAndExtractText(communityUrls);
}

/**
 * Step 4: LLM synthesises all scraped text into structured career data JSON.
 * Falls back to LLM knowledge if scraped text is insufficient.
 */
async function llmSynthesise(field, scrapedContext, sourceLabel) {
  const hasRealData = scrapedContext.trim().length > 200;

  const sys = 'You are Neuro, an expert career data assistant for Neuropath AI. Return ONLY valid JSON — no markdown, no explanation.';

  const contextSection = hasRealData
    ? `Here is LIVE data scraped from the internet right now:\n\n${scrapedContext.slice(0, 5000)}\n\nUse this data as your PRIMARY source.`
    : `Note: Live scraping returned limited data. Use your up-to-date knowledge to fill in the gaps.`;

  const usr = `Field: "${field}"

${contextSection}

Generate a comprehensive career guidance JSON for someone interested in "${field}". Include REAL, verifiable names and working links where possible. Prioritise courses and scholarships relevant to India but include global options too.

Return EXACTLY this JSON structure:
{
  "courses": [
    {
      "name": "Course name",
      "platform": "Platform/institution name",
      "link": "https://real-working-url.com/course",
      "mode": "online",
      "duration": "e.g. 6 weeks",
      "description": "1 sentence description"
    }
  ],
  "scholarships": [
    {
      "title": "Scholarship name",
      "source": "Organization name",
      "description": "What it offers",
      "amount": "Amount in INR or USD",
      "deadline": "Month Year or 'Check website'",
      "link": "https://scholarship-url.com"
    }
  ],
  "institutions": [
    {
      "name": "Institution name",
      "location": "City, Country",
      "type": "university/institute/online",
      "link": "https://institution-url.com"
    }
  ],
  "training": [
    {
      "title": "Program/hackathon/bootcamp name",
      "provider": "Provider name",
      "type": "online",
      "duration": "e.g. 3 months",
      "link": "https://program-url.com",
      "description": "1 sentence"
    }
  ],
  "liveLinks": [
    {
      "title": "Link title",
      "url": "https://...",
      "category": "course|scholarship|job|hackathon|news"
    }
  ]
}

Requirements:
- courses: 6 items minimum
- scholarships: 5 items minimum (include Indian govt. scholarships like NSP, AICTE, Pragati where relevant)
- institutions: 6 items minimum (include IITs, NITs, or reputed global unis for ${field})
- training: 5 items minimum (hackathons, bootcamps, competitions)
- liveLinks: 8 trending/current resource links for ${field}
- ALL links must be real working URLs (no placeholder #)
- Current year context: 2025-2026`;

  try {
    const raw = await callLLM(sys, usr, 3072);
    const parsed = safeParseJson(raw);
    if (parsed && parsed.courses) return { data: parsed, source: hasRealData ? sourceLabel : 'llm' };
  } catch (e) {
    console.warn('[llmSynthesise] Parse error:', e.message);
  }

  // Final safety net — very minimal structure
  return {
    data: {
      courses: [],
      scholarships: [],
      institutions: [],
      training: [],
      liveLinks: [],
    },
    source: 'llm_error',
  };
}

/**
 * Master enrichment function — runs the full 3-tier pipeline:
 *   Tier 1: Direct scrape LLM-recommended URLs
 *   Tier 2: Community fallback (Reddit/Google News RSS)
 *   Tier 3: Pure LLM knowledge
 */
async function runEnrichmentPipeline(field) {
  console.log(`\n🔍 [Enrich] Starting pipeline for field: "${field}"`);

  // ── Tier 1: LLM recommends URLs → Axios fetch → Cheerio extract ──────────
  console.log('  [Tier 1] Fetching LLM-recommended URLs…');
  const recommendedUrls = await getLLMRecommendedUrls(field);
  console.log(`  [Tier 1] Got ${recommendedUrls.length} URLs to scrape`);

  let scrapedContext = await fetchAndExtractText(recommendedUrls);
  let sourceLabel = 'scrape+llm';

  // ── Tier 2: Community fallback if direct scrape was thin ─────────────────
  if (scrapedContext.trim().length < 500) {
    console.log('  [Tier 1] Insufficient data, moving to Tier 2 (community)…');
    const communityContext = await fetchCommunityFallback(field);
    scrapedContext = (scrapedContext + '\n\n' + communityContext).trim();
    sourceLabel = 'community+llm';
  }

  // ── Tier 3: Pure LLM if community also thin ───────────────────────────────
  if (scrapedContext.trim().length < 200) {
    console.log('  [Tier 2] Still insufficient, falling back to pure LLM knowledge…');
    sourceLabel = 'llm';
  }

  console.log(`  [Synthesise] Context length: ${scrapedContext.length} chars. Source: ${sourceLabel}`);

  // ── Step 4: LLM synthesises to structured JSON ───────────────────────────
  const { data, source } = await llmSynthesise(field, scrapedContext, sourceLabel);

  console.log(`  ✅ Enriched: ${data.courses?.length || 0} courses, ${data.scholarships?.length || 0} scholarships, ${data.institutions?.length || 0} institutions, ${data.training?.length || 0} training, ${data.liveLinks?.length || 0} links`);

  return { ...data, source };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING USER ROUTES (preserved exactly)
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/users', async (req, res) => {
  try {
    const { uid, name, email } = req.body;
    if (!uid || !name || !email) return res.status(400).json({ error: 'Missing required fields' });
    let user = await User.findOne({ uid });
    if (user) {
      user.lastLogin = new Date();
      await user.save();
      return res.json({ message: 'User login updated', user });
    }
    user = new User({ uid, name, email });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/users/:uid/login', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { lastLogin: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Login time updated', user });
  } catch (error) {
    console.error('Error updating login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Neuropath API is running' });
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW ROUTE: POST /api/career/enrich
// Triggers the full 3-tier enrichment pipeline and stores result in MongoDB.
// Called as fire-and-forget from frontend when user submits their passion.
// ═════════════════════════════════════════════════════════════════════════════
app.post('/api/career/enrich', async (req, res) => {
  const field = (req.body.field || '').trim();
  if (!field) return res.status(400).json({ error: 'field is required in request body' });

  const slug = fieldSlug(field);

  // Check if we have a fresh record (< 6 hours)
  try {
    const existing = await CareerData.findOne({ fieldSlug: slug });
    if (existing) {
      const ageMs = Date.now() - new Date(existing.enrichedAt).getTime();
      if (ageMs < 6 * 60 * 60 * 1000) {
        console.log(`[Enrich] Cache HIT for "${field}" (${Math.round(ageMs / 60000)} min old)`);
        return res.json({
          message: 'Using cached enrichment (< 6 hours old)',
          field,
          source: existing.source,
          enrichedAt: existing.enrichedAt,
          fromCache: true,
        });
      }
    }
  } catch (e) {
    console.warn('[Enrich] Cache check failed:', e.message);
  }

  // Acknowledge immediately — pipeline runs asynchronously
  res.json({ message: 'Enrichment pipeline started', field, status: 'processing' });

  // Run pipeline in background (don't block the response)
  setImmediate(async () => {
    try {
      const enriched = await runEnrichmentPipeline(field);

      // Upsert into MongoDB
      await CareerData.findOneAndUpdate(
        { fieldSlug: slug },
        {
          field,
          fieldSlug: slug,
          courses: enriched.courses || [],
          scholarships: enriched.scholarships || [],
          institutions: enriched.institutions || [],
          training: enriched.training || [],
          liveLinks: enriched.liveLinks || [],
          source: enriched.source || 'llm',
          enrichedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`✅ [Enrich] Saved career data for "${field}" to MongoDB`);
    } catch (e) {
      console.error(`❌ [Enrich] Pipeline failed for "${field}":`, e.message);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NEW ROUTE: GET /api/career/data?field=<field>
// Returns career data from MongoDB. If stale (> 6h) or missing, triggers
// enrichment and waits for it (synchronous path for frontend data fetching).
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/career/data', async (req, res) => {
  const field = (req.query.field || '').trim();
  if (!field) return res.status(400).json({ error: 'field query param required' });

  const slug = fieldSlug(field);

  // Try MongoDB first
  try {
    const existing = await CareerData.findOne({ fieldSlug: slug });
    if (existing) {
      const ageMs = Date.now() - new Date(existing.enrichedAt).getTime();
      // Ensure we don't serve failed/empty data, and cache for 24 hours
      if (ageMs < 24 * 60 * 60 * 1000 && existing.source !== 'llm_error' && existing.courses.length > 0) {
        console.log(`[CareerData] Serving from DB for "${field}" (${Math.round(ageMs / 60000)} min old)`);
        return res.json({
          field: existing.field,
          courses: existing.courses,
          scholarships: existing.scholarships,
          institutions: existing.institutions,
          training: existing.training,
          liveLinks: existing.liveLinks,
          source: existing.source,
          enrichedAt: existing.enrichedAt,
          fromCache: true,
        });
      }
      console.log(`[CareerData] Stale record for "${field}" — re-enriching…`);
    } else {
      console.log(`[CareerData] No record for "${field}" — enriching now…`);
    }
  } catch (e) {
    console.warn('[CareerData] DB lookup failed:', e.message);
  }

  // Run pipeline synchronously (frontend is waiting)
  try {
    const enriched = await runEnrichmentPipeline(field);

    // Save to MongoDB
    try {
      await CareerData.findOneAndUpdate(
        { fieldSlug: slug },
        {
          field,
          fieldSlug: slug,
          courses: enriched.courses || [],
          scholarships: enriched.scholarships || [],
          institutions: enriched.institutions || [],
          training: enriched.training || [],
          liveLinks: enriched.liveLinks || [],
          source: enriched.source || 'llm',
          enrichedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`✅ [CareerData] Saved fresh data for "${field}"`);
    } catch (e) {
      console.warn('[CareerData] DB save failed (returning data anyway):', e.message);
    }

    return res.json({
      field,
      courses: enriched.courses || [],
      scholarships: enriched.scholarships || [],
      institutions: enriched.institutions || [],
      training: enriched.training || [],
      liveLinks: enriched.liveLinks || [],
      source: enriched.source || 'llm',
      enrichedAt: new Date(),
      fromCache: false,
    });
  } catch (e) {
    console.error('[CareerData] Full pipeline error:', e.message);
    return res.status(500).json({ error: 'Failed to fetch career data', details: e.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// EXISTING ROUTE A — GET /api/scrape/courses?field=<field> (PRESERVED)
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/scrape/courses', async (req, res) => {
  const field = (req.query.field || '').trim();
  if (!field) return res.status(400).json({ error: 'field query param required' });

  const cacheKey = `courses_${field.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ courses: cached, source: 'cache' });

  const courses = [];

  try {
    const { data } = await axios.get('https://nptel.ac.in/courses', { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes(field.toLowerCase()) && courses.length < 4) {
        const link = $(el).closest('a').attr('href') || 'https://nptel.ac.in/courses';
        courses.push({ name: text, platform: 'NPTEL', link: link.startsWith('http') ? link : `https://nptel.ac.in${link}`, mode: 'online' });
      }
    });
  } catch (e) { console.warn('NPTEL scrape failed:', e.message); }

  try {
    const { data } = await axios.get('https://swayam.gov.in/explorer', { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('h4, h3, .card-title').each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes(field.toLowerCase()) && courses.length < 6) {
        const link = $(el).closest('a').attr('href') || 'https://swayam.gov.in';
        courses.push({ name: text, platform: 'Swayam', link: link.startsWith('http') ? link : `https://swayam.gov.in${link}`, mode: 'online' });
      }
    });
  } catch (e) { console.warn('Swayam scrape failed:', e.message); }

  try {
    const { data } = await axios.get(`https://ocw.mit.edu/search/?q=${encodeURIComponent(field)}`, { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('h3.course-title, h2.course-title, .search-results h3, .course-card h3').each((_, el) => {
      const text = $(el).text().trim();
      const link = $(el).closest('a').attr('href') || '';
      if (text && courses.length < 8) {
        courses.push({ name: text, platform: 'MIT OpenCourseWare', link: link.startsWith('http') ? link : `https://ocw.mit.edu${link}`, mode: 'online' });
      }
    });
  } catch (e) { console.warn('MIT OCW scrape failed:', e.message); }

  if (courses.length < 3) {
    try {
      const raw = await callNvidiaQwen(
        'You are an expert career data assistant. Return ONLY valid JSON, no markdown.',
        `Generate 6 real online courses for the field "${field}". Return JSON: {"courses":[{"name":"Course Name","platform":"Platform Name","link":"https://platform.com/course","mode":"online"}]}`
      );
      const parsed = safeParseJson(raw);
      const llmCourses = parsed?.courses || [];
      for (const lc of llmCourses) {
        if (!courses.find(c => c.name.toLowerCase() === lc.name.toLowerCase())) courses.push(lc);
        if (courses.length >= 8) break;
      }
    } catch { /* ignore */ }
  }

  const result = courses.slice(0, 8);
  setCache(cacheKey, result);
  res.json({ courses: result, source: 'scrape+llm' });
});

// ═════════════════════════════════════════════════════════════════════════════
// EXISTING ROUTE B — GET /api/scrape/scholarships?field=<field> (PRESERVED)
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/scrape/scholarships', async (req, res) => {
  const field = (req.query.field || '').trim();
  if (!field) return res.status(400).json({ error: 'field query param required' });

  const cacheKey = `scholarships_${field.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ scholarships: cached, source: 'cache' });

  const scholarships = [];

  try {
    const { data } = await axios.get('https://scholarships.gov.in/', { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('a').each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes('scholarship') && text.length > 15 && scholarships.length < 4) {
        scholarships.push({ title: text, source: 'National Scholarship Portal', description: `Government scholarship listed on scholarships.gov.in`, amount: 'Varies', deadline: 'Check portal' });
      }
    });
  } catch (e) { console.warn('Scholarships.gov.in scrape failed:', e.message); }

  const hardcoded = [
    { title: `National Means-cum-Merit Scholarship (${field})`, source: 'Ministry of Education, Govt. of India', description: `Financial assistance for meritorious students pursuing ${field}-related studies`, amount: '₹12,000/year', deadline: 'October 31, 2025' },
    { title: 'Post Matric Scholarship for SC/ST/OBC', source: 'Ministry of Social Justice', description: 'Support for students from reserved categories in any accredited course', amount: 'Up to ₹1,20,000/year', deadline: 'November 30, 2025' },
    { title: `Pragati Scholarship for Girls — ${field}`, source: 'AICTE', description: `For girl students pursuing ${field} in AICTE-approved institutions`, amount: '₹50,000/year', deadline: 'December 15, 2025' },
    { title: 'Prime Minister Scholarship Scheme', source: 'Ministry of Home Affairs', description: 'Scholarship for wards of ex-servicemen pursuing professional courses', amount: '₹36,000/year', deadline: 'October 15, 2025' },
  ];

  const merged = [...scholarships];
  for (const hc of hardcoded) {
    if (!merged.find(s => s.title.toLowerCase().includes(hc.title.toLowerCase().slice(0, 20)))) merged.push(hc);
  }

  if (merged.length < 4) {
    try {
      const raw = await callNvidiaQwen(
        'You are an expert career data assistant. Return ONLY valid JSON, no markdown.',
        `Generate 4 real scholarships relevant to the field "${field}" in India or globally. Return JSON: {"scholarships":[{"title":"...","source":"...","description":"...","amount":"...","deadline":"..."}]}`
      );
      const parsed = safeParseJson(raw);
      for (const ls of parsed?.scholarships || []) {
        if (!merged.find(s => s.title === ls.title)) merged.push(ls);
      }
    } catch { /* ignore */ }
  }

  const result = merged.slice(0, 8);
  setCache(cacheKey, result);
  res.json({ scholarships: result, source: 'scrape+hardcoded' });
});

// ═════════════════════════════════════════════════════════════════════════════
// EXISTING ROUTE C — GET /api/scrape/training?field=<field> (PRESERVED)
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/scrape/training', async (req, res) => {
  const field = (req.query.field || '').trim();
  if (!field) return res.status(400).json({ error: 'field query param required' });

  const cacheKey = `training_${field.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ programs: cached, source: 'cache' });

  const programs = [];

  try {
    const { data } = await axios.get('https://unstop.com/competitions', { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('h3, h2, .opportunity-title, .card-title').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).closest('a').attr('href') || 'https://unstop.com';
      if (text.toLowerCase().includes(field.toLowerCase()) && programs.length < 3) {
        programs.push({ title: text, provider: 'Unstop', type: 'online', duration: 'Varies', link: href.startsWith('http') ? href : `https://unstop.com${href}` });
      }
    });
  } catch (e) { console.warn('Unstop scrape failed:', e.message); }

  try {
    const { data } = await axios.get('https://devpost.com/hackathons', { headers: SCRAPE_HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    $('h3.hackathon-description, h2, h3, .hackathon-title').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).closest('a').attr('href') || 'https://devpost.com';
      if (text && programs.length < 6) {
        programs.push({ title: text, provider: 'Devpost', type: 'online', duration: 'Hackathon', link: href.startsWith('http') ? href : `https://devpost.com${href}` });
      }
    });
  } catch (e) { console.warn('Devpost scrape failed:', e.message); }

  if (programs.length < 3) {
    try {
      const raw = await callNvidiaQwen(
        'You are an expert career data assistant. Return ONLY valid JSON, no markdown.',
        `Generate 5 real hackathons, bootcamps, or training programs for "${field}". Return JSON: {"programs":[{"title":"...","provider":"...","type":"online","duration":"...","link":"https://..."}]}`
      );
      const parsed = safeParseJson(raw);
      for (const lp of parsed?.programs || []) {
        if (!programs.find(p => p.title === lp.title)) programs.push(lp);
        if (programs.length >= 6) break;
      }
    } catch { /* ignore */ }
  }

  const result = programs.slice(0, 6);
  setCache(cacheKey, result);
  res.json({ programs: result, source: 'scrape+llm' });
});

// ═════════════════════════════════════════════════════════════════════════════
// EXISTING ROUTE D — POST /api/resume/analyze (PRESERVED)
// ═════════════════════════════════════════════════════════════════════════════
app.post('/api/resume/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const field = (req.body.field || 'General Career').trim();

    let extractedText = '';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf') {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text;
    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract text from the uploaded file. Please ensure it is a readable PDF or DOCX.' });
    }

    const resumeSnippet = extractedText.slice(0, 6000);

    const systemPrompt = `You are Neuro, an expert career counselor AI for Neuropath. Analyze the resume and return ONLY valid JSON. Do not add markdown or explanation.`;
    const userMessage = `Resume text:\n${resumeSnippet}\n\nUser's passion/field: ${field}\n\nReturn JSON with exactly these keys:\n{\n  "strengths": [],\n  "skillGaps": [],\n  "careerFitScore": 0,\n  "careerFitReason": "",\n  "recommendedCourses": [],\n  "recommendedInstitutions": [],\n  "scholarships": [],\n  "summary": ""\n}`;

    let raw = await callLLM(systemPrompt, userMessage, 2048);
    let analysis = safeParseJson(raw);

    if (!analysis) {
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    const required = ['strengths', 'skillGaps', 'careerFitScore', 'careerFitReason', 'recommendedCourses', 'recommendedInstitutions', 'scholarships', 'summary'];
    for (const key of required) {
      if (!(key in analysis)) analysis[key] = key === 'careerFitScore' ? 50 : key === 'careerFitReason' || key === 'summary' ? '' : [];
    }

    res.json(analysis);
  } catch (error) {
    console.error('Resume analyze error:', error.message);
    res.status(500).json({ error: 'Failed to analyze resume. Please try again.', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 New routes: POST /api/career/enrich  |  GET /api/career/data`);
});
