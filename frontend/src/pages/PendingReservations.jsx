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
  const [detailsReservation, setDetailsReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  // ===========================================================
  // LOAD ALL RESERVATIONS
  // ===========================================================

  const loadReservations = async () => {
    try {
      const res = await getPendingReservations();

      setReservations(res.reservations || []);

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load reservations."
      );

    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // APPROVE
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

      const res =
        await approveReservation(id);

      alert(res.message);

      await loadReservations();

    } catch (error) {

      alert(
        error.response?.data?.message ||
          "Approval failed."
      );

    } finally {

      setProcessingId(null);

    }
  };

  // ===========================================================
  // REJECT
  // ===========================================================

  const handleReject = async (id) => {

    const reason = window.prompt(
      "Reason for rejecting this reservation:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {

      alert(
        "A rejection reason is required."
      );

      return;
    }

    setProcessingId(id);

    try {

      const res =
        await rejectReservation(
          id,
          reason.trim()
        );

      alert(res.message);

      await loadReservations();

    } catch (error) {

      alert(
        error.response?.data?.message ||
          "Rejection failed."
      );

    } finally {

      setProcessingId(null);

    }
  };

  // ===========================================================
  // HOLD EXPIRY
  // ===========================================================

  const isHoldExpired = (reservation) => {

    return (
      reservation.status === "pending" &&
      reservation.holdExpiresAt &&
      new Date(
        reservation.holdExpiresAt
      ) < new Date()
    );

  };

  // ===========================================================
  // FORMAT DATE
  // ===========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-BD",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );
  };

  // ===========================================================
  // STATUS BADGE
  // ===========================================================

  const getStatusBadge = (status) => {

    switch (status) {

      case "pending":
        return (
          <span className="badge bg-warning text-dark">
            Pending
          </span>
        );

      case "approved":
        return (
          <span className="badge bg-success">
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="badge bg-danger">
            Rejected
          </span>
        );

      case "cancelled":
        return (
          <span className="badge bg-secondary">
            Cancelled
          </span>
        );

      case "expired":
        return (
          <span className="badge bg-dark">
            Expired
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            {status || "Unknown"}
          </span>
        );
    }
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
          />

          <p className="mt-2">
            Loading reservations...
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
          PAGE TITLE
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="mb-1">
            Reservation History
          </h2>

          <p className="text-muted mb-0">
            View all student reservation requests and
            submitted applicant details.
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadReservations}
        >
          Refresh
        </button>

      </div>


      {/* =====================================================
          NO RESERVATIONS
      ===================================================== */}

      {reservations.length === 0 ? (

        <div className="alert alert-info">

          No reservation records found.

        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-dark">

              <tr>

                <th>
                  Student
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
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {reservations.map((r) => {

                const expired =
                  isHoldExpired(r);

                return (

                  <tr key={r._id}>

                    {/* STUDENT */}

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


                    {/* ROOM */}

                    <td>

                      {r.room?.roomNumber ||
                        "-"}

                    </td>


                    {/* BED */}

                    <td>

                      {r.bedNumber || "-"}

                    </td>


                    {/* STATUS */}

                    <td>

                      {getStatusBadge(
                        r.status
                      )}

                      {r.status ===
                        "rejected" &&
                        r.rejectionReason && (

                          <div className="small text-danger mt-1">

                            Reason:{" "}
                            {r.rejectionReason}

                          </div>

                        )}

                    </td>


                    {/* CREATED */}

                    <td>

                      {formatDate(
                        r.createdAt
                      )}

                    </td>


                    {/* HOLD EXPIRES */}

                    <td
                      className={
                        expired
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >

                      {r.status ===
                      "pending" ? (

                        <>
                          {formatDate(
                            r.holdExpiresAt
                          )}

                          {expired && (

                            <span className="ms-1">

                              (expired)

                            </span>

                          )}

                        </>

                      ) : (

                        "-"

                      )}

                    </td>


                    {/* ACTION */}

                    <td>

                      {/* ALWAYS AVAILABLE */}

                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() =>
                          setDetailsReservation(r)
                        }
                      >
                        View Details
                      </button>


                      {/* ONLY PENDING */}

                      {r.status ===
                        "pending" &&
                        !expired && (

                          <>

                            <button
                              className="btn btn-success btn-sm me-2"
                              disabled={
                                processingId ===
                                r._id
                              }
                              onClick={() =>
                                handleApprove(
                                  r._id
                                )
                              }
                            >

                              {processingId ===
                              r._id
                                ? "..."
                                : "Approve"}

                            </button>


                            <button
                              className="btn btn-danger btn-sm"
                              disabled={
                                processingId ===
                                r._id
                              }
                              onClick={() =>
                                handleReject(
                                  r._id
                                )
                              }
                            >

                              {processingId ===
                              r._id
                                ? "..."
                                : "Reject"}

                            </button>

                          </>

                        )}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}


      {/* =====================================================
          APPLICANT DETAILS MODAL
      ===================================================== */}

      {detailsReservation && (

        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            background:
              "rgba(0,0,0,0.5)",
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

                <div>

                  <h5 className="modal-title">

                    Applicant Details

                  </h5>

                  <small className="text-muted">

                    Reservation Status:{" "}

                    {getStatusBadge(
                      detailsReservation.status
                    )}

                  </small>

                </div>


                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() =>
                    setDetailsReservation(
                      null
                    )
                  }
                />

              </div>


              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="modal-body">

                {(() => {

                  const details =
                    detailsReservation
                      .applicantDetails;


                  if (!details) {

                    return (

                      <p className="text-muted mb-0">

                        No applicant details were
                        submitted with this request.

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

                    <>

                      <table className="table table-sm table-borderless mb-3">

                        <tbody>

                          {rows.map(
                            ([label, value]) => (

                              <tr key={label}>

                                <th
                                  className="text-muted"
                                  style={{
                                    width:
                                      "40%",
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


                      {/* =================================================
                          RESERVATION INFORMATION
                      ================================================= */}

                      <hr />

                      <h6 className="mb-3">
                        Reservation Information
                      </h6>


                      <table className="table table-sm table-borderless">

                        <tbody>

                          <tr>

                            <th
                              className="text-muted"
                              style={{
                                width:
                                  "40%",
                              }}
                            >
                              Room
                            </th>

                            <td>

                              {detailsReservation
                                .room
                                ?.roomNumber ||
                                "-"}

                            </td>

                          </tr>


                          <tr>

                            <th className="text-muted">
                              Bed
                            </th>

                            <td>

                              {detailsReservation
                                .bedNumber ||
                                "-"}

                            </td>

                          </tr>


                          <tr>

                            <th className="text-muted">
                              Status
                            </th>

                            <td>

                              {getStatusBadge(
                                detailsReservation
                                  .status
                              )}

                            </td>

                          </tr>


                          <tr>

                            <th className="text-muted">
                              Submitted
                            </th>

                            <td>

                              {formatDate(
                                detailsReservation
                                  .createdAt
                              )}

                            </td>

                          </tr>


                          {detailsReservation
                            .approvedAt && (

                            <tr>

                              <th className="text-muted">
                                Approved At
                              </th>

                              <td>

                                {formatDate(
                                  detailsReservation
                                    .approvedAt
                                )}

                              </td>

                            </tr>

                          )}


                          {detailsReservation
                            .rejectionReason && (

                            <tr>

                              <th className="text-muted">
                                Rejection Reason
                              </th>

                              <td className="text-danger">

                                {
                                  detailsReservation
                                    .rejectionReason
                                }

                              </td>

                            </tr>

                          )}

                        </tbody>

                      </table>

                    </>

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
                    setDetailsReservation(
                      null
                    )
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