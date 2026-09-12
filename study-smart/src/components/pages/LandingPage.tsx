"use client";

import React from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileBarChart,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  ListTodo,
  MessageSquare,
  PieChart,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Upload,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    title: "AI Study Assistant",
    desc: "Answers grounded in your uploaded notes, not generic textbooks. Ask anything and get cited sources.",
  },
  {
    icon: <MessageSquare size={22} />,
    title: "Notes-Based Q&A",
    desc: "\"What's the Pumping Lemma?\" — answered from your actual class notes with page references.",
  },
  {
    icon: <FileBarChart size={22} />,
    title: "Question Paper Analysis",
    desc: "Extracts questions from previous papers and ranks them by historical frequency.",
  },
  {
    icon: <Target size={22} />,
    title: "Repeated Question Detection",
    desc: "Find which topics show up every year so you never miss a high-value question.",
  },
  {
    icon: <Lightbulb size={22} />,
    title: "Important Topic ID",
    desc: "Cross-references your syllabus, notes, and question papers to flag critical areas.",
  },
  {
    icon: <Route size={22} />,
    title: "Personalized Roadmap",
    desc: "A day-by-day, topic-by-topic plan tuned to your exam date and available time.",
  },
  {
    icon: <FlaskConical size={22} />,
    title: "AI Practice Questions",
    desc: "Generate MCQs, short-answer, and exam-style problems from your materials.",
  },
  {
    icon: <ListTodo size={22} />,
    title: "Mock Tests",
    desc: "Full-length timed tests matching your question-paper pattern, with instant grading.",
  },
  {
    icon: <PieChart size={22} />,
    title: "Progress Tracking",
    desc: "See strong vs. weak topics, track your streak, and watch coverage climb to 100%.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Weak Topic Detection",
    desc: "AI watches your test scores and re-allocates study time where you need it most.",
  },
  {
    icon: <BrainCircuit size={22} />,
    title: "Adaptive Study Planning",
    desc: "Mastered a topic? The roadmap cuts it. Struggling? It adds extra practice.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Built for Students",
    desc: "Clean, fast, mobile-friendly. No jargon, just a calm place to get work done.",
  },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    step: "Upload",
    title: "Upload all your materials",
    desc: "Drop in notes, previous question papers, syllabus PDFs, textbooks, even handwritten photos.",
    icon: <CloudUpload size={24} />,
  },
  {
    n: "02",
    step: "AI Understands",
    title: "We analyze everything together",
    desc: "The AI extracts topics, questions, repetition patterns, and syllabus coverage from all your files.",
    icon: <BrainCircuit size={24} />,
  },
  {
    n: "03",
    step: "Get Your Roadmap",
    title: "Receive a personal study plan",
    desc: "A structured, day-by-day plan built from your materials, your exam date, and your available hours.",
    icon: <Route size={24} />,
  },
  {
    n: "04",
    step: "Study & Track",
    title: "Study, practice, and improve",
    desc: "Ask the AI questions, solve practice tests, and watch weak topics become strong ones.",
    icon: <Trophy size={24} />,
  },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Everything you need to get started.",
    highlight: false,
    cta: "Start Studying Free",
    features: [
      "3 subjects",
      "20 material uploads",
      "AI Q&A with source citations",
      "Basic question-paper analysis",
      "Personalized 7-day roadmap",
      "5 practice tests / month",
    ],
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    desc: "For serious exam preparation.",
    highlight: true,
    cta: "Go Pro",
    features: [
      "Unlimited subjects",
      "Unlimited materials",
      "Advanced AI assistant + extended context",
      "Full question-paper frequency analysis",
      "Adaptive roadmaps up to 90 days",
      "Unlimited mock tests",
      "Weak-area focused practice",
      "Priority processing",
    ],
  },
  {
    name: "Team / Class",
    price: "₹899",
    period: "/month",
    desc: "For friends, study groups, and small classes.",
    highlight: false,
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Up to 10 student seats",
      "Shared material library",
      "Class-wide topic analytics",
      "Mentor / teacher dashboard",
      "Dedicated support",
    ],
  },
];

const FAQS = [
  {
    q: "Is StudySmart a generic PDF chatbot?",
    a: "No. StudySmart was built specifically for exam preparation. It cross-references your notes, syllabus, and previous question papers to build you an actual study plan — not just answer isolated questions.",
  },
  {
    q: "Does StudySmart 'predict' my exam questions?",
    a: "No. We analyze historical frequency and syllabus coverage from the materials YOU upload. We tell you what has been repeated in the past and flag high-priority topics; we never claim to foretell the future.",
  },
  {
    q: "What kind of files can I upload?",
    a: "PDFs, DOCX, PPTX, TXT files, and images (including handwritten notes, which are processed through OCR).",
  },
  {
    q: "Will the AI make up things from my notes?",
    a: "No. If the answer isn't in your uploaded materials, the AI clearly says so. Every sourced answer comes with a citation (material + page).",
  },
  {
    q: "Can I change my study plan as I go?",
    a: "Yes. Plan tasks are check-off-able, and if you ace or flop a test, the adaptive planner reshuffles future days automatically.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your materials are stored privately in your account, used only to build your study plan, and never shared with third parties.",
  },
];

