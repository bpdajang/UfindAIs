import React, { useEffect, useState, useContext } from "react";
import { aiTools } from "../../data/sampleData";
import AICard from "../../components/AICard";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {
  const { user: contextUser, token } = useContext(AuthContext);

  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);

  const [user, setUser] = useState(contextUser || null);
  const [loadingUser, setLoadingUser] = useState(!contextUser);
  const [userError, setUserError] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    setUser(contextUser || null);
    setLoadingUser(!contextUser);
    setUserError("");
  }, [contextUser]);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      setLoadingUser(true);
      setUserError("");
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setUserError(data?.detail || "Failed to load user");
          return;
        }

        const data = await res.json();
        setUser(data);
        setForm({ name: data.name || "", email: data.email || "" });
      } catch {
        setUserError("Network error while loading user.");
      } finally {
        setLoadingUser(false);
      }
    };

    if (!contextUser) loadMe();
  }, [token]);

  useEffect(() => {
    const loadSavedAndRecent = async () => {
      if (!token) return;
      try {
        const [savedRes, recentRes] = await Promise.all([
          fetch("/api/users/me/saved", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/users/me/recent", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setFavorites(savedData || []);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecent(recentData || []);
        }
      } catch {
        // keep existing state
      }
    };

    loadSavedAndRecent();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUserError(data?.detail || "Failed to update profile");
        return;
      }

      const data = await res.json();
      setUser(data);
      setForm({ name: data.name || "", email: data.email || "" });
      setEditMode(false);
      alert("Profile updated!");
    } catch {
      setUserError("Network error while updating profile.");
    }
  };

  const { logout } = useContext(AuthContext);

  const verifyAccount = async () => {
    if (!token) return;
    setUserError("");

    try {
      const res = await fetch("/api/users/me/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUserError(data?.detail || "Failed to verify account");
        return;
      }

      const data = await res.json();
      // Refresh user view
      setUser((prev) => (prev ? { ...prev, verified: true } : prev));
      alert(data?.message || "Account verified!");
    } catch {
      setUserError("Network error while verifying account.");
    }
  };

  const deleteAccount = async () => {
    if (!token) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?",
    );

    if (!confirmDelete) return;
    setUserError("");

    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUserError(data?.detail || "Failed to delete account");
        return;
      }

      logout();
      window.location.href = "/login";
    } catch {
      setUserError("Network error while deleting account.");
    }
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          "linear-gradient(to bottom, var(--bg-dark), var(--bg-darker))",
        color: "var(--text-primary)",
      }}
    >
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      {/* ===================== */}
      {/* ACCOUNT INFO */}
      {/* ===================== */}

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Account Info</h2>

        <div
          className="p-6 rounded-xl shadow"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          {!editMode ? (
            <>
              {loadingUser ? (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
              ) : user ? (
                <>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>

                  <p className="mt-2">
                    <strong>Status:</strong>{" "}
                    {user.verified ? (
                      <span className="text-green-400">Verified</span>
                    ) : (
                      <span className="text-yellow-400">Not Verified</span>
                    )}
                  </p>
                </>
              ) : (
                <p style={{ color: "#ff6b6b" }}>{userError || "No user"}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Profile
                </button>

                {user && !user.verified && (
                  <button
                    onClick={verifyAccount}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                  >
                    Verify Email
                  </button>
                )}

                <button
                  onClick={deleteAccount}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
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
                />
              </div>

              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 rounded hover:bg-gray-600"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ==================== */}
      {/* SAVED COLLECTION */}
      {/* ==================== */}

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Saved AI Tools</h2>

        {favorites.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No saved AI tools yet</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {favorites.map((tool) => (
              <AICard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
