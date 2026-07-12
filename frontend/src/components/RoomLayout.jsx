import React from "react";

const createFallbackPositions = (beds) => beds.map((bed, index) => ({
  bedNumber: bed.bedNumber,
  x: 3 + (index % 2) * 9,
  y: 3 + Math.floor(index / 2) * 6,
}));

const RoomLayout = ({ beds = [], layout = {}, selectedBedId, onSelectBed }) => {
  const activeBeds = beds.filter((bed) => !bed.isArchived);
  const roomWidth = Number(layout.roomWidth) || 20;
  const roomLength = Number(layout.roomLength) || 15;
  const positions = Array.isArray(layout.bedPositions) && layout.bedPositions.length
    ? layout.bedPositions
    : createFallbackPositions(activeBeds);

  if (!activeBeds.length) {
    return <div className="border rounded p-4 text-muted text-center">No beds are available to display in this layout.</div>;
  }

  const positionForBed = (bed, index) => {
    const found = positions.find((position) => position?.bedNumber === bed.bedNumber);
    return found && Number.isFinite(Number(found.x)) && Number.isFinite(Number(found.y))
      ? found
      : createFallbackPositions(activeBeds)[index];
  };

  return (
    <section className="border rounded p-3 bg-light">
      <div className="d-flex flex-wrap gap-3 small mb-3" aria-label="Bed status legend">
        <span><i className="d-inline-block bg-success rounded-circle me-1" style={{ width: 10, height: 10 }} />Available</span>
        <span><i className="d-inline-block bg-primary rounded-circle me-1" style={{ width: 10, height: 10 }} />Selected</span>
        <span><i className="d-inline-block bg-danger rounded-circle me-1" style={{ width: 10, height: 10 }} />Occupied</span>
      </div>
      <div className="bg-white border rounded position-relative" style={{ minHeight: 280, overflow: "hidden" }}>
        {activeBeds.map((bed, index) => {
          const position = positionForBed(bed, index);
          const isSelected = selectedBedId === String(bed._id || bed.bedNumber || "");
          const statusClass = bed.occupied ? "btn-outline-danger" : isSelected ? "btn-primary" : "btn-outline-success";

          return (
            <button
              key={bed._id || `${bed.bedNumber}-${index}`}
              type="button"
              className={`btn ${statusClass} position-absolute p-2 ${isSelected ? "shadow" : ""}`}
              style={{
                width: 92,
                left: `${Math.min(Math.max((Number(position.x) / roomWidth) * 100, 2), 75)}%`,
                top: `${Math.min(Math.max((Number(position.y) / roomLength) * 100, 2), 80)}%`,
              }}
              disabled={bed.occupied}
              onClick={() => onSelectBed?.(bed)}
              aria-pressed={isSelected}
            >
              <strong>Bed {bed.bedNumber || index + 1}</strong>
              <small className="d-block">{bed.occupied ? "Occupied" : isSelected ? "Selected" : "Available"}</small>
            </button>
          );
        })}
      </div>
      <p className="small text-muted mt-3 mb-0">Click an available bed to select it. Room size: {roomWidth} × {roomLength}.</p>
    </section>
  );
};

export default RoomLayout;
