import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">

        <h2>Manager Dashboard</h2>

        <hr />

        <h5>Welcome, {user?.name}</h5>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Status:</strong> {user?.approvalStatus}
        </p>

        <div className="d-flex gap-2 mt-3">

          {/* My Profile */}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>

          {/* Logout */}
          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}

export default ManagerDashboard;