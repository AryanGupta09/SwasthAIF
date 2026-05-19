import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    setError("");

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      
      // Auto login after registration
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password
      });

      localStorage.setItem("token", loginRes.data.token);
      
      if (loginRes.data.user?.name) {
        localStorage.setItem("userName", loginRes.data.user.name);
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
            <p className="auth-tagline">Transform Your Health with AI</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">✨</div>
              <div className="auth-feature-text">
                <h3>AI-Powered Recommendations</h3>
                <p>Smart suggestions based on your profile</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🎯</div>
              <div className="auth-feature-text">
                <h3>Personalized Goals</h3>
                <p>Set and achieve your fitness targets</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🏆</div>
              <div className="auth-feature-text">
                <h3>Achieve Success</h3>
                <p>Join thousands reaching their goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Join thousands achieving their fitness goals</p>
            </div>

            {error && (
              <div className="auth-alert">
                <span className="auth-alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {passwordStrength && (
                  <div className={`auth-strength auth-strength-${passwordStrength}`}>
                    <div className="auth-strength-bar">
                      <div className="auth-strength-fill"></div>
                    </div>
                    <span className="auth-strength-text">
                      {passwordStrength === "weak" && "Weak password"}
                      {passwordStrength === "medium" && "Medium strength"}
                      {passwordStrength === "strong" && "Strong password"}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-input-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    autoComplete="new-password"
                  />
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <button onClick={() => navigate("/")}>
                  Login Here
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

export default Register;
