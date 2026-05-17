import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./Pages/Home.jsx";
import Explore from "./Pages/Explore.jsx";
import AIDetails from "./Pages/AIDetails.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import { ErrorBoundary } from "react-error-boundary";
import SubmitAI from "./Pages/SubmitAI.jsx";
import Dashboard from "./Pages/User/Dashboard.jsx";
import Admin from "./Pages/Admin.jsx";
import Quiz from "./Pages/Quiz.jsx";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <BrowserRouter>
        <AuthProvider>
          <div
            data-theme={theme}
            className="min-h-screen"
            style={{
              backgroundColor: "var(--bg-darker)",
              color: "var(--text-primary)",
            }}
          >
            <Navbar onToggleTheme={toggleTheme} theme={theme} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/ai/:id" element={<AIDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitAI />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/quiz" element={<Quiz />} />

              {/* <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <SubmitAI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        /> */}
            </Routes>

            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
