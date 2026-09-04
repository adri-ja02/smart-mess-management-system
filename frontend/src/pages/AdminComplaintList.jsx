import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getComplaintsForAdmin,
} from "../services/complaintService";


/* =========================================================
   FINAL REVIEW DECISIONS
========================================================= */

const FINAL_DECISIONS = [
  "Valid",
  "Insufficient Evidence",
  "Duplicate",
  "Confirmed False",
];


/* =========================================================
   GET REVIEW DECISION LABEL

   RULES:

   1. Final decision exists
      → show final decision.

   2. Actual review activity exists
      → show Under Review.

   3. Manager concern alone
      → DOES NOT mean Under Review.

   4. Reopened alone
      → DOES NOT mean Under Review.

   5. Untouched complaint
      → Not Reviewed.
========================================================= */

const getReviewDecisionLabel = (
  complaint
) => {

  if (!complaint) {
    return "Not Reviewed";
  }


  /* -------------------------------------------------------
     FINAL DECISION HAS HIGHEST PRIORITY
  ------------------------------------------------------- */

  if (
    FINAL_DECISIONS.includes(
      complaint.reviewDecision
    )
  ) {
    return complaint.reviewDecision;
  }


  /* -------------------------------------------------------
     FALLBACK:
     Backend may store final decision in status.
  ------------------------------------------------------- */

  if (
    FINAL_DECISIONS.includes(
      complaint.status
    )
  ) {
    return complaint.status;
  }


  /* -------------------------------------------------------
     EXPLICIT UNDER REVIEW
  ------------------------------------------------------- */

  if (
    complaint.reviewDecision ===
    "Under Review"
  ) {
    return "Under Review";
  }


  /* -------------------------------------------------------
     SITE INSPECTION

     Requesting site inspection means admin
     has actually started review activity.
  ------------------------------------------------------- */

  const hasSiteInspectionRequest =
    Boolean(
      complaint.inspectionRequest?.requested
    );


  /* -------------------------------------------------------
     CONFIDENTIAL REVIEW QUESTION

     Sending a confidential question means
     admin has started review activity.
  ------------------------------------------------------- */

  const hasReviewQuestion =
    Array.isArray(
      complaint.reviewQuestions
    ) &&
    complaint.reviewQuestions.length > 0;


  /* -------------------------------------------------------
     ACTIVE PROCESSING STATUSES

     IMPORTANT:

     "Reopened" is intentionally NOT included.

     A reopened complaint must initially remain
     "Not Reviewed" until the admin takes a new
     review action.
  ------------------------------------------------------- */

  const activeReviewStatuses = [
    "Under Review",
    "Review",
    "Assigned",
    "In Progress",
    "Repair Completed",
  ];


  const isActiveReviewStatus =
    activeReviewStatuses.includes(
      complaint.status
    );


  /* -------------------------------------------------------
     TIMELINE REVIEW ACTIVITY

     These events indicate that review/processing
     has actually happened.

     IMPORTANT:
     - concernsManager is NOT checked.
     - Reopened is NOT checked by itself.
  ------------------------------------------------------- */

  const hasReviewTimelineActivity =
    Array.isArray(
      complaint.timeline
    ) &&
    complaint.timeline.some(
      (entry) =>
        [
          "Under Review",
          "Review",
          "Assigned",
          "In Progress",
          "Repair Completed",
          "Valid",
          "Duplicate",
          "Insufficient Evidence",
          "Confirmed False",
        ].includes(
          entry.status
        )
    );


  /* -------------------------------------------------------
     REVIEW HAS STARTED
  ------------------------------------------------------- */

  if (
    hasSiteInspectionRequest ||
    hasReviewQuestion ||
    isActiveReviewStatus ||
    hasReviewTimelineActivity
  ) {
    return "Under Review";
  }


  /* -------------------------------------------------------
     REOPENED BUT NOT REVIEWED

     IMPORTANT:

     Reopened alone must remain Not Reviewed.

     Example:

     Status:
     Reopened

     concernsManager:
     true

     reviewDecision:
     null

     Result:
     Not Reviewed
  ------------------------------------------------------- */

  return "Not Reviewed";
};


