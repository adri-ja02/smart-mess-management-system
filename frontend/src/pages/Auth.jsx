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

        // ROLE BASED REDIRECT
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
          "Something went wrong. Please try again."
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
          FULL BACKGROUND
          ===================================================== */}

      <div className="auth-background"></div>


      {/* =====================================================
          RIGHT SIDE AUTH CONTENT
          ===================================================== */}

      <div className="auth-content">

        <div className="auth-card">

          {/* =================================================
              HEADER
              ================================================= */}

          <div className="auth-header">

            <div className="auth-logo">
              🏠
            </div>

            <h1 className="auth-welcome">
              {isLogin
                ? "Welcome Back!"
                : "Create Account"}
            </h1>

            <p className="auth-description">
              {isLogin
                ? "Login to access your Smart Mess & SpaceFit account"
                : "Join Smart Student Mess & SpaceFit"}
            </p>

          </div>


          {/* =================================================
              LOGIN / REGISTER SWITCH
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


          {/* =================================================
              MESSAGE
              ================================================= */}

          {message && (
            <div className="auth-message">

              <span className="message-icon">
                ℹ️
              </span>

              <span>
                {message}
              </span>

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
                  Full Name
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
                Email Address
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
                Password
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
                  Account Type
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


            {/* =================================================
                SUBMIT BUTTON
                ================================================= */}

            <button
              type="submit"
              className="auth-submit"
            >

              <span>
                {isLogin
                  ? "🔑 Login to Account"
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

              <span>
                🛏️
              </span>

              <small>
                Smart Rooms
              </small>

            </div>


            <div className="auth-feature">

              <span>
                🍽️
              </span>

              <small>
                Smart Mess
              </small>

            </div>


            <div className="auth-feature">

              <span>
                📊
              </span>

              <small>
                Smart Insights
              </small>

            </div>

          </div>


          {/* =================================================
              LOGIN / REGISTER TOGGLE
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

            <span>
              🛡️ Secure
            </span>

            <span>•</span>

            <span>
              ⚡ Real-time
            </span>

            <span>•</span>

            <span>
              ☁️ Cloud Based
            </span>

          </div>


          <div className="auth-brand">
            Smart Student Mess & SpaceFit
          </div>

        </div>

      </div>

    </div>
  );
}

export default Auth;