import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampusRouteMap from "../components/CampusRouteMap";
import RoomLayout from "../components/RoomLayout";
import roomService from "../services/roomService";
import { bedSelectionKey, getSelectedBedId, saveSelectedBedId } from "../utils/bedSelection";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBedId, setSelectedBedId] = useState(null);

  useEffect(() => {
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

    loadRoom();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" /><p>Loading Room...</p></div>;
  }

  if (!room) {
    return <div className="alert alert-danger">Room not found</div>;
  }

  const activeBeds = (room.beds || []).filter((bed) => !bed.isArchived);
  const occupiedBeds = activeBeds.filter((bed) => bed.occupied).length;
  const roomImages = room.roomImages?.length ? room.roomImages : room.images || [];
  const selectBed = (bed) => {
    if (bed.occupied) return;
    const bedId = bedSelectionKey(bed);
    setSelectedBedId(bedId);
    saveSelectedBedId(room._id, bedId);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold">Room {room.roomNumber}</h2>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>

          <hr />
          <h4 className="mb-3">Room Images</h4>
          {roomImages.filter((image) => image?.url).length ? (
            <div className="row">
              {roomImages.filter((image) => image?.url).map((image, index) => (
                <div className="col-md-4 mb-3" key={image.publicId || image.public_id || index}>
                  <img src={image.url} alt={`Room ${room.roomNumber}`} className="img-fluid rounded" style={{ height: 250, width: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          ) : <p>No images available</p>}

          <hr />
          <h4>Basic Information</h4>
          <div className="row">
            <div className="col-md-6 mb-2"><strong>Building:</strong> {room.building?.name}</div>
            <div className="col-md-6 mb-2"><strong>Floor:</strong> {room.floor?.number}</div>
            <div className="col-md-6 mb-2"><strong>Location:</strong> {room.messLocation}</div>
            <div className="col-md-6 mb-2"><strong>Rent:</strong> ৳{room.rent}</div>
          </div>

          <hr />
          <h4>Room Space Passport</h4>
          <div className="row">
            <div className="col-md-6 mb-2"><strong>Total Area:</strong> {room.totalArea}</div>
            <div className="col-md-6 mb-2"><strong>Usable Area:</strong> {room.usableArea}</div>
            <div className="col-md-6 mb-2"><strong>Storage:</strong> {room.storage || "-"}</div>
            <div className="col-md-6 mb-2"><strong>Bathroom:</strong> {room.bathroomType}</div>
            <div className="col-md-6 mb-2"><strong>Natural Light:</strong> {room.naturalLightLevel}</div>
            <div className="col-md-6 mb-2"><strong>Ventilation:</strong> {room.ventilationNotes || "-"}</div>
            <div className="col-md-6 mb-2"><strong>Utility Policy:</strong> {room.utilityPolicy || "-"}</div>
            <div className="col-md-6 mb-2"><strong>Amenities:</strong> {room.amenities?.length ? room.amenities.join(", ") : "None"}</div>
          </div>

          <hr />
          <h4>Visual Room Layout</h4>
          <RoomLayout
            beds={activeBeds}
            layout={room.layout}
            selectedBedId={selectedBedId}
            onSelectBed={selectBed}
          />

          <hr />
          <h4>Bed Inventory</h4>
          <p><strong>Occupancy:</strong> {occupiedBeds} occupied / {activeBeds.length} total / {activeBeds.length - occupiedBeds} available</p>
          {activeBeds.length ? (
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light"><tr><th>Bed Number</th><th>Position</th><th>Status</th></tr></thead>
              <tbody>
                {activeBeds.map((bed, index) => (
                  <tr key={bed._id || index} className={selectedBedId === bedSelectionKey(bed) ? "table-primary" : ""}>
                    <td>{bed.bedNumber}</td>
                    <td>{bed.position || "-"}</td>
                    <td><span className={`badge ${bed.occupied ? "bg-danger" : selectedBedId === bedSelectionKey(bed) ? "bg-primary" : "bg-success"}`}>{bed.occupied ? "Occupied" : selectedBedId === bedSelectionKey(bed) ? "Selected" : "Available"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="alert alert-info">No beds available.</div>}

          <hr />
          <h4 className="mb-3">Campus Route Map</h4>
          <CampusRouteMap room={room} />
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