export default function LandingPage() {
  const { setScreen } = useApp();
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">StudySmart</p>
              <p className="text-[11px] text-slate-500">AI Study Planner</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen("login")}
              className="btn-ghost"
            >
              Sign in
            </button>
            <button
              onClick={() => setScreen("signup")}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, #eef2ff 0%, transparent 50%), radial-gradient(circle at 90% 10%, #ecfeff 0%, transparent 40%), radial-gradient(circle at 50% 100%, #fdf4ff 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200">
              ✨ New: Roadmap adapts to your test performance
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Turn Your Notes Into a{" "}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                Smarter Study Plan
              </span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
              Upload your notes, syllabus and previous question papers. AI
              analyzes everything and builds a personalized roadmap for your
              exam preparation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setScreen("signup")}
                className="btn-primary px-7 py-3 text-base"
              >
                Start Studying Free
                <ArrowRight size={18} className="ml-2" />
              </button>
              <a
                href="#how"
                className="btn-secondary px-7 py-3 text-base"
              >
                <PlayCircle size={18} className="mr-2 text-primary-600" />
                See How It Works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              No credit card required · Cancel anytime · 3 subjects free
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl">
            <FlowVisual />
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From notes to next exam in 4 steps
            </h2>
            <p className="mt-4 text-slate-600">
              Simple for first-time users, powerful enough for full-semester
              prep.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.n}
                className="card card-hover relative overflow-hidden p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-primary-600">
                    Step {s.n}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    {s.icon}
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Main Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to prepare smarter
            </h2>
            <p className="mt-4 text-slate-600">
              A complete AI-powered study companion, built around your
              materials.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple plans, serious results
            </h2>
            <p className="mt-4 text-slate-600">
              Start free. Upgrade only when you need more power.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={
                  "card relative flex flex-col p-7 " +
                  (p.highlight
                    ? "ring-2 ring-primary-500 shadow-card-hover"
                    : "")
                }
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 badge bg-primary-600 text-white -translate-x-1/2 px-3 py-1">
                    Most popular
                  </span>
                )}
                <p className="text-sm font-semibold text-slate-500">
                  {p.name}
                </p>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {p.price}
                  </span>
                  <span className="ml-1 text-sm text-slate-500">
                    {p.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <button
                  onClick={() => setScreen("signup")}
                  className={
                    "mt-6 w-full " +
                    (p.highlight ? "btn-primary" : "btn-secondary")
                  }
                >
                  {p.cta}
                </button>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 flex-none text-primary-600"
                      />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle
                        size={18}
                        className="flex-none text-primary-600"
                      />
                      <span className="font-semibold text-slate-900">
                        {f.q}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={
                        "flex-none text-slate-400 transition-transform " +
                        (open ? "rotate-180" : "")
                      }
                    />
                  </button>
                  {open && (
                    <div className="border-t border-slate-200 bg-slate-50/50 p-5 pl-14">
                      <p className="text-sm leading-relaxed text-slate-700">
                        {f.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="card overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-fuchsia-600 p-10 text-center sm:p-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Your next exam starts today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Upload your first set of notes in under 30 seconds and let the AI
              build your study plan.
            </p>
            <button
              onClick={() => setScreen("signup")}
              className="mt-8 rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary-700 shadow-lg transition hover:bg-slate-50"
            >
              Start Studying Free →
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" />
            <span>© {new Date().getFullYear()} StudySmart. Built for students.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FlowVisual() {
  const items = [
    { label: "Upload Materials", icon: <Upload size={22} />, accent: "from-sky-500 to-primary-500" },
    { label: "AI Analysis", icon: <BrainCircuit size={22} />, accent: "from-primary-500 to-indigo-500" },
    { label: "Personalized Roadmap", icon: <Route size={22} />, accent: "from-indigo-500 to-fuchsia-500" },
    { label: "Better Preparation", icon: <Trophy size={22} />, accent: "from-fuchsia-500 to-rose-500" },
  ];
  return (
    <div className="card p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div key={it.label} className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div
                className={
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white " +
                  it.accent
                }
              >
                {it.icon}
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900">
                Step {i + 1}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {it.label}
              </p>
            </div>
            {i < items.length - 1 && (
              <ArrowRight
                size={20}
                className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-slate-300 lg:block"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
