import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AICard from "../components/AICard";
import QuizBanner from "../components/Quizbanner";

const Home = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Fetch enough tools so featured=true items aren't missed due to API default limit
      params.set("limit", "100");

      const res = await fetch(`/api/tools?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const featuredTools = (Array.isArray(data) ? data : [])
        .filter((t) => t?.featured === true)
        .sort((a, b) => {
          const at = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const bt = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return at - bt;
        });

      setTools(featuredTools);
    } catch (err) {
      setError("Could not load tools. Please try again.");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [setTools]);

  useEffect(() => {
    const timer = setTimeout(fetchTools, 300);
    return () => clearTimeout(timer);
  }, [fetchTools]);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="text-center py-24 px-6"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-dark), var(--bg-darker))",
        }}
      >
        <h1
          className="text-5xl md:text-6xl font-extrabold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Discover the Best AI Tools <br />
          <span className="text-indigo-500">All in One Place</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          UfindAIs helps you find powerful AI tools for writing, coding, design,
          marketing, productivity and more.
        </p>

        <Link
          to="/explore"
          className="bg-transparent border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          Explore AI Tools
        </Link>
      </section>
      <QuizBanner />

      {/* Featured Tools */}
      <section
        className="px-6 py-16"
        style={{ backgroundColor: "var(--bg-darker)" }}
      >
        <h2
          className="text-3xl font-bold mb-10"
          style={{ color: "var(--text-primary)" }}
        >
          Popular AI Tools
        </h2>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <AICard key={tool} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
