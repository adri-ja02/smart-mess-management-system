import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../services/Auth.css";

function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const user = await login({
          email: form.email,
          password: form.password,
        });

        // ROLE REDIRECT
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "manager") {
          navigate("/manager");
        } else {
          navigate("/student");
        }
      } else {
        await register(form);

        if (form.role === "manager") {
          setMessage(
            "Registration successful! Waiting for admin approval."
          );
        } else {
          setMessage(
            "Registration successful! Please login."
          );
        }

        setIsLogin(true);

        // Reset form after registration
        setForm({
          name: "",
          email: "",
          password: "",
          role: "student",
        });
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage("");

    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    });
  };

  return (
    <div className="auth-page">

      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="auth-background"></div>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="auth-content">

        {/* ===================================================
            GLASS LOGIN / REGISTER CARD
            =================================================== */}

        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo">
            🏠
          </div>

          {/* Header */}
          <div className="auth-header">

            <h1 className="auth-title">
              Smart Student
            </h1>

            <h1 className="auth-title auth-title-green">
              Mess & SpaceFit
            </h1>

            <h2 className="auth-system-title">
              Room Allocation System
            </h2>

            <div className="auth-line">
              <span></span>
              <span className="auth-leaf">🌿</span>
              <span></span>
            </div>

            <p className="auth-subtitle">
              Smart Management • Better Living
            </p>

          </div>

          {/* =================================================
              LOGIN / REGISTER INDICATOR
              ================================================= */}

          <div className="auth-mode">

            <button
              type="button"
              className={
                isLogin
                  ? "auth-mode-btn active"
                  : "auth-mode-btn"
              }
              onClick={() => {
                if (!isLogin) {
                  switchMode();
                }
              }}
            >
              🔑 Login
            </button>

            <button
              type="button"
              className={
                !isLogin
                  ? "auth-mode-btn active"
                  : "auth-mode-btn"
              }
              onClick={() => {
                if (isLogin) {
                  switchMode();
                }
              }}
            >
              ✨ Register
            </button>

          </div>

          {/* Message */}
          {message && (
            <div className="auth-message">
              <span>ℹ️</span>
              <span>{message}</span>
            </div>
          )}

          {/* =================================================
              FORM
              ================================================= */}

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            {!isLogin && (
              <div className="auth-input-group">

                <label>
                  👤 Full Name
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    👤
                  </span>

                  <input
                    type="text"
                    name="name"
                    className="auth-input"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>
            )}

            {/* EMAIL */}
            <div className="auth-input-group">

              <label>
                📧 Email Address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉️
                </span>

                <input
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="auth-input-group">

              <label>
                🔐 Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  type="password"
                  name="password"
                  className="auth-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* ROLE */}
            {!isLogin && (
              <div className="auth-input-group">

                <label>
                  🎓 Account Type
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    🎓
                  </span>

                  <select
                    name="role"
                    className="auth-input auth-select"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="student">
                      Student
                    </option>

                    <option value="manager">
                      Mess Manager
                    </option>

                    <option value="admin">
                      Administrator
                    </option>
                  </select>

                </div>

              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="auth-submit"
            >
              <span>
                {isLogin
                  ? "🔑 Login"
                  : "✨ Create Account"}
              </span>

              <span className="auth-arrow">
                →
              </span>
            </button>

          </form>

          {/* =================================================
              FEATURES
              ================================================= */}

          <div className="auth-features">

            <div className="auth-feature">
              <span>🛏️</span>
              <small>Smart Rooms</small>
            </div>

            <div className="auth-feature">
              <span>🍽️</span>
              <small>Smart Mess</small>
            </div>

            <div className="auth-feature">
              <span>📊</span>
              <small>Smart Insights</small>
            </div>

          </div>

          {/* =================================================
              TOGGLE
              ================================================= */}

          <div className="auth-toggle">

            <span>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              className="auth-toggle-btn"
              onClick={switchMode}
            >
              {isLogin
                ? "Register"
                : "Login"}
            </button>

          </div>

          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="auth-footer">

            <div>
              🛡️ Secure &nbsp; • &nbsp;
              ⚡ Real-time &nbsp; • &nbsp;
              ☁️ Cloud Based
            </div>

            <div className="auth-footer-title">
              Smart Student Mess & SpaceFit
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Auth;