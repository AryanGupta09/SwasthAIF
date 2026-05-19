import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/Workout.css";

const WORKOUT_TYPES = [
  { name: "Running", icon: "🏃", met: 9.8 },
  { name: "Walking", icon: "🚶", met: 3.5 },
  { name: "Yoga", icon: "🧘", met: 2.5 },
  { name: "Cycling", icon: "🚴", met: 7.5 },
  { name: "Weight Training", icon: "🏋️", met: 5.0 },
  { name: "Swimming", icon: "🏊", met: 8.0 },
  { name: "Cricket", icon: "🏏", met: 4.8 },
  { name: "Badminton", icon: "🏸", met: 5.5 },
  { name: "Football", icon: "⚽", met: 7.0 },
  { name: "Skipping", icon: "🪢", met: 11.0 },
  { name: "Dance", icon: "💃", met: 5.0 },
  { name: "Stretching", icon: "🤸", met: 2.3 },
];

const INTENSITY_MULTIPLIERS = { Low: 0.8, Medium: 1.0, High: 1.2 };

const Workout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("log");

  // Log Workout state
  const [logForm, setLogForm] = useState({
    workoutType: "",
    duration: "",
    intensity: "Medium",
    notes: "",
  });
  const [estimatedCalories, setEstimatedCalories] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState("");
  const [logError, setLogError] = useState("");

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Weekly summary state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // AI Plan state
  const [aiForm, setAiForm] = useState({
    fitnessLevel: "Beginner",
    availableTime: "30",
    medicalConditions: "",
    goal: "General Fitness",
  });
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Auto-calculate calories when type/duration/intensity changes
  useEffect(() => {
    if (logForm.workoutType && logForm.duration) {
      const typeData = WORKOUT_TYPES.find(w => w.name === logForm.workoutType);
      if (typeData) {
        const weight = parseFloat(localStorage.getItem("userWeight") || "70");
        const durationHours = parseFloat(logForm.duration) / 60;
        const multiplier = INTENSITY_MULTIPLIERS[logForm.intensity] || 1.0;
        const calories = Math.round(typeData.met * weight * durationHours * multiplier);
        setEstimatedCalories(calories);
      }
    } else {
      setEstimatedCalories(null);
    }
  }, [logForm.workoutType, logForm.duration, logForm.intensity]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/workout/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.workouts || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/workout/weekly-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") loadHistory();
    if (tab === "summary") loadSummary();
  };

  const handleLogChange = (e) => {
    setLogForm({ ...logForm, [e.target.name]: e.target.value });
    setLogError("");
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.workoutType || !logForm.duration) {
      setLogError("Please select a workout type and enter duration.");
      return;
    }
    setLogLoading(true);
    setLogError("");
    setLogSuccess("");
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/workout/log",
        {
          workoutType: logForm.workoutType,
          duration: parseInt(logForm.duration),
          intensity: logForm.intensity,
          caloriesBurned: estimatedCalories,
          notes: logForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogSuccess("Workout logged successfully! 🎉");
      setLogForm({ workoutType: "", duration: "", intensity: "Medium", notes: "" });
      setEstimatedCalories(null);
      setTimeout(() => setLogSuccess(""), 4000);
    } catch (err) {
      setLogError(err.response?.data?.message || "Failed to log workout. Please try again.");
    } finally {
      setLogLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Delete this workout entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/workout/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(prev => prev.filter(w => w._id !== workoutId));
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  const handleAiChange = (e) => {
    setAiForm({ ...aiForm, [e.target.name]: e.target.value });
    setAiError("");
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError("");
    setAiPlan(null);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/workout/suggestions",
        aiForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiPlan(res.data.plan || res.data);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to generate AI plan. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIntensityColor = (intensity) => {
    if (intensity === "Low") return "#22c55e";
    if (intensity === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="workout-container">
      {/* Header */}
      <header className="workout-header">
        <div className="workout-header-content">
          <h1 className="workout-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <div className="workout-header-actions">
            <ThemeToggle />
            <button className="workout-back-btn" onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="workout-hero">
        <h2 className="workout-hero-title">🏋️ Workout Tracker</h2>
        <p className="workout-hero-subtitle">
          Log workouts, track weekly progress, and get AI-powered 7-day fitness plans
        </p>
      </div>

      {/* Tabs */}
      <div className="workout-tabs-wrapper">
        <div className="workout-tabs">
          {[
            { id: "log", label: "📝 Log Workout" },
            { id: "history", label: "📋 History" },
            { id: "summary", label: "📊 Weekly Summary" },
            { id: "ai", label: "🤖 AI Plan" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`workout-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="workout-main">

        {/* ===== LOG WORKOUT TAB ===== */}
        {activeTab === "log" && (
          <div className="workout-card">
            <h3 className="workout-card-title">Log a Workout</h3>

            {logSuccess && (
              <div className="workout-alert workout-alert-success">{logSuccess}</div>
            )}
            {logError && (
              <div className="workout-alert workout-alert-error">⚠️ {logError}</div>
            )}

            <form onSubmit={handleLogSubmit}>
              {/* Workout Type Grid */}
              <div className="workout-field-group">
                <label>Select Workout Type</label>
                <div className="workout-type-grid">
                  {WORKOUT_TYPES.map(type => (
                    <button
                      key={type.name}
                      type="button"
                      className={`workout-type-btn ${logForm.workoutType === type.name ? "active" : ""}`}
                      onClick={() => setLogForm(prev => ({ ...prev, workoutType: type.name }))}
                    >
                      <span className="workout-type-icon">{type.icon}</span>
                      <span className="workout-type-name">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="workout-field-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  name="duration"
                  placeholder="e.g. 30"
                  value={logForm.duration}
                  onChange={handleLogChange}
                  min="1"
                  max="480"
                  className="workout-input"
                />
              </div>

              {/* Intensity */}
              <div className="workout-field-group">
                <label>Intensity</label>
                <div className="workout-intensity-group">
                  {["Low", "Medium", "High"].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`workout-intensity-btn ${logForm.intensity === level ? "active" : ""}`}
                      style={logForm.intensity === level ? { background: getIntensityColor(level) } : {}}
                      onClick={() => setLogForm(prev => ({ ...prev, intensity: level }))}
                    >
                      {level === "Low" && "🟢"} {level === "Medium" && "🟡"} {level === "High" && "🔴"} {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calorie Estimate */}
              {estimatedCalories !== null && (
                <div className="workout-calorie-estimate">
                  <span className="workout-calorie-icon">🔥</span>
                  <div>
                    <span className="workout-calorie-value">{estimatedCalories}</span>
                    <span className="workout-calorie-label"> kcal estimated</span>
                  </div>
                  <span className="workout-calorie-note">(based on MET formula, ~70kg body weight)</span>
                </div>
              )}

              {/* Notes */}
              <div className="workout-field-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="How did it feel? Any personal records?"
                  value={logForm.notes}
                  onChange={handleLogChange}
                  rows="3"
                  className="workout-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={logLoading}
                className={`workout-submit-btn ${logLoading ? "loading" : ""}`}
              >
                {logLoading ? (
                  <><span className="spinner"></span> Logging...</>
                ) : (
                  "✅ Log Workout"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div className="workout-card">
            <h3 className="workout-card-title">Workout History</h3>
            {historyLoading ? (
              <div className="workout-loading">
                <div className="spinner" style={{ borderTopColor: "var(--accent)" }}></div>
                <p>Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="workout-empty">
                <span className="workout-empty-icon">📋</span>
                <p>No workouts logged yet. Start by logging your first workout!</p>
                <button className="workout-empty-btn" onClick={() => setActiveTab("log")}>
                  Log a Workout
                </button>
              </div>
            ) : (
              <div className="workout-history-list">
                {history.map((workout, idx) => (
                  <div key={workout._id || idx} className="workout-history-item">
                    <div className="workout-history-icon">
                      {WORKOUT_TYPES.find(w => w.name === workout.workoutType)?.icon || "🏃"}
                    </div>
                    <div className="workout-history-info">
                      <div className="workout-history-name">{workout.workoutType}</div>
                      <div className="workout-history-meta">
                        <span>⏱ {workout.duration} min</span>
                        <span
                          className="workout-history-intensity"
                          style={{ color: getIntensityColor(workout.intensity) }}
                        >
                          ● {workout.intensity}
                        </span>
                        {workout.caloriesBurned && (
                          <span>🔥 {workout.caloriesBurned} kcal</span>
                        )}
                        <span className="workout-history-date">{formatDate(workout.date || workout.createdAt)}</span>
                      </div>
                      {workout.notes && (
                        <div className="workout-history-notes">"{workout.notes}"</div>
                      )}
                    </div>
                    <button
                      className="workout-delete-btn"
                      onClick={() => handleDeleteWorkout(workout._id)}
                      title="Delete"
                      aria-label="Delete workout"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== WEEKLY SUMMARY TAB ===== */}
        {activeTab === "summary" && (
          <div className="workout-card">
            <h3 className="workout-card-title">Weekly Summary</h3>
            {summaryLoading ? (
              <div className="workout-loading">
                <div className="spinner" style={{ borderTopColor: "var(--accent)" }}></div>
                <p>Loading summary...</p>
              </div>
            ) : !summary ? (
              <div className="workout-empty">
                <span className="workout-empty-icon">📊</span>
                <p>No data available yet. Log some workouts first!</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="workout-stats-grid">
                  <div className="workout-stat-card">
                    <span className="workout-stat-icon">🏋️</span>
                    <span className="workout-stat-value">{summary.totalWorkouts ?? 0}</span>
                    <span className="workout-stat-label">Workouts</span>
                  </div>
                  <div className="workout-stat-card">
                    <span className="workout-stat-icon">⏱</span>
                    <span className="workout-stat-value">{summary.totalDuration ?? 0}</span>
                    <span className="workout-stat-label">Minutes</span>
                  </div>
                  <div className="workout-stat-card">
                    <span className="workout-stat-icon">🔥</span>
                    <span className="workout-stat-value">{summary.totalCalories ?? 0}</span>
                    <span className="workout-stat-label">Calories</span>
                  </div>
                  <div className="workout-stat-card">
                    <span className="workout-stat-icon">🔥</span>
                    <span className="workout-stat-value">{summary.streak ?? 0}</span>
                    <span className="workout-stat-label">Day Streak</span>
                  </div>
                </div>

                {/* Daily Breakdown */}
                {summary.dailyBreakdown && summary.dailyBreakdown.length > 0 && (
                  <div className="workout-daily-section">
                    <h4>Daily Breakdown</h4>
                    <div className="workout-daily-list">
                      {summary.dailyBreakdown.map((day, idx) => (
                        <div key={idx} className="workout-daily-item">
                          <span className="workout-daily-day">{day.day}</span>
                          <div className="workout-daily-bar-wrap">
                            <div
                              className="workout-daily-bar"
                              style={{
                                width: `${Math.min((day.duration / 120) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="workout-daily-duration">{day.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== AI PLAN TAB ===== */}
        {activeTab === "ai" && (
          <div className="workout-card">
            <h3 className="workout-card-title">AI 7-Day Fitness Plan</h3>
            <p className="workout-card-subtitle">
              Tell us about yourself and get a personalized weekly workout plan
            </p>

            {aiError && (
              <div className="workout-alert workout-alert-error">⚠️ {aiError}</div>
            )}

            <form onSubmit={handleAiSubmit} className="workout-ai-form">
              <div className="workout-field-group">
                <label htmlFor="fitnessLevel">Fitness Level</label>
                <select
                  id="fitnessLevel"
                  name="fitnessLevel"
                  value={aiForm.fitnessLevel}
                  onChange={handleAiChange}
                  className="workout-select"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="workout-field-group">
                <label htmlFor="availableTime">Available Time per Day (minutes)</label>
                <select
                  id="availableTime"
                  name="availableTime"
                  value={aiForm.availableTime}
                  onChange={handleAiChange}
                  className="workout-select"
                >
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="workout-field-group">
                <label htmlFor="goal">Fitness Goal</label>
                <select
                  id="goal"
                  name="goal"
                  value={aiForm.goal}
                  onChange={handleAiChange}
                  className="workout-select"
                >
                  <option value="General Fitness">General Fitness</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Flexibility">Flexibility</option>
                </select>
              </div>

              <div className="workout-field-group">
                <label htmlFor="medicalConditions">Medical Conditions (optional)</label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  placeholder="e.g., knee pain, back issues, asthma..."
                  value={aiForm.medicalConditions}
                  onChange={handleAiChange}
                  rows="3"
                  className="workout-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className={`workout-submit-btn ${aiLoading ? "loading" : ""}`}
              >
                {aiLoading ? (
                  <><span className="spinner"></span> Generating Plan...</>
                ) : (
                  "✨ Generate AI Plan"
                )}
              </button>
            </form>

            {/* AI Plan Results */}
            {aiPlan && (
              <div className="workout-week-plan">
                <div className="workout-plan-header">
                  <span>✨ AI Generated</span>
                  <h4>Your 7-Day Fitness Plan</h4>
                </div>
                <div className="workout-days-grid">
                  {Array.isArray(aiPlan) ? (
                    aiPlan.map((day, idx) => (
                      <div key={idx} className="workout-day-card">
                        <div className="workout-day-header">
                          <span className="workout-day-number">Day {idx + 1}</span>
                          <span className="workout-day-name">{day.day || `Day ${idx + 1}`}</span>
                        </div>
                        <div className="workout-exercise-list">
                          {Array.isArray(day.exercises) ? (
                            day.exercises.map((ex, exIdx) => (
                              <div key={exIdx} className="workout-exercise-item">
                                <span className="workout-exercise-dot">●</span>
                                <span>{typeof ex === "object" ? ex.name || ex.exercise || JSON.stringify(ex) : ex}</span>
                              </div>
                            ))
                          ) : (
                            <div className="workout-exercise-item">
                              <span>{day.exercises || day.description || "Rest day"}</span>
                            </div>
                          )}
                        </div>
                        {day.duration && (
                          <div className="workout-day-duration">⏱ {day.duration}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="workout-plan-text">
                      <pre>{typeof aiPlan === "string" ? aiPlan : JSON.stringify(aiPlan, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Workout;
