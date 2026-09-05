import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getComplaintByIdForManager,
  assignComplaint,
  updateComplaintStatus,
  uploadCompletionEvidence,
} from "../services/complaintService";

import ComplaintTimeline from "../components/ComplaintTimeline";

const WORKER_TYPES = [
  "Plumber",
  "Technician",
  "Mechanic",
  "Other",
];

const STATUS_OPTIONS = [
  "In Progress",
  "Repair Completed",
];

function ManagerComplaintDetail() {
  const { id } = useParams();

  const [complaint, setComplaint] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [assigning, setAssigning] =
    useState(false);

  const [workerType, setWorkerType] =
    useState("");

  const [workerName, setWorkerName] =
    useState("");

  const [targetDate, setTargetDate] =
    useState("");

  const [statusChoice, setStatusChoice] =
    useState("");

  const [completionFiles, setCompletionFiles] =
    useState([]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const isRepairCompleted =
    complaint?.status ===
    "Repair Completed";

  const isClosed =
    complaint?.status ===
    "Closed";

  const isActionBlocked =
    isRepairCompleted ||
    isClosed;

  const getStatusBadgeClass = (
    status
  ) => {
    switch (status) {
      case "Valid":
        return "badge bg-success";

      case "Assigned":
        return "badge bg-primary";

      case "In Progress":
        return "badge bg-warning text-dark";

      case "Repair Completed":
        return "badge bg-success";

      case "Reopened":
        return "badge bg-danger";

      case "Closed":
        return "badge bg-secondary";

      default:
        return "badge bg-secondary";
    }
  };

  const getStatusButtonClass = () => {
    if (isClosed) {
      return "btn btn-secondary w-100";
    }

    if (
      statusChoice ===
      "Repair Completed"
    ) {
      return "btn btn-success w-100";
    }

    if (
      statusChoice ===
      "In Progress"
    ) {
      return "btn btn-warning w-100";
    }

    return "btn btn-primary w-100";
  };

  /* =========================================================
     FORMAT DATE FOR DATETIME-LOCAL
  ========================================================= */

  const formatDateForInput = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /* =========================================================
     LOAD COMPLAINT
     
     IMPORTANT:
     This loads only once when the ID changes.
     
     There is NO 10-second polling because polling was
     overwriting the assignment form while the manager
     was typing.
  ========================================================= */

  const load =useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await getComplaintByIdForManager(
          id
        );

      const loadedComplaint =
        data.complaint;

      setComplaint(
        loadedComplaint
      );

      setStatusChoice(
        loadedComplaint.status || ""
      );

      /*
       * Populate worker fields only from
       * already-saved backend data.
       */
      if (
        loadedComplaint.assignedTo
      ) {
        setWorkerType(
          loadedComplaint.assignedTo
            ?.type || ""
        );

        setWorkerName(
          loadedComplaint.assignedTo
            ?.name || ""
        );
      } else {
        setWorkerType("");
        setWorkerName("");
      }

      /*
       * Populate target date only if
       * it already exists.
       */
      if (
        loadedComplaint.targetCompletionDate
      ) {
        setTargetDate(
          formatDateForInput(
            loadedComplaint
              .targetCompletionDate
          )
        );
      } else {
        setTargetDate("");
      }

      setError("");
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
        "Could not load work order."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* =========================================================
     ASSIGN WORKER
  ========================================================= */

  const handleAssign = async (
    e
  ) => {
    e.preventDefault();

    if (
      isActionBlocked ||
      assigning
    ) {
      return;
    }

    setError("");

    const cleanWorkerName =
      workerName.trim();

    if (!workerType) {
      setError(
        "Please select a worker type."
      );
      return;
    }

    if (!cleanWorkerName) {
      setError(
        "Please enter the worker name."
      );
      return;
    }

    if (!targetDate) {
      setError(
        "Please select a target completion date."
      );
      return;
    }

    try {
      setAssigning(true);

      const data =
        await assignComplaint(
          id,
          workerType,
          cleanWorkerName,
          targetDate
        );

      const updatedComplaint =
        data.complaint;

      /*
       * Update complaint.
       */
      setComplaint(
        updatedComplaint
      );

      /*
       * Keep the values in the form.
       */
      setWorkerType(
        updatedComplaint
          .assignedTo?.type ||
        workerType
      );

      setWorkerName(
        updatedComplaint
          .assignedTo?.name ||
        cleanWorkerName
      );

      if (
        updatedComplaint
          .targetCompletionDate
      ) {
        setTargetDate(
          formatDateForInput(
            updatedComplaint
              .targetCompletionDate
          )
        );
      } else {
        /*
         * If backend doesn't return the
         * date, keep what the manager entered.
         */
        setTargetDate(
          targetDate
        );
      }

      setStatusChoice(
        updatedComplaint.status ||
        ""
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
        "Could not assign work order."
      );
    } finally {
      setAssigning(false);
    }
  };

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleStatus = async (
    e
  ) => {
    e.preventDefault();

    if (isClosed) {
      return;
    }

    if (
      !statusChoice ||
      statusChoice ===
        complaint.status
    ) {
      return;
    }

    try {
      const data =
        await updateComplaintStatus(
          id,
          statusChoice
        );

      setComplaint(
        data.complaint
      );

      setStatusChoice(
        data.complaint.status
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
        "Could not update work-order status."
      );
    }
  };

  /* =========================================================
     COMPLETION EVIDENCE
  ========================================================= */

  const handleCompletionUpload =
    async (e) => {
      e.preventDefault();

      if (isClosed) {
        return;
      }

      if (
        completionFiles.length ===
        0
      ) {
        setError(
          "Select at least one completion-evidence file."
        );
        return;
      }

      try {
        const data =
          await uploadCompletionEvidence(
            id,
            completionFiles
          );

        setComplaint(
          data.complaint
        );

        setCompletionFiles([]);

        setError("");
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
          "Could not upload completion evidence."
        );
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <p>
        Loading work order...
      </p>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!complaint) {
    return (
      <div className="alert alert-danger">
        {error ||
          "Work order not found."}
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="row">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="col-md-7">

        <h4>
          Work Order #
          {" "}
          {complaint.ticketNumber}
        </h4>

        <div className="alert alert-success">
          This complaint was already marked{" "}
          <strong>
            Valid
          </strong>{" "}
          by the System Administrator.
        </div>

        <p className="text-muted">
          Resident identity and confidential
          resident communication are not
          available on this page.
        </p>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* WORK ORDER INFORMATION */}

        <div className="card mb-3">
          <div className="card-body">

            <h6>
              Work Order Information
            </h6>

            <p>
              <strong>
                Ticket:
              </strong>{" "}
              {complaint.ticketNumber}
            </p>

            <p>
              <strong>
                Location:
              </strong>{" "}
              {complaint.location}
            </p>

            <p>
              <strong>
                Category:
              </strong>{" "}
              {complaint.category}
            </p>

            <p>
              <strong>
                Priority:
              </strong>{" "}

              <span
                className={
                  complaint.priority ===
                    "Emergency"
                    ? "badge bg-danger"
                    : complaint.priority ===
                        "High"
                      ? "badge bg-warning text-dark"
                      : complaint.priority ===
                          "Low"
                        ? "badge bg-secondary"
                        : "badge bg-primary"
                }
              >
                {
                  complaint.priority ||
                  complaint.urgency ||
                  "Medium"
                }
              </span>
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}

              <span
                className={
                  getStatusBadgeClass(
                    complaint.status
                  )
                }
              >
                {complaint.status}
              </span>
            </p>

            {complaint.targetCompletionDate && (
              <p>
                <strong>
                  Target completion:
                </strong>{" "}
                {new Date(
                  complaint.targetCompletionDate
                ).toLocaleString()}
              </p>
            )}

            {complaint.escalation
              ?.isEscalated && (
              <div className="alert alert-danger">
                <strong>
                  OVERDUE / ESCALATED
                </strong>

                <br />

                {
                  complaint.escalation
                    .reason
                }
              </div>
            )}

          </div>
        </div>

        {/* PROBLEM DESCRIPTION */}

        <div className="card mb-3">
          <div className="card-body">

            <h6>
              Problem Description
            </h6>

            <p>
              {complaint.description}
            </p>

          </div>
        </div>

        {/* COMPLAINT EVIDENCE */}

        {complaint.evidence
          ?.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">

              <h6>
                Complaint Evidence
              </h6>

              <div className="row">

                {complaint.evidence.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="col-md-6 mb-3"
                      key={
                        item.public_id ||
                        index
                      }
                    >

                      {item.type ===
                      "video" ? (
                        <video
                          src={
                            item.url
                          }
                          controls
                          className="w-100 rounded"
                        />
                      ) : (
                        <img
                          src={
                            item.url
                          }
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

        {/* COMPLETION EVIDENCE */}

        {complaint
          .completionEvidence
          ?.length > 0 && (
          <div className="card mb-3 border-success">
            <div className="card-body">

              <h6>
                Repair Completion Evidence
              </h6>

              <div className="row">

                {complaint
                  .completionEvidence
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="col-md-6 mb-3"
                        key={
                          item.public_id ||
                          index
                        }
                      >

                        {item.type ===
                        "video" ? (
                          <video
                            src={
                              item.url
                            }
                            controls
                            className="w-100 rounded"
                          />
                        ) : (
                          <img
                            src={
                              item.url
                            }
                            alt="Repair completion evidence"
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

        {/* TIMELINE */}

        <ComplaintTimeline
          complaint={
            complaint
          }
        />

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="col-md-5">

        {/* ===================================================
            ASSIGN WORKER
        =================================================== */}

        <div className="card mb-3">
          <div className="card-body">

            <h6>
              Assign Worker
            </h6>

            <form
              onSubmit={
                handleAssign
              }
            >

              {/* WORKER TYPE */}

              <label className="form-label">
                Worker Type
              </label>

              <select
                className="form-select mb-3"
                value={
                  workerType
                }
                onChange={(e) =>
                  setWorkerType(
                    e.target.value
                  )
                }
                disabled={
                  isActionBlocked ||
                  assigning
                }
              >

                <option value="">
                  Select worker type
                </option>

                {WORKER_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}

              </select>

              {/* WORKER NAME */}

              <label className="form-label">
                Worker Name
              </label>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter worker name"
                value={
                  workerName
                }
                onChange={(e) =>
                  setWorkerName(
                    e.target.value
                  )
                }
                disabled={
                  isActionBlocked ||
                  assigning
                }
              />

              {/* TARGET DATE */}

              <label className="form-label">
                Target Completion Date
              </label>

              <input
                type="datetime-local"
                className="form-control mb-3"
                value={
                  targetDate
                }
                onChange={(e) =>
                  setTargetDate(
                    e.target.value
                  )
                }
                disabled={
                  isActionBlocked ||
                  assigning
                }
              />

              {/* ASSIGN BUTTON */}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={
                  isActionBlocked ||
                  assigning ||
                  !workerType ||
                  !workerName.trim() ||
                  !targetDate
                }
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Work Order"}
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <div className="card mb-3">
          <div className="card-body">

            <h6>
              Work Order Status
            </h6>

            <form
              onSubmit={
                handleStatus
              }
            >

              <select
                className="form-select mb-3"
                value={
                  statusChoice
                }
                onChange={(e) =>
                  setStatusChoice(
                    e.target.value
                  )
                }
                disabled={
                  isClosed
                }
              >

                <option
                  value={
                    complaint.status
                  }
                >
                  {
                    complaint.status
                  }
                </option>

                {STATUS_OPTIONS
                  .filter(
                    (status) =>
                      status !==
                      complaint.status
                  )
                  .map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

              </select>

              <button
                type="submit"
                className={
                  getStatusButtonClass()
                }
                disabled={
                  isClosed ||
                  !statusChoice ||
                  statusChoice ===
                    complaint.status
                }
              >
                Update Status
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            COMPLETION EVIDENCE
        =================================================== */}

        <div className="card mb-3 border-success">
          <div className="card-body">

            <h6>
              Repair Completion Evidence
            </h6>

            <p className="text-muted small">
              Upload evidence after the assigned
              maintenance person completes the
              repair.
            </p>

            <form
              onSubmit={
                handleCompletionUpload
              }
            >

              <input
                type="file"
                className="form-control mb-3"
                multiple
                accept="image/*,video/*"
                onChange={(e) =>
                  setCompletionFiles(
                    Array.from(
                      e.target.files
                    )
                  )
                }
                disabled={
                  isClosed
                }
              />

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={
                  isClosed
                }
              >
                Upload Completion Evidence
              </button>

            </form>

          </div>
        </div>

        {/* ===================================================
            REPAIR COMPLETED
        =================================================== */}

        {complaint.status ===
          "Repair Completed" && (
          <div className="alert alert-info">
            Waiting for the anonymous resident
            to verify the repair using the
            private token.
          </div>
        )}

        {/* ===================================================
            CLOSED
        =================================================== */}

        {complaint.status ===
          "Closed" && (
          <div className="alert alert-success">
            Resident confirmed that the repair
            was resolved.
          </div>
        )}

      </div>
    </div>
  );
}

export default ManagerComplaintDetail;