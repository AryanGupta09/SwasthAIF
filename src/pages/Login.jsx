import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      
      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo-circle">
              <span className="auth-logo-emoji">💪</span>
            </div>
            <h1 className="auth-brand-name">SwasthAI</h1>
            <p className="auth-tagline">Your AI-Powered Fitness Companion</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🥗</div>
              <div className="auth-feature-text">
                <h3>Personalized Diet Plans</h3>
                <p>AI-generated meal plans tailored to your goals</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">💬</div>
              <div className="auth-feature-text">
                <h3>24/7 AI Coach</h3>
                <p>Get instant fitness advice anytime, anywhere</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              <div className="auth-feature-text">
                <h3>Track Progress</h3>
                <p>Monitor your health journey with insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Welcome Back</h2>
              <p>Login to continue your fitness journey</p>
            </div>

            {error && (
              <div className="auth-alert">
                <span className="auth-alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`auth-submit ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")}>
                  Create Account
                </button>
              </p>
            </div>
          </div>

          <div className="auth-security">
            <span>🔒</span>
            <span>Your data is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
