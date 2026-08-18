import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getComplaintByIdForManager,
  assignComplaint,
  updateComplaintStatus,
  askReviewQuestion,
} from "../services/complaintService";

import ComplaintTimeline from "../components/ComplaintTimeline";

const STATUSES = [
  "Submitted",
  "Under Review",
  "Insufficient Evidence",
  "Duplicate",
  "Confirmed False",
  "Valid",
  "Assigned",
  "In Progress",
  "Repair Completed",
  "Closed",
];

const WORKER_TYPES = [
  "Plumber",
  "Technician",
  "Mechanic",
  "Other",
];

function ManagerComplaintDetail() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");

  // Assignment
  const [workerType, setWorkerType] = useState("");
  const [workerName, setWorkerName] = useState("");

  // Status
  const [statusChoice, setStatusChoice] = useState("");

  // Review question
  const [question, setQuestion] = useState("");

  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  // loadWorker = true only when page first opens.
  // loadWorker = false during 5-second refresh.
  const load = async (loadWorker = false) => {
    try {
      setError("");

      const data = await getComplaintByIdForManager(id);

      // Always update complaint information
      setComplaint(data.complaint);

      // Always update status
      setStatusChoice(data.complaint.status || "");

      /*
        IMPORTANT:

        Only load the assigned worker when the page
        is opened for the first time.

        During the 5-second refresh we DO NOT update
        workerType or workerName.

        This prevents the manager's worker selection
        from disappearing.
      */
      if (loadWorker) {
        if (data.complaint.assignedTo) {
          setWorkerType(
            data.complaint.assignedTo.type || ""
          );

          setWorkerName(
            data.complaint.assignedTo.name || ""
          );
        } else {
          setWorkerType("");
          setWorkerName("");
        }
      }
    } catch (err) {
      console.error("LOAD COMPLAINT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Could not load complaint."
      );
    }
  };

  /* =========================================================
     INITIAL LOAD + 5 SECOND REFRESH
  ========================================================= */

  useEffect(() => {
    // First load:
    // Load complaint + existing worker assignment
    load(true);

    // Refresh complaint every 5 seconds.
    // This updates:
    // - Student answers
    // - Additional notes
    // - Evidence
    // - Status
    //
    // But DOES NOT reset workerType/workerName.
    const refreshInterval = setInterval(() => {
      load(false);
    }, 5000);

    // Stop refreshing when leaving the page
    return () => clearInterval(refreshInterval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* =========================================================
     ASSIGN WORKER
  ========================================================= */

  const handleAssign = async (e) => {
    e.preventDefault();

    setError("");

    if (!workerType) {
      setError("Please select a worker type.");
      return;
    }

    if (!workerName.trim()) {
      setError("Please enter the worker name.");
      return;
    }

    try {
      const data = await assignComplaint(
        id,
        workerType,
        workerName.trim()
      );

      // Update complaint immediately on screen
      setComplaint(data.complaint);

      // Update status dropdown as well
      setStatusChoice(data.complaint.status);

      setError("");

      // Keep the assigned worker visible
      setWorkerType(
        data.complaint.assignedTo?.type ||
          workerType
      );

      setWorkerName(
        data.complaint.assignedTo?.name ||
          workerName.trim()
      );
    } catch (err) {
      console.error(
        "ASSIGN WORKER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not assign worker."
      );
    }
  };

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleStatusChange = async (e) => {
    e.preventDefault();

    setError("");

    if (!statusChoice) {
      setError("Please select a status.");
      return;
    }

    // Don't send request if status hasn't changed
    if (complaint.status === statusChoice) {
      setError(
        `Complaint is already "${statusChoice}".`
      );
      return;
    }

    try {
      const data = await updateComplaintStatus(
        id,
        statusChoice
      );

      setComplaint(data.complaint);
      setStatusChoice(data.complaint.status);

      setError("");
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not update status."
      );
    }
  };

  /* =========================================================
     ASK REVIEW QUESTION
  ========================================================= */

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    setError("");

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      const data = await askReviewQuestion(
        id,
        question.trim()
      );

      setComplaint(data.complaint);
      setQuestion("");

      setError("");
    } catch (err) {
      console.error(
        "ASK QUESTION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not send question."
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!complaint && !error) {
    return <p>Loading...</p>;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !complaint) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="row">

      {/* =====================================================
          LEFT SIDE - COMPLAINT DETAILS
      ===================================================== */}

      <div className="col-md-7">

        <h4>
          Complaint #{complaint.ticketNumber}
        </h4>

        {/* MANUAL REFRESH */}

        <button
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => load(false)}
        >
          🔄 Refresh Complaint
        </button>

        <p className="text-muted small mb-3">
          Reported anonymously. No resident identity is
          attached to this record.
        </p>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* ===================================================
            COMPLAINT INFORMATION
        =================================================== */}

        <div className="card mb-4">
          <div className="card-body">

            <h6 className="fw-bold mb-3">
              Complaint Information
            </h6>

            <ul className="list-unstyled mb-0">

              <li className="mb-2">
                <strong>Ticket Number:</strong>{" "}
                {complaint.ticketNumber}
              </li>

              <li className="mb-2">
                <strong>Location:</strong>{" "}
                {complaint.location}
              </li>

              <li className="mb-2">
                <strong>Category:</strong>{" "}
                {complaint.category}
              </li>

              <li className="mb-2">
                <strong>Urgency:</strong>{" "}
                {complaint.urgency}
              </li>

              <li className="mb-2">
                <strong>Status:</strong>{" "}
                <span className="badge bg-primary">
                  {complaint.status}
                </span>
              </li>

              <li className="mb-2">
                <strong>Assigned To:</strong>{" "}

                {complaint.assignedTo ? (
                  <>
                    <span className="badge bg-info text-dark me-2">
                      {complaint.assignedTo.type}
                    </span>

                    {complaint.assignedTo.name}
                  </>
                ) : (
                  <span className="text-muted">
                    Not yet assigned
                  </span>
                )}
              </li>

              {complaint.assignedTo?.assignedAt && (
                <li>
                  <strong>Assigned At:</strong>{" "}
                  {new Date(
                    complaint.assignedTo.assignedAt
                  ).toLocaleString()}
                </li>
              )}

            </ul>

          </div>
        </div>

        {/* ===================================================
            PROBLEM
        =================================================== */}

        <div className="card mb-4">
          <div className="card-body">

            <h6 className="fw-bold">
              Problem
            </h6>

            <p className="mb-0">
              {complaint.description}
            </p>

          </div>
        </div>

        {/* ===================================================
            ADDITIONAL INFORMATION FROM STUDENT
        =================================================== */}

        {complaint.additionalNotes &&
          complaint.additionalNotes.length > 0 && (

            <div className="card mb-4">
              <div className="card-body">

                <h6 className="fw-bold">
                  Additional Information From Resident
                </h6>

                {complaint.additionalNotes.map(
                  (item, index) => (

                    <div
                      key={
                        item._id || index
                      }
                      className="border rounded p-3 mb-2"
                    >

                      <p className="mb-1">
                        {item.note}
                      </p>

                      <small className="text-muted">
                        {item.addedAt
                          ? new Date(
                              item.addedAt
                            ).toLocaleString()
                          : ""}
                      </small>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

        {/* ===================================================
            EVIDENCE
        =================================================== */}

        {complaint.evidence &&
          complaint.evidence.length > 0 && (

            <div className="card mb-4">
              <div className="card-body">

                <h6 className="fw-bold mb-3">
                  Evidence
                </h6>

                <div className="row">

                  {complaint.evidence.map(
                    (item, index) => (

                      <div
                        className="col-md-6 mb-3"
                        key={
                          item.public_id ||
                          index
                        }
                      >

                        {item.type === "video" ? (

                          <video
                            src={item.url}
                            controls
                            className="w-100 rounded"
                          />

                        ) : (

                          <img
                            src={item.url}
                            alt="Complaint evidence"
                            className="img-fluid rounded"
                          />

                        )}

                      </div>
                    )
                  )}

                </div>

              </div>
            </div>
          )}

        {/* ===================================================
            TIMELINE
        =================================================== */}

        <ComplaintTimeline
          complaint={complaint}
        />

      </div>

      {/* =====================================================
          RIGHT SIDE - MANAGER ACTIONS
      ===================================================== */}

      <div className="col-md-5">

        {/* ===================================================
            ASSIGN WORKER
        =================================================== */}

        <div className="card mb-3">
          <div className="card-body">

            <h6 className="fw-bold">
              Assign Worker
            </h6>

            <p className="text-muted small">
              Assign the appropriate worker after
              reviewing the complaint.
            </p>

            <form onSubmit={handleAssign}>

              {/* WORKER TYPE */}

              <label className="form-label">
                Worker Type
              </label>

              <select
                className="form-select mb-3"
                value={workerType}
                onChange={(e) =>
                  setWorkerType(e.target.value)
                }
              >

                <option value="">
                  Select Worker Type
                </option>

                {WORKER_TYPES.map((type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>

                ))}

              </select>

              {/* WORKER NAME */}

              <label className="form-label">
                Worker Name
              </label>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter worker name"
                value={workerName}
                onChange={(e) =>
                  setWorkerName(e.target.value)
                }
              />

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Assign Worker
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            CHANGE STATUS
        =================================================== */}

        <div className="card mb-3">
          <div className="card-body">

            <h6 className="fw-bold">
              Change Complaint Status
            </h6>

            <form onSubmit={handleStatusChange}>

              <select
                className="form-select mb-3"
                value={statusChoice}
                onChange={(e) =>
                  setStatusChoice(e.target.value)
                }
              >

                {STATUSES.map((status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>

                ))}

              </select>

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Update Status
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            ASK REVIEW QUESTION
        =================================================== */}

        <div className="card mb-3">
          <div className="card-body">

            <h6 className="fw-bold">
              Ask Resident a Question
            </h6>

            <p className="text-muted small">
              If more information is needed, ask the
              resident a question. They can answer it
              using their complaint tracking token.
            </p>

            <form onSubmit={handleAskQuestion}>

              <textarea
                className="form-control mb-2"
                rows={4}
                placeholder="Example: Can you confirm whether the pipe is leaking continuously?"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
              />

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Send Question
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            REVIEW QUESTIONS
        =================================================== */}

        {complaint.reviewQuestions &&
          complaint.reviewQuestions.length > 0 && (

            <div className="card">

              <div className="card-body">

                <h6 className="fw-bold">
                  Review Questions
                </h6>

                {complaint.reviewQuestions.map(
                  (item, index) => (

                    <div
                      key={
                        item._id || index
                      }
                      className="border rounded p-2 mb-2"
                    >

                      <div>
                        <strong>
                          Question:
                        </strong>{" "}
                        {item.question}
                      </div>

                      <div className="mt-1">

                        <strong>
                          Answer:
                        </strong>{" "}

                        {item.answer ? (

                          <span>
                            {item.answer}
                          </span>

                        ) : (

                          <span className="text-muted">
                            Waiting for resident
                            response
                          </span>

                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

      </div>

    </div>
  );
}

export default ManagerComplaintDetail;