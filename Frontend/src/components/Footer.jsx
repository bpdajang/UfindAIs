import { Link } from "react-router-dom";
import logo from "../assets/Ufindais.png";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-dark)",
        borderTop: "1px solid var(--border-color)",
      }}
      className="mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Section */}
        <div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            <img
              src={logo}
              alt="UfindAIs Logo"
              className="h-10 inline-block "
            />
            <div className="inline-block align-middle sm:inline">
              Ufind<span className="text-indigo-500">AIs</span>
            </div>
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Discover, explore and submit the best AI tools in one place. Built
            for creators, developers, marketers and founders.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Platform
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/explore"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Explore AI
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Categories
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/explore?category=Writing"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Writing
              </Link>
            </li>
            <li>
              <Link
                to="/explore?category=Coding"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Coding
              </Link>
            </li>
            <li>
              <Link
                to="/explore?category=Design"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Design
              </Link>
            </li>
            <li>
              <Link
                to="/explore?category=Video"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Video
              </Link>
            </li>
            <li>
              <Link
                to="/explore?category=Marketing"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Marketing
              </Link>
            </li>
            <li>
              <Link
                to="/explore?category=Productivity"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Productivity
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Social */}
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Company
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/about"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-white transition"
                style={{ color: "var(--text-muted)" }}
              >
                Terms of Service
              </Link>
            </li>
          </ul>

          {/* Social Links */}
          <div className="flex space-x-4 mt-6">
            <a
              href="#"
              className="hover:text-indigo-500 transition"
              style={{ color: "var(--text-muted)" }}
            >
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-indigo-500 transition"
              style={{ color: "var(--text-muted)" }}
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="hover:text-indigo-500 transition"
              style={{ color: "var(--text-muted)" }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        style={{ borderTop: "1px solid var(--border-color)" }}
        className="py-6 text-center text-sm"
      >
        <p style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} ufoundai. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
