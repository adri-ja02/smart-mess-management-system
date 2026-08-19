const STAGES = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Repair Completed",
  "Closed",
];

function ComplaintTimeline({ complaint }) {
  const currentIndex = STAGES.indexOf(complaint.status);

  return (
    <div>
      <h5 className="mb-3">Timeline</h5>

      <ul className="list-group mb-4">
        {STAGES.map((stage, index) => {
          const reached = currentIndex >= 0 && index <= currentIndex;

          return (
            <li
              key={stage}
              className={`list-group-item d-flex align-items-center ${
                reached ? "list-group-item-success" : ""
              }`}
            >
              <i
                className={`bi ${
                  reached ? "bi-check-circle-fill" : "bi-circle"
                } me-2`}
              />
              {stage}
            </li>
          );
        })}
      </ul>

      {complaint.evidence?.length > 0 && (
        <div className="mb-4">
          <h6>Evidence</h6>
          <div className="d-flex flex-wrap gap-2">
            {complaint.evidence.map((item, i) =>
              item.type === "video" ? (
                <video
                  key={i}
                  src={item.url}
                  controls
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                  className="rounded border"
                />
              ) : (
                <img
                  key={i}
                  src={item.url}
                  alt="evidence"
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                  className="rounded border"
                />
              )
            )}
          </div>
        </div>
      )}

      {complaint.additionalNotes?.length > 0 && (
        <div className="mb-4">
          <h6>Additional Notes</h6>
          <ul className="list-group">
            {complaint.additionalNotes.map((n, i) => (
              <li key={i} className="list-group-item">
                {n.note}
                <div className="text-muted small">
                  {new Date(n.addedAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {complaint.reviewQuestions?.length > 0 && (
        <div>
          <h6>Review Questions</h6>
          {complaint.reviewQuestions.map((q) => (
            <div key={q._id} className="card mb-2">
              <div className="card-body py-2">
                <div className="fw-semibold">{q.question}</div>
                {q.answer ? (
                  <div className="text-success mt-1">You: {q.answer}</div>
                ) : (
                  <div className="text-warning mt-1">Awaiting your answer</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComplaintTimeline;