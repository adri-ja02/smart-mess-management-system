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

   2. Review activity has actually started
      → show Under Review.

   3. Manager concern by itself
      → DOES NOT mean Under Review.

   4. Authorized alternative by itself
      → DOES NOT determine initial review state.

   5. Untouched complaint
      → Not Reviewed.
========================================================= */

const getReviewDecisionLabel = (
  complaint
) => {

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
     Sometimes backend may store the final decision
     in status instead of reviewDecision.
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

     Requesting site inspection means review has started.
  ------------------------------------------------------- */

  const hasSiteInspectionRequest =
    Boolean(
      complaint.inspectionRequest?.requested
    );


  /* -------------------------------------------------------
     CONFIDENTIAL REVIEW QUESTION

     Sending at least one confidential question means
     review has started.
  ------------------------------------------------------- */

  const hasReviewQuestion =
    Array.isArray(
      complaint.reviewQuestions
    ) &&
    complaint.reviewQuestions.length > 0;


  /* -------------------------------------------------------
     ACTIVE REVIEW STATUSES

     These statuses indicate that processing has started.
  ------------------------------------------------------- */

  const activeReviewStatuses = [
    "Under Review",
    "Review",
    "Assigned",
    "In Progress",
    "Repair Completed",
    "Reopened",
  ];

  const isActiveReviewStatus =
    activeReviewStatuses.includes(
      complaint.status
    );


  /* -------------------------------------------------------
     TIMELINE REVIEW ACTIVITY

     Check only actual review/processing events.

     IMPORTANT:
     Do NOT use concernsManager here.
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
          "Reopened",
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
     MANAGER CONCERN ALONE DOES NOT START REVIEW

     Example:

     Status: Submitted
     concernsManager: true
     reviewDecision: empty

     Result:

     Review Decision: Not Reviewed
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
       REVIEW / NEEDS ATTENTION
    ----------------------------------------------------- */

    case "reopened":
      return "bg-warning text-dark";

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
                    "1px solid #e5e5e5",
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
                      This does NOT change Review Decision.
                      
                      Submitted + Manager Concern
                      =
                      Not Reviewed
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
                      the Mess Manager and must
                      be routed to an authorized
                      alternative after the
                      complaint is marked Valid.

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
                  ======================================= */}

                  {reviewDecision ===
                    "Under Review" && (

                    <div className="alert alert-warning py-2">

                      <strong>
                        Review in Progress:
                      </strong>{" "}

                      This complaint is currently
                      being reviewed or processed by
                      the System Administrator.

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
                    Open Admin Review
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