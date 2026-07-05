import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">

        <h2 className="mb-3">Student Dashboard</h2>

        <h5>Welcome, {user?.name} 👋</h5>
        <p className="text-muted">
          Manage your account and profile from here.
        </p>

        <div className="d-flex flex-wrap gap-2 mt-3">

          {/* Profile */}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
          >
            👤 My Profile
          </button>

          {/* Change Password */}
          <button
            className="btn btn-warning"
            onClick={() => navigate("/change-password")}
          >
            🔒 Change Password
          </button>

          

          {/* Logout */}
          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;