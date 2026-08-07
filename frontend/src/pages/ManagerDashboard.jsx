import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import roomService from "../services/roomService";
import { Link } from "react-router-dom";

function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const res = await roomService.getRooms();
      setRooms(res.data.rooms);
    } catch (error) {
      console.log("Room loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0">
        <div className="card-body p-5">

          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="fw-bold">Manager Dashboard</h2>
            <p className="text-muted">
              Smart Student Mess Management System
            </p>
          </div>

          <hr />

          {/* MANAGER INFO */}
          <div className="mb-4">
            <h5>Welcome, {user?.name}</h5>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Status:</strong> {user?.approvalStatus}
            </p>
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>

          {/* ACCOUNT ACTIONS */}
<div className="d-flex flex-wrap gap-2 mb-4">

  <button
    className="btn btn-primary"
    onClick={() => navigate("/profile")}
  >
    👤 My Profile
  </button>

  <button
    className="btn btn-success"
    onClick={() => navigate("/rooms")}
  >
    🏠 Room Management
  </button>

  <Link
    to="/pending-reservations"
    className="btn btn-warning"
  >
    📋 Pending Reservations
  </Link>

</div>

<hr />

          {/* CREATED ROOMS */}
          <h4 className="mb-4">Created Rooms</h4>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
              <p className="mt-2">Loading rooms...</p>
            </div>
          ) : (
            <div className="row">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No rooms created yet
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOGOUT */}
          <div className="mt-4">
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;