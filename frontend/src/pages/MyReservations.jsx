import { useEffect, useState } from "react";
import {
  getMyReservations,
  cancelReservation,
} from "../services/reservationService";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [detailsReservation, setDetailsReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const res = await getMyReservations();

      setReservations(res.reservations || []);
    } catch (error) {
      console.error(error);

      alert("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmCancel) {
      return;
    }

    setProcessingId(id);

    try {
      const res = await cancelReservation(id);

      alert(res.message);

      await loadReservations();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel reservation."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =======================================================
  // FORMAT DATE + TIME
  // =======================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // =======================================================
  // CHECK HOLD EXPIRATION
  // =======================================================

  const isHoldExpired = (holdExpiresAt) => {
    if (!holdExpiresAt) {
      return false;
    }

    return new Date(holdExpiresAt) < new Date();
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="container mt-5">

      <h2 className="mb-4">
        My Reservations
      </h2>

      {loading ? (

        <div className="text-center">

          <div
            className="spinner-border"
            role="status"
          ></div>

          <p className="mt-2">
            Loading...
          </p>

        </div>

      ) : reservations.length === 0 ? (

        <div className="alert alert-info">
          You have no reservations.
        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-bordered table-hover align-middle">

            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead className="table-dark">

              <tr>

                {/* FIRST: BUILDING */}

                <th>
                  Building
                </th>

                {/* SECOND: ROOM */}

                <th>
                  Room
                </th>

                {/* THIRD: BED */}

                <th>
                  Bed
                </th>

                <th>
                  Status
                </th>

                <th>
                  Details
                </th>

                <th>
                  Requested On
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

              {reservations.map((reservation) => {

                const holdExpired =
                  isHoldExpired(
                    reservation.holdExpiresAt
                  );

                return (

                  <tr
                    key={reservation._id}
                  >

                    {/* =================================================
                        BUILDING
                    ================================================= */}

                    <td>
                      {reservation.room?.building?.name ||
                        reservation.room?.building ||
                        "-"}
                    </td>

                    {/* =================================================
                        ROOM
                    ================================================= */}

                    <td>
                      {reservation.room?.roomNumber ||
                        "-"}
                    </td>

                    {/* =================================================
                        BED
                    ================================================= */}

                    <td>
                      {reservation.bedNumber || "-"}
                    </td>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td>

                      <span
                        className={`badge ${
                          reservation.status ===
                          "approved"
                            ? "bg-success"
                            : reservation.status ===
                              "pending"
                            ? "bg-warning text-dark"
                            : reservation.status ===
                              "rejected"
                            ? "bg-danger"
                            : reservation.status ===
                              "expired"
                            ? "bg-secondary"
                            : "bg-dark"
                        }`}
                      >
                        {reservation.status}
                      </span>

                    </td>

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <td className="small">

                      {/* PENDING */}

                      {reservation.status ===
                        "pending" &&
                        reservation.holdExpiresAt && (

                          <div
                            className={
                              holdExpired
                                ? "text-danger fw-bold"
                                : "text-muted"
                            }
                          >

                            <strong>
                              Hold expires:
                            </strong>{" "}

                            {formatDateTime(
                              reservation.holdExpiresAt
                            )}

                            {holdExpired && (
                              <span className="ms-1">
                                (expired)
                              </span>
                            )}

                          </div>

                        )}

                      {/* REJECTED */}

                      {reservation.status ===
                        "rejected" &&
                        reservation.rejectionReason && (

                          <div className="text-danger">

                            <strong>
                              Reason:
                            </strong>{" "}

                            {
                              reservation.rejectionReason
                            }

                          </div>

                        )}

                      {/* APPROVED */}

                      {reservation.status ===
                        "approved" && (

                          <span className="text-success">
                            Reservation approved.
                          </span>

                        )}

                      {/* CANCELLED */}

                      {reservation.status ===
                        "cancelled" && (

                          <span className="text-muted">
                            Reservation cancelled.
                          </span>

                        )}

                      {/* EXPIRED */}

                      {reservation.status ===
                        "expired" && (

                          <span className="text-danger">
                            Reservation hold expired.
                          </span>

                        )}

                    </td>

                    {/* =================================================
                        REQUESTED DATE + TIME
                    ================================================= */}

                    <td>

                      {formatDateTime(
                        reservation.createdAt
                      )}

                    </td>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <td>

                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() =>
                          setDetailsReservation(
                            reservation
                          )
                        }
                      >
                        View Submitted Info
                      </button>

                      {/* PENDING / APPROVED */}

                      {(reservation.status ===
                        "pending" ||
                        reservation.status ===
                          "approved") && (

                        <button
                          className="btn btn-danger btn-sm"
                          disabled={
                            processingId ===
                            reservation._id
                          }
                          onClick={() =>
                            handleCancel(
                              reservation._id
                            )
                          }
                        >

                          {processingId ===
                          reservation._id
                            ? "Cancelling..."
                            : "Cancel"}

                        </button>

                      )}

                      {/* EXPIRED */}

                      {reservation.status ===
                        "expired" && (

                        <span className="text-muted">
                          No action
                        </span>

                      )}

                      {/* REJECTED */}

                      {reservation.status ===
                        "rejected" && (

                        <span className="text-muted">
                          No action
                        </span>

                      )}

                      {/* CANCELLED */}

                      {reservation.status ===
                        "cancelled" && (

                        <span className="text-muted">
                          Cancelled
                        </span>

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
          SUBMITTED INFO MODAL
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

              {/* MODAL HEADER */}

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
                />

              </div>

              {/* MODAL BODY */}

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

              {/* MODAL FOOTER */}

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

export default MyReservations;