import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AICard from "../components/AICard";
import { Bookmark } from "lucide-react";
import useSavedStatus from "../hooks/useSavedStatus";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const AIDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [tool, setTool] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { isSaved, setIsSaved } = useSavedStatus({ token, toolId: tool?.id });

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/users/me/saved/${tool.id}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to update save");
      }

      setIsSaved(!isSaved);
    } catch {
      // revert visual state by re-syncing from hook
      setIsSaved(isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchTool = async () => {
      setLoading(true);
      setError(null);
      try {
        const [toolRes, altRes] = await Promise.all([
          fetch(`/api/tools/${id}`),
          fetch(`/api/tools/${id}/alternatives`),
        ]);

        if (!toolRes.ok) {
          setError(
            toolRes.status === 404 ? "Tool not found." : "Failed to load tool.",
          );
          return;
        }

        const toolData = await toolRes.json();
        setTool(toolData);

        if (altRes.ok) {
          const altData = await altRes.json();
          setAlternatives(altData);
        }
      } catch (err) {
        // Surface the real reason (offline/server down/CORS/misconfigured proxy/etc.)
        console.error("Failed to load tool details:", err);
        const msg = err?.message ? String(err.message) : "Unknown error";
        setError(`Could not connect to the server. (${msg})`);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const getPricingColor = (pricing) => {
    switch (pricing?.toLowerCase()) {
      case "free":
        return "bg-green-500/20 text-green-400";
      case "freemium":
        return "bg-blue-500/20 text-blue-400";
      case "free trial":
        return "bg-purple-500/20 text-purple-400";
      case "paid":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-darker)" }}
      >
        <span className="loading loading-spinner loading-lg text-indigo-500"></span>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !tool) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{
          backgroundColor: "var(--bg-darker)",
          color: "var(--text-primary)",
        }}
      >
        <p className="text-xl">{error || "Tool not found."}</p>
        <Link
          to="/explore"
          className="btn btn-sm"
          style={{
            backgroundColor: "var(--color-primary, #6366f1)",
            color: "#fff",
            border: "none",
          }}
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{ backgroundColor: "var(--bg-darker)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/explore"
          className="inline-flex items-center hover:text-white mb-8 transition"
          style={{ color: "var(--text-muted)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Explore
        </Link>

        {/* Header */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div
              className="p-4 rounded-xl w-24 h-24 flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              {tool.logo ? (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-3xl font-bold text-indigo-500">
                  {tool.name?.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  style={{ color: "var(--text-muted)" }}
                  className="text-sm"
                >
                  AI Categories:
                </span>
                {tool.functions?.map((func, i) => (
                  <span
                    key={i}
                    className="text-xs bg-indigo-600/30 text-indigo-400 px-2 py-1 rounded-full"
                  >
                    {func}
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <span
                  style={{ color: "var(--text-muted)" }}
                  className="text-sm"
                >
                  Pricing Model:{" "}
                </span>
                {tool.pricing && (
                  <span
                    className={`text-sm px-2 py-0.5 rounded-full ${getPricingColor(tool.pricing)}`}
                  >
                    {tool.pricing}
                  </span>
                )}
                {tool.pricingDetail && (
                  <span
                    style={{ color: "var(--text-secondary)" }}
                    className="text-sm ml-2"
                  >
                    {tool.pricingDetail}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {/* tool.link is the correct field name from your backend */}
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-indigo-500 hover:bg-indigo-500 py-2 px-4 rounded-lg text-center transition font-medium"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Visit Site
                </a>
              </div>
            </div>

            {/* Save - Clickable */}
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-1 text-sm transition `}
            >
              <Bookmark
                className={
                  isSaved
                    ? "text-indigo-500 fill-indigo-500"
                    : "text-gray-400 hover:text-indigo-400"
                }
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* Definition */}
        {tool.definition && (
          <Section title={`What is ${tool.name}?`}>
            <p
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.definition}
            </p>
          </Section>
        )}

        {/* Key Features */}
        {tool.keyFeatures?.length > 0 && (
          <Section title="Key Features">
            <ul className="grid md:grid-cols-2 gap-3">
              {tool.keyFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-500 mr-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Pricing */}
        <Section title="Pricing">
          <p style={{ color: "var(--text-secondary)" }}>
            {tool.pricingDetail || tool.pricing}
          </p>
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Disclaimer:</strong> Pricing information may not be up to
              date. Check the official {tool.name} website for current details.
            </p>
          </div>
        </Section>

        {/* Who is using */}
        {tool.whoIsUsing && (
          <Section title={`Who is Using ${tool.name}?`}>
            <p
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.whoIsUsing}
            </p>
          </Section>
        )}

        {/* What makes unique */}
        {tool.whatMakesUnique && (
          <Section title={`What Makes ${tool.name} Unique?`}>
            <p
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.whatMakesUnique}
            </p>
          </Section>
        )}

        {/* Summary */}
        {tool.summary && (
          <Section title="Summary">
            <p
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.summary}
            </p>
          </Section>
        )}

        {/* Alternatives */}
        <Section title="Alternatives">
          {alternatives.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              No alternatives found for {tool.name}.
            </p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {alternatives.map((alt) => (
                <AICard key={alt.id} tool={alt} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

// Small layout helper — keeps sections consistent
const Section = ({ title, children }) => (
  <div
    className="rounded-2xl p-8 mb-8"
    style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-color)",
    }}
  >
    <h2
      className="text-xl font-bold mb-4"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h2>
    {children}
  </div>
);

export default AIDetails;
