import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AICard from "../components/AICard";

const STATIC_CATEGORIES = [
  "All",
  // multi-tag categories so tools can appear in more than one theme
  "AI assistance",
  "Writing",
  "Coding",
  "Design",
  "Video",
  "Marketing",
  "Productivity",
  "Education",
  "Business",
  "Research",
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selected, setSelected] = useState(initialCategory);
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dynamic categories from API (falls back to static list)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/tools/categories`,
        );
        const data = await res.json();
        setCategories(["All", ...data]);
      } catch (error) {
        setCategories(STATIC_CATEGORIES);
      }
    };
    fetchData();
  }, []);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selected !== "All") params.set("category", selected);
      params.set("limit", "50");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tools?${params}`,
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setTools(data);
    } catch (err) {
      setError("Could not load tools. Please try again.");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [search, selected]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(fetchTools, 300);
    return () => clearTimeout(timer);
  }, [fetchTools]);

  // Keep URL in sync with filters
  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (selected !== "All") next.category = selected;
    setSearchParams(next, { replace: true });
  }, [search, selected]);

  const handleCategorySelect = (cat) => {
    setSelected(cat);
  };

  return (
    <div
      className="px-6 py-16"
      style={{ backgroundColor: "var(--bg-darker)", minHeight: "100vh" }}
    >
      <h1
        className="text-4xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        Explore AI Tools
      </h1>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
        <input
          type="text"
          placeholder="Search AI tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg px-4 py-2 w-full md:w-80 focus:outline-none focus:border-indigo-500"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
        />

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="px-4 py-2 rounded-lg text-sm transition hover:bg-gray-700"
              style={{
                backgroundColor:
                  selected === cat
                    ? "var(--color-primary, #6366f1)"
                    : "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-indigo-500"></span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-24">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTools}
            className="btn btn-sm"
            style={{
              backgroundColor: "var(--color-primary, #6366f1)",
              color: "#fff",
              border: "none",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && tools.length === 0 && (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p
            className="text-lg font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No tools found
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Try a different search or category
          </p>
        </div>
      )}

      {!loading && !error && tools.length > 0 && (
        <>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {tools.length} tool{tools.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <AICard key={tool.id} tool={tool} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
