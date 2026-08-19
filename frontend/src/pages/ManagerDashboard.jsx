import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import roomService from "../services/roomService";

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

  // Capitalize first letter
  const capitalize = (value) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formattedRole = capitalize(user?.role);
  const formattedStatus = capitalize(user?.approvalStatus);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "25px 0",
        background:
          "linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #eff6ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* =========================
          DECORATIVE BACKGROUND
      ========================= */}

      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(251, 146, 60, 0.08)",
          top: "-120px",
          left: "-90px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(236, 72, 153, 0.07)",
          bottom: "-160px",
          right: "-110px",
        }}
      />

      {/* =========================
          MAIN CONTAINER
      ========================= */}

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
            background: "rgba(255, 255, 255, 0.97)",
          }}
        >
          <div className="card-body p-4 p-md-5">

            {/* =========================
                HEADER
            ========================= */}

            <div className="text-center mb-3">
              <div
                style={{
                  width: "100%",
                  padding: "9px 20px",
                  background:
                    "linear-gradient(135deg, #ffe4d6, #fce7f3)",
                  border:
                    "1px solid #f8c8b8",
                  borderRadius: "10px",
                  color: "#7c2d12",
                  boxShadow:
                    "0 3px 10px rgba(234, 88, 12, 0.08)",
                }}
              >
                <h2
                  className="fw-bold mb-1"
                  style={{
                    fontSize: "24px",
                    color: "#7c2d12",
                  }}
                >
                  Manager Dashboard
                </h2>

                <p
                  className="mb-0 small"
                  style={{
                    color: "#9a3412",
                  }}
                >
                  Smart Student Mess & SpaceFit Management System
                </p>
              </div>
            </div>

            <hr />

            {/* =========================
                MANAGER INFO
            ========================= */}

            <div className="mb-4">

              <h5 className="fw-bold">
                Welcome, {user?.name} 👋
              </h5>

              <p className="mb-2">
                <strong>Email:</strong> {user?.email}
              </p>

              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "#fff3cd",
                    color: "#856404",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {formattedStatus}
                </span>
              </p>

              <p className="mb-0">
                <strong>Role:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "#fce7f3",
                    color: "#9d174d",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {formattedRole}
                </span>
              </p>

            </div>

            {/* =========================
                ACCOUNT ACTIONS
            ========================= */}

            <div className="d-flex flex-wrap gap-2 mb-4">

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
                className="btn btn-success"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/rooms")}
              >
                🏠 Room Management
              </button>

              <Link
                to="/pending-reservations"
                className="btn btn-warning"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
              >
                📋 Pending Reservations
              </Link>

              <button
                className="btn btn-danger"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={() =>
                  navigate("/manager/complaints")
                }
              >
                🛠️ Complaints & Issues
              </button>

            </div>

            <hr />

            {/* =========================
                CREATED ROOMS
            ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

              <h4 className="mb-0 fw-bold">
                🏠 Created Rooms
              </h4>

              <span
                style={{
                  borderRadius: "15px",
                  padding: "7px 12px",
                  background: "#f97316",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {rooms.length} Rooms
              </span>

            </div>

            {/* =========================
                LOADING
            ========================= */}

            {loading ? (

              <div className="text-center">

                <div
                  className="spinner-border"
                  style={{
                    color: "#f97316",
                  }}
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

                    <div
                      className="alert"
                      style={{
                        background: "#fff7ed",
                        border: "1px solid #fdba74",
                        color: "#9a3412",
                        borderRadius: "10px",
                      }}
                    >
                      No rooms created yet.
                    </div>

                  </div>

                )}

              </div>

            )}

            {/* =========================
                LOGOUT
            ========================= */}

            <div
              className="mt-4 pt-3"
              style={{
                borderTop: "1px solid #dee2e6",
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

export default ManagerDashboard;