/* =========================================================
   REVIEW DECISION BADGE COLOR
========================================================= */

const getReviewDecisionClass = (
  decision
) => {

  switch (
    decision?.toLowerCase()
  ) {

    case "valid":
      return "bg-success";

    case "duplicate":
      return "bg-primary";

    case "insufficient evidence":
      return "bg-warning text-dark";

    case "confirmed false":
      return "bg-danger";

    case "under review":
    case "review":
      return "bg-warning text-dark";

    case "not reviewed":
      return "bg-secondary";

    default:
      return "bg-secondary";
  }
};


/* =========================================================
   STATUS BADGE COLORS
========================================================= */

const getStatusBadgeClass = (
  status
) => {

  switch (
    status?.toLowerCase()
  ) {

    /* -----------------------------------------------------
       POSITIVE / COMPLETED
    ----------------------------------------------------- */

    case "valid":
      return "bg-success";

    case "resolved":
      return "bg-success";

    case "repair completed":
      return "bg-success";


    /* -----------------------------------------------------
       CLOSED
    ----------------------------------------------------- */

    case "closed":
      return "bg-secondary";


    /* -----------------------------------------------------
       WORK ORDER
    ----------------------------------------------------- */

    case "assigned":
      return "bg-primary";

    case "in progress":
      return "bg-info text-dark";


    /* -----------------------------------------------------
       REOPENED
    ----------------------------------------------------- */

    case "reopened":
      return "bg-warning text-dark";


    /* -----------------------------------------------------
       REVIEW / NEEDS ATTENTION
    ----------------------------------------------------- */

    case "insufficient evidence":
      return "bg-warning text-dark";

    case "pending":
      return "bg-warning text-dark";

    case "under review":
      return "bg-warning text-dark";

    case "review":
      return "bg-warning text-dark";


    /* -----------------------------------------------------
       INFORMATIONAL
    ----------------------------------------------------- */

    case "duplicate":
      return "bg-primary";


    /* -----------------------------------------------------
       NEGATIVE
    ----------------------------------------------------- */

    case "confirmed false":
      return "bg-danger";

    case "rejected":
      return "bg-danger";


    /* -----------------------------------------------------
       CANCELLED
    ----------------------------------------------------- */

    case "cancelled":
    case "canceled":
      return "bg-secondary";


    /* -----------------------------------------------------
       SUBMITTED
    ----------------------------------------------------- */

    case "submitted":
      return "bg-primary";


    /* -----------------------------------------------------
       DEFAULT
    ----------------------------------------------------- */

    default:
      return "bg-secondary";
  }
};


/* =========================================================
   ADMIN COMPLAINT LIST
========================================================= */

