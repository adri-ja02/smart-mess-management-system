import { useState } from "react";
import { trackComplaint } from "../services/complaintService";
import ComplaintTimeline from "../components/ComplaintTimeline";
import ComplaintUpdateForm from "../components/ComplaintUpdateForm";

function TrackComplaint() {
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckStatus = async (e) => {
    e.preventDefault();

    if (!tokenInput.trim()) return;

    setError("");
    setLoading(true);

    try {
      const data = await trackComplaint(tokenInput.trim());
      setComplaint(data.complaint);
      setActiveToken(tokenInput.trim());
    } catch (err) {
      setComplaint(null);
      setActiveToken(null);
      setError(
        err.response?.data?.message ||
          "Invalid token. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="mb-3">Track Your Complaint</h4>

        <form onSubmit={handleCheckStatus} className="mb-4">
          <label className="form-label">Private Token</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="A7K9-XP24-QM81"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Checking..." : "Check Status"}
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        {complaint && (
          <div>
            <div className="mb-4">
              <h5>Complaint #{complaint.ticketNumber}</h5>
              <span className="badge bg-info text-dark me-2">
                {complaint.status}
              </span>
              <span className="text-muted small">
                {complaint.location} &middot; {complaint.category} &middot;{" "}
                {complaint.urgency}
              </span>
              <p className="mt-2">{complaint.description}</p>
            </div>

            <ComplaintTimeline complaint={complaint} />

            <ComplaintUpdateForm
              token={activeToken}
              complaint={complaint}
              onUpdated={setComplaint}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;