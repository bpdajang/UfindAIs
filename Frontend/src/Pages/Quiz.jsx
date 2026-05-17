import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    id: "goal",
    question: "What's your main goal?",
    options: [
      {
        icon: "✍️",
        label: "Writing & content",
        sub: "Blogs, emails, copy",
        val: "Writing",
      },
      {
        icon: "💻",
        label: "Coding & dev",
        sub: "Build & ship faster",
        val: "Coding",
      },
      {
        icon: "🎨",
        label: "Design & visuals",
        sub: "Images, video, UI",
        val: "Design",
      },
      {
        icon: "📈",
        label: "Marketing & growth",
        sub: "Ads, SEO, analytics",
        val: "Marketing",
      },
      {
        icon: "⚙️",
        label: "Productivity",
        sub: "Automate & organise",
        val: "Productivity",
      },
      {
        icon: "🔬",
        label: "Research",
        sub: "Summarise & analyse",
        val: "Writing",
      },
    ],
  },
  {
    id: "level",
    question: "How would you describe your experience with AI tools?",
    options: [
      {
        icon: "👋",
        label: "Just starting out",
        sub: "New to AI tools",
        val: "beginner",
      },
      {
        icon: "🙂",
        label: "Some experience",
        sub: "Used a few tools",
        val: "intermediate",
      },
      {
        icon: "🚀",
        label: "Power user",
        sub: "Comfortable with APIs",
        val: "advanced",
      },
    ],
  },
  {
    id: "budget",
    question: "What's your budget?",
    options: [
      { icon: "🆓", label: "Free only", sub: "No credit card", val: "Free" },
      {
        icon: "💳",
        label: "Up to $20/mo",
        sub: "Freemium & entry plans",
        val: "Freemium",
      },
      { icon: "💼", label: "$20–100/mo", sub: "Pro & team plans", val: "Paid" },
      {
        icon: "🏢",
        label: "Enterprise",
        sub: "Team or company budget",
        val: "Enterprise",
      },
    ],
  },
  {
    id: "style",
    question: "How do you prefer to work?",
    options: [
      {
        icon: "🖱️",
        label: "No-code UI",
        sub: "Click, not type",
        val: "nocode",
      },
      {
        icon: "⌨️",
        label: "API / code",
        sub: "Build my own workflow",
        val: "code",
      },
      {
        icon: "🔌",
        label: "Integrations",
        sub: "Plug into existing apps",
        val: "integrations",
      },
      {
        icon: "📱",
        label: "Mobile-first",
        sub: "Works on my phone",
        val: "mobile",
      },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      {
        icon: "⚡",
        label: "Speed & output",
        sub: "Get things done fast",
        val: "speed",
      },
      {
        icon: "🎯",
        label: "Quality & accuracy",
        sub: "Best results",
        val: "quality",
      },
      {
        icon: "🔒",
        label: "Privacy & security",
        sub: "Data stays private",
        val: "privacy",
      },
      {
        icon: "🤝",
        label: "Collaboration",
        sub: "Works with my team",
        val: "collab",
      },
    ],
  },
];

const Quiz = ({ allTools = [] }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  const pick = (val) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const next = async () => {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      await fetchResults();
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Send all 5 quiz dimensions to the new endpoint
      const params = new URLSearchParams({
        goal: answers.goal || "",
        level: answers.level || "",
        budget: answers.budget || "",
        style: answers.style || "",
        priority: answers.priority || "",
        limit: 4,
      });

      const res = await fetch(`/api/quiz/results?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResults(data);
    } catch {
      // Fallback: basic client-side filter if API is unreachable
      const filtered = allTools
        .filter((t) => {
          if (!answers.goal) return true;
          // DB may store category as string[]; quiz wants a single goal string.
          if (Array.isArray(t.category))
            return t.category.includes(answers.goal);
          return t.category === answers.goal;
        })
        .filter((t) => !answers.budget || t.pricing === answers.budget)
        .slice(0, 4);
      setResults(filtered.length ? filtered : allTools.slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  const goToExplore = () => {
    navigate(`/explore`);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-darker)" }}
      >
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-indigo-500 mb-4"></div>
          <p style={{ color: "var(--text-muted)" }}>
            Finding your best matches...
          </p>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (results) {
    return (
      <div
        className="min-h-screen px-6 py-16 max-w-3xl mx-auto"
        style={{ backgroundColor: "var(--bg-darker)" }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Your AI tool matches
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Based on your answers — here are the best tools for you.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          {results.map((tool, i) => (
            <div
              key={tool.id}
              className="flex items-start gap-4 p-5 rounded-xl transition hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--bg-card)",
                border:
                  i === 0
                    ? "1.5px solid #6366f1"
                    : "1px solid var(--border-color)",
              }}
            >
              {tool.logo ? (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  🤖
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {i === 0 && (
                    <span
                      className="badge badge-sm text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "#6366f120", color: "#818cf8" }}
                    >
                      Best match
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {tool.pricing || "Freemium"}
                  </span>
                </div>
                <p
                  className="font-semibold text-base"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tool.name}
                </p>
                <p
                  className="text-sm mt-1 line-clamp-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tool.description}
                </p>
              </div>

              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm shrink-0"
                style={{
                  backgroundColor: "var(--color-primary, #6366f1)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Visit
              </a>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={goToExplore}
            className="btn"
            style={{
              backgroundColor: "var(--color-primary, #6366f1)",
              color: "#fff",
              border: "none",
            }}
          >
            See all {answers.goal || ""} tools →
          </button>
          <button
            onClick={retake}
            className="btn"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz questions ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{ backgroundColor: "var(--bg-darker)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Find your perfect AI tool
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Answer 5 quick questions and we'll match you to the best tools.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div
            className="flex justify-between text-xs mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              Question {step + 1} of {questions.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--color-primary, #6366f1)",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          {current.question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {current.options.map((opt) => {
            const isSelected = answers[current.id] === opt.val;
            return (
              <button
                key={opt.val + opt.label}
                onClick={() => pick(opt.val)}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: isSelected ? "#6366f115" : "var(--bg-card)",
                  border: isSelected
                    ? "1.5px solid #6366f1"
                    : "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className="font-medium text-sm">{opt.label}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={back}
            disabled={step === 0}
            className="btn btn-sm"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              opacity: step === 0 ? 0.4 : 1,
            }}
          >
            ← Back
          </button>

          <button
            onClick={next}
            disabled={!answers[current.id]}
            className="btn btn-sm"
            style={{
              backgroundColor: answers[current.id]
                ? "var(--color-primary, #6366f1)"
                : "var(--bg-secondary)",
              color: answers[current.id] ? "#fff" : "var(--text-muted)",
              border: "none",
              opacity: answers[current.id] ? 1 : 0.5,
            }}
          >
            {step === questions.length - 1 ? "See my matches →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
