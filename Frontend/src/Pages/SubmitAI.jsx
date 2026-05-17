import { useState } from "react";

const SubmitAI = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", form);
  };

  return (
    <div className="flex justify-center py-20">
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl w-full max-w-xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Submit Your AI Tool
        </h2>

        <input
          type="text"
          placeholder="AI Name"
          className="w-full mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <textarea
          placeholder="Short Description"
          className="w-full mb-6 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          rows="4"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button className="w-full bg-indigo-600 py-3 rounded-lg">
          Submit for Review
        </button>
      </form>
    </div>
  );
};

export default SubmitAI;
