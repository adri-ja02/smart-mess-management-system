import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import roomService from "../services/roomService";
import RoomCard from "../components/RoomCard";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [showRooms, setShowRooms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load all rooms
  const loadRooms = async () => {
    try {
      setLoading(true);

      const res = await roomService.getRooms();

      setRooms(res.data.rooms);
      setShowRooms(true);
    } catch (error) {
      console.log("Room loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logout
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
            <h2 className="fw-bold">
              Student Dashboard
            </h2>

            <p className="text-muted">
              Smart Student Mess Management System
            </p>
          </div>

          <hr />

          {/* STUDENT INFO */}
          <div className="mb-4">
            <h5>
              Welcome, {user?.name} 👋
            </h5>

            <p>
              <strong>Email:</strong> {user?.email}
            </p>

            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="d-flex flex-wrap gap-2 mb-4">

            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile")}
            >
              👤 My Profile
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/living-needs")}
            >
              🏠 Find SpaceFit Rooms
            </button>

            <Link
              to="/my-reservations"
              className="btn btn-success"
            >
              📋 My Reservations
            </Link>

            <Link
              to="/waitlist"
              className="btn btn-warning"
            >
              ⏳ My Waitlist
            </Link>

            {/* MODULE 3 */}
            <Link
              to="/complaints/new"
              className="btn btn-danger"
            >
              🛠️ Complaints
            </Link>

            <Link
  to="/complaints/track"
  className="btn btn-info"
>
  🔎 Track My Complaint
</Link>

          </div>

          {/* FEATURE CARD */}
          <div className="row mt-4">

            <div className="col-md-6 mb-3">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h4>Discover Rooms</h4>

                  <p>
                    Browse available rooms and explore
                    Room Space Passport details.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={loadRooms}
                  >
                    Browse Rooms
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* ROOMS */}
          {showRooms && (
            <div className="mt-5">

              <h3 className="mb-4">
                Available Rooms
              </h3>

              {loading ? (

                <div className="text-center">

                  <div
                    className="spinner-border"
                    role="status"
                  ></div>

                  <p className="mt-2">
                    Loading rooms...
                  </p>

                </div>

              ) : (

                <div className="row">

                  {rooms.length > 0 ? (

                    rooms.map((room) => (

                      <RoomCard
                        key={room._id}
                        room={room}
                      />

                    ))

                  ) : (

                    <div className="col-12">

                      <div className="alert alert-info">
                        No rooms available.
                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>
          )}

          {/* LOGOUT */}
          <div className="mt-4">

            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;