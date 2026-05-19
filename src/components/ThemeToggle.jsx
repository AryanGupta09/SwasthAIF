import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = ({ floating = false }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className={`theme-toggle ${floating ? "theme-toggle-floating" : "theme-toggle-inline"}`}
      onClick={toggleTheme}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <span className="theme-toggle-icon">{theme === "light" ? "🌙" : "☀️"}</span>
      {!floating && <span className="theme-toggle-label">{theme === "light" ? "Dark" : "Light"}</span>}
    </button>
  );
};

export default ThemeToggle;
