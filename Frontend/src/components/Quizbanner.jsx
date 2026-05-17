import { Link } from "react-router-dom";

/**
 * Drop this banner anywhere on Home.jsx (or Explore.jsx) to
 * drive users to the quiz. Place it between the hero and featured tools.
 *
 * Usage in Home.jsx:
 *   import QuizBanner from "../components/QuizBanner";
 *   <QuizBanner />
 */
const QuizBanner = () => {
  return (
    <section
      className="mx-6 my-10 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
      style={{
        background: "linear-gradient(135deg, #6366f115 0%, #818cf810 100%)",
        border: "1px solid #6366f130",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Not sure where to start?
          </h2>
        </div>
        <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
          Answer 5 quick questions and we'll match you to the best AI tools for
          your goals, skill level, and budget.
        </p>
      </div>

      <Link
        to="/quiz"
        className="btn whitespace-nowrap shrink-0"
        style={{
          backgroundColor: "var(--color-primary, #6366f1)",
          color: "#fff",
          border: "none",
        }}
      >
        Get a Recommendation →
      </Link>
    </section>
  );
};

export default QuizBanner;
