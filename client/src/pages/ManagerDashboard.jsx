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

        <p>Email: {user?.email}</p>

        <p>Status: {user?.approvalStatus}</p>

        <button
          className="btn btn-danger mt-3"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default ManagerDashboard;