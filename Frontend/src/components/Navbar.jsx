import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/Ufindais.png";

const Navbar = ({ onToggleTheme, theme }) => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className="flex justify-between items-center px-8 py-4 border-b"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <Link
        to="/"
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        <img src={logo} alt="UfindAIs Logo" className="h-10 inline-block " />
        <div className="inline-block align-middle sm:inline">
          Ufind<span className="text-indigo-500">AIs</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="space-x-6 hidden md:flex items-center">
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>
        <Link to="/explore" style={{ color: "var(--text-primary)" }}>
          Explore
        </Link>
        {/* <Link
          to="/nonAI"
          style={{ color: "var(--text-primary)" }}
          className="text-sm border border-gray-500 px-2 py-1 rounded-lg"
        >
          <span>Other tools</span>
        </Link> */}

        {user ? (
          <>
            <Link to="/dashboard" style={{ color: "var(--text-primary)" }}>
              Dashboard
            </Link>
            {user.role === "admin" && (
              <>
                <Link to="/submit" style={{ color: "var(--text-primary)" }}>
                  Submit AI
                </Link>
                <Link to="/admin" style={{ color: "var(--text-primary)" }}>
                  Admin
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="bg-indigo-600 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "var(--text-primary)" }}>
              Login
            </Link>
            <Link to="/register" className="bg-indigo-600 px-4 py-2 rounded-lg">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-1"
        onClick={() => setIsMenuOpen(true)}
        style={{ color: "var(--text-primary)" }}
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0f172a] bg-opacity-60 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu panel */}
          <div
            className="fixed top-0 right-0 h-full w-72 bg-card border-l shadow-2xl z-50 md:hidden flex flex-col p-6 overflow-y-auto"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex justify-between items-center mb-8">
              <div
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Menu
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                ×
              </button>
            </div>

            <ul className="flex-1 space-y-4">
              <li>
                <Link
                  to="/explore"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Explore
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/nonAI"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-block text-sm border border-gray-500 px-3 py-2 rounded-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Other tools
                </Link>
              </li> */}
              {user ? (
                <>
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Dashboard
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <>
                      <li>
                        <Link
                          to="/submit"
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Submit AI
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Admin
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-4 bg-indigo-600 rounded-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 px-4 bg-indigo-600 rounded-lg font-semibold"
                      style={{ color: "white" }}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
