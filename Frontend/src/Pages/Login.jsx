import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new URLSearchParams();
      // Backend expects OAuth2PasswordRequestForm: fields are username + password
      form.set("username", email);
      form.set("password", password);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail || "Login failed");
        return;
      }

      const data = await res.json();
      // backend returns { access_token, token_type, user }
      login({ user: data.user, access_token: data.access_token });
      navigate("/");
    } catch {
      setError("Network error. Please try again.");
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
          Login
        </h2>

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mb-4" style={{ color: "#ff6b6b" }}>
            {error}
          </p>
        )}

        <button
          className="w-full bg-indigo-600 py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
