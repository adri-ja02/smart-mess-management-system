import {
  Link,
} from "react-router-dom";

const STATUS_COLORS = {
  Valid: "primary",
  Assigned: "primary",
  "In Progress": "warning",
  "Repair Completed":
    "success",
  Reopened: "danger",
  Closed: "dark",
};

const URGENCY_COLORS = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Emergency: "danger",
};

function ComplaintCard({
  complaint,
}) {
  const overdue =
    complaint.escalation
      ?.isEscalated;

  return (
    <Link
      to={`/manager/complaints/${complaint._id}`}
      className="text-decoration-none text-body"
    >
      <div className="card mb-2 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">
                #
                {
                  complaint.ticketNumber
                }{" "}
                ·{" "}
                {
                  complaint.location
                }
              </div>

              <div className="text-muted small">
                {
                  complaint.category
                }{" "}
                ·{" "}
                {new Date(
                  complaint.createdAt
                ).toLocaleDateString()}
              </div>
            </div>

            <div className="d-flex gap-2">
              <span
                className={`badge bg-${
                  URGENCY_COLORS[
                    complaint.urgency
                  ] ||
                  "secondary"
                }`}
              >
                {
                  complaint.urgency
                }
              </span>

              <span
                className={`badge bg-${
                  STATUS_COLORS[
                    complaint.status
                  ] ||
                  "secondary"
                }`}
              >
                {
                  complaint.status
                }
              </span>
            </div>
          </div>

          {overdue && (
            <div className="alert alert-danger mt-3 mb-0 py-2">
              <strong>
                OVERDUE / ESCALATED
              </strong>
              <br />
              {
                complaint
                  .escalation
                  .reason
              }
            </div>
          )}

          {complaint.targetCompletionDate && (
            <div className="small text-muted mt-2">
              Target:{" "}
              {new Date(
                complaint.targetCompletionDate
              ).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ComplaintCard;