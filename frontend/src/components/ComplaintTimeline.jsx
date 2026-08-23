const STAGES = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Repair Completed",
  "Closed",
];

/*
 * Admin screening decisions visually place the timeline
 * at Under Review.
 *
 * The actual complaint.status and reviewDecision values
 * remain unchanged.
 */
const UNDER_REVIEW_STATUSES = [
  "Valid",
  "Insufficient Evidence",
  "Duplicate",
];

const isRejectedClosure = (complaint) =>
  complaint.status === "Confirmed False";

/*
 * Stages that never actually happened once the admin
 * confirms the complaint as false.
 */
const SKIPPED_ON_REJECTION = [
  "Assigned",
  "In Progress",
  "Repair Completed",
];


const getTimelineDisplayStatus = (complaint) => {
  /*
   * Confirmed False means the complaint is treated as
   * closed from the resident's timeline perspective.
   */
  if (isRejectedClosure(complaint)) {
    return "Closed";
  }

  /*
   * Once the admin has assigned an authorized alternative,
   * the backend changes status to Assigned.
   */
  if (complaint.status === "Assigned") {
    return "Assigned";
  }

  /*
   * Normal admin review decisions are displayed as
   * Under Review.
   */
  if (
    UNDER_REVIEW_STATUSES.includes(
      complaint.status
    )
  ) {
    return "Under Review";
  }

  /*
   * Before a final decision is made, an inspection request
   * or review question means the complaint is actively
   * under investigation.
   */
  const hasSiteInspectionRequest = Boolean(
    complaint.inspectionRequest?.requested
  );

  const hasReviewQuestion =
    Array.isArray(
      complaint.reviewQuestions
    ) &&
    complaint.reviewQuestions.length > 0;

  if (
    complaint.status === "Submitted" &&
    (
      hasSiteInspectionRequest ||
      hasReviewQuestion
    )
  ) {
    return "Under Review";
  }

  return complaint.status;
};


