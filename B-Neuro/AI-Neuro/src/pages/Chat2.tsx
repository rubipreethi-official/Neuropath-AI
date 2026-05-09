/**
 * Chat2.tsx — AI Career Discovery Agent
 * Added: ForwardBtn for stage navigation (chat→cards→roadmap→email)
 * ForwardBtn only shows when it's valid to proceed forward.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Send, ArrowLeft, ArrowRight, ChevronRight,
  Mail, CheckCircle, Sparkles, Loader2, Download
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

type AppPage    = "chat" | "cards" | "roadmap";
type SkillLevel = "Complete Beginner" | "Some Experience" | "Intermediate" | "";

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
// N8N HELPER
// ─────────────────────────────────────────────────────────────────────────────
async function callN8n(message: string, type = "career", email = ""): Promise<string> {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
  if (!url || url.includes("YOUR_WEBHOOK")) {
    throw new Error("Add VITE_N8N_WEBHOOK_URL to your .env and restart npm run dev");
  }

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ message, type, email }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`n8n error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const rawText = await res.text();
  console.log("[n8n] raw response:", rawText.slice(0, 500));

  try {
    const data = JSON.parse(rawText) as unknown;
    const str = (v: unknown): string | null => typeof v === "string" ? v : null;
    const obj = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;

    if (str(obj?.output))   return str(obj.output)!;
    if (str(obj?.text))     return str(obj.text)!;
    if (str(obj?.response)) return str(obj.response)!;
    if (str(obj?.result))   return str(obj.result)!;

    if (obj?.message && typeof obj.message === "object") {
      const m = obj.message as Record<string, unknown>;
      if (str(m?.content)) return str(m.content)!;
    }

    if (obj?.content && typeof obj.content === "object") {
      const c = obj.content as Record<string, unknown>;
      if (Array.isArray(c?.parts) && c.parts.length > 0) {
        const p = (c.parts as Record<string, unknown>[])[0];
        if (str(p?.text)) return str(p.text)!;
      }
      if (str(c)) return str(c)!;
    }

    for (const key of Object.keys(obj || {})) {
      if (str((obj as Record<string, unknown>)[key])) {
        return str((obj as Record<string, unknown>)[key])!;
      }
    }

    return rawText;
  } catch {
    return rawText;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON<T>(aiText: string): T {
  let cleaned = aiText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const firstBrace   = cleaned.indexOf("{");
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

  const opener  = cleaned[start];
  const closer  = opener === "{" ? "}" : "]";
  const lastEnd = cleaned.lastIndexOf(closer);

  if (lastEnd === -1) throw new Error("Malformed JSON in AI response");

  const jsonString = cleaned.slice(start, lastEnd + 1);

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    const fixed = jsonString
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(fixed) as T;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT ROADMAP STEPS
// ─────────────────────────────────────────────────────────────────────────────
function extractRoadmapSteps(raw: string): RoadmapStep[] {
  console.log("[roadmap] extracting from:", raw.slice(0, 600));

  try {
    const data = extractJSON<{ steps: RoadmapStep[] }>(raw);
    if (Array.isArray(data.steps) && data.steps.length > 0) return data.steps;
  } catch { /* try next */ }

  try {
    const data = extractJSON<{ roadmap: RoadmapStep[] }>(raw);
    if (Array.isArray(data.roadmap) && data.roadmap.length > 0) return data.roadmap;
  } catch { /* try next */ }

  try {
    const data = extractJSON<RoadmapStep[]>(raw);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* try next */ }

  try {
    const data = extractJSON<{ data: { steps: RoadmapStep[] } }>(raw);
    if (Array.isArray(data.data?.steps) && data.data.steps.length > 0) return data.data.steps;
  } catch { /* try next */ }

  throw new Error(`Could not parse roadmap steps. Raw: ${raw.slice(0, 200)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
function getFallbackRoadmap(career: string, level: SkillLevel): RoadmapStep[] {
  const isBeginner = level === "Complete Beginner";
  return [
    {
      phase: "Foundation",
      title: isBeginner ? `Learn ${career} Basics` : `Solidify ${career} Fundamentals`,
      description: `Start with the core concepts of ${career}. Build a strong foundation that will support everything you learn later. Focus on understanding rather than memorizing.`,
      resources: ["YouTube tutorials", "Coursera", "Udemy"],
    },
    {
      phase: "Practice",
      title: "Build Your First Projects",
      description: `Apply what you've learned by working on small real projects in ${career}. Projects solidify your understanding and give you something to show employers or clients.`,
      resources: ["GitHub", "Portfolio sites", "Personal projects"],
    },
    {
      phase: "Growth",
      title: "Find a Community & Mentor",
      description: `Join communities of ${career} practitioners. Find a mentor who can guide you. Attend meetups, webinars, or workshops to network and learn from others.`,
      resources: ["LinkedIn", "Reddit communities", "Discord servers", "Meetup.com"],
    },
    {
      phase: "Specialization",
      title: "Pick Your Niche",
      description: `Within ${career}, identify the specific area you're most passionate about. Specializing makes you more valuable and helps you stand out in the job market.`,
      resources: ["Industry blogs", "Podcasts", "Online courses"],
    },
    {
      phase: "Professional",
      title: "Launch Your Career",
      description: `Start applying for jobs, internships, or freelance work in ${career}. Build your portfolio, update your resume, and start networking with professionals in the field.`,
      resources: ["LinkedIn Jobs", "Indeed", "Upwork", "AngelList"],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED UI COMPONENTS
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

// ─────────────────────────────────────────────────────────────────────────────
// BACK + FORWARD NAVIGATION BAR
// Both buttons sit in a flex row — back on left, forward on right.
// ForwardBtn is hidden (invisible, non-interactive) when canGoForward=false,
// so the layout stays stable and back button doesn't jump around.
// ─────────────────────────────────────────────────────────────────────────────
function NavBar({
  onBack,
  onForward,
  canGoForward,
  forwardLabel = "Next",
}: {
  onBack: () => void;
  onForward?: () => void;
  canGoForward?: boolean;
  forwardLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm group"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-purple-600/50 bg-purple-800/40 group-hover:bg-purple-700/60 transition-colors">
          <ArrowLeft size={16} />
        </span>
        Back
      </button>

      {/* Forward — always rendered for layout stability, invisible when disabled */}
      <button
        onClick={onForward}
        disabled={!canGoForward}
        aria-hidden={!canGoForward}
        className={`flex items-center gap-2 text-sm transition-all group ${
          canGoForward
            ? "text-purple-300 hover:text-white cursor-pointer opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {forwardLabel}
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-purple-600/50 bg-purple-800/40 group-hover:bg-purple-700/60 transition-colors">
          <ArrowRight size={16} />
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE CAREER CARD
// ─────────────────────────────────────────────────────────────────────────────
function normalizeCard(raw: Record<string, unknown>): CareerCard {
  const title =
    (raw.title as string) ||
    (raw.career_title as string) ||
    (raw.name as string) ||
    "Career";

  const description =
    (raw.description as string) ||
    (raw.explanation as string) ||
    (raw.summary as string) ||
    "";

  const perks: string[] = Array.isArray(raw.perks)
    ? (raw.perks as string[])
    : Array.isArray(raw.benefits)
    ? (raw.benefits as string[])
    : Array.isArray(raw.advantages)
    ? (raw.advantages as string[])
    : ["Great opportunities", "Good pay", "Growing field"];

  const skills: string[] = Array.isArray(raw.skills)
    ? (raw.skills as string[])
    : Array.isArray(raw.required_skills)
    ? (raw.required_skills as string[])
    : Array.isArray(raw.competencies)
    ? (raw.competencies as string[])
    : ["Communication", "Problem solving", "Creativity"];

  const emoji = (raw.emoji as string) || "🎯";

  return { emoji, title, description, perks, skills };
}

// ─────────────────────────────────────────────────────────────────────────────
// CAREER CARD
// ─────────────────────────────────────────────────────────────────────────────
function CareerCardItem({ card: rawCard, index, onClick, selected }: {
  card: CareerCard | Record<string, unknown>; index: number; onClick: () => void; selected?: boolean;
}) {
  const card = normalizeCard(rawCard as Record<string, unknown>);
  const [hov, setHov] = useState(false);
  const active = hov || selected;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300"
      style={{
        background:   active ? "rgba(109,40,217,0.28)" : "rgba(88,28,135,0.18)",
        borderColor:  selected ? "rgba(167,139,250,0.9)" : active ? "rgba(167,139,250,0.65)" : "rgba(109,40,217,0.4)",
        transform:    active ? "translateY(-8px)" : "translateY(0)",
        boxShadow:    selected ? "0 0 0 2px rgba(167,139,250,0.4), 0 24px 60px rgba(0,0,0,0.55)" : active ? "0 24px 60px rgba(0,0,0,0.55)" : "none",
        animationDelay: `${index * 0.12}s`,
      }}
    >
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none transition-all duration-300"
        style={{
          backdropFilter: active ? "blur(3px)" : "blur(0px)",
          background:     active ? "rgba(10,0,30,0.28)" : "transparent",
        }}>
        <span className="text-purple-300 text-sm px-5 py-2 rounded-full border border-purple-500/50 transition-all duration-300"
          style={{
            background: "rgba(10,0,30,0.82)",
            opacity:    active ? 1 : 0,
            transform:  active ? "translateY(0)" : "translateY(8px)",
          }}>
          {selected ? "✓ Selected" : "Choose this path →"}
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

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const roadmapContainerRef = useRef<HTMLDivElement>(null);

  // ── PAGE PERSISTENCE via sessionStorage ──────────────────────────────────
  useEffect(() => {
    const savedPage = sessionStorage.getItem("neuropath_page") as AppPage | null;
    if (savedPage) setPage(savedPage);

    const savedInterest = sessionStorage.getItem("neuropath_interest");
    if (savedInterest) {
      setInterest(savedInterest);
      setChatPhase("done");
    }

    const savedCard = sessionStorage.getItem("neuropath_card");
    if (savedCard) {
      try { setSelectedCard(JSON.parse(savedCard)); } catch { /* ignore */ }
    }

    const savedLevel = sessionStorage.getItem("neuropath_level") as SkillLevel | null;
    if (savedLevel) setSkillLevel(savedLevel);

    const savedSteps = sessionStorage.getItem("neuropath_steps");
    if (savedSteps) {
      try { setRoadmapSteps(JSON.parse(savedSteps)); } catch { /* ignore */ }
    }

    const savedCards = sessionStorage.getItem("neuropath_cards");
    if (savedCards) {
      try { setCards(JSON.parse(savedCards)); } catch { /* ignore */ }
    }

    // Email logic removed
  }, []);

  useEffect(() => { sessionStorage.setItem("neuropath_page", page); }, [page]);
  useEffect(() => { if (interest) sessionStorage.setItem("neuropath_interest", interest); }, [interest]);
  useEffect(() => { if (selectedCard) sessionStorage.setItem("neuropath_card", JSON.stringify(selectedCard)); }, [selectedCard]);
  useEffect(() => { if (skillLevel) sessionStorage.setItem("neuropath_level", skillLevel); }, [skillLevel]);
  useEffect(() => { if (roadmapSteps.length > 0) sessionStorage.setItem("neuropath_steps", JSON.stringify(roadmapSteps)); }, [roadmapSteps]);
  useEffect(() => { if (cards.length > 0) sessionStorage.setItem("neuropath_cards", JSON.stringify(cards)); }, [cards]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

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

    const prompt =
      `You are a career expert. Student interest: "${interest}". ` +
      `Respond with ONLY this exact JSON structure, nothing else before or after:\n` +
      `{"careers":[{"emoji":"🎯","title":"Career Name","description":"Two sentences about this career.","perks":["benefit 1","benefit 2","benefit 3"],"skills":["skill 1","skill 2","skill 3","skill 4"]}]}\n` +
      `Fill in 3 different careers for "${interest}": one creative, one technical, one entrepreneurial. ` +
      `Use real, specific career titles. Do not include any explanation text.`;

    try {
      const raw  = await callN8n(prompt);
      let rawCards: Record<string, unknown>[] = [];
      try {
        const data = extractJSON<{ careers?: unknown[]; paths?: unknown[]; data?: unknown[] }>(raw);
        rawCards = (data.careers || data.paths || data.data || []) as Record<string, unknown>[];
      } catch {
        rawCards = extractJSON<Record<string, unknown>[]>(raw);
      }
      if (!rawCards || rawCards.length === 0) throw new Error("Empty careers array");
      const normalized = rawCards.map(normalizeCard);
      setCards(normalized);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setCardsError(`Could not load career paths: ${msg}. Please try again.`);
    } finally {
      setCardsLoading(false);
    }
  }, [interest]);

  // ── PAGE 3: Generate roadmap ──────────────────────────────────────────────
  const handleCardClick = (card: CareerCard | Record<string, unknown>) => {
    const normalized = normalizeCard(card as Record<string, unknown>);
    setSelectedCard(normalized);
    setPage("roadmap");
    setSkillLevel("");
    setRoadmapSteps([]);
    setRoadmapError("");
  };

  const generateRoadmap = useCallback(async (level: SkillLevel) => {
    if (!selectedCard) return;
    setSkillLevel(level);
    setRoadmapLoading(true);
    setRoadmapError("");
    setRoadmapSteps([]);

    const prompt =
      `You are a career mentor. Respond with ONLY valid JSON, no other text.\n` +
      `Create a learning roadmap for someone who wants to become a "${selectedCard.title}".\n` +
      `Their current level: "${level}".\n` +
      `Required JSON format (exactly this structure):\n` +
      `{\n` +
      `  "steps": [\n` +
      `    {\n` +
      `      "phase": "Foundation",\n` +
      `      "title": "Learn the basics",\n` +
      `      "description": "Start here. Two or three actionable sentences.",\n` +
      `      "resources": ["YouTube", "Coursera"]\n` +
      `    }\n` +
      `  ]\n` +
      `}\n` +
      `Provide exactly 5 steps. Do not add any text before or after the JSON.`;

    try {
      const raw = await callN8n(prompt);
      let steps: RoadmapStep[] = [];

      try {
        steps = extractRoadmapSteps(raw);
      } catch (parseErr) {
        console.warn("[roadmap] Parse failed, trying retry prompt:", parseErr);
        const retryPrompt =
          `Return ONLY a JSON array of 5 career steps for "${selectedCard.title}" (${level} level).\n` +
          `Format: [{"phase":"string","title":"string","description":"string","resources":["string"]}]\n` +
          `No explanation. Only the JSON array.`;
        const raw2 = await callN8n(retryPrompt);
        steps = extractRoadmapSteps(raw2);
      }

      if (!steps || steps.length === 0) {
        steps = getFallbackRoadmap(selectedCard.title, level);
      }

      const normalized = steps.map((s, i) => ({
        phase:       s.phase       || `Phase ${i + 1}`,
        title:       s.title       || `Step ${i + 1}`,
        description: s.description || "Work on this step to advance your career.",
        resources:   Array.isArray(s.resources) ? s.resources : [],
      }));

      setRoadmapSteps(normalized);
    } catch (e: unknown) {
      console.error("[roadmap] All attempts failed:", e);
      const fallback = getFallbackRoadmap(selectedCard.title, level);
      setRoadmapSteps(fallback);
    } finally {
      setRoadmapLoading(false);
    }
  }, [selectedCard]);

  const downloadPDF = async () => {
    if (!roadmapContainerRef.current) return;
    setPdfGenerating(true);
    try {
      const canvas = await html2canvas(roadmapContainerRef.current, {
        backgroundColor: "#2e1065", // purple-950 roughly
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${selectedCard?.title?.replace(/\s+/g, '_') || 'career'}_roadmap.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setPdfGenerating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORWARD NAVIGATION LOGIC
  // Each stage defines whether forward is allowed and what it does.
  // ─────────────────────────────────────────────────────────────────────────
  const forwardConfig: Record<AppPage, { label: string; canGo: boolean; action: () => void }> = {
    chat: {
      label: "Career Paths",
      // Can go forward only if interest chosen and not still loading bot reply
      canGo: chatPhase === "done" && !chatLoading && interest.length > 0,
      action: goToCards,
    },
    cards: {
      label: "Roadmap",
      // Can go forward only if a card has been selected
      canGo: selectedCard !== null,
      action: () => setPage("roadmap"),
    },
    roadmap: {
      label: "Continue",
      // Always can proceed from roadmap page now if steps generated
      canGo: roadmapSteps.length > 0 && !roadmapLoading,
      action: () => onComplete(interest),
    },
  };

  const fwd = forwardConfig[page];

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — CHAT
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "chat") return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        <NavBar
          onBack={onBack ?? (() => {})}
          onForward={fwd.action}
          canGoForward={fwd.canGo}
          forwardLabel={fwd.label}
        />

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
          <div className="bg-purple-800/50 border-b border-purple-700/50 px-6 py-4 flex items-center gap-3">
            <Sparkles size={22} className="text-purple-300" />
            <h2 className="text-lg font-semibold text-white">Neuropath Career AI</h2>
            <span className="ml-auto text-xs text-green-400 bg-green-900/30 border border-green-700/30 px-3 py-1 rounded-full">● Online</span>
          </div>

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
        <NavBar
          onBack={() => setPage("chat")}
          onForward={fwd.action}
          canGoForward={fwd.canGo}
          forwardLabel={fwd.label}
        />

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
              <CareerCardItem
                key={i}
                card={card}
                index={i}
                selected={selectedCard?.title === card.title}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        )}

        {/* Hint when a card is selected */}
        {selectedCard && !cardsLoading && (
          <p className="text-center text-purple-400 text-sm mt-6" style={{ animation: "c2FadeUp 0.4s ease" }}>
            ✓ <span className="text-purple-200">{selectedCard.title}</span> selected — hit <span className="text-purple-200">Roadmap →</span> above to continue
          </p>
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
        <NavBar
          onBack={() => setPage("cards")}
          onForward={fwd.action}
          canGoForward={fwd.canGo}
          forwardLabel={fwd.label}
        />

        <div className="text-center mb-10">
          <div className="inline-block bg-purple-800/40 border border-purple-600/40 text-purple-300 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase mb-4">Your Personalized Roadmap</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{selectedCard?.title}</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">{selectedCard?.emoji} {interest} → {selectedCard?.title} — 0 to Pro</p>
        </div>

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

        {roadmapError && !roadmapLoading && (
          <ErrorBox msg={roadmapError} onRetry={() => skillLevel && generateRoadmap(skillLevel)} />
        )}

        {!roadmapLoading && !roadmapError && roadmapSteps.length > 0 && (
          <div className="max-w-2xl mx-auto" ref={roadmapContainerRef}>
            {roadmapSteps.map((step, i) => (
              <RoadmapStepItem key={i} step={step} index={i} isLast={i === roadmapSteps.length - 1} />
            ))}
            <div className="mt-12 text-center flex flex-col items-center" data-html2canvas-ignore="true">
              <BigCTA onClick={downloadPDF} disabled={pdfGenerating}>
                {pdfGenerating ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} />} 
                {pdfGenerating ? "Generating PDF..." : "Download Roadmap as PDF"}
              </BigCTA>
              
              <button onClick={() => onComplete(interest)} className="mt-8 text-purple-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold tracking-wide">
                Continue to Best Institutions <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}

export default Chat2;