function AdminComplaintList() {

  const navigate =
    useNavigate();


  /* =======================================================
     STATE
  ======================================================= */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =======================================================
     LOAD COMPLAINTS
  ======================================================= */

  const loadComplaints =
    async () => {

      try {

        setLoading(true);
        setError("");

        const data =
          await getComplaintsForAdmin();

        setComplaints(
          data.complaints || []
        );

      } catch (err) {

        setError(
          err.response?.data
            ?.message ||
          "Failed to load complaints."
        );

      } finally {

        setLoading(false);

      }
    };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadComplaints();

  }, []);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="container mt-4">

        <p>
          Loading complaint integrity
          records...
        </p>

      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="container mt-4">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{
          border:
            "2px solid #f39c12",

          borderRadius:
            "12px",

          padding:
            "16px 20px",

          background:
            "linear-gradient(135deg, #fff3e0, #ffe0b2)",

          boxShadow:
            "0 4px 10px rgba(243, 156, 18, 0.15)",
        }}
      >

        <div>

          <h3
            className="fw-bold mb-2"
            style={{
              color:
                "#d35400",
            }}
          >
            Complaint Integrity Review
          </h3>

          <p className="text-muted mb-0">

            Resident complaints are submitted
            to the System Administrator.
            The Mess Manager receives only
            complaints marked Valid.

          </p>

        </div>


        <button
          className="btn"
          onClick={() =>
            navigate(
              "/admin/complaints/analytics"
            )
          }
          style={{
            background:
              "linear-gradient(135deg, #f39c12, #e67e22)",

            color:
              "#fff",

            border:
              "none",

            borderRadius:
              "8px",

            padding:
              "10px 18px",

            fontWeight:
              "600",

            whiteSpace:
              "nowrap",

            marginLeft:
              "20px",

            boxShadow:
              "0 3px 6px rgba(230, 126, 34, 0.25)",
          }}
        >
          Complaint Analytics
        </button>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ===================================================
          NO COMPLAINTS
      =================================================== */}

      {complaints.length === 0 ? (

        <div className="alert alert-info">

          No complaints available.

        </div>

      ) : (

        complaints.map(
          (complaint) => {

            /* =============================================
               REVIEW DECISION
            ============================================= */

            const reviewDecision =
              getReviewDecisionLabel(
                complaint
              );

            const reviewDecisionClass =
              getReviewDecisionClass(
                reviewDecision
              );


            /* =============================================
               REOPENED
            ============================================= */

            const isReopened =
              complaint.status ===
              "Reopened";


            const isClosed =
              complaint.status ===
              "Closed";


            return (

              <div
                key={
                  complaint._id
                }
                className="card mb-3 shadow-sm"
                style={{
                  borderRadius:
                    "10px",

                  border:
                    isReopened
                      ? "2px solid #f39c12"
                      : "1px solid #e5e5e5",
                }}
              >

                <div className="card-body">


                  {/* =======================================
                      TICKET + STATUS
                  ======================================= */}

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="mb-0 fw-bold">

                      #
                      {
                        complaint.ticketNumber
                      }

                    </h5>


                    <span
                      className={`badge ${getStatusBadgeClass(
                        complaint.status
                      )}`}
                      style={{
                        padding:
                          "7px 12px",

                        borderRadius:
                          "20px",

                        fontSize:
                          "0.85rem",
                      }}
                    >
                      {
                        complaint.status
                      }
                    </span>

                  </div>


                  {/* =======================================
                      REOPENED NOTICE
                  ======================================= */}

                  {isReopened && (

                    <div
                      className="alert alert-warning"
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Complaint Reopened
                      </strong>

                      <br />

                      The resident reopened this
                      complaint. It requires a
                      new administrator review.

                      <br />

                      <strong>
                        Current Review Decision:
                      </strong>{" "}

                      {reviewDecision}

                    </div>

                  )}


                  {/* =======================================
                      CLOSED NOTICE
                  ======================================= */}

                  {isClosed && (

                    <div
                      className="alert alert-secondary"
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Complaint Closed
                      </strong>

                      <br />

                      This complaint has been
                      closed.

                    </div>

                  )}


                  {/* =======================================
                      LOCATION
                  ======================================= */}

                  <p className="mb-2">

                    <strong>
                      Location:
                    </strong>{" "}

                    {
                      complaint.location
                    }

                  </p>


                  {/* =======================================
                      CATEGORY
                  ======================================= */}

                  <p className="mb-2">

                    <strong>
                      Category:
                    </strong>{" "}

                    {
                      complaint.category
                    }

                  </p>


                  {/* =======================================
                      URGENCY
                  ======================================= */}

                  <p className="mb-2">

                    <strong>
                      Urgency:
                    </strong>{" "}

                    {
                      complaint.urgency
                    }

                  </p>


                  {/* =======================================
                      REVIEW DECISION
                  ======================================= */}

                  <div className="mb-3">

                    <strong>
                      Review Decision:
                    </strong>{" "}

                    <span
                      className={`badge ${reviewDecisionClass}`}
                      style={{
                        padding:
                          "7px 12px",

                        borderRadius:
                          "20px",

                        fontSize:
                          "0.85rem",
                      }}
                    >
                      {
                        reviewDecision
                      }
                    </span>

                  </div>


                  {/* =======================================
                      MANAGER CONFLICT

                      IMPORTANT:

                      Manager concern does NOT automatically
                      mean Under Review.
                  ======================================= */}

                  {complaint.concernsManager && (

                    <div
                      className="alert alert-warning"
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Manager Conflict:
                      </strong>{" "}

                      This complaint concerns
                      the Mess Manager.

                      <br />

                      It must be reviewed by the
                      System Administrator.

                      <br />

                      If the complaint is marked
                      <strong>
                        {" "}Valid
                      </strong>
                      , it can be routed to an
                      authorized alternative.

                    </div>

                  )}


                  {/* =======================================
                      CREDIBILITY FLAGS
                  ======================================= */}

                  {complaint.credibilityFlags
                    ?.length > 0 && (

                    <div
                      className="alert alert-warning"
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Credibility Flags:
                      </strong>


                      <ul className="mb-0 mt-2">

                        {complaint
                          .credibilityFlags
                          .map(
                            (
                              flag,
                              index
                            ) => (

                              <li
                                key={
                                  index
                                }
                              >
                                {
                                  flag
                                }
                              </li>

                            )
                          )}

                      </ul>

                    </div>

                  )}


                  {/* =======================================
                      UNDER REVIEW MESSAGE

                      IMPORTANT:

                      This will NOT appear merely because
                      the complaint was reopened.
                  ======================================= */}

                  {reviewDecision ===
                    "Under Review" && (

                    <div
                      className="alert alert-warning py-2"
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Review in Progress:
                      </strong>{" "}

                      This complaint is currently
                      being reviewed or processed by
                      the System Administrator.

                    </div>

                  )}


                  {/* =======================================
                      NOT REVIEWED MESSAGE

                      Particularly useful for reopened
                      complaints waiting for admin action.
                  ======================================= */}

                  {reviewDecision ===
                    "Not Reviewed" && (

                    <div
                      className={
                        isReopened
                          ? "alert alert-warning py-2"
                          : "alert alert-secondary py-2"
                      }
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Not Reviewed:
                      </strong>{" "}

                      {isReopened
                        ? "This reopened complaint is waiting for a new administrator review."
                        : "No administrator review action has been recorded yet."}

                    </div>

                  )}


                  {/* =======================================
                      FINAL DECISION MESSAGE
                  ======================================= */}

                  {FINAL_DECISIONS.includes(
                    reviewDecision
                  ) && (

                    <div
                      className={`alert ${
                        reviewDecision ===
                        "Valid"
                          ? "alert-success"
                          : reviewDecision ===
                            "Confirmed False"
                          ? "alert-danger"
                          : "alert-secondary"
                      } py-2`}
                      style={{
                        borderRadius:
                          "8px",
                      }}
                    >

                      <strong>
                        Final Review Decision:
                      </strong>{" "}

                      {
                        reviewDecision
                      }

                    </div>

                  )}


                  {/* =======================================
                      OPEN ADMIN REVIEW
                  ======================================= */}

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(
                        `/admin/complaints/${complaint._id}/review`
                      )
                    }
                    style={{
                      borderRadius:
                        "8px",

                      padding:
                        "9px 18px",

                      fontWeight:
                        "600",
                    }}
                  >

                    {isReopened
                      ? "Review Reopened Complaint"
                      : "Open Admin Review"}

                  </button>


                </div>

              </div>

            );

          }
        )

      )}

    </div>

  );
}


export default AdminComplaintList;