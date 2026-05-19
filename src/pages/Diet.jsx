import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Diet.css";

const Diet = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    height: "",
    weight: "",
    bmi: "",
    age: "",
    gender: "Male",
    activityLevel: "Moderate",
    foodPreference: "Vegetarian",
    diseases: "",
    goal: ""
  });

  const [showBMICalculator, setShowBMICalculator] = useState(false);
  const [diet, setDiet] = useState(null);
  const [calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    setError("");

    // Auto-calculate BMI when height and weight change
    if (name === "height" || name === "weight") {
      const height = name === "height" ? parseFloat(value) : parseFloat(form.height);
      const weight = name === "weight" ? parseFloat(value) : parseFloat(form.weight);
      
      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setForm(prev => ({ ...prev, bmi: calculatedBMI }));
      }
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(form.height);
    const weight = parseFloat(form.weight);
    
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setForm({ ...form, bmi: calculatedBMI });
      setShowBMICalculator(false);
    }
  };

  const calculateCalories = () => {
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    const age = parseFloat(form.age);
    const gender = form.gender;
    const activityLevel = form.activityLevel;

    if (!weight || !height || !age) return null;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === "Male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      "Sedentary": 1.2,
      "Light": 1.375,
      "Moderate": 1.55,
      "Active": 1.725,
      "Very Active": 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    // Adjust based on goal
    let targetCalories = tdee;
    if (form.goal === "Weight Loss") {
      targetCalories = Math.round(tdee - 500);
    } else if (form.goal === "Weight Gain" || form.goal === "Muscle Building") {
      targetCalories = Math.round(tdee + 500);
    }

    return {
      bmr: Math.round(bmr),
      tdee: tdee,
      target: targetCalories
    };
  };

  const generateDiet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Calculate calories
      const calorieData = calculateCalories();
      setCalories(calorieData);

      const res = await API.post(
        "/diet/generate",
        {
          bmi: parseFloat(form.bmi),
          foodPreference: form.foodPreference,
          diseases: form.diseases
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDiet(res.data.meals);

    } catch (err) {
      console.error("Diet generation error:", err);
      setError(err.response?.data?.message || "Diet generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: "Underweight", color: "#ff9800", icon: "⚠️", advice: "Weight gain recommended" };
    if (bmi < 25) return { text: "Normal Weight", color: "#4caf50", icon: "✅", advice: "Maintain current weight" };
    if (bmi < 30) return { text: "Overweight", color: "#ff9800", icon: "⚠️", advice: "Weight loss recommended" };
    return { text: "Obese", color: "#f44336", icon: "❗", advice: "Consult a doctor" };
  };

  const bmiCategory = form.bmi ? getBMICategory(parseFloat(form.bmi)) : null;

  return (
    <div className="diet-container">
      {/* Header */}
      <header className="diet-header">
        <div className="diet-header-content">
          <h1 className="diet-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <button className="diet-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="diet-main">
        <div className="diet-hero">
          <h2 className="diet-hero-title">🥗 AI Diet Generator</h2>
          <p className="diet-hero-subtitle">
            Get personalized Indian meal plans based on your health profile
          </p>
        </div>

        <div className="diet-content">
          {/* Form Section */}
          <div className="diet-form-wrapper">
            <form onSubmit={generateDiet} className="diet-form">
              {error && (
                <div className="diet-error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Body Metrics */}
              <div className="diet-step-card">
                <div className="diet-step-header">
                  <span className="diet-step-number">1</span>
                  <h3 className="diet-step-title">Body Metrics</h3>
                </div>
                
                <div className="diet-metrics-grid">
                  <div className="diet-metric-item">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      placeholder="170"
                      value={form.height}
                      onChange={handleChange}
                      required
                      min="50"
                      max="250"
                    />
                  </div>
                  <div className="diet-metric-item">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      placeholder="70"
                      value={form.weight}
                      onChange={handleChange}
                      required
                      min="20"
                      max="300"
                    />
                  </div>
                  <div className="diet-metric-item">
                    <label>Age (years)</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="25"
                      value={form.age}
                      onChange={handleChange}
                      required
                      min="10"
                      max="100"
                    />
                  </div>
                </div>

                {form.bmi && (
                  <div className="diet-bmi-display" style={{ borderColor: bmiCategory.color }}>
                    <div className="diet-bmi-left">
                      <span className="diet-bmi-label">Your BMI</span>
                      <span className="diet-bmi-number">{form.bmi}</span>
                    </div>
                    <div className="diet-bmi-right">
                      <span className="diet-bmi-icon">{bmiCategory.icon}</span>
                      <div>
                        <span className="diet-bmi-category" style={{ color: bmiCategory.color }}>
                          {bmiCategory.text}
                        </span>
                        <span className="diet-bmi-advice">{bmiCategory.advice}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Personal Details */}
              <div className="diet-step-card">
                <div className="diet-step-header">
                  <span className="diet-step-number">2</span>
                  <h3 className="diet-step-title">Personal Details</h3>
                </div>

                <div className="diet-field-group">
                  <label>Gender</label>
                  <div className="diet-radio-group">
                    <label className={`diet-radio-card ${form.gender === "Male" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={form.gender === "Male"}
                        onChange={handleChange}
                      />
                      <span className="diet-radio-icon">👨</span>
                      <span className="diet-radio-text">Male</span>
                    </label>
                    <label className={`diet-radio-card ${form.gender === "Female" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={form.gender === "Female"}
                        onChange={handleChange}
                      />
                      <span className="diet-radio-icon">👩</span>
                      <span className="diet-radio-text">Female</span>
                    </label>
                  </div>
                </div>

                <div className="diet-field-group">
                  <label>Activity Level</label>
                  <select
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                  >
                    <option value="Sedentary">Sedentary (Little/No exercise)</option>
                    <option value="Light">Light (1-3 days/week)</option>
                    <option value="Moderate">Moderate (3-5 days/week)</option>
                    <option value="Active">Active (6-7 days/week)</option>
                    <option value="Very Active">Very Active (Athlete)</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Diet Preferences */}
              <div className="diet-step-card">
                <div className="diet-step-header">
                  <span className="diet-step-number">3</span>
                  <h3 className="diet-step-title">Diet Preferences</h3>
                </div>

                <div className="diet-field-group">
                  <label>Food Preference</label>
                  <div className="diet-radio-group">
                    {["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"].map((pref) => (
                      <label key={pref} className={`diet-radio-card ${form.foodPreference === pref ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="foodPreference"
                          value={pref}
                          checked={form.foodPreference === pref}
                          onChange={handleChange}
                        />
                        <span className="diet-radio-icon">
                          {pref === "Vegetarian" && "🥬"}
                          {pref === "Non-Vegetarian" && "🍗"}
                          {pref === "Vegan" && "🌱"}
                          {pref === "Eggetarian" && "🥚"}
                        </span>
                        <span className="diet-radio-text">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="diet-field-group">
                  <label>Health Goal (Optional)</label>
                  <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                  >
                    <option value="">Select your goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="General Health">General Health</option>
                  </select>
                </div>

                <div className="diet-field-group">
                  <label>Medical Conditions (Optional)</label>
                  <textarea
                    name="diseases"
                    placeholder="e.g., Diabetes, Hypertension, Thyroid..."
                    value={form.diseases}
                    onChange={handleChange}
                    rows="3"
                  />
                  <small>This helps us create a safer, more suitable diet plan</small>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`diet-generate-btn ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Generating Your Plan...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Generate My Diet Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {diet && (
            <div className="diet-results-wrapper">
              <div className="diet-results-header">
                <div className="diet-results-badge">
                  <span>✨</span>
                  <span>AI Generated</span>
                </div>
                <h3>Your Personalized Diet Plan</h3>
                <p>A customized meal plan designed for your health goals</p>
              </div>

              {/* Calorie Information */}
              {calories && (
                <div className="diet-calorie-cards">
                  <div className="diet-calorie-card">
                    <span className="diet-calorie-icon">⚡</span>
                    <span className="diet-calorie-value">{calories.bmr}</span>
                    <span className="diet-calorie-label">BMR</span>
                    <span className="diet-calorie-desc">Base Metabolic Rate</span>
                  </div>
                  <div className="diet-calorie-card">
                    <span className="diet-calorie-icon">🏃</span>
                    <span className="diet-calorie-value">{calories.tdee}</span>
                    <span className="diet-calorie-label">TDEE</span>
                    <span className="diet-calorie-desc">Daily Energy Expenditure</span>
                  </div>
                  <div className="diet-calorie-card highlight">
                    <span className="diet-calorie-icon">🎯</span>
                    <span className="diet-calorie-value">{calories.target}</span>
                    <span className="diet-calorie-label">Target</span>
                    <span className="diet-calorie-desc">Recommended Calories</span>
                  </div>
                  {diet?.dailyProteinTarget && (
                    <div className="diet-calorie-card protein-card">
                      <span className="diet-calorie-icon">💪</span>
                      <span className="diet-calorie-value">{diet.dailyProteinTarget}g</span>
                      <span className="diet-calorie-label">Protein</span>
                      <span className="diet-calorie-desc">Daily Protein Target</span>
                    </div>
                  )}
                </div>
              )}

              {/* Meal Timeline */}
              <div className="diet-meals-timeline">
                <div className="diet-meal-card">
                  <div className="diet-meal-time">
                    <span className="diet-meal-icon">🌅</span>
                    <span>7:00 - 9:00 AM</span>
                  </div>
                  <div className="diet-meal-content">
                    <h4>Breakfast Options</h4>
                    <div className="diet-meal-options">
                      {Array.isArray(diet.breakfast) ? (
                        diet.breakfast.map((option, index) => (
                          <div key={index} className="diet-meal-option">
                            <span className="diet-option-number">Option {index + 1}</span>
                            {typeof option === 'object' && option.meal ? (
                              <>
                                <p>{option.meal}</p>
                                <span className="diet-protein-badge">💪 {option.protein}g protein</span>
                              </>
                            ) : (
                              <p>{option}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>{diet.breakfast}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="diet-meal-card">
                  <div className="diet-meal-time">
                    <span className="diet-meal-icon">☀️</span>
                    <span>12:00 - 2:00 PM</span>
                  </div>
                  <div className="diet-meal-content">
                    <h4>Lunch Options</h4>
                    <div className="diet-meal-options">
                      {Array.isArray(diet.lunch) ? (
                        diet.lunch.map((option, index) => (
                          <div key={index} className="diet-meal-option">
                            <span className="diet-option-number">Option {index + 1}</span>
                            {typeof option === 'object' && option.meal ? (
                              <>
                                <p>{option.meal}</p>
                                <span className="diet-protein-badge">💪 {option.protein}g protein</span>
                              </>
                            ) : (
                              <p>{option}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>{diet.lunch}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="diet-meal-card">
                  <div className="diet-meal-time">
                    <span className="diet-meal-icon">🍪</span>
                    <span>4:00 - 5:00 PM</span>
                  </div>
                  <div className="diet-meal-content">
                    <h4>Snacks Options</h4>
                    <div className="diet-meal-options">
                      {Array.isArray(diet.snacks) ? (
                        diet.snacks.map((option, index) => (
                          <div key={index} className="diet-meal-option">
                            <span className="diet-option-number">Option {index + 1}</span>
                            {typeof option === 'object' && option.meal ? (
                              <>
                                <p>{option.meal}</p>
                                <span className="diet-protein-badge">💪 {option.protein}g protein</span>
                              </>
                            ) : (
                              <p>{option}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>{diet.snacks}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="diet-meal-card">
                  <div className="diet-meal-time">
                    <span className="diet-meal-icon">🌙</span>
                    <span>7:00 - 9:00 PM</span>
                  </div>
                  <div className="diet-meal-content">
                    <h4>Dinner Options</h4>
                    <div className="diet-meal-options">
                      {Array.isArray(diet.dinner) ? (
                        diet.dinner.map((option, index) => (
                          <div key={index} className="diet-meal-option">
                            <span className="diet-option-number">Option {index + 1}</span>
                            {typeof option === 'object' && option.meal ? (
                              <>
                                <p>{option.meal}</p>
                                <span className="diet-protein-badge">💪 {option.protein}g protein</span>
                              </>
                            ) : (
                              <p>{option}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>{diet.dinner}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="diet-tips">
                <h4>💡 Important Tips</h4>
                <div className="diet-tips-grid">
                  <div className="diet-tip">
                    <span>💧</span>
                    <p>Drink 8-10 glasses of water daily</p>
                  </div>
                  <div className="diet-tip">
                    <span>🏃</span>
                    <p>Exercise 30 minutes daily</p>
                  </div>
                  <div className="diet-tip">
                    <span>😴</span>
                    <p>Get 7-8 hours of sleep</p>
                  </div>
                  <div className="diet-tip">
                    <span>🥗</span>
                    <p>Eat fresh, seasonal foods</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="diet-actions">
                <button onClick={() => window.print()}>
                  <span>🖨️</span>
                  <span>Print Plan</span>
                </button>
                <button onClick={() => {
                  setDiet(null);
                  setCalories(null);
                  setForm({
                    height: "",
                    weight: "",
                    bmi: "",
                    age: "",
                    gender: "Male",
                    activityLevel: "Moderate",
                    foodPreference: "Vegetarian",
                    diseases: "",
                    goal: ""
                  });
                }}>
                  <span>🔄</span>
                  <span>Generate New Plan</span>
                </button>
              </div>

              {/* Disclaimer */}
              <div className="diet-disclaimer">
                <span>⚠️</span>
                <div>
                  <strong>Medical Disclaimer:</strong> This is an AI-generated diet plan for informational purposes only. 
                  Please consult with a healthcare professional before making significant dietary changes.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Diet;
