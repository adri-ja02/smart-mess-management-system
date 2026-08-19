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

  // Capitalize role for display
  const formattedRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Student";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "12px 0 30px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fffdf2 0%, #eafff5 40%, #e8f9ff 75%, #f5edff 100%)",
      }}
    >
      {/* ================= BACKGROUND DECORATIONS ================= */}

      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "rgba(120, 220, 180, 0.18)",
          top: "-110px",
          left: "-90px",
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "rgba(100, 210, 240, 0.16)",
          top: "10%",
          right: "-120px",
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "rgba(190, 160, 245, 0.15)",
          bottom: "-120px",
          left: "10%",
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "230px",
          height: "230px",
          borderRadius: "50%",
          background: "rgba(255, 220, 140, 0.18)",
          bottom: "5%",
          right: "5%",
          filter: "blur(8px)",
        }}
      />

      {/* ================= MAIN CONTAINER ================= */}

      <div
        className="container"
        style={{
          maxWidth: "1200px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="card shadow border-0"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.96)",
          }}
        >
          <div
            className="card-body"
            style={{
              padding: "14px 30px 30px",
            }}
          >
            {/* ================= HEADER ================= */}

            <div
              className="text-center"
              style={{
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  padding: "7px 20px",
                  background:
                    "linear-gradient(135deg, #dff8ee, #e3f7fc)",
                  borderRadius: "9px",
                  color: "#3d7f70",
                  boxShadow:
                    "0 3px 10px rgba(80, 160, 140, 0.10)",
                  border: "1px solid #c5e9dc",
                }}
              >
                <h2
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "23px",
                    lineHeight: "1.2",
                  }}
                >
                  Student Dashboard
                </h2>

                <p
                  className="mb-0"
                  style={{
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  Smart Student Mess & SpaceFit Management System
                </p>
              </div>
            </div>

            <hr
              style={{
                margin: "10px 0 18px",
              }}
            />

            {/* ================= STUDENT INFO ================= */}

            <div className="mb-3">
              <h5 className="fw-bold mb-2">
                Welcome, {user?.name} 👋
              </h5>

              <p className="mb-1">
                <strong>Email:</strong> {user?.email}
              </p>

              <p className="mb-0">
                <strong>Role:</strong> {formattedRole}
              </p>
            </div>

            {/* ================= ACTION BUTTONS ================= */}

            <div
              className="d-flex flex-wrap gap-2"
              style={{
                marginBottom: "18px",
              }}
            >
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/profile")}
              >
                👤 My Profile
              </button>

              <button
                className="btn btn-outline-primary"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/living-needs")}
              >
                🏠 Find SpaceFit Rooms
              </button>

              <Link
                to="/my-reservations"
                className="btn btn-success"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
              >
                📋 My Reservations
              </Link>

              <Link
                to="/waitlist"
                className="btn btn-warning"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
              >
                ⏳ My Waitlist
              </Link>

              <Link
                to="/complaints/new"
                className="btn btn-danger"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
              >
                🛠️ Complaints
              </Link>

              <Link
                to="/complaints/track"
                className="btn btn-info text-white"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
              >
                🔎 Track My Complaint
              </Link>
            </div>

            {/* ================= DISCOVER ROOMS ================= */}

            <div className="row mt-3">
              <div className="col-md-6 mb-3">
                <div
                  className="card h-100"
                  style={{
                    borderRadius: "15px",
                    background:
                      "linear-gradient(135deg, #fff0e6 0%, #fff8ed 100%)",
                    border: "2px solid #f3c4a5",
                    boxShadow:
                      "0 6px 18px rgba(220, 150, 110, 0.14)",
                  }}
                >
                  <div className="card-body">
                    <h4
                      className="fw-bold"
                      style={{
                        color: "#c27650",
                      }}
                    >
                      🏠 Discover Rooms
                    </h4>

                    <p
                      style={{
                        color: "#7d6b63",
                      }}
                    >
                      Browse available rooms and explore
                      Room Space Passport details.
                    </p>

                    <button
                      className="btn"
                      style={{
                        borderRadius: "9px",
                        fontWeight: "500",
                        backgroundColor: "#e89a70",
                        borderColor: "#e89a70",
                        color: "white",
                      }}
                      onClick={loadRooms}
                    >
                      Browse Rooms
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ROOMS ================= */}

            {showRooms && (
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="mb-0 fw-bold">
                    Available Rooms
                  </h3>

                  <span
                    className="badge"
                    style={{
                      background:
                        "linear-gradient(135deg, #42b883, #39b7d9)",
                      borderRadius: "15px",
                      padding: "7px 12px",
                    }}
                  >
                    {rooms.length} Rooms
                  </span>
                </div>

                {loading ? (
                  <div className="text-center">
                    <div
                      className="spinner-border text-success"
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

            {/* ================= LOGOUT ================= */}

            <div
              className="mt-3 pt-3"
              style={{
                borderTop: "1px solid #dceee8",
              }}
            >
              <button
                className="btn btn-outline-danger"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;