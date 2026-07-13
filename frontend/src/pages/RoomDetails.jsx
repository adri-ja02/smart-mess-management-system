import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampusRouteMap from "../components/CampusRouteMap";
import RoomLayout from "../components/RoomLayout";
import roomService from "../services/roomService";
import { bedSelectionKey, getSelectedBedId, saveSelectedBedId } from "../utils/bedSelection";
import { useAuth } from "../context/AuthContext"; // adjust path to match your project

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const isManager = user?.role === "manager";
  const canSelect = isStudent || isManager; // both can select an available bed
  const canDeselect = isManager; // only manager can free up a selected bed

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBedId, setSelectedBedId] = useState(null);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const res = await roomService.getRoom(id);
      setRoom(res.data.room);
      setSelectedBedId(getSelectedBedId(res.data.room._id));
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

  // Active (non-archived) beds are used for occupancy counts, layout, and the bed table
  const activeBeds = (room.beds || []).filter((bed) => !bed.isArchived);

  const occupiedBeds = activeBeds.filter((bed) => bed.occupied).length;

  const totalBeds = activeBeds.length;

  const selectBed = (bed) => {
    if (bed.occupied) return;

    const bedId = bedSelectionKey(bed);
    const isSelected = selectedBedId === bedId;

    if (isSelected) {
      // Only a manager can free up an already-selected bed
      if (!canDeselect) return;

      setSelectedBedId(null);
      saveSelectedBedId(room._id, null);
      return;
    }

    // Students and managers can select an available bed
    if (!canSelect) return;

    setSelectedBedId(bedId);
    saveSelectedBedId(room._id, bedId);
  };

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

          <h4 className="mb-3">
            Visual Room Layout
          </h4>

          <RoomLayout
            beds={activeBeds}
            layout={room.layout}
            selectedBedId={selectedBedId}
            onSelectBed={selectBed}
          />

          <hr />

          <h4>
            Bed Inventory
          </h4>

          <p>
            <strong>Occupancy:</strong>{" "}
            {occupiedBeds} occupied / {totalBeds} total / {totalBeds - occupiedBeds} available
          </p>

          {activeBeds.length > 0 ? (

            <table className="table table-bordered table-hover align-middle">

              <thead className="table-light">

                <tr>
                  <th>Bed Number</th>
                  <th>Position</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {activeBeds.map((bed, index) => {

                  const isSelected = selectedBedId === bedSelectionKey(bed);
                  const clickable =
                    !bed.occupied &&
                    ((isSelected && canDeselect) || (!isSelected && canSelect));

                  return (

                    <tr
                      key={bed._id || index}
                      className={isSelected ? "table-primary" : ""}
                      style={clickable ? { cursor: "pointer" } : undefined}
                      onClick={() => selectBed(bed)}
                    >

                      <td>
                        {bed.bedNumber}
                      </td>

                      <td>
                        {bed.position || "-"}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            bed.occupied
                              ? "bg-danger"
                              : isSelected
                              ? "bg-primary"
                              : "bg-success"
                          }`}
                        >
                          {bed.occupied
                            ? "Occupied"
                            : isSelected
                            ? "Selected"
                            : "Available"}
                        </span>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          ) : (

            <div className="alert alert-info">
              No beds available.
            </div>

          )}

          <hr />

          <h4 className="mb-3">
            Campus Route Map
          </h4>

          <CampusRouteMap room={room} />

        </div>

      </div>

    </div>
  );
};

export default RoomDetails;