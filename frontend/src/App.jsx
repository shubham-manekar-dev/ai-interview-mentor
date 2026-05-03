import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Brain,
  ChevronRight,
  RotateCcw,
  Send,
  Copy,
  Check,
  Clock,
  Target,
  Trophy,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Zap,
  History,
  X,
  CheckCircle2,
  TrendingUp,
  Hash,
  Briefcase,
  BookOpen,
  Keyboard,
  Star,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8001";

const roles = [
  "Python Backend Developer",
  "GenAI Engineer",
  "FastAPI Developer",
  "QA Automation Engineer",
  "DevOps Engineer",
  "Data Engineer",
];

const topicsByRole = {
  "Python Backend Developer": ["Python", "FastAPI", "Flask", "REST API", "SQL", "Docker"],
  "GenAI Engineer": ["RAG", "Embeddings", "Vector DB", "Prompt Engineering", "LLM API", "LangChain"],
  "FastAPI Developer": ["FastAPI", "Pydantic", "Dependency Injection", "JWT Auth", "SQLAlchemy", "Testing"],
  "QA Automation Engineer": ["Pytest", "API Testing", "Selenium", "CI/CD", "Test Strategy"],
  "DevOps Engineer": ["Docker", "Kubernetes", "Jenkins", "Nginx", "Monitoring", "CI/CD"],
  "Data Engineer": ["SQL", "Airflow", "ETL", "Data Modeling", "Spark", "Pipelines"],
};

const difficultyMeta = {
  L1: { years: "0–2 yrs" },
  L2: { years: "2–5 yrs" },
  Senior: { years: "5+ yrs" },
};

const STORAGE_KEY = "interview_mentor_stats_v1";
const HISTORY_KEY = "interview_mentor_history_v1";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function scoreToTone(score) {
  if (score == null)
    return { ring: "stroke-slate-300", text: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "—" };
  if (score >= 8)
    return { ring: "stroke-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Strong" };
  if (score >= 6)
    return { ring: "stroke-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Solid" };
  if (score >= 4)
    return { ring: "stroke-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Developing" };
  return { ring: "stroke-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Needs work" };
}

