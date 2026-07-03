import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          setMessage("Registration successful! Waiting for admin approval.");
        } else {
          setMessage("Registration successful! Please login.");
        }

        setIsLogin(true);

        // reset form after register
        setForm({
          name: "",
          email: "",
          password: "",
          role: "student",
        });
      }

    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="container mt-5 auth-wrapper"
      style={{ maxWidth: "450px" }}
    >
      <div className="card shadow p-4 auth-card">

        {/* HEADER */}
        <div className="text-center mb-4">

          <h2 className="auth-title">
            🏠 Smart Student Mess Management System 
          </h2>

          <p className="auth-subtitle">
            Student • Mess Manager • Administrator
          </p>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="alert alert-info">
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* NAME (REGISTER ONLY) */}
          {!isLogin && (
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* ROLE (REGISTER ONLY) */}
          {!isLogin && (
            <div className="mb-3">
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="manager">Mess Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* SUBMIT BUTTON (FIXED - IMPORTANT) */}
          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Register"}
          </button>

        </form>

        <hr />

        {/* TOGGLE BUTTON */}
        <p className="text-center mb-0">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            className="btn btn-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");

              setForm({
                name: "",
                email: "",
                password: "",
                role: "student",
              });
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;