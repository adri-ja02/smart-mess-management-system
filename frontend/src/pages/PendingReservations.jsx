import { useEffect, useState } from "react";

import {
  getPendingReservations,
  approveReservation,
  rejectReservation,
} from "../services/reservationService";

function PendingReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Selected reservation for View Submitted Info modal
  const [detailsReservation, setDetailsReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  // ===========================================================
  // LOAD PENDING RESERVATIONS
  // ===========================================================

  const loadReservations = async () => {
    try {
      setLoading(true);

      const res = await getPendingReservations();

      const pendingReservations =
        (res.reservations || []).filter(
          (reservation) =>
            reservation.status === "pending"
        );

      setReservations(pendingReservations);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load pending reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // APPROVE RESERVATION
  // ===========================================================

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Approve this reservation? The bed will be marked occupied."
      )
    ) {
      return;
    }

    setProcessingId(id);

    try {
      const res = await approveReservation(id);

      alert(
        res.message ||
          "Reservation approved successfully."
      );

      await loadReservations();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Approval failed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ===========================================================
  // REJECT RESERVATION
  // ===========================================================

  const handleReject = async (id) => {
    const reason = window.prompt(
      "Reason for rejecting this reservation:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    setProcessingId(id);

    try {
      const res = await rejectReservation(
        id,
        reason.trim()
      );

      alert(
        res.message ||
          "Reservation rejected successfully."
      );

      await loadReservations();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Rejection failed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ===========================================================
  // CHECK HOLD EXPIRY
  // ===========================================================

  const isHoldExpired = (reservation) => {
    return (
      reservation.status === "pending" &&
      reservation.holdExpiresAt &&
      new Date(reservation.holdExpiresAt) <
        new Date()
    );
  };

  // ===========================================================
  // FORMAT DATE
  // ===========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
          ></div>

          <p className="mt-2">
            Loading pending reservations...
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // PAGE
  // ===========================================================

  return (
    <div className="container mt-5">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Pending Reservations
          </h2>

          <p className="text-muted mb-0">
            Review and manage pending student
            reservation requests.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadReservations}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {reservations.length === 0 ? (
        <div className="alert alert-info">
          No pending reservations.
        </div>
      ) : (
        <div className="table-responsive">

          <table className="table table-bordered table-hover align-middle">

            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead className="table-dark">
              <tr>

                <th>
                  Student
                </th>

                <th>
                  Building
                </th>

                <th>
                  Room
                </th>

                <th>
                  Bed
                </th>

                <th>
                  Status
                </th>

                <th>
                  Requested
                </th>

                <th>
                  Hold Expires
                </th>

                <th>
                  View Details
                </th>

                <th>
                  Action
                </th>

              </tr>
            </thead>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <tbody>

              {reservations.map((r) => {
                const expired = isHoldExpired(r);

                return (
                  <tr key={r._id}>

                    {/* =================================================
                        STUDENT
                    ================================================= */}

                    <td>
                      <div className="fw-semibold">
                        {r.student?.name ||
                          r.applicantDetails?.fullName ||
                          "-"}
                      </div>

                      <small className="text-muted">
                        {r.student?.email ||
                          r.applicantDetails?.email ||
                          "-"}
                      </small>
                    </td>

                    {/* =================================================
                        BUILDING
                    ================================================= */}

                    <td>
                      {r.room?.building?.name ||
                        "-"}
                    </td>

                    {/* =================================================
                        ROOM
                    ================================================= */}

                    <td>
                      {r.room?.roomNumber ||
                        "-"}
                    </td>

                    {/* =================================================
                        BED
                    ================================================= */}

                    <td>
                      {r.bedNumber || "-"}
                    </td>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td>
                      <span className="badge bg-warning text-dark">
                        Pending
                      </span>
                    </td>

                    {/* =================================================
                        REQUESTED
                    ================================================= */}

                    <td>
                      {formatDate(r.createdAt)}
                    </td>

                    {/* =================================================
                        HOLD EXPIRES
                    ================================================= */}

                    <td
                      className={
                        expired
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {formatDate(
                        r.holdExpiresAt
                      )}

                      {expired && (
                        <span className="ms-1">
                          (expired)
                        </span>
                      )}
                    </td>

                    {/* =================================================
                        VIEW SUBMITTED INFO
                    ================================================= */}

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          setDetailsReservation(r)
                        }
                      >
                        View Details
                      </button>
                    </td>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <td>

                      <button
                        type="button"
                        className="btn btn-success btn-sm me-2"
                        disabled={
                          processingId === r._id ||
                          expired
                        }
                        onClick={() =>
                          handleApprove(r._id)
                        }
                      >
                        {processingId === r._id
                          ? "..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={
                          processingId === r._id ||
                          expired
                        }
                        onClick={() =>
                          handleReject(r._id)
                        }
                      >
                        {processingId === r._id
                          ? "..."
                          : "Reject"}
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

      {/* =====================================================
          VIEW SUBMITTED INFO MODAL
      ===================================================== */}

      {detailsReservation && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content">

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="modal-header">
                <h5 className="modal-title">
                  Submitted Information
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() =>
                    setDetailsReservation(null)
                  }
                ></button>
              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="modal-body">

                {(() => {
                  const details =
                    detailsReservation.applicantDetails;

                  if (!details) {
                    return (
                      <p className="text-muted mb-0">
                        No details were submitted
                        with this request.
                      </p>
                    );
                  }

                  const rows = [
                    [
                      "Full Name",
                      details.fullName,
                    ],
                    [
                      "Email",
                      details.email,
                    ],
                    [
                      "Phone",
                      details.phone,
                    ],
                    [
                      "Address",
                      details.address,
                    ],
                    [
                      "Institution",
                      details.institutionName,
                    ],
                    [
                      "Student ID",
                      details.studentId,
                    ],
                    [
                      "Blood Group",
                      details.bloodGroup,
                    ],
                    [
                      "Father's Name",
                      details.fatherName,
                    ],
                    [
                      "Father's Phone",
                      details.fatherPhone,
                    ],
                    [
                      "Mother's Name",
                      details.motherName,
                    ],
                    [
                      "Mother's Phone",
                      details.motherPhone,
                    ],
                  ];

                  return (
                    <table className="table table-sm table-borderless mb-0">
                      <tbody>
                        {rows.map(
                          ([label, value]) => (
                            <tr key={label}>
                              <th
                                className="text-muted"
                                style={{
                                  width: "40%",
                                }}
                              >
                                {label}
                              </th>

                              <td>
                                {value || "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  );
                })()}

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setDetailsReservation(null)
                  }
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PendingReservations;
