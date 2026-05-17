import React, { useState } from "react";
import { aiTools as initialTools } from "../data/sampleData";

const Admin = () => {
  const [tools, setTools] = useState(initialTools);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    link: "",
    logo: "",
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    link: "",
    logo: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAI = {
      id: tools.length + 1,
      ...form,
      featured: false,
      views: 0,
      clicks: 0,
      saves: 0,
      pricing: "Freemium",
      pricingDetail: "",
      functions: [],
      definition: "",
      keyFeatures: [],
      whoIsUsing: "",
      whatMakesUnique: "",
      summary: "",
    };

    setTools([...tools, newAI]);

    setForm({
      name: "",
      description: "",
      category: "",
      link: "",
      logo: "",
    });
  };

  const deleteAI = (id) => {
    setTools(tools.filter((tool) => tool.id !== id));
  };

  // Open modal for editing
  const openEditModal = (tool) => {
    setEditingTool(tool);
    setEditForm({
      name: tool.name || "",
      description: tool.description || "",
      category: tool.category || "",
      link: tool.link || "",
      logo: tool.logo || "",
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTool(null);
    setEditForm({
      name: "",
      description: "",
      category: "",
      link: "",
      logo: "",
    });
  };

  // Save edited tool
  const saveEdit = () => {
    setTools(
      tools.map((tool) =>
        tool.id === editingTool.id ? { ...tool, ...editForm } : tool,
      ),
    );
    closeModal();
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: "var(--bg-darker)" }}
    >
      {/* PAGE TITLE */}
      <h1
        className="text-3xl font-bold mb-10"
        style={{ color: "var(--text-primary)" }}
      >
        Admin Dashboard
      </h1>

      {/* DASHBOARD STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div
          className="p-6 rounded-xl shadow"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2 style={{ color: "var(--text-muted)" }}>Total AI Tools</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {tools.length}
          </p>
        </div>

        <div
          className="p-6 rounded-xl shadow"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2 style={{ color: "var(--text-muted)" }}>Total Users</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">120</p>
        </div>

        <div
          className="p-6 rounded-xl shadow"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2 style={{ color: "var(--text-muted)" }}>Categories</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
        </div>
      </div>

      {/* ADD AI TOOL */}
      <div
        className="p-8 rounded-xl shadow mb-12 max-w-xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Add New AI Tool
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Logo URL
            </label>
            <input
              type="url"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              AI Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Website Link
            </label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              required
            />
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Add AI Tool
          </button>
        </form>
      </div>

      {/* MANAGE AI TOOLS */}
      <div
        className="shadow rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div
          className="p-6"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Manage AI Tools
          </h2>
        </div>

        <table className="w-full text-left">
          <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
            <tr>
              <th className="p-4" style={{ color: "var(--text-muted)" }}>
                Logo
              </th>
              <th className="p-4" style={{ color: "var(--text-muted)" }}>
                Name
              </th>
              <th className="p-4" style={{ color: "var(--text-muted)" }}>
                Category
              </th>
              <th className="p-4" style={{ color: "var(--text-muted)" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {tools.map((tool) => (
              <tr
                key={tool.id}
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                <td className="p-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    {tool.logo ? (
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-indigo-500 font-bold">
                        {tool.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="p-4 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tool.name}
                </td>
                <td className="p-4" style={{ color: "var(--text-secondary)" }}>
                  {tool.category}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => openEditModal(tool)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAI(tool.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Edit AI Tool
              </h2>
              <button
                onClick={closeModal}
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={editForm.logo}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  AI Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                  rows="3"
                />
              </div>

              <div>
                <label
                  className="block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Website Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={editForm.link}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Save Changes
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded hover:bg-gray-600 transition"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
