import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/MealSwap.css";

const MealSwap = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    consumedFood: "",
    consumedTime: "",
    consumedCalories: ""
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consumedFood || !formData.consumedTime) {
      setError("Please fill all required fields");
      return;
    }

    if (!user?.latestDietPlan?.meals) {
      setError("Please generate a diet plan first from Diet page");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      
      const requestData = {
        consumedFood: formData.consumedFood,
        consumedTime: formData.consumedTime,
        consumedCalories: formData.consumedCalories,
        bmi: user.bmi || 22,
        foodPreference: user.foodPreference || "Vegetarian",
        diseases: user.diseases?.join(", ") || "",
        currentMealPlan: user.latestDietPlan.meals
      };

      const res = await API.post("/diet/swap", requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(res.data);
      
      // Update user's latest diet plan with adjusted meals
      const updatedMeals = {
        breakfast: res.data.adjustedMeals.breakfast || user.latestDietPlan.meals.breakfast,
        lunch: res.data.adjustedMeals.lunch || user.latestDietPlan.meals.lunch,
        snacks: res.data.adjustedMeals.snacks || user.latestDietPlan.meals.snacks,
        dinner: res.data.adjustedMeals.dinner || user.latestDietPlan.meals.dinner
      };

      // Update local user state
      setUser({
        ...user,
        latestDietPlan: {
          ...user.latestDietPlan,
          meals: updatedMeals
        }
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to adjust meals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-swap-container">
      {/* Header */}
      <header className="meal-swap-header">
        <div className="meal-swap-header-content">
          <h1 className="meal-swap-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <button className="meal-swap-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="meal-swap-main">
        <div className="meal-swap-hero">
          <h2 className="meal-swap-hero-title">🔄 Meal Swap</h2>
          <p className="meal-swap-hero-subtitle">
            Had something unhealthy? Don't worry! Tell us what you ate and we'll adjust your remaining meals
          </p>
        </div>

        {error && (
          <div className="meal-swap-alert meal-swap-alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="meal-swap-content">
          {/* Input Form */}
          <div className="meal-swap-form-card">
            <h3>What did you consume?</h3>
            <form onSubmit={handleSubmit}>
              <div className="meal-swap-form-group">
                <label>Food Item(s) *</label>
                <textarea
                  name="consumedFood"
                  value={formData.consumedFood}
                  onChange={handleChange}
                  placeholder="e.g., 1 Pizza slice, 1 Burger, 2 Samosas, etc."
                  rows="3"
                  required
                />
              </div>

              <div className="meal-swap-form-group">
                <label>Time Consumed *</label>
                <select
                  name="consumedTime"
                  value={formData.consumedTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time</option>
                  <option value="Morning (6 AM - 10 AM)">Morning (6 AM - 10 AM)</option>
                  <option value="Late Morning (10 AM - 12 PM)">Late Morning (10 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                  <option value="Evening (3 PM - 6 PM)">Evening (3 PM - 6 PM)</option>
                  <option value="Night (6 PM - 10 PM)">Night (6 PM - 10 PM)</option>
                  <option value="Late Night (10 PM onwards)">Late Night (10 PM onwards)</option>
                </select>
              </div>

              <div className="meal-swap-form-group">
                <label>Estimated Calories (Optional)</label>
                <input
                  type="number"
                  name="consumedCalories"
                  value={formData.consumedCalories}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>

              <button 
                type="submit" 
                className="meal-swap-submit-btn"
                disabled={loading}
              >
                {loading ? "Adjusting Meals..." : "Get Adjusted Meal Plan"}
              </button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="meal-swap-results">
              {/* Analysis */}
              <div className="meal-swap-analysis-card">
                <h3>📊 Analysis</h3>
                <p>{result.analysis}</p>
              </div>

              {/* Adjusted Meals */}
              <div className="meal-swap-meals-card">
                <h3>🍽️ Your Adjusted Meal Plan</h3>
                
                <div className="meal-swap-meals-grid">
                  {/* Breakfast */}
                  {result.adjustedMeals.breakfast ? (
                    <div className="meal-swap-meal-section">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🌅</span>
                        <h4>Breakfast</h4>
                      </div>
                      <div className="meal-swap-meal-options">
                        {result.adjustedMeals.breakfast.map((option, idx) => (
                          <div key={idx} className="meal-swap-meal-option">
                            <span className="meal-swap-option-label">Option {idx + 1}</span>
                            <p>{option}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="meal-swap-meal-section meal-swap-meal-consumed">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🌅</span>
                        <h4>Breakfast</h4>
                      </div>
                      <p className="meal-swap-consumed-text">✓ Already consumed</p>
                    </div>
                  )}

                  {/* Lunch */}
                  {result.adjustedMeals.lunch ? (
                    <div className="meal-swap-meal-section">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">☀️</span>
                        <h4>Lunch</h4>
                      </div>
                      <div className="meal-swap-meal-options">
                        {result.adjustedMeals.lunch.map((option, idx) => (
                          <div key={idx} className="meal-swap-meal-option">
                            <span className="meal-swap-option-label">Option {idx + 1}</span>
                            <p>{option}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="meal-swap-meal-section meal-swap-meal-consumed">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">☀️</span>
                        <h4>Lunch</h4>
                      </div>
                      <p className="meal-swap-consumed-text">✓ Already consumed</p>
                    </div>
                  )}

                  {/* Snacks */}
                  {result.adjustedMeals.snacks ? (
                    <div className="meal-swap-meal-section">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🍪</span>
                        <h4>Snacks</h4>
                      </div>
                      <div className="meal-swap-meal-options">
                        {result.adjustedMeals.snacks.map((option, idx) => (
                          <div key={idx} className="meal-swap-meal-option">
                            <span className="meal-swap-option-label">Option {idx + 1}</span>
                            <p>{option}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="meal-swap-meal-section meal-swap-meal-consumed">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🍪</span>
                        <h4>Snacks</h4>
                      </div>
                      <p className="meal-swap-consumed-text">✓ Already consumed</p>
                    </div>
                  )}

                  {/* Dinner */}
                  {result.adjustedMeals.dinner ? (
                    <div className="meal-swap-meal-section">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🌙</span>
                        <h4>Dinner</h4>
                      </div>
                      <div className="meal-swap-meal-options">
                        {result.adjustedMeals.dinner.map((option, idx) => (
                          <div key={idx} className="meal-swap-meal-option">
                            <span className="meal-swap-option-label">Option {idx + 1}</span>
                            <p>{option}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="meal-swap-meal-section meal-swap-meal-consumed">
                      <div className="meal-swap-meal-header">
                        <span className="meal-swap-meal-icon">🌙</span>
                        <h4>Dinner</h4>
                      </div>
                      <p className="meal-swap-consumed-text">✓ Already consumed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="meal-swap-recommendations-card">
                <h3>💡 Recommendations</h3>
                <p>{result.recommendations}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MealSwap;
