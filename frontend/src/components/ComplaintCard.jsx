import { Link } from "react-router-dom";

const STATUS_COLORS = {
  Submitted: "secondary",
  "Under Review": "info",
  Assigned: "primary",
  "In Progress": "warning",
  "Repair Completed": "success",
  Closed: "dark",
  Valid: "primary",
  "Insufficient Evidence": "warning",
  Duplicate: "secondary",
  "Confirmed False": "danger",
};

const URGENCY_COLORS = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Emergency: "danger",
};

function ComplaintCard({ complaint }) {
  return (
    <Link
      to={`/manager/complaints/${complaint._id}`}
      className="text-decoration-none text-body"
    >
      <div className="card mb-2 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">
              #{complaint.ticketNumber} &middot; {complaint.location}
            </div>
            <div className="text-muted small">
              {complaint.category} &middot;{" "}
              {new Date(complaint.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="d-flex gap-2">
            <span className={`badge bg-${URGENCY_COLORS[complaint.urgency]}`}>
              {complaint.urgency}
            </span>
            <span className={`badge bg-${STATUS_COLORS[complaint.status]}`}>
              {complaint.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ComplaintCard;