import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import roomService from "../services/roomService";
import {
  requestReservation,
  getReservationStatus,
} from "../services/reservationService";

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const occupiedBeds =
    room.beds?.filter((bed) => bed.occupied).length || 0;

  const totalBeds = room.beds?.length || 0;

  const [reservationStatus, setReservationStatus] = useState(null);

  useEffect(() => {
    if (user?.role === "student") {
      loadReservationStatus();
    }
  }, [room._id, user]);

  const loadReservationStatus = async () => {
    try {
      const res = await getReservationStatus(room._id);
      setReservationStatus(res.status);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRoom = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to archive this room?"
    );

    if (!confirmDelete) return;

    try {
      await roomService.archiveRoom(room._id);
      alert("Room archived successfully.");
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Failed to archive room.");
    }
  };

  const reserveRoom = async () => {
    try {
      const availableBed = room.beds.find(
        (bed) => !bed.occupied
      );

      let res;

      if (availableBed) {
        res = await requestReservation({
          roomId: room._id,
          bedNumber: availableBed.bedNumber,
        });
      } else {
        res = await requestReservation({
          roomId: room._id,
        });
      }

      alert(res.message);

      // Change button immediately
      setReservationStatus("pending");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Reservation failed."
      );
    }
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow h-100">

        {/* ROOM IMAGE */}
        {room.images?.length > 0 ? (
          <img
            src={room.images[0].url}
            className="card-img-top"
            alt="Room"
            style={{
              height: "220px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center bg-light"
            style={{ height: "220px" }}
          >
            <p className="text-muted">
              No Image Available
            </p>
          </div>
        )}

        <div className="card-body d-flex flex-column">

          <h5 className="fw-bold">
            Room {room.roomNumber}
          </h5>

          <hr />

          <p>
            <strong>Building:</strong>{" "}
            {room.building?.name}
          </p>

          <p>
            <strong>Floor:</strong>{" "}
            {room.floor?.number}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {room.messLocation}
          </p>

          <p>
            <strong>Rent:</strong> ৳{room.rent}
          </p>

          <p>
            <strong>Occupancy:</strong>{" "}
            {occupiedBeds} / {totalBeds}
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

            <button
              className="btn btn-primary w-100 mb-2"
              onClick={() =>
                navigate(`/rooms/${room._id}`)
              }
            >
              View Details
            </button>

            {/* STUDENT BUTTON */}

            {user?.role === "student" && (

              <button
                className={`btn w-100 mb-2 ${
                  reservationStatus === "approved"
                    ? "btn-success"
                    : reservationStatus === "pending"
                    ? "btn-warning"
                    : "btn-primary"
                }`}
                disabled={
                  reservationStatus === "approved" ||
                  reservationStatus === "pending"
                }
                onClick={reserveRoom}
              >
                {reservationStatus === "approved"
                  ? "✅ Reserved"
                  : reservationStatus === "pending"
                  ? "⏳ Request Pending"
                  : "🛏 Reserve Bed"}
              </button>

            )}

            {/* MANAGER */}

            {user?.role === "manager" && (
              <>
                <button
                  className="btn btn-warning w-100 mb-2"
                  onClick={() =>
                    navigate(`/rooms/edit/${room._id}`)
                  }
                >
                  Edit Room
                </button>

                <button
                  className="btn btn-danger w-100"
                  onClick={deleteRoom}
                >
                  Archive Room
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default RoomCard;