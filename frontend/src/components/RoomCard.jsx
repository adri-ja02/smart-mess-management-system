import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import roomService from "../services/roomService";

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const occupiedBeds =
    room.beds?.filter((bed) => bed.occupied).length || 0;

  const totalBeds = room.beds?.length || 0;

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

  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow h-100">

        {/* IMAGE */}
        {room.images?.length > 0 ? (
          <img
            src={room.images[0].url}
            className="card-img-top"
            alt="Room"
            style={{ height: "220px", objectFit: "cover" }}
          />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center bg-light"
            style={{ height: "220px" }}
          >
            <p className="text-muted">No Image Available</p>
          </div>
        )}

        <div className="card-body d-flex flex-column">
          <h5 className="fw-bold">Room {room.roomNumber}</h5>

          <hr />

          <p><strong>Building:</strong> {room.building?.name}</p>
          <p><strong>Floor:</strong> {room.floor?.number}</p>
          <p><strong>Location:</strong> {room.messLocation}</p>
          <p><strong>Rent:</strong> ৳{room.rent}</p>

          <p>
            <strong>Occupancy:</strong>{" "}
            {occupiedBeds} / {totalBeds}
          </p>

          <p>
            <strong>Bathroom:</strong> {room.bathroomType}
          </p>

          <p>
            <strong>Natural Light:</strong> {room.naturalLightLevel}
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
              onClick={() => navigate(`/rooms/${room._id}`)}
            >
              View Details
            </button>

            {user?.role === "manager" && (
              <>
                {/* ✅ FIXED HERE */}
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