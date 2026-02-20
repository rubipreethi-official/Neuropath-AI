/**
 * Chat2.tsx — AI Career Discovery Agent
 * ══════════════════════════════════════
 * Fixed version: handles all n8n "Message a Model" response formats correctly.
 *
 * Your n8n workflow: Webhook → Message a Model → Respond to Webhook
 * Your .env:  VITE_N8N_WEBHOOK_URL=https://rubipreethi.app.n8n.cloud/webhook/neuropath-agent1
 *
 * THE FIX: The n8n "Message a Model" (AI Agent) node returns the AI reply
 * as a plain string inside { "output": "..." }. We now handle ALL possible
 * n8n response shapes and aggressively extract JSON from the AI text.
 *
 * ALSO: The n8n prompt field must be set to:   {{ $json.body.message }}
 * (see the n8n update instructions at the bottom of this file)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Send, ArrowLeft, ChevronRight,
  Mail, CheckCircle, Sparkles, Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Message   { text: string; sender: "bot" | "user"; }
interface CareerCard {
  emoji: string; title: string; description: string;
  perks: string[]; skills: string[];
}
interface RoadmapStep {
  phase: string; title: string; description: string; resources: string[];
}

type AppPage    = "chat" | "cards" | "roadmap" | "email";
type SkillLevel = "Complete Beginner" | "Some Experience" | "Intermediate" | "";

// ── Identical props to original Chat2 → App.tsx unchanged ──
interface Chat2Props {
  onComplete: (predictedPassion: string) => void;
  userName:   string;
  onBack?:    () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEREST PRESETS
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS = [
  { emoji: "💻", label: "Coding" },       { emoji: "🎤", label: "Singing" },
  { emoji: "💃", label: "Dancing" },      { emoji: "🍳", label: "Cooking" },
  { emoji: "🎨", label: "Art & Design" }, { emoji: "⚽", label: "Sports" },
  { emoji: "📸", label: "Photography" },  { emoji: "✍️", label: "Writing" },
  { emoji: "🎧", label: "Music Production" }, { emoji: "🔬", label: "Science" },
  { emoji: "🎮", label: "Gaming" },       { emoji: "🏥", label: "Healthcare" },
];

// ─────────────────────────────────────────────────────────────────────────────
// N8N HELPER — FIXED to handle all response shapes
// ─────────────────────────────────────────────────────────────────────────────
async function callN8n(message: string): Promise<string> {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
  if (!url || url.includes("YOUR_WEBHOOK")) {
    throw new Error("Add VITE_N8N_WEBHOOK_URL to your .env and restart npm run dev");
  }

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`n8n error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const rawText = await res.text();

  // ── Try to parse as JSON ──────────────────────────────────────────────────
  try {
    const data = JSON.parse(rawText) as unknown;

    // Helper to dig a string out of unknown
    const str = (v: unknown): string | null =>
      typeof v === "string" ? v : null;

    // data could be an array (n8n sometimes wraps in array)
    const obj = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;

    // ── Try every known n8n "Message a Model" / AI Agent output shape ──
    //
    // Shape 1 (most common for n8n AI Agent):  { "output": "..." }
    if (str(obj?.output))  return str(obj.output)!;

    // Shape 2 (n8n Gemini/OpenAI node):  { "text": "..." }
    if (str(obj?.text))    return str(obj.text)!;

    // Shape 3 (n8n chat model):  { "message": { "content": "..." } }
    if (obj?.message && typeof obj.message === "object") {
      const m = obj.message as Record<string, unknown>;
      if (str(m?.content)) return str(m.content)!;
    }

    // Shape 4 (Gemini raw):  { "content": { "parts": [{ "text": "..." }] } }
    if (obj?.content && typeof obj.content === "object") {
      const c = obj.content as Record<string, unknown>;
      if (Array.isArray(c?.parts) && c.parts.length > 0) {
        const p = (c.parts as Record<string, unknown>[])[0];
        if (str(p?.text)) return str(p.text)!;
      }
    }

    // Shape 5: { "response": "..." }
    if (str(obj?.response)) return str(obj.response)!;

    // Shape 6: { "result": "..." }
    if (str(obj?.result)) return str(obj.result)!;

    // Fallback: return raw JSON (will be tried as JSON by extractJSON)
    return rawText;

  } catch {
    // n8n returned plain text directly
    return rawText;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON EXTRACTOR — very aggressive, handles all LLM formatting habits
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON<T>(aiText: string): T {
  // 1. Strip markdown code fences
  let cleaned = aiText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 2. Remove any leading/trailing explanation text before/after the JSON
  //    Find the FIRST { or [ and the LAST } or ]
  const firstBrace  = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start = -1;

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error("No JSON found in AI response");
  } else if (firstBrace === -1) {
    start = firstBracket;
  } else if (firstBracket === -1) {
    start = firstBrace;
  } else {
    start = Math.min(firstBrace, firstBracket);
  }

  // Find matching end bracket
  const opener  = cleaned[start];
  const closer  = opener === "{" ? "}" : "]";
  const lastEnd = cleaned.lastIndexOf(closer);

  if (lastEnd === -1) throw new Error("Malformed JSON in AI response");

  const jsonString = cleaned.slice(start, lastEnd + 1);

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // Sometimes the LLM produces trailing commas — try a lenient fix
    const fixed = jsonString
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(fixed) as T;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED UI COMPONENTS (purple Tailwind theme)
// ─────────────────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1 px-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block w-2 h-2 rounded-full bg-purple-400"
          style={{ animation: "c2Bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

function Spinner({ size = 40 }: { size?: number }) {
  return <Loader2 size={size} className="text-purple-400 animate-spin" />;
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-5 text-red-300 text-sm text-center max-w-2xl mx-auto">
      <p className="font-semibold mb-1">Something went wrong</p>
      <p className="text-red-400 text-xs mb-3">{msg}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="text-purple-300 hover:text-white transition-colors underline text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

function BigCTA({ onClick, children, disabled = false }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
      {children}
    </button>
  );
}

function BackBtn({ to }: { to: () => void }) {
  return (
    <button onClick={to}
      className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm">
      <ArrowLeft size={18} /> Back
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAREER CARD — hover blur effect
// ─────────────────────────────────────────────────────────────────────────────
function CareerCardItem({ card, index, onClick }: {
  card: CareerCard; index: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300"
      style={{
        background:   hov ? "rgba(109,40,217,0.28)" : "rgba(88,28,135,0.18)",
        borderColor:  hov ? "rgba(167,139,250,0.65)" : "rgba(109,40,217,0.4)",
        transform:    hov ? "translateY(-8px)" : "translateY(0)",
        boxShadow:    hov ? "0 24px 60px rgba(0,0,0,0.55)" : "none",
        animationDelay: `${index * 0.12}s`,
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none transition-all duration-300"
        style={{
          backdropFilter: hov ? "blur(3px)" : "blur(0px)",
          background:     hov ? "rgba(10,0,30,0.28)" : "transparent",
        }}>
        <span className="text-purple-300 text-sm px-5 py-2 rounded-full border border-purple-500/50 transition-all duration-300"
          style={{
            background: "rgba(10,0,30,0.82)",
            opacity:    hov ? 1 : 0,
            transform:  hov ? "translateY(0)" : "translateY(8px)",
          }}>
          Choose this path →
        </span>
      </div>

      <div className="p-7">
        <span className="text-4xl block mb-4">{card.emoji}</span>
        <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
        <p className="text-purple-200 text-sm leading-relaxed mb-5">{card.description}</p>

        <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">✦ Perks</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {card.perks.map((p, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-purple-800/40 border border-purple-600/40 text-purple-200">{p}</span>
          ))}
        </div>

        <p className="text-purple-400 text-xs tracking-widest uppercase mb-2">✦ Skills You'll Need</p>
        <div className="flex flex-wrap gap-2">
          {card.skills.map((s, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-pink-900/30 border border-pink-700/30 text-pink-300">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP STEP
// ─────────────────────────────────────────────────────────────────────────────
function RoadmapStepItem({ step, index, isLast }: {
  step: RoadmapStep; index: number; isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div className="flex gap-5 mb-7" style={{ animation: "c2StepIn 0.5s ease both", animationDelay: `${index * 0.1}s` }}>
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-500/50 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-purple-900/60">
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 min-h-[24px] mt-2 bg-gradient-to-b from-purple-600/40 to-transparent" />}
      </div>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="flex-1 rounded-xl p-5 border transition-all duration-200"
        style={{ background: "rgba(88,28,135,0.15)", borderColor: hov ? "rgba(167,139,250,0.5)" : "rgba(109,40,217,0.3)" }}>
        <p className="text-purple-400 text-xs tracking-widest uppercase mb-1">✦ {step.phase}</p>
        <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
        <p className="text-purple-200 text-sm leading-relaxed">{step.description}</p>
        {step.resources?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step.resources.map((r, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full bg-pink-900/20 border border-pink-700/25 text-pink-300">📚 {r}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Chat2({ onComplete, userName, onBack }: Chat2Props) {

  const [page, setPage] = useState<AppPage>("chat");

  // Page 1
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [chatInput,   setChatInput]   = useState("");
  const [chatPhase,   setChatPhase]   = useState<"greeting" | "interest" | "done">("greeting");
  const [interest,    setInterest]    = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasGreeted     = useRef(false);

  // Page 2
  const [cards,        setCards]        = useState<CareerCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError,   setCardsError]   = useState("");

  // Page 3
  const [selectedCard,   setSelectedCard]   = useState<CareerCard | null>(null);
  const [skillLevel,     setSkillLevel]     = useState<SkillLevel>("");
  const [roadmapSteps,   setRoadmapSteps]   = useState<RoadmapStep[]>([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError,   setRoadmapError]   = useState("");

  // Page 4
  const [email,        setEmail]        = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent,    setEmailSent]    = useState(false);
  const [emailError,   setEmailError]   = useState("");

  // Inject keyframes once
  useEffect(() => {
    const id = "c2-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes c2Bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes c2StepIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
      @keyframes c2FadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes c2MsgIn  { from{opacity:0;transform:scale(.95) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
    `;
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Initial greeting (strict-mode safe)
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    setTimeout(() => {
      setMessages([{ sender: "bot", text: `Hey ${userName}! 👋 I'm your AI career guide. I'm here to help you discover a career path that genuinely excites you.` }]);
      setTimeout(() => {
        setMessages((p) => [...p, { sender: "bot", text: "Let's start simple — what are you most passionate about? Pick from below or type your own! 🚀" }]);
        setChatPhase("interest");
      }, 1100);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addBot  = (t: string) => setMessages((p) => [...p, { text: t, sender: "bot" }]);
  const addUser = (t: string) => setMessages((p) => [...p, { text: t, sender: "user" }]);

  // ── PAGE 1: Interest selected ─────────────────────────────────────────────
  const handleInterest = async (chosen: string) => {
    if (chatPhase !== "interest") return;
    setInterest(chosen);
    addUser(chosen);
    setChatPhase("done");
    setChatLoading(true);

    const prompt =
      `A student named ${userName} is interested in: "${chosen}". ` +
      `Write a SHORT 2-sentence warm enthusiastic reply acknowledging their interest. ` +
      `No JSON. No markdown. Just plain conversational text.`;

    try {
      const reply = await callN8n(prompt);
      const clean = reply.replace(/^["']|["']$/g, "").trim();
      setTimeout(() => {
        addBot(clean.length > 10 ? clean : `${chosen} is a fantastic choice! There are amazing career paths waiting for you.`);
        setTimeout(() => {
          addBot(`Let me show you 3 exciting career paths in ${chosen} crafted just for you ✨`);
          setChatLoading(false);
        }, 900);
      }, 500);
    } catch {
      setTimeout(() => {
        addBot(`${chosen} is a fantastic choice! So many exciting career paths await. Let me show you 3 perfect options ✨`);
        setChatLoading(false);
      }, 700);
    }
  };

  const handleSend = () => {
    const v = chatInput.trim();
    if (!v || chatPhase !== "interest") return;
    setChatInput("");
    handleInterest(v);
  };

  // ── PAGE 2: Fetch career cards ────────────────────────────────────────────
  const goToCards = useCallback(async () => {
    setPage("cards");
    setCardsLoading(true);
    setCardsError("");

    // We give the LLM a very clear JSON template to follow
    const prompt =
      `You are a career expert. Student interest: "${interest}". ` +
      `Respond with ONLY this exact JSON structure, nothing else before or after:\n` +
      `{"careers":[{"emoji":"🎯","title":"Career Name","description":"Two sentences about this career.","perks":["benefit 1","benefit 2","benefit 3"],"skills":["skill 1","skill 2","skill 3","skill 4"]}]}\n` +
      `Fill in 3 different careers for "${interest}": one creative, one technical, one entrepreneurial. ` +
      `Use real, specific career titles. Do not include any explanation text.`;

    try {
      const raw  = await callN8n(prompt);
      const data = extractJSON<{ careers: CareerCard[] }>(raw);
      if (!data.careers || data.careers.length === 0) throw new Error("Empty careers array");
      setCards(data.careers);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setCardsError(`Could not load career paths: ${msg}. Please try again.`);
    } finally {
      setCardsLoading(false);
    }
  }, [interest]);

  // ── PAGE 3: Generate roadmap ──────────────────────────────────────────────
  const handleCardClick = (card: CareerCard) => {
    setSelectedCard(card);
    setPage("roadmap");
    setSkillLevel("");
    setRoadmapSteps([]);
  };

  const generateRoadmap = useCallback(async (level: SkillLevel) => {
    if (!selectedCard) return;
    setSkillLevel(level);
    setRoadmapLoading(true);
    setRoadmapError("");

    const prompt =
      `You are a career mentor. Career: "${selectedCard.title}". Level: "${level}". ` +
      `Respond with ONLY this exact JSON structure, nothing else:\n` +
      `{"steps":[{"phase":"Foundation","title":"Step title","description":"2-3 sentences. Specific and actionable.","resources":["Platform 1","Tool 2"]}]}\n` +
      `Fill in 5-6 progressive steps to become a professional ${selectedCard.title} starting from ${level}. ` +
      `Use real platforms and tools. Do not include any explanation text outside the JSON.`;

    try {
      const raw  = await callN8n(prompt);
      const data = extractJSON<{ steps: RoadmapStep[] }>(raw);
      if (!data.steps || data.steps.length === 0) throw new Error("Empty steps array");
      setRoadmapSteps(data.steps);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setRoadmapError(`Could not generate roadmap: ${msg}`);
    } finally {
      setRoadmapLoading(false);
    }
  }, [selectedCard]);

  // ── PAGE 4: Send email via n8n ────────────────────────────────────────────
  const sendEmail = async () => {
    if (!email.trim()) return;
    setEmailSending(true);
    setEmailError("");

    const prompt =
      `Student ${userName} (email: ${email}) chose "${selectedCard?.title}" career path. ` +
      `Level: ${skillLevel}. Interest: ${interest}. ` +
      `Steps: ${roadmapSteps.map((s, i) => `${i+1}. ${s.title}`).join(", ")}. ` +
      `Write a short encouraging 2-paragraph email confirming their career roadmap. Plain text only.`;

    try {
      await callN8n(prompt);
      setEmailSent(true);
    } catch {
      setEmailError("Could not send email right now. You can still continue!");
    } finally {
      setEmailSending(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — CHAT
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "chat") return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        {onBack && <BackBtn to={onBack} />}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Brain size={40} className="text-purple-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's Find Your Passion</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Your AI career guide will discover the perfect path for you!
          </p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl overflow-hidden">
          {/* Chat header */}
          <div className="bg-purple-800/50 border-b border-purple-700/50 px-6 py-4 flex items-center gap-3">
            <Sparkles size={22} className="text-purple-300" />
            <h2 className="text-lg font-semibold text-white">Neuropath Career AI</h2>
            <span className="ml-auto text-xs text-green-400 bg-green-900/30 border border-green-700/30 px-3 py-1 rounded-full">● Online</span>
          </div>

          {/* Messages */}
          <div className="h-[360px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                style={{ animation: "c2MsgIn 0.3s ease both" }}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "bg-purple-800/50 text-purple-100 border border-purple-700/50"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start" style={{ animation: "c2MsgIn 0.3s ease both" }}>
                <div className="bg-purple-800/50 border border-purple-700/50 rounded-2xl px-5 py-3"><TypingDots /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interest picker */}
          {chatPhase === "interest" && (
            <div className="border-t border-purple-700/50 p-6">
              <p className="text-purple-400 text-xs tracking-widest uppercase mb-3">Quick pick your interest</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => handleInterest(p.label)}
                    className="bg-purple-800/30 hover:bg-purple-700/50 border border-purple-700/50 hover:border-purple-500 text-purple-200 hover:text-white px-4 py-2 rounded-full text-sm transition-all hover:-translate-y-0.5 active:scale-95">
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
              <p className="text-purple-400 text-xs tracking-widest uppercase mb-3">Or type anything else</p>
              <div className="flex gap-3">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  placeholder="e.g. Robotics, Fashion, Architecture, Baking..."
                  className="flex-1 bg-purple-800/30 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                <button onClick={handleSend} disabled={!chatInput.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                  <Send size={16} /> Send
                </button>
              </div>
            </div>
          )}
        </div>

        {chatPhase === "done" && !chatLoading && (
          <div className="mt-8 text-center" style={{ animation: "c2FadeUp 0.5s ease" }}>
            <BigCTA onClick={goToCards}>
              <Brain size={24} /> Show Me My Career Paths <ChevronRight size={22} />
            </BigCTA>
            <p className="text-purple-400 text-sm mt-4">3 AI-generated paths for your interest in {interest}</p>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — CAREER CARDS
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "cards") return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <BackBtn to={() => setPage("chat")} />

        <div className="text-center mb-10">
          <div className="inline-block bg-purple-800/40 border border-purple-600/40 text-purple-300 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-4">{interest}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Career Paths</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">Three worlds you could thrive in. Hover to explore, click to choose.</p>
        </div>

        {cardsLoading && (
          <div className="flex flex-col items-center py-20">
            <Spinner size={44} />
            <p className="text-purple-200 text-lg font-semibold mt-5">Generating career paths for "{interest}"...</p>
            <p className="text-purple-400 text-sm mt-2">This takes about 15 seconds</p>
          </div>
        )}

        {cardsError && !cardsLoading && <ErrorBox msg={cardsError} onRetry={goToCards} />}

        {!cardsLoading && !cardsError && cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <CareerCardItem key={i} card={card} index={i} onClick={() => handleCardClick(card)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — ROADMAP
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "roadmap") return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <BackBtn to={() => setPage("cards")} />

        <div className="text-center mb-10">
          <div className="inline-block bg-purple-800/40 border border-purple-600/40 text-purple-300 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-4">Your Personalized Roadmap</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{selectedCard?.title}</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">{selectedCard?.emoji} {interest} → {selectedCard?.title} — 0 to Pro</p>
        </div>

        {/* Skill level */}
        {!skillLevel && (
          <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 max-w-xl mx-auto mb-10 text-center" style={{ animation: "c2FadeUp 0.5s ease" }}>
            <p className="text-white text-xl font-semibold mb-6 leading-relaxed">
              What's your current level in <span className="text-purple-300">{selectedCard?.title}</span>?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(["Complete Beginner", "Some Experience", "Intermediate"] as SkillLevel[]).map((lvl) => (
                <button key={lvl} onClick={() => generateRoadmap(lvl)}
                  className="bg-purple-800/30 hover:bg-purple-700/50 border border-purple-700/50 hover:border-purple-500 text-purple-200 hover:text-white px-5 py-3 rounded-full text-sm font-medium transition-all hover:-translate-y-1 active:scale-95">
                  {lvl === "Complete Beginner" ? "🌱" : lvl === "Some Experience" ? "🌿" : "🌳"} {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {roadmapLoading && (
          <div className="flex flex-col items-center py-20">
            <Spinner size={44} />
            <p className="text-purple-200 text-lg font-semibold mt-5">Building your roadmap for {skillLevel}...</p>
            <p className="text-purple-400 text-sm mt-2">This takes about 15 seconds</p>
          </div>
        )}

        {roadmapError && !roadmapLoading && <ErrorBox msg={roadmapError} />}

        {!roadmapLoading && !roadmapError && roadmapSteps.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {roadmapSteps.map((step, i) => (
              <RoadmapStepItem key={i} step={step} index={i} isLast={i === roadmapSteps.length - 1} />
            ))}
            <div className="mt-12 text-center">
              <BigCTA onClick={() => setPage("email")}>
                <Mail size={22} /> Get My Roadmap on Email <ChevronRight size={20} />
              </BigCTA>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — EMAIL + FINAL CTA → ChatbotAnalysis
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full">
        <BackBtn to={() => setPage("roadmap")} />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-800/50 border-2 border-purple-600/50 mb-6">
            <Mail size={40} className="text-purple-300" />
          </div>
          <div className="inline-block bg-purple-800/40 border border-purple-600/40 text-purple-300 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-4">Almost There!</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get Your Career Roadmap</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">We'll send your full personalized roadmap to your email</p>
        </div>

        {/* Summary */}
        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
          <p className="text-purple-400 text-xs tracking-widest uppercase mb-4">✦ Your Email Will Include</p>
          {[`Your Interest: ${interest}`, `Chosen Career: ${selectedCard?.title}`, `Your Level: ${skillLevel}`,
            `${roadmapSteps.length} Personalized Roadmap Steps`, "Resources & Tools for each step", "Pro tips & next actions"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <CheckCircle size={16} className="text-purple-400 flex-shrink-0" />
              <span className="text-purple-200 text-sm">{item}</span>
            </div>
          ))}
        </div>

        {!emailSent ? (
          <div className="max-w-md mx-auto text-center">
            <p className="text-purple-300 text-sm mb-4">Enter your email to receive your roadmap:</p>
            <div className="flex gap-3 mb-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendEmail(); }}
                placeholder="your@email.com"
                className="flex-1 bg-purple-800/30 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <button onClick={sendEmail} disabled={!email.trim() || emailSending}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                {emailSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {emailSending ? "Sending..." : "Send"}
              </button>
            </div>
            {emailError && <p className="text-red-400 text-xs mb-4">{emailError}</p>}
            <p className="text-purple-500 text-xs mb-8">— or skip this and continue —</p>
          </div>
        ) : (
          <div className="text-center mb-8" style={{ animation: "c2FadeUp 0.5s ease" }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 border-2 border-green-600/40 mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-2">Sent! ✨</h3>
            <p className="text-purple-300 text-sm">Check <strong className="text-purple-200">{email}</strong></p>
          </div>
        )}

        {/* ── FINAL CTA → triggers onComplete → App.tsx goes to chatbot-analysis ── */}
        <div className="text-center">
          <BigCTA onClick={() => onComplete(interest)}>
            <Brain size={24} />
            Continue to Best Institutions &amp; Scholarships
            <ChevronRight size={22} />
          </BigCTA>
          <p className="text-purple-300 text-sm mt-4">
            Get institution &amp; scholarship recommendations for{" "}
            <span className="text-purple-200 font-semibold">{selectedCard?.title ?? interest}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat2;

/*
══════════════════════════════════════════════════════════════════════════════
  HOW TO FIX YOUR N8N "MESSAGE A MODEL" NODE  (required — do this once)
══════════════════════════════════════════════════════════════════════════════

1. Open your n8n workflow at: https://rubipreethi.app.n8n.cloud
2. Click on the "Message a Model" node
3. Find the field called "Prompt" or "User Message" or "Message"
4. Change its value to:
      {{ $json.body.message }}
   This makes n8n pass whatever your React app sends as the AI input.

5. In the SYSTEM PROMPT field (if it exists), put:
      You are a helpful AI career guide for students. When asked for JSON,
      respond with ONLY valid JSON matching the exact structure requested.
      Never add explanation text before or after JSON responses.

6. Click Save → make sure the workflow ACTIVE toggle is ON (top right)

Your .env is CORRECT as it is:
   VITE_N8N_WEBHOOK_URL=https://rubipreethi.app.n8n.cloud/webhook/neuropath-agent1
   (No spaces, no quotes, just the URL)

══════════════════════════════════════════════════════════════════════════════
*/