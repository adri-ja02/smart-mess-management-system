import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function ComplaintSubmitted() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { ticketNumber, token } = location.state || {};

  // Direct visits / refreshes have no state to show — send them
  // back to the form instead of rendering an empty success page.
  if (!ticketNumber || !token) {
    navigate("/complaints/new", { replace: true });
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the token is still selectable text
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body text-center">
        <i className="bi bi-check-circle-fill text-success fs-1 mb-2" />
        <h4>Complaint Submitted Successfully!</h4>

        <div className="mt-4 mb-3">
          <div className="text-muted small">Ticket Number</div>
          <div className="fs-5 fw-semibold">{ticketNumber}</div>
        </div>

        <div className="mb-3">
          <div className="text-muted small">Private Follow-up Token</div>
          <div className="fs-4 fw-bold font-monospace">{token}</div>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy Token"}
          </button>
        </div>

        <div className="alert alert-warning text-start">
          <strong>⚠ Save this token.</strong> You will need it to check your
          complaint later, and it will not be shown again. It is not linked
          to your account, so no one can look it up on your behalf.
        </div>

        <Link to="/complaints/track" className="btn btn-primary">
          Track This Complaint
        </Link>
      </div>
    </div>
  );
}

export default ComplaintSubmitted;