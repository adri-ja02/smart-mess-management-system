import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import roomService from "../services/roomService";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const res = await roomService.getRoom(id);
      setRoom(res.data.room);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
        <p>Loading Room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="alert alert-danger">
        Room not found
      </div>
    );
  }

  const occupiedBeds =
    room.beds?.filter((bed) => bed.occupied).length || 0;

  const totalBeds =
    room.beds?.length || 0;

  return (
    <div className="container mt-5">

      <div className="card shadow">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center">

            <h2 className="fw-bold">
              Room {room.roomNumber}
            </h2>

            <button
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

          </div>

          <hr />

          <h4 className="mb-3">
            Room Images
          </h4>

          {room.images?.length > 0 ? (

            <div className="row">

              {room.images.map((img, index) => (

                <div
                  className="col-md-4 mb-3"
                  key={index}
                >

                  <img
                    src={img.url}
                    alt="Room"
                    className="img-fluid rounded"
                    style={{
                      height: "250px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />

                </div>

              ))}

            </div>

          ) : (

            <p>No images available</p>

          )}

          <hr />

          <h4>
            Basic Information
          </h4>

          <div className="row">

            <div className="col-md-6 mb-2">
              <strong>Building:</strong>{" "}
              {room.building?.name}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Floor:</strong>{" "}
              {room.floor?.number}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Location:</strong>{" "}
              {room.messLocation}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Rent:</strong> ৳{room.rent}
            </div>

          </div>

          <hr />

          <h4>
            Room Space Passport
          </h4>

          <div className="row">

            <div className="col-md-6 mb-2">
              <strong>Total Area:</strong>{" "}
              {room.totalArea}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Usable Area:</strong>{" "}
              {room.usableArea}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Storage:</strong>{" "}
              {room.storage || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Bathroom:</strong>{" "}
              {room.bathroomType}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Natural Light:</strong>{" "}
              {room.naturalLightLevel}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Ventilation:</strong>{" "}
              {room.ventilationNotes || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Utility Policy:</strong>{" "}
              {room.utilityPolicy || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Amenities:</strong>{" "}
              {room.amenities?.length
                ? room.amenities.join(", ")
                : "None"}
            </div>

          </div>

          <hr />

          <h4>
            Bed Inventory
          </h4>

          <p>
            <strong>Occupancy:</strong>{" "}
            {occupiedBeds} / {totalBeds}
          </p>

                    {room.beds?.length > 0 ? (

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-light">

                <tr>
                  <th>Bed Number</th>
                  <th>Position</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {room.beds.map((bed) => (

                  <tr key={bed._id}>

                    <td>
                      {bed.bedNumber}
                    </td>

                    <td>
                      {bed.position}
                    </td>

                    <td>

                      {bed.occupied ? (

                        <span className="badge bg-danger">
                          Occupied
                        </span>

                      ) : (

                        <span className="badge bg-success">
                          Available
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          ) : (

            <div className="alert alert-info">
              No beds available.
            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default RoomDetails;