/* -------------------- Small components -------------------- */

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";
  return (
    <div className="fixed top-6 right-6 z-50 animate-[slideIn_0.25s_ease-out]">
      <div
        className={`flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${
          isError ? "border-red-200" : "border-emerald-200"
        }`}
      >
        {isError ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        )}
        <div className="max-w-sm">
          <p className="text-sm font-semibold leading-5 text-slate-900">{toast.title}</p>
          {toast.message && <p className="mt-0.5 text-xs leading-5 text-slate-600">{toast.message}</p>}
        </div>
        <button onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ step }) {
  const steps = [
    { id: 1, label: "Setup" },
    { id: 2, label: "Question" },
    { id: 3, label: "Answer" },
    { id: 4, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <React.Fragment key={s.id}>
            <div
              className={`flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : done
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="font-semibold">{done ? "✓" : s.id}</span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <span className="text-sm font-semibold tabular-nums text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function ScoreCircle({ score }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    if (score == null) return;
    let raf;
    let start;
    const duration = 800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(score * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const tone = scoreToTone(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (animated / 10) * circumference;

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${tone.ring} transition-[stroke-dashoffset]`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold leading-none ${tone.text}`}>{animated.toFixed(1)}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">/ 10</span>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SkeletonLine({ w = "w-full" }) {
  return <div className={`h-3 animate-pulse rounded bg-slate-200 ${w}`} />;
}

/* -------------------- Main App -------------------- */

function App() {
  const [role, setRole] = useState("Python Backend Developer");
  const [topic, setTopic] = useState("FastAPI");
  const [difficulty, setDifficulty] = useState("L1");
  const [experienceYears, setExperienceYears] = useState(5);

  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState(() => loadJSON(STORAGE_KEY, { count: 0, scoreSum: 0, best: 0 }));
  const [history, setHistory] = useState(() => loadJSON(HISTORY_KEY, []));
  const [historyOpen, setHistoryOpen] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  /* Inject font once */
  useEffect(() => {
    if (document.getElementById("interview-mentor-fonts")) return;
    const link = document.createElement("link");
    link.id = "interview-mentor-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  /* Timer */
  useEffect(() => {
    if (questionData && !evaluation) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    return undefined;
  }, [questionData, evaluation]);

  /* Auto-focus textarea */
  useEffect(() => {
    if (questionData && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [questionData]);

  /* Cmd/Ctrl + Enter to submit */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (questionData && !evaluation && userAnswer.trim()) {
          e.preventDefault();
          evaluateAnswer();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionData, evaluation, userAnswer]);

  const availableTopics = useMemo(() => topicsByRole[role] || ["Python"], [role]);
  const wordCount = useMemo(
    () => (userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0),
    [userAnswer]
  );
  const charCount = userAnswer.length;
  const avgScore = stats.count > 0 ? (stats.scoreSum / stats.count).toFixed(1) : "—";

  const currentStep = useMemo(() => {
    if (evaluation) return 4;
    if (questionData && userAnswer.trim().length > 0) return 3;
    if (questionData) return 2;
    return 1;
  }, [questionData, userAnswer, evaluation]);

  function handleRoleChange(value) {
    setRole(value);
    setTopic((topicsByRole[value] || ["Python"])[0]);
    softReset();
  }

  function softReset() {
    setQuestionData(null);
    setEvaluation(null);
    setUserAnswer("");
    setElapsed(0);
  }

  function resetInterview() {
    if (userAnswer.trim() && !evaluation) {
      const ok = window.confirm("Discard your current answer?");
      if (!ok) return;
    }
    softReset();
    setToast({ type: "success", title: "Session reset", message: "Ready for a new question." });
  }

  async function generateQuestion() {
    setQuestionLoading(true);
    setEvaluation(null);
    setUserAnswer("");
    setElapsed(0);

    try {
      const response = await fetch(`${API_BASE_URL}/interview/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          topic,
          difficulty,
          experience_years: Number(experienceYears),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to generate question");
      setQuestionData(data);
    } catch (err) {
      setToast({
        type: "error",
        title: "Couldn't generate question",
        message: err.message || "Check that your FastAPI server is running.",
      });
    } finally {
      setQuestionLoading(false);
    }
  }

  async function evaluateAnswer() {
    if (!questionData?.question) {
      setToast({ type: "error", title: "No question yet", message: "Generate a question first." });
      return;
    }
    if (!userAnswer.trim()) {
      setToast({ type: "error", title: "Empty answer", message: "Write your answer before evaluating." });
      return;
    }

    setEvaluationLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          topic,
          difficulty,
          experience_years: Number(experienceYears),
          question: questionData.question,
          user_answer: userAnswer,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to evaluate answer");

      setEvaluation(data);

      const newStats = {
        count: stats.count + 1,
        scoreSum: stats.scoreSum + (data.score || 0),
        best: Math.max(stats.best || 0, data.score || 0),
      };
      setStats(newStats);
      saveJSON(STORAGE_KEY, newStats);

      const entry = {
        id: Date.now(),
        role,
        topic,
        difficulty,
        question: questionData.question,
        score: data.score,
        level: data.level,
        elapsed,
        at: new Date().toISOString(),
      };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      saveJSON(HISTORY_KEY, newHistory);
    } catch (err) {
      setToast({
        type: "error",
        title: "Evaluation failed",
        message: err.message || "Try again in a moment.",
      });
    } finally {
      setEvaluationLoading(false);
    }
  }

  function clearHistory() {
    if (!window.confirm("Clear all session history and stats?")) return;
    setHistory([]);
    setStats({ count: 0, scoreSum: 0, best: 0 });
    saveJSON(HISTORY_KEY, []);
    saveJSON(STORAGE_KEY, { count: 0, scoreSum: 0, best: 0 });
    setToast({ type: "success", title: "History cleared" });
  }

  const tone = evaluation ? scoreToTone(evaluation.score) : null;

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 antialiased"
      style={{ fontFamily: "'Manrope', system-ui, -apple-system, sans-serif" }}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes slideIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fade-up { animation: fadeUp 0.3s ease-out both; }
      `}</style>

      {/* ============= TOP BAR ============= */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-slate-900">Interview Mentor</h1>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Practice · Iterate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <StatPill icon={Hash} label="attempts" value={stats.count} />
              <StatPill icon={TrendingUp} label="avg" value={avgScore} />
              <StatPill icon={Trophy} label="best" value={stats.best || "—"} />
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <History className="h-3.5 w-3.5" />
              History
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {/* ============= HEADER ============= */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            AI Interview Mentor
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Realistic technical questions, scored answers, and structured feedback —
            powered by your FastAPI + Gemini backend.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <StepIndicator step={currentStep} />
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {API_BASE_URL}
            </div>
          </div>
        </header>

        {/* ============= MAIN ============= */}
        <main className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* ---------- SETUP ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-900">Setup</h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Configure your interview profile</p>
              </div>

              <div className="space-y-5 p-5">
                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {roles.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Topic</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTopics.map((item) => (
                      <button
                        key={item}
                        onClick={() => setTopic(item)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                          topic === item
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.entries(difficultyMeta).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`rounded-lg border p-2 text-left transition ${
                          difficulty === key
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`text-xs font-semibold ${difficulty === key ? "text-blue-700" : "text-slate-700"}`}>
                          {key}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{meta.years}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Experience</span>
                    <span className="text-slate-900">{experienceYears} yrs</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={generateQuestion}
                    disabled={questionLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {questionLoading ? (
                      <>
                        <Brain className="h-4 w-4 animate-pulse" />
                        Thinking…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Generate Question
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetInterview}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Session
                  </button>
                </div>

                {/* Keyboard hint */}
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
                  <Keyboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <p>
                    Press{" "}
                    <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                      ⌘ / Ctrl
                    </kbd>{" "}
                    +{" "}
                    <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                      Enter
                    </kbd>{" "}
                    to submit.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ---------- MAIN PANEL ---------- */}
          <section className="space-y-5">
            {/* QUESTION CARD */}
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-900">Question</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                    {topic}
                  </span>
                  <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                    {difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {questionLoading ? (
                  <div className="space-y-3 py-2">
                    <SkeletonLine />
                    <SkeletonLine w="w-11/12" />
                    <SkeletonLine w="w-9/12" />
                  </div>
                ) : questionData ? (
                  <div className="fade-up space-y-5">
                    <p className="text-lg leading-relaxed text-slate-900">{questionData.question}</p>

                    {questionData.expected_focus?.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Expected Focus
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {questionData.expected_focus.map((item, index) => (
                            <span
                              key={`${item}-${index}`}
                              className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Brain className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700">Ready when you are</p>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      Configure your setup on the left, then generate your first question.
                    </p>
                  </div>
                )}
              </div>
            </article>

            {/* ANSWER CARD */}
            {questionData && !evaluation && (
              <article className="fade-up overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-900">Your Answer</h2>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(elapsed)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>{wordCount} words</span>
                    <span className="text-slate-300">·</span>
                    <span>{charCount} chars</span>
                  </div>
                </div>

                <div className="p-5">
                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows="10"
                    placeholder="Walk through your reasoning as if you were speaking out loud in a real interview. Mention trade-offs, examples, and edge cases…"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Aim for structured reasoning — not just keywords.
                    </p>
                    <button
                      onClick={evaluateAnswer}
                      disabled={evaluationLoading || !userAnswer.trim()}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {evaluationLoading ? (
                        <>
                          <Brain className="h-4 w-4 animate-pulse" />
                          Evaluating…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Evaluate Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* EVALUATION CARD */}
            {evaluation && (
              <article className="fade-up overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-900">Evaluation</h2>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Solved in {formatDuration(elapsed)}
                  </span>
                </div>

                {/* Score block */}
                <div className="grid gap-6 border-b border-slate-200 p-6 md:grid-cols-[auto_1fr] md:items-center">
                  <ScoreCircle score={evaluation.score} />
                  <div>
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.border} ${tone.bg} ${tone.text}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {tone.label}
                    </div>
                    <p className="mt-2 text-2xl font-bold leading-tight text-slate-900">{evaluation.level}</p>
                    <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-600">
                      Use the breakdown below to refine your reasoning before the next attempt.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={generateQuestion}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Next Question
                      </button>
                      <button
                        onClick={() => {
                          setEvaluation(null);
                          setUserAnswer("");
                          setElapsed(0);
                          setTimeout(() => textareaRef.current?.focus(), 100);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retry
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strengths + Missing */}
                <div className="grid gap-px bg-slate-200 md:grid-cols-2">
                  <div className="bg-white p-5">
                    <div className="mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Strengths</h3>
                    </div>
                    {evaluation.strengths?.length ? (
                      <ul className="space-y-2">
                        {evaluation.strengths.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-slate-700">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">No strengths identified.</p>
                    )}
                  </div>

                  <div className="bg-white p-5">
                    <div className="mb-3 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Missing Points</h3>
                    </div>
                    {evaluation.missing_points?.length ? (
                      <ul className="space-y-2">
                        {evaluation.missing_points.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-slate-700">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">Nothing major missed — nice work.</p>
                    )}
                  </div>
                </div>

                {/* Ideal Answer */}
                <div className="border-t border-slate-200 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-slate-500" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Ideal Answer</h3>
                    </div>
                    <CopyButton text={evaluation.ideal_answer} />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{evaluation.ideal_answer}</p>
                  </div>
                </div>

                {/* Follow-up */}
                {evaluation.follow_up_question && (
                  <div className="border-t border-slate-200 p-5">
                    <div className="mb-3 flex items-center gap-1.5">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Follow-up</h3>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm leading-relaxed text-slate-800">{evaluation.follow_up_question}</p>
                    </div>
                  </div>
                )}
              </article>
            )}
          </section>
        </main>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[11px] text-slate-400">
          <p className="font-medium">Built with FastAPI · Gemini · React · Tailwind</p>
        </footer>
      </div>

      {/* ============= HISTORY DRAWER ============= */}
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Session History</h3>
                <p className="mt-0.5 text-xs text-slate-500">{history.length} attempts saved locally</p>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <History className="mb-3 h-7 w-7 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No attempts yet.</p>
                  <p className="mt-1 text-xs text-slate-500">Your evaluated answers will appear here.</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {history.map((h) => {
                    const t = scoreToTone(h.score);
                    return (
                      <li
                        key={h.id}
                        className="rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                              <span>{h.difficulty}</span>
                              <span className="text-slate-300">·</span>
                              <span>{h.role.split(" ")[0]}</span>
                              <span className="text-slate-300">·</span>
                              <span>{h.topic}</span>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-800">
                              {h.question}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(h.elapsed)}
                              </span>
                              <span>{new Date(h.at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`flex flex-col items-center rounded-lg border px-2.5 py-1 ${t.border} ${t.bg}`}>
                            <span className={`text-xl font-bold leading-none ${t.text}`}>{h.score}</span>
                            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400">/ 10</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {history.length > 0 && (
              <div className="border-t border-slate-200 p-4">
                <button
                  onClick={clearHistory}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Clear All History
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

export default App;
