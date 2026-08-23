import {
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  useEffect,
  useState,
} from "react";

import RoomCard from "../components/RoomCard";

import roomService from "../services/roomService";

function ManagerDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // SEARCH STATE
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // LOAD ROOMS
  // =========================================================

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const res =
        await roomService.getRooms();

      setRooms(
        res.data.rooms || []
      );
    } catch (error) {
      console.log(
        "Room loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH THROUGH ANY ROOM DETAIL
  // =========================================================

  const searchRoomDetails = (
    value,
    search
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value)
        .toLowerCase()
        .includes(search);
    }

    if (Array.isArray(value)) {
      return value.some((item) =>
        searchRoomDetails(
          item,
          search
        )
      );
    }

    if (
      typeof value === "object"
    ) {
      return Object.values(value).some(
        (item) =>
          searchRoomDetails(
            item,
            search
          )
      );
    }

    return false;
  };

  // =========================================================
  // FILTER ROOMS
  // =========================================================

  const filteredRooms =
    rooms.filter((room) => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return searchRoomDetails(
        room,
        search
      );
    });

  // =========================================================
  // FORMAT USER VALUE
  // =========================================================

  const capitalizeFirstLetter = (
    value
  ) => {
    if (!value) {
      return "";
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // =========================================================
  // COMMON MANAGEMENT BUTTON STYLE
  // =========================================================

  const managementButtonStyle = {
    fontWeight: "500",
    borderRadius: "50px",
    padding: "10px 20px",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f3fb 0%, #fff4e6 48%, #eef8f5 100%)",
      }}
    >
      <div className="container">

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div
          className="card border-0"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow:
              "0 12px 35px rgba(76, 58, 91, 0.16)",
          }}
        >

          <div className="card-body p-4 p-md-5">

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="text-center mb-4"
              style={{
                background: "#2563EB",
                borderRadius: "12px",
                padding: "9px 20px",
                boxShadow:
                  "0 5px 14px rgba(37, 99, 235, 0.20)",
              }}
            >

              <h2
                className="fw-bold mb-1"
                style={{
                  color: "#ffffff",
                  fontSize: "21px",
                  lineHeight: "1.2",
                }}
              >
                Manager Dashboard
              </h2>

              <p
                className="mb-0"
                style={{
                  color: "#eff6ff",
                  fontSize: "12px",
                }}
              >
                Smart Student Mess & SpaceFit Room Allocation system
              </p>

            </div>

            <hr
              style={{
                borderColor: "#ded2e7",
              }}
            />

            {/* =================================================
                MANAGER INFO
            ================================================= */}

            <div
              className="mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #f1eaff, #faf7ff)",
                border:
                  "1px solid #ddd0ec",
                borderLeft:
                  "5px solid #7B5EA7",
                borderRadius: "14px",
                padding: "18px 20px",
                boxShadow:
                  "0 5px 14px rgba(109, 89, 122, 0.08)",
              }}
            >

              <h5
                className="fw-bold mb-3"
                style={{
                  color: "#4B3A57",
                }}
              >
                Welcome, {user?.name}👋
              </h5>

              <p className="mb-2">
                <strong>Email:</strong>{" "}
                {user?.email}
              </p>

              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: "#198754",
                    fontWeight: "500",
                  }}
                >
                  {capitalizeFirstLetter(
                    user?.approvalStatus
                  )}
                </span>
              </p>

              <p className="mb-0">
                <strong>Role:</strong>{" "}
                <span
                  style={{
                    color: "#6D597A",
                    fontWeight: "500",
                  }}
                >
                  {capitalizeFirstLetter(
                    user?.role
                  )}
                </span>
              </p>

            </div>

            {/* =================================================
                ACCOUNT ACTIONS
            ================================================= */}

            <div className="mb-4">

              <h5
                className="fw-bold mb-3"
                style={{
                  color: "#403547",
                }}
              >
                Management Actions
              </h5>

              <div
                className="d-flex flex-wrap"
                style={{
                  gap: "12px",
                }}
              >

                {/* PROFILE */}

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    navigate("/profile")
                  }
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#6C63FF",
                    borderColor:
                      "#6C63FF",
                    color: "#ffffff",
                    boxShadow:
                      "0 3px 8px rgba(108, 99, 255, 0.20)",
                  }}
                >
                  👤 My Profile
                </button>

                {/* ROOM MANAGEMENT */}

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    navigate("/rooms")
                  }
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#198754",
                    borderColor:
                      "#198754",
                    color: "#ffffff",
                    boxShadow:
                      "0 3px 8px rgba(25, 135, 84, 0.20)",
                  }}
                >
                  🏠 Room Management
                </button>

                {/* PENDING RESERVATIONS */}

                <Link
                  to="/pending-reservations"
                  className="btn"
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#FFC107",
                    borderColor:
                      "#FFC107",
                    color: "#000000",
                    boxShadow:
                      "0 3px 8px rgba(255, 193, 7, 0.20)",
                  }}
                >
                  📋 Pending Reservations
                </Link>

                {/* RESERVATION HISTORY */}

                <Link
                  to="/reservation-history"
                  className="btn"
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#FF9800",
                    borderColor:
                      "#FF9800",
                    color: "#000000",
                    boxShadow:
                      "0 3px 8px rgba(255, 152, 0, 0.22)",
                  }}
                >
                  📜 Reservation History
                </Link>

                {/* WAITLIST */}

                <Link
                  to="/manager-waitlist"
                  className="btn"
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#17A2B8",
                    borderColor:
                      "#17A2B8",
                    color: "#ffffff",
                    boxShadow:
                      "0 3px 8px rgba(23, 162, 184, 0.20)",
                  }}
                >
                  🕒 Check Waitlist
                </Link>

                {/* COMPLAINTS */}

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    navigate(
                      "/manager/complaints"
                    )
                  }
                  style={{
                    ...managementButtonStyle,
                    backgroundColor:
                      "#DC3545",
                    borderColor:
                      "#DC3545",
                    color: "#ffffff",
                    boxShadow:
                      "0 3px 8px rgba(220, 53, 69, 0.20)",
                  }}
                >
                  🛠️ Complaints & Issues
                </button>

              </div>

            </div>

            <hr
              style={{
                borderColor: "#ded2e7",
              }}
            />

            {/* =================================================
                CREATED ROOMS HEADER
            ================================================= */}

            <div
              className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3"
            >

              <div>

                <h4
                  className="mb-1 fw-bold"
                  style={{
                    color: "#403547",
                  }}
                >
                  Created Rooms
                </h4>

                <small
                  style={{
                    color: "#77707C",
                  }}
                >
                  Search and manage your created rooms
                </small>

              </div>

              {!loading && (

                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #6D597A, #9B72B0)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "500",
                    boxShadow:
                      "0 3px 8px rgba(109, 89, 122, 0.18)",
                  }}
                >
                  {filteredRooms.length}{" "}
                  {filteredRooms.length === 1
                    ? "Room"
                    : "Rooms"}
                </span>

              )}

            </div>

            {/* =================================================
                SEARCH BAR
            ================================================= */}

            {!loading &&
              rooms.length > 0 && (

                <div
                  className="mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #fff3df, #fff9f1)",
                    border:
                      "1px solid #ffd59a",
                    borderRadius: "14px",
                    padding: "17px",
                    boxShadow:
                      "0 5px 15px rgba(255, 152, 0, 0.10)",
                  }}
                >

                  <label
                    className="fw-bold mb-2"
                    style={{
                      color: "#C76B00",
                      fontSize: "15px",
                    }}
                  >
                    🔎 Find a Room
                  </label>

                  <div className="input-group">

                    <span
                      className="input-group-text"
                      style={{
                        background: "#ffffff",
                        border:
                          "1px solid #f0c98b",
                        color: "#FF9800",
                        fontSize: "18px",
                      }}
                    >
                      🔍
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by building, room number, floor, rent, amenities, bathroom, location..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                      style={{
                        border:
                          "1px solid #f0c98b",
                        boxShadow: "none",
                        padding:
                          "11px 14px",
                      }}
                    />

                    {searchTerm && (

                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          setSearchTerm("")
                        }
                        style={{
                          background:
                            "#FF9800",
                          border:
                            "1px solid #FF9800",
                          color: "#000000",
                          fontWeight: "400",
                        }}
                      >
                        ✕
                      </button>

                    )}

                  </div>

                  <small
                    className="d-block mt-2"
                    style={{
                      color: "#80694E",
                      fontSize: "12px",
                    }}
                  >
                    Search using any room detail such as
                    building, room number, floor, rent,
                    amenities, bathroom, area, storage,
                    lighting, ventilation, bed information,
                    and more.
                  </small>

                </div>

              )}

            {/* =================================================
                ROOM RESULTS
            ================================================= */}

            {loading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border"
                  style={{
                    color: "#7B5EA7",
                  }}
                  role="status"
                />

                <p
                  className="mt-2 text-muted"
                >
                  Loading rooms...
                </p>

              </div>

            ) : (

              <div className="row">

                {filteredRooms.length > 0 ? (

                  filteredRooms.map(
                    (room) => (
                      <RoomCard
                        key={room._id}
                        room={room}
                      />
                    )
                  )

                ) : (

                  <div className="col-12">

                    <div
                      className="text-center p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #eaf4ff, #f5faff)",
                        border:
                          "1px solid #bdd8f5",
                        borderRadius:
                          "14px",
                        boxShadow:
                          "0 5px 15px rgba(13, 110, 253, 0.08)",
                      }}
                    >

                      <div
                        style={{
                          fontSize: "30px",
                          marginBottom:
                            "8px",
                        }}
                      >
                        🔍
                      </div>

                      <h5
                        className="fw-bold"
                        style={{
                          color: "#3973B8",
                        }}
                      >
                        No Matching Room Found
                      </h5>

                      <p
                        className="text-muted mb-0"
                      >
                        {searchTerm
                          ? `No room matches "${searchTerm}". Try another room detail.`
                          : "No rooms have been created yet."}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            )}

            {/* =================================================
                LOGOUT
            ================================================= */}

            <div
              className="mt-4 pt-3 border-top"
              style={{
                borderColor:
                  "#ded2e7 !important",
              }}
            >

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleLogout}
                style={{
                  fontWeight: "400",
                  borderRadius: "8px",
                  padding:
                    "9px 18px",
                  boxShadow:
                    "0 3px 8px rgba(220, 53, 69, 0.10)",
                }}
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