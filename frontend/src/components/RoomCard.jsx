import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import roomService from "../services/roomService";

// onArchived: optional callback(roomId) so the parent list can remove
// this card / refetch without a full page reload.
const RoomCard = ({ room, onArchived }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isArchiving, setIsArchiving] = useState(false);

  const activeBeds =
    room.beds?.filter((bed) => !bed.isArchived) || [];

  const occupiedBeds = activeBeds.filter(
    (bed) => bed.occupied
  ).length;

  const totalBeds = activeBeds.length;

  const deleteRoom = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to archive this room?"
    );

    if (!confirmDelete) return;

    setIsArchiving(true);

    try {
      await roomService.archiveRoom(room._id);

      if (onArchived) {
        onArchived(room._id);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to archive room.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="col-md-4 mb-4">

      {/* Gradient Border Wrapper */}
      <div
        style={{
          padding: "3px",
          borderRadius: "17px",
          background:
            "linear-gradient(135deg, #f3a6d8, #c5a7f7, #9eddf5)",
          height: "100%",
          boxShadow:
            "0 6px 18px rgba(170, 140, 190, 0.18)",
        }}
      >

        <div
          className="card h-100 border-0"
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #fff7fc 0%, #f7f2ff 50%, #f0faff 100%)",
          }}
        >

          {/* ================= ROOM IMAGE ================= */}
          {room.images?.length > 0 ? (
            <img
              src={room.images[0].url}
              className="card-img-top"
              alt={`Room ${room.roomNumber}`}
              style={{
                height: "220px",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: "220px",
                background:
                  "linear-gradient(135deg, #fdeafa, #eaf7ff)",
              }}
            >
              <p
                className="mb-0"
                style={{
                  color: "#9b6bb3",
                  fontWeight: "500",
                }}
              >
                🏠 No Image Available
              </p>
            </div>
          )}

          <div className="card-body d-flex flex-column">

            {/* ================= BUILDING + ROOM ================= */}
            <div className="mb-2">

              <h5
                className="fw-bold mb-1"
                style={{
                  color: "#6f42c1",
                }}
              >
                {room.building?.name}
              </h5>

              <div
                className="fw-semibold"
                style={{
                  color: "#b05c91",
                  fontSize: "15px",
                }}
              >
                🏠 Room {room.roomNumber}
              </div>

            </div>

            <hr />

            {/* ================= ROOM INFORMATION ================= */}

            <p>
              <strong>Floor:</strong>{" "}
              {room.floor?.number}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {room.messLocation}
            </p>

            <p>
              <strong>Rent:</strong>{" "}
              <span
                style={{
                  color: "#b35c91",
                  fontWeight: "600",
                }}
              >
                ৳{room.rent}
              </span>
            </p>

            <p>
              <strong>Occupancy:</strong>{" "}
              <span
                className="badge"
                style={{
                  background:
                    "linear-gradient(135deg, #b78de8, #8ec5fc)",
                  color: "white",
                  borderRadius: "10px",
                }}
              >
                {occupiedBeds} / {totalBeds}
              </span>
            </p>

            <p>
              <strong>Bathroom:</strong>{" "}
              {room.bathroomType}
            </p>

            <p>
              <strong>Natural Light:</strong>{" "}
              {room.naturalLightLevel}
            </p>

            <p>
              <strong>Amenities:</strong>{" "}
              {room.amenities?.length > 0
                ? room.amenities.join(", ")
                : "None"}
            </p>

            <div className="mt-auto">

              <hr />

              {/* ================= VIEW DETAILS ================= */}
              <button
                className="btn btn-primary w-100 mb-2"
                style={{
                  borderRadius: "9px",
                  fontWeight: "500",
                }}
                onClick={() =>
                  navigate(`/rooms/${room._id}`)
                }
              >
                View Details
              </button>

              {/* ================= MANAGER ================= */}
              {user?.role === "manager" && (
                <>
                  <button
                    className="btn btn-warning w-100 mb-2"
                    style={{
                      borderRadius: "9px",
                      fontWeight: "500",
                    }}
                    onClick={() =>
                      navigate(`/rooms/edit/${room._id}`)
                    }
                  >
                    Edit Room
                  </button>

                  <button
                    className="btn btn-danger w-100"
                    style={{
                      borderRadius: "9px",
                      fontWeight: "500",
                    }}
                    onClick={deleteRoom}
                    disabled={isArchiving}
                  >
                    {isArchiving
                      ? "Archiving..."
                      : "Archive Room"}
                  </button>
                </>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;