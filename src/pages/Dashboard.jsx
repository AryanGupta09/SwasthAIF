import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const features = [
    {
      icon: "🥗",
      title: "Diet Plan",
      description: "Get personalized AI-powered meal plans based on your BMI and health goals",
      path: "/diet",
      color: "#4caf50"
    },
    {
      icon: "🔄",
      title: "Meal Swap",
      description: "Had something unhealthy? Get adjusted meal recommendations for the rest of your day",
      path: "/meal-swap",
      color: "#ff9800"
    },
    {
      icon: "💬",
      title: "AI Coach",
      description: "Chat with your personal fitness assistant anytime, anywhere",
      path: "/chat",
      color: "#2196f3"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <div className="dashboard-user-section">
            <span className="dashboard-welcome-text">Welcome, {userName}!</span>
            <button 
              className="dashboard-profile-btn"
              onClick={() => navigate("/profile")}
            >
              <span>👤</span> Profile
            </button>
            <button className="dashboard-logout-btn" onClick={logout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <h2 className="dashboard-hero-title">Your AI-Powered Fitness Journey</h2>
          <p className="dashboard-hero-subtitle">
            Personalized diet plans, expert coaching, and progress tracking - all in one place. 
            Start your transformation today with SwasthAI's intelligent fitness ecosystem.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="dashboard-features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="dashboard-feature-card"
              style={{ borderTop: `5px solid ${feature.color}` }}
              onClick={() => navigate(feature.path)}
            >
              <div className="dashboard-feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="dashboard-feature-title">{feature.title}</h3>
              <p className="dashboard-feature-description">{feature.description}</p>
              <button
                className="dashboard-feature-btn"
                style={{ backgroundColor: feature.color }}
              >
                Get Started →
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="dashboard-info-section">
          <h3 className="dashboard-info-title">🎯 Why Choose SwasthAI?</h3>
          <p className="dashboard-info-text">
            Our AI-powered platform combines cutting-edge technology with personalized health insights. 
            Whether you're looking to lose weight, gain muscle, or maintain a healthy lifestyle, 
            SwasthAI adapts to your unique needs and guides you every step of the way.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="dashboard-footer-content">
          <div className="dashboard-footer-section">
            <h4 className="dashboard-footer-brand">💪 SwasthAI</h4>
            <p className="dashboard-footer-tagline">
              Your AI-powered health companion for a better lifestyle
            </p>
          </div>

          <div className="dashboard-footer-section">
            <h5 className="dashboard-footer-heading">Quick Links</h5>
            <ul className="dashboard-footer-links">
              <li onClick={() => navigate("/diet")}>Diet Plan</li>
              <li onClick={() => navigate("/meal-swap")}>Meal Swap</li>
              <li onClick={() => navigate("/chat")}>AI Coach</li>
              <li onClick={() => navigate("/profile")}>My Profile</li>
            </ul>
          </div>

          <div className="dashboard-footer-section">
            <h5 className="dashboard-footer-heading">Features</h5>
            <ul className="dashboard-footer-links">
              <li>🥗 Personalized Meal Plans</li>
              <li>💬 24/7 AI Assistance</li>
              <li>📊 BMI Tracking</li>
            </ul>
          </div>

          <div className="dashboard-footer-section">
            <h5 className="dashboard-footer-heading">Stay Healthy</h5>
            <p className="dashboard-footer-text">
              Track your progress, achieve your goals, and live your best life with SwasthAI
            </p>
          </div>
        </div>

        <div className="dashboard-footer-bottom">
          <p>© 2026 SwasthAI. All rights reserved.</p>
          <p className="dashboard-footer-motto">Your Health, Our Priority 💚</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
