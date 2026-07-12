import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CampusRouteMap from "../components/CampusRouteMap";
import RoomLayout from "../components/RoomLayout";
import { bedSelectionKey, getSelectedBedId, saveSelectedBedId } from "../utils/bedSelection";

const SpaceFitExplorer = () => {
  const [matches, setMatches] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState({});

  useEffect(() => {
    const savedMatches = localStorage.getItem("spaceFitMatches");
    if (!savedMatches) return;

    try {
      const nextMatches = JSON.parse(savedMatches);
      setMatches(nextMatches);
      setSelectedBeds(Object.fromEntries(
        nextMatches.map((item) => [String(item.room?._id), getSelectedBedId(item.room?._id)])
      ));
    } catch {
      localStorage.removeItem("spaceFitMatches");
    }
  }, []);

  const selectBed = (roomId, bed) => {
    if (bed.occupied || bed.isArchived) return;
    const bedId = bedSelectionKey(bed);
    saveSelectedBedId(roomId, bedId);
    setSelectedBeds((current) => ({ ...current, [String(roomId)]: bedId }));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h1 className="text-center mb-4">SpaceFit Recommended Rooms</h1>
        {!matches.length ? (
          <div className="alert alert-warning text-center">No matching rooms found</div>
        ) : (
          <div className="row g-4">
            {matches.map((item, index) => {
              const room = item.room || {};
              const activeBeds = (room.beds || []).filter((bed) => !bed.isArchived);
              const occupiedBeds = activeBeds.filter((bed) => bed.occupied).length;
              const availableBeds = activeBeds.length - occupiedBeds;
              const selectedBedId = selectedBeds[String(room._id)];

              return (
                <div className="col-md-6" key={room._id || index}>
                  <div className="card shadow-sm p-4 h-100">
                    <div className="d-flex justify-content-between gap-3">
                      <h4 className="text-primary">Room {room.roomNumber}</h4>
                      {room._id && <Link className="btn btn-outline-primary btn-sm" to={`/rooms/${room._id}`}>View Details</Link>}
                    </div>
                    <p className="mb-1"><strong>Building:</strong> {room.building?.name || "Not specified"}</p>
                    <p className="mb-1"><strong>Floor:</strong> {room.floor?.number ?? "Not specified"}</p>
                    <p className="mb-3"><strong>Match Score:</strong> <span className="badge bg-success">{Number(item.score) || 0}%</span></p>

                    <section className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                        <h6 className="mb-0">Bed occupancy</h6>
                        <span className="small text-muted text-end">{activeBeds.length} total · {occupiedBeds} occupied · {availableBeds} available</span>
                      </div>
                      <RoomLayout
                        beds={activeBeds}
                        layout={room.layout}
                        selectedBedId={selectedBedId}
                        onSelectBed={(bed) => selectBed(room._id, bed)}
                      />
                    </section>

                    <section className="mb-3">
                      <strong>Why it matches:</strong>
                      <ul className="mt-2 mb-0">
                        {(item.reasons || []).map((reason, reasonIndex) => <li key={reasonIndex}>{reason}</li>)}
                      </ul>
                    </section>

                    {item.breakdown?.length > 0 && (
                      <section className="small text-muted mb-3">
                        <strong>Score breakdown</strong>
                        <ul className="mb-0 mt-1">
                          {item.breakdown.map((part) => <li key={part.criterion}>{part.criterion}: +{part.points}/{part.maxPoints}</li>)}
                        </ul>
                      </section>
                    )}

                    <CampusRouteMap room={room} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceFitExplorer;
