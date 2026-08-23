import {
  useState,
} from "react";

import {
  trackComplaint,
} from "../services/complaintService";

import ComplaintTimeline from "../components/ComplaintTimeline";

import ComplaintUpdateForm from "../components/ComplaintUpdateForm";


/* =========================================================
   STATUS BADGE
========================================================= */

const getStatusClass = (status) => {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  switch (normalizedStatus) {
    case "pending":
      return "bg-warning text-dark";

    case "under review":
      return "bg-info text-dark";

    case "assigned":
      return "bg-primary";

    case "in progress":
      return "bg-primary";

    case "resolved":
      return "bg-success";

    case "closed":
      return "bg-dark";

    case "reopened":
      return "bg-warning text-dark";

    case "rejected":
      return "bg-danger";

    default:
      return "bg-secondary";
  }
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function TrackComplaint() {
  const [tokenInput, setTokenInput] =
    useState("");

  const [activeToken, setActiveToken] =
    useState(null);

  const [complaint, setComplaint] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     CHECK COMPLAINT STATUS
  ======================================================= */

  const handleCheckStatus =
    async (e) => {
      e.preventDefault();

      if (
        !tokenInput.trim()
      ) {
        setError(
          "Please enter your private follow-up token."
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          await trackComplaint(
            tokenInput.trim()
          );

        setComplaint(
          data.complaint
        );

        setActiveToken(
          tokenInput.trim()
        );
      } catch (err) {
        setComplaint(null);
        setActiveToken(null);

        setError(
          err.response?.data
            ?.message ||
            "Invalid token. Please check your token and try again."
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="container py-4">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body p-4">

          <div className="d-flex align-items-start gap-3">

            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "52px",
                height: "52px",
                fontSize: "24px",
              }}
            >
              🔒
            </div>

            <div>

              <h4 className="mb-1">
                Confidential Complaint Tracking
              </h4>

              <p className="text-muted mb-0">
                Use your private token to securely
                check your complaint status and
                communicate anonymously with the
                System Administrator.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          TOKEN SEARCH
      ================================================= */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="mb-1">
                Check Complaint Status
              </h5>

              <small className="text-muted">
                Enter the private token you received
                when following up on your complaint.
              </small>

            </div>

            <span className="badge bg-light text-dark border">
              Private
            </span>

          </div>


          <form
            onSubmit={
              handleCheckStatus
            }
          >

            <label
              className="form-label fw-semibold"
            >
              Private Follow-Up Token
            </label>

            <div className="input-group input-group-lg">

              <input
                type="text"
                className="form-control font-monospace"
                placeholder="ABCD-EFGH-IJKL"
                value={
                  tokenInput
                }
                onChange={(e) =>
                  setTokenInput(
                    e.target.value
                  )
                }
                autoComplete="off"
              />

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Checking..."
                  : "Check Status"}
              </button>

            </div>

            <div className="form-text">
              Keep this token private. It is used
              to access your confidential complaint
              communication.
            </div>

          </form>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="alert alert-danger d-flex align-items-center shadow-sm"
          role="alert"
        >

          <span
            className="me-2"
            style={{
              fontSize: "20px",
            }}
          >
            ⚠️
          </span>

          <div>
            {error}
          </div>

        </div>

      )}


      {/* =================================================
          COMPLAINT DETAILS
      ================================================= */}

      {complaint && (

        <div>

          {/* =============================================
              COMPLAINT HEADER
          ============================================= */}

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-body p-4">

              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">

                <div>

                  <small className="text-muted">
                    Complaint
                  </small>

                  <h4 className="mb-2">
                    #{complaint.ticketNumber}
                  </h4>

                </div>


                <span
                  className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                    complaint.status
                  )}`}
                >
                  {complaint.status}
                </span>

              </div>


              {/* =========================================
                  INFORMATION CARDS
              ========================================= */}

              <div className="row g-3 mt-2">

                <div className="col-md-4">

                  <div className="border rounded p-3 h-100 bg-light">

                    <small className="text-muted d-block mb-1">
                      Location
                    </small>

                    <strong>
                      {complaint.location ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="border rounded p-3 h-100 bg-light">

                    <small className="text-muted d-block mb-1">
                      Category
                    </small>

                    <strong>
                      {complaint.category ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="border rounded p-3 h-100 bg-light">

                    <small className="text-muted d-block mb-1">
                      Urgency
                    </small>

                    <strong>
                      {complaint.urgency ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>

              </div>


              {/* =========================================
                  DESCRIPTION
              ========================================= */}

              <div className="mt-4">

                <h6 className="fw-semibold">
                  Complaint Description
                </h6>

                <div className="border rounded p-3 bg-light">

                  <p className="mb-0">
                    {complaint.description ||
                      "No description provided."}
                  </p>

                </div>

              </div>


              {/* =========================================
                  REVIEW DECISION
              ========================================= */}

              {complaint.reviewDecision && (

                <div className="alert alert-info mt-4 mb-0">

                  <h6 className="fw-semibold mb-2">
                    Review Decision
                  </h6>

                  <div>
                    {complaint.reviewDecision}
                  </div>

                </div>

              )}


              {/* =========================================
                  TARGET COMPLETION
              ========================================= */}

              {complaint.targetCompletionDate && (

                <div className="border rounded p-3 mt-3">

                  <small className="text-muted d-block">
                    Target Completion
                  </small>

                  <strong>
                    {new Date(
                      complaint.targetCompletionDate
                    ).toLocaleString()}
                  </strong>

                </div>

              )}


              {/* =========================================
                  REPAIR CONFIRMED
              ========================================= */}

              {complaint.repairVerification
                ?.status ===
                "Confirmed" && (

                <div className="alert alert-success mt-4 mb-0">

                  <div className="fw-semibold mb-1">
                    ✓ Repair Resolution Confirmed
                  </div>

                  <div>
                    You confirmed the repair
                    resolution for this complaint.
                  </div>

                </div>

              )}


              {/* =========================================
                  REOPENED
              ========================================= */}

              {complaint.repairVerification
                ?.status ===
                "Reopened" && (

                <div className="alert alert-warning mt-4 mb-0">

                  <div className="fw-semibold mb-1">
                    ⚠ Complaint Reopened
                  </div>

                  <div>
                    You reopened this complaint
                    because the issue has not been
                    satisfactorily resolved.
                  </div>

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              COMPLAINT TIMELINE
          ================================================= */}

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-body p-4">

              <div className="mb-3">

                <h5 className="mb-1">
                  Complaint Progress
                </h5>

                <p className="text-muted mb-0">
                  Follow the progress and actions
                  taken on your complaint.
                </p>

              </div>

              <ComplaintTimeline
                complaint={
                  complaint
                }
              />

            </div>

          </div>


          {/* =================================================
              CONFIDENTIAL UPDATE
          ================================================= */}

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-body p-4">

              <div className="d-flex align-items-start gap-3 mb-4">

                <div
                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                  }}
                >
                  💬
                </div>

                <div>

                  <h5 className="mb-1">
                    Confidential Communication
                  </h5>

                  <p className="text-muted mb-0">
                    Send an update or additional
                    information to the System
                    Administrator using your private
                    token.
                  </p>

                </div>

              </div>


              <ComplaintUpdateForm
                token={
                  activeToken
                }
                complaint={
                  complaint
                }
                onUpdated={
                  setComplaint
                }
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default TrackComplaint;