function ComplaintTimeline({
  complaint,
}) {
  const rejected =
    isRejectedClosure(
      complaint
    );

  const displayStatus =
    getTimelineDisplayStatus(
      complaint
    );

  const currentIndex =
    STAGES.indexOf(
      displayStatus
    );


  /*
   * Manager-conflict complaint:
   *
   * The authorized alternative is assigned by the admin.
   * The resident can see the information returned by
   * the backend.
   */
  const hasAuthorizedAlternative =
    Boolean(
      complaint.concernsManager &&
        complaint.alternativeHandler?.name
    );


  return (
    <div>

      {/* =====================================================
          TIMELINE
      ===================================================== */}

      <div className="mb-4">

        <div className="d-flex justify-content-between align-items-center mb-3">

          <div>
            <h5 className="mb-1">
              Complaint Timeline
            </h5>

            <small className="text-muted">
              Track the progress of your complaint.
            </small>
          </div>

          {displayStatus && (
            <span
              className={`badge rounded-pill px-3 py-2 ${
                rejected
                  ? "bg-danger"
                  : displayStatus === "Closed"
                  ? "bg-dark"
                  : displayStatus === "Repair Completed"
                  ? "bg-success"
                  : displayStatus === "In Progress"
                  ? "bg-primary"
                  : displayStatus === "Assigned"
                  ? "bg-primary"
                  : displayStatus === "Under Review"
                  ? "bg-info text-dark"
                  : "bg-secondary"
              }`}
            >
              {displayStatus}
            </span>
          )}

        </div>


        {/* ===============================================
            TIMELINE CARD
        =============================================== */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">

            <div className="position-relative">

              {/* Vertical line */}

              <div
                className="position-absolute d-none d-sm-block"
                style={{
                  left: "20px",
                  top: "20px",
                  bottom: "20px",
                  width: "2px",
                  backgroundColor: "#dee2e6",
                  zIndex: 0,
                }}
              />


              {STAGES.map(
                (
                  stage,
                  index
                ) => {

                  const skipped =
                    rejected &&
                    SKIPPED_ON_REJECTION.includes(
                      stage
                    );

                  const reached =
                    !skipped &&
                    currentIndex >= 0 &&
                    index <= currentIndex;

                  const isCurrent =
                    !skipped &&
                    index === currentIndex;

                  const isUpcoming =
                    !skipped &&
                    (
                      currentIndex < 0 ||
                      index > currentIndex
                    );


                  return (
                    <div
                      key={stage}
                      className="position-relative d-flex align-items-start mb-4"
                      style={{
                        zIndex: 1,
                      }}
                    >

                      {/* =================================
                          ICON
                      ================================= */}

                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                          skipped
                            ? "bg-danger text-white"
                            : reached
                            ? "bg-success text-white"
                            : "bg-light text-secondary border"
                        }`}
                        style={{
                          width: "42px",
                          height: "42px",
                          fontSize: "18px",
                        }}
                      >

                        {skipped ? (
                          <i className="bi bi-x-lg" />
                        ) : reached ? (
                          <i className="bi bi-check-lg" />
                        ) : (
                          <i className="bi bi-circle" />
                        )}

                      </div>


                      {/* =================================
                          STAGE CONTENT
                      ================================= */}

                      <div className="ms-3 pt-1 flex-grow-1">

                        <div
                          className={`fw-semibold ${
                            isCurrent
                              ? "text-primary"
                              : skipped
                              ? "text-danger"
                              : ""
                          }`}
                        >
                          {stage}

                          {isCurrent && (
                            <span className="badge bg-primary ms-2">
                              Current
                            </span>
                          )}
                        </div>


                        <small className="text-muted">

                          {skipped
                            ? "This stage was not required."
                            : reached
                            ? stage === "Closed" &&
                              rejected
                              ? "Complaint closed after being confirmed false."
                              : "Completed"
                            : isUpcoming
                            ? "Not reached yet."
                            : "Waiting for update."}

                        </small>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          AUTHORIZED ALTERNATIVE
      ===================================================== */}

      {hasAuthorizedAlternative && (

        <div className="card border-primary shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="d-flex align-items-start gap-3">

              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "46px",
                  height: "46px",
                  fontSize: "20px",
                }}
              >
                <i className="bi bi-person-check-fill" />
              </div>


              <div className="flex-grow-1">

                <h6 className="mb-1">
                  Authorized Alternative
                </h6>

                <p className="text-muted mb-3">
                  This complaint concerns the Mess
                  Manager and has been routed to an
                  authorized alternative.
                </p>


                <div className="row g-3">

                  <div className="col-md-6">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted d-block">
                        Name
                      </small>

                      <strong>
                        {
                          complaint
                            .alternativeHandler
                            .name
                        }
                      </strong>

                    </div>

                  </div>


                  {complaint
                    .alternativeHandler
                    .authority && (

                    <div className="col-md-6">

                      <div className="border rounded p-3 h-100">

                        <small className="text-muted d-block">
                          Authority
                        </small>

                        <strong>
                          {
                            complaint
                              .alternativeHandler
                              .authority
                          }
                        </strong>

                      </div>

                    </div>

                  )}


                  {complaint
                    .alternativeHandler
                    .contact && (

                    <div className="col-md-6">

                      <div className="border rounded p-3 h-100">

                        <small className="text-muted d-block">
                          Contact
                        </small>

                        <strong>
                          {
                            complaint
                              .alternativeHandler
                              .contact
                          }
                        </strong>

                      </div>

                    </div>

                  )}

                </div>


                {complaint
                  .alternativeHandler
                  .assignedAt && (

                  <div className="text-muted small mt-3">

                    <i className="bi bi-clock me-1" />

                    Assigned:{" "}

                    {new Date(
                      complaint
                        .alternativeHandler
                        .assignedAt
                    ).toLocaleString()}

                  </div>

                )}


                <div className="alert alert-info mt-3 mb-0">

                  <i className="bi bi-info-circle me-2" />

                  The System Administrator handles
                  the maintenance status updates for
                  this complaint.

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          EVIDENCE
      ===================================================== */}

      {complaint.evidence?.length > 0 && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="mb-3">

              <h6 className="mb-1">
                Evidence
              </h6>

              <small className="text-muted">
                Evidence submitted with this complaint.
              </small>

            </div>


            <div className="row g-3">

              {complaint.evidence.map(
                (
                  item,
                  i
                ) => (

                  <div
                    key={i}
                    className="col-6 col-sm-4 col-md-3"
                  >

                    <div className="border rounded overflow-hidden bg-light">

                      {item.type ===
                      "video" ? (

                        <video
                          src={
                            item.url
                          }
                          controls
                          className="w-100"
                          style={{
                            height:
                              "150px",
                            objectFit:
                              "cover",
                          }}
                        />

                      ) : (

                        <img
                          src={
                            item.url
                          }
                          alt={`Complaint evidence ${
                            i + 1
                          }`}
                          className="w-100"
                          style={{
                            height:
                              "150px",
                            objectFit:
                              "cover",
                          }}
                        />

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          ADDITIONAL NOTES
      ===================================================== */}

      {complaint.additionalNotes
        ?.length > 0 && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="mb-3">

              <h6 className="mb-1">
                Additional Notes
              </h6>

              <small className="text-muted">
                Additional information related to
                your complaint.
              </small>

            </div>


            <div className="d-flex flex-column gap-2">

              {complaint.additionalNotes.map(
                (
                  n,
                  i
                ) => (

                  <div
                    key={i}
                    className="border rounded p-3"
                  >

                    <div className="mb-2">
                      {n.note}
                    </div>

                    <div className="text-muted small">

                      <i className="bi bi-clock me-1" />

                      {new Date(
                        n.addedAt
                      ).toLocaleString()}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          REVIEW QUESTIONS
      ===================================================== */}

      {complaint.reviewQuestions
        ?.length > 0 && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="mb-3">

              <h6 className="mb-1">
                Review Questions
              </h6>

              <small className="text-muted">
                Questions from the System Administrator
                that may require your response.
              </small>

            </div>


            <div className="d-flex flex-column gap-3">

              {complaint.reviewQuestions.map(
                (q) => (

                  <div
                    key={q._id}
                    className="border rounded p-3"
                  >

                    <div className="fw-semibold mb-2">

                      <i className="bi bi-question-circle me-2 text-primary" />

                      {q.question}

                    </div>


                    {q.answer ? (

                      <div className="alert alert-success py-2 px-3 mb-0">

                        <strong>
                          Your answer:
                        </strong>{" "}

                        {q.answer}

                      </div>

                    ) : (

                      <div className="alert alert-warning py-2 px-3 mb-0">

                        <i className="bi bi-hourglass-split me-2" />

                        Awaiting your answer

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default ComplaintTimeline;