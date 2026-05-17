import React from "react";

const ThemeToggle = ({ theme, onToggleTheme }) => {
  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        onChange={onToggleTheme}
        checked={theme === "dark"}
      />

      {/* Sun icon */}
      <svg
        className="swap-off fill-current w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M5.64 17.66L4.22 19.07 2.81 17.66 4.22 16.24 5.64 17.66zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.78 3.22l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zM20 11v2h3v-2h-3zm-8 8a7 7 0 100-14 7 7 0 000 14zm6.36-1.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zM11 23h2v-3h-2v3zM4.22 7.76L2.81 6.34 4.22 4.93 5.64 6.34 4.22 7.76z" />
      </svg>

      {/* Moon icon */}
      <svg
        className="swap-on fill-current w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M21.64 13A9 9 0 0111 2.36 9 9 0 1021.64 13z" />
      </svg>
    </label>
  );
};

export default ThemeToggle;
