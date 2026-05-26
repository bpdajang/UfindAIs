import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (e) {
      setError("Network error. Please try again.");
      console.error("Registration error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl w-96"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          required
          className="w-full mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full mb-6 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
        />

        <input
          type="password"
          placeholder="Confirm password"
          required
          className="w-full mb-6 p-3 rounded-lg"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }))
          }
        />

        {error ? (
          <div className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 py-3 rounded-lg disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
