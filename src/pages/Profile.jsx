import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
    foodPreference: "",
    diseases: ""
  });

  useEffect(() => {
    fetchUserProfile();
    fetchBMIHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(res.data);
      setFormData({
        name: res.data.name || "",
        height: res.data.height || "",
        weight: res.data.weight || "",
        age: res.data.age || "",
        gender: res.data.gender || "Male",
        foodPreference: res.data.foodPreference || "Vegetarian",
        diseases: res.data.diseases?.join(", ") || ""
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const fetchBMIHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/user/bmi-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBmiHistory(res.data.bmiHistory || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      // Prepare update data
      const updateData = {
        name: formData.name,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        foodPreference: formData.foodPreference,
        diseases: formData.diseases.split(",").map(d => d.trim()).filter(d => d)
      };

      const res = await API.put("/user/profile", updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      localStorage.setItem("userName", res.data.user.name);
      setSuccess("Profile updated successfully!");
      setEditing(false);

      // Add BMI record if height and weight changed
      if (updateData.height && updateData.weight) {
        const heightInMeters = updateData.height / 100;
        const bmi = (updateData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        try {
          await API.post("/user/bmi-record", {
            weight: updateData.weight,
            height: updateData.height,
            bmi: parseFloat(bmi)
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          fetchBMIHistory();
        } catch (bmiError) {
          console.error("BMI record error:", bmiError);
          // Don't show error to user, profile is already updated
        }
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Failed to update profile";
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { text: "N/A", color: "#999" };
    if (bmi < 18.5) return { text: "Underweight", color: "#ff9800" };
    if (bmi < 25) return { text: "Normal", color: "#4caf50" };
    if (bmi < 30) return { text: "Overweight", color: "#ff9800" };
    return { text: "Obese", color: "#f44336" };
  };

  // Calculate BMI live from height and weight
  const calculateCurrentBMI = () => {
    if (user?.height && user?.weight) {
      const heightInMeters = user.height / 100;
      return parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return user?.bmi || null;
  };

  const currentBMI = calculateCurrentBMI();
  const bmiCategory = getBMICategory(currentBMI);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <button className="profile-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="profile-hero">
          <h2 className="profile-hero-title">👤 My Profile</h2>
          <p className="profile-hero-subtitle">
            Manage your personal information and track your health progress
          </p>
        </div>

        {error && (
          <div className="profile-alert profile-alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="profile-alert profile-alert-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Personal Information</h3>
              {!editing ? (
                <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                  <span>✏️</span>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="profile-edit-actions">
                  <button className="profile-cancel-btn" onClick={() => {
                    setEditing(false);
                    setError("");
                  }}>
                    Cancel
                  </button>
                  <button 
                    className="profile-save-btn" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <label>Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p>{user?.name || "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>

              <div className="profile-info-item">
                <label>Age</label>
                {editing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    min="10"
                    max="100"
                  />
                ) : (
                  <p>{user?.age || "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Gender</label>
                {editing ? (
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{user?.gender || "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Height (cm)</label>
                {editing ? (
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Enter height"
                    min="50"
                    max="250"
                  />
                ) : (
                  <p>{user?.height ? `${user.height} cm` : "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Weight (kg)</label>
                {editing ? (
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Enter weight"
                    min="20"
                    max="300"
                  />
                ) : (
                  <p>{user?.weight ? `${user.weight} kg` : "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Food Preference</label>
                {editing ? (
                  <select name="foodPreference" value={formData.foodPreference} onChange={handleChange}>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                ) : (
                  <p>{user?.foodPreference || "Not set"}</p>
                )}
              </div>

              <div className="profile-info-item profile-info-full">
                <label>Medical Conditions</label>
                {editing ? (
                  <textarea
                    name="diseases"
                    value={formData.diseases}
                    onChange={handleChange}
                    placeholder="e.g., Diabetes, Hypertension (comma separated)"
                    rows="2"
                  />
                ) : (
                  <p>{user?.diseases?.length > 0 ? user.diseases.join(", ") : "None"}</p>
                )}
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className="profile-bmi-card">
            <h3>Current BMI</h3>
            {currentBMI ? (
              <div className="profile-bmi-display">
                <div className="profile-bmi-circle" style={{ borderColor: bmiCategory.color }}>
                  <span className="profile-bmi-value">{currentBMI}</span>
                  <span className="profile-bmi-label">BMI</span>
                </div>
                <div className="profile-bmi-info">
                  <div className="profile-bmi-category" style={{ color: bmiCategory.color }}>
                    {bmiCategory.text}
                  </div>
                  <div className="profile-bmi-details">
                    <div className="profile-bmi-detail">
                      <span>Height:</span>
                      <strong>{user?.height ? `${user.height} cm` : "N/A"}</strong>
                    </div>
                    <div className="profile-bmi-detail">
                      <span>Weight:</span>
                      <strong>{user?.weight ? `${user.weight} kg` : "N/A"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-bmi-empty">
                <div className="profile-bmi-empty-icon">📊</div>
                <p className="profile-bmi-empty-text">
                  Add your height and weight to calculate BMI
                </p>
                <button 
                  className="profile-bmi-empty-btn"
                  onClick={() => setEditing(true)}
                >
                  Update Profile
                </button>
              </div>
            )}
          </div>

          {/* BMI History */}
          {bmiHistory.length > 0 && (
            <div className="profile-history-card">
              <h3>📊 BMI History</h3>
              <div className="profile-history-chart">
                {bmiHistory.slice(-10).reverse().map((record, index) => {
                  const category = getBMICategory(record.bmi);
                  return (
                    <div key={index} className="profile-history-item">
                      <div className="profile-history-date">
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="profile-history-bar">
                        <div 
                          className="profile-history-fill" 
                          style={{ 
                            width: `${(record.bmi / 40) * 100}%`,
                            backgroundColor: category.color
                          }}
                        >
                          <span className="profile-history-value">{record.bmi}</span>
                        </div>
                      </div>
                      <div className="profile-history-weight">
                        {record.weight} kg
                      </div>
                    </div>
                  );
                })}
              </div>
              {bmiHistory.length > 10 && (
                <p className="profile-history-note">
                  Showing last 10 records
                </p>
              )}
            </div>
          )}

          {/* Today's Meal Plan */}
          {user?.latestDietPlan?.meals && (
            <div className="profile-meal-card">
              <div className="profile-meal-header">
                <h3>🍽️ Today's Meal Plan</h3>
                <span className="profile-meal-date">
                  Created: {new Date(user.latestDietPlan.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="profile-meal-info">
                <div className="profile-meal-info-item">
                  <span>BMI:</span>
                  <strong>{user.latestDietPlan.bmi || "N/A"}</strong>
                </div>
                <div className="profile-meal-info-item">
                  <span>Goal:</span>
                  <strong>{user.latestDietPlan.goal || "N/A"}</strong>
                </div>
                {user.latestDietPlan.dailyProteinTarget && (
                  <div className="profile-meal-info-item protein-target">
                    <span>Daily Protein:</span>
                    <strong>{user.latestDietPlan.dailyProteinTarget}g</strong>
                  </div>
                )}
              </div>

              <div className="profile-meal-grid">
                {/* Breakfast */}
                <div className="profile-meal-section">
                  <div className="profile-meal-section-header">
                    <span className="profile-meal-icon">🌅</span>
                    <h4>Breakfast</h4>
                  </div>
                  <div className="profile-meal-options">
                    {user.latestDietPlan.meals.breakfast?.map((option, idx) => (
                      <div key={idx} className="profile-meal-option">
                        <span className="profile-meal-option-label">Option {idx + 1}</span>
                        {typeof option === 'object' && option.meal ? (
                          <>
                            <p>{option.meal}</p>
                            <span className="profile-protein-badge">💪 {option.protein}g</span>
                          </>
                        ) : (
                          <p>{option}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lunch */}
                <div className="profile-meal-section">
                  <div className="profile-meal-section-header">
                    <span className="profile-meal-icon">☀️</span>
                    <h4>Lunch</h4>
                  </div>
                  <div className="profile-meal-options">
                    {user.latestDietPlan.meals.lunch?.map((option, idx) => (
                      <div key={idx} className="profile-meal-option">
                        <span className="profile-meal-option-label">Option {idx + 1}</span>
                        {typeof option === 'object' && option.meal ? (
                          <>
                            <p>{option.meal}</p>
                            <span className="profile-protein-badge">💪 {option.protein}g</span>
                          </>
                        ) : (
                          <p>{option}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Snacks */}
                <div className="profile-meal-section">
                  <div className="profile-meal-section-header">
                    <span className="profile-meal-icon">🍪</span>
                    <h4>Snacks</h4>
                  </div>
                  <div className="profile-meal-options">
                    {user.latestDietPlan.meals.snacks?.map((option, idx) => (
                      <div key={idx} className="profile-meal-option">
                        <span className="profile-meal-option-label">Option {idx + 1}</span>
                        {typeof option === 'object' && option.meal ? (
                          <>
                            <p>{option.meal}</p>
                            <span className="profile-protein-badge">💪 {option.protein}g</span>
                          </>
                        ) : (
                          <p>{option}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dinner */}
                <div className="profile-meal-section">
                  <div className="profile-meal-section-header">
                    <span className="profile-meal-icon">🌙</span>
                    <h4>Dinner</h4>
                  </div>
                  <div className="profile-meal-options">
                    {user.latestDietPlan.meals.dinner?.map((option, idx) => (
                      <div key={idx} className="profile-meal-option">
                        <span className="profile-meal-option-label">Option {idx + 1}</span>
                        {typeof option === 'object' && option.meal ? (
                          <>
                            <p>{option.meal}</p>
                            <span className="profile-protein-badge">💪 {option.protein}g</span>
                          </>
                        ) : (
                          <p>{option}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-meal-footer">
                <button 
                  className="profile-meal-update-btn"
                  onClick={() => navigate("/diet")}
                >
                  Update Meal Plan
                </button>
                <button 
                  className="profile-meal-swap-btn"
                  onClick={() => navigate("/meal-swap")}
                >
                  🔄 Meal Swap
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-icon">📅</div>
              <div className="profile-stat-content">
                <span className="profile-stat-label">Member Since</span>
                <span className="profile-stat-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                  }) : "N/A"}
                </span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">📈</div>
              <div className="profile-stat-content">
                <span className="profile-stat-label">BMI Records</span>
                <span className="profile-stat-value">{bmiHistory.length}</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">🎯</div>
              <div className="profile-stat-content">
                <span className="profile-stat-label">Health Goal</span>
                <span className="profile-stat-value">
                  {currentBMI < 18.5 ? "Gain Weight" : 
                   currentBMI < 25 ? "Maintain" : "Lose Weight"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
