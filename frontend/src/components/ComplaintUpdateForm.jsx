import { useState } from "react";

import {
  addFollowUp,
  answerReviewQuestion,
  verifyRepair,
  acceptSiteInspection,
} from "../services/complaintService";

import EvidenceUpload from "./EvidenceUpload";

function ComplaintUpdateForm({
  token,
  complaint,
  onUpdated,
}) {
  const [note, setNote] =
    useState("");

  const [evidence, setEvidence] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [answers, setAnswers] =
    useState({});

  const [verificationComment, setVerificationComment] =
    useState("");

  const [acceptingInspection, setAcceptingInspection] =
    useState(false);

  /*
   * Only surface the site inspection request to the resident once
   * the System Administrator has both requested it AND recorded a
   * final decision on the complaint.
   */
  const showInspectionRequest =
    Boolean(
      complaint.inspectionRequest
        ?.requested
    ) &&
    Boolean(
      complaint.reviewDecision
    );

  const unansweredQuestions =
    (
      complaint.reviewQuestions ||
      []
    ).filter(
      (question) =>
        !question.answer
    );

  const handleSubmitUpdate =
    async (e) => {
      e.preventDefault();

      if (
        !note.trim() &&
        evidence.length === 0
      ) {
        setError(
          "Add an explanation or evidence first."
        );
        return;
      }

      setError("");
      setSubmitting(true);

      try {
        const data =
          await addFollowUp(
            token,
            note.trim(),
            evidence
          );

        setNote("");
        setEvidence([]);

        onUpdated(
          data.complaint
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Could not add update."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleAnswer =
    async (questionId) => {
      const answer =
        (
          answers[questionId] ||
          ""
        ).trim();

      if (!answer) {
        return;
      }

      setError("");

      try {
        const data =
          await answerReviewQuestion(
            token,
            questionId,
            answer
          );

        setAnswers(
          (prev) => ({
            ...prev,
            [questionId]:
              "",
          })
        );

        onUpdated(
          data.complaint
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Could not submit answer."
        );
      }
    };

  const handleAcceptInspection =
    async () => {
      setError("");
      setAcceptingInspection(true);

      try {
        const data =
          await acceptSiteInspection(
            token
          );

        onUpdated(
          data.complaint
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Could not accept site inspection."
        );
      } finally {
        setAcceptingInspection(false);
      }
    };

  const handleVerification =
    async (action) => {
      setError("");

      if (
        action ===
          "reopen" &&
        !verificationComment.trim()
      ) {
        setError(
          "Please explain why you are reopening the complaint."
        );
        return;
      }

      try {
        const data =
          await verifyRepair(
            token,
            action,
            verificationComment.trim()
          );

        setVerificationComment("");

        onUpdated(
          data.complaint
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Could not update repair verification."
        );
      }
    };

  /*
   * Once the complaint reaches one of these terminal states, the
   * resident has nothing further to do - hide every action (follow
   * up, answering questions, accepting an inspection, verifying
   * repairs) and show a plain status message instead.
   */
  if (complaint.status === "Confirmed False") {
    return (
      <div className="mt-4">
        <div className="alert alert-danger mb-0">
          The complaint is confirmed as false.
        </div>
      </div>
    );
  }

  if (complaint.status === "Closed") {
    return (
      <div className="mt-4">
        <div className="alert alert-secondary mb-0">
          The complaint is marked as closed.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {unansweredQuestions.length >
        0 && (
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <h5>
              Confidential question from
              the System Administrator
            </h5>

            <p className="text-muted">
              Only you and the System
              Administrator can see this
              communication.
            </p>

            {unansweredQuestions.map(
              (question) => (
                <div
                  key={
                    question._id
                  }
                  className="border rounded p-3 mb-3"
                >
                  <p>
                    <strong>
                      Question:
                    </strong>{" "}
                    {
                      question.question
                    }
                  </p>

                  <div className="input-group">
                    <input
                      className="form-control"
                      placeholder="Your answer"
                      value={
                        answers[
                          question._id
                        ] || ""
                      }
                      onChange={(e) =>
                        setAnswers(
                          (prev) => ({
                            ...prev,
                            [question._id]:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        handleAnswer(
                          question._id
                        )
                      }
                    >
                      Answer
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {showInspectionRequest && (
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <h5>
              Site Inspection Requested
            </h5>

            <p className="text-muted">
              The System Administrator has
              requested an independent site
              inspection for this complaint.
            </p>

            {complaint.inspectionRequest
              ?.note && (
              <p>
                <strong>Note:</strong>{" "}
                {
                  complaint
                    .inspectionRequest
                    .note
                }
              </p>
            )}

            {complaint.inspectionRequest
              ?.accepted ? (
              <div className="alert alert-success mb-0">
                You accepted the site
                inspection request.
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  acceptingInspection
                }
                onClick={
                  handleAcceptInspection
                }
              >
                {acceptingInspection
                  ? "Accepting..."
                  : "Accept Site Inspection"}
              </button>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={
          handleSubmitUpdate
        }
        className="card mb-4"
      >
        <div className="card-body">
          <h5>
            Confidential Follow-Up
          </h5>

          <p className="text-muted">
            Add more information or evidence.
            Your identity is not revealed.
          </p>

          <textarea
            className="form-control mb-3"
            rows={4}
            placeholder="Add an explanation..."
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
          />

          <EvidenceUpload
            evidence={evidence}
            onChange={
              setEvidence
            }
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              submitting
            }
          >
            {submitting
              ? "Submitting..."
              : "Send Confidential Update"}
          </button>
        </div>
      </form>

      {complaint.status ===
        "Repair Completed" && (
        <div className="card border-success mb-4">
          <div className="card-body">
            <h5 className="text-success">
              Repair Verification
            </h5>

            <p>
              The maintenance work has been
              marked as completed. Please verify
              whether the issue has actually been
              resolved.
            </p>

            {complaint.completionEvidence
              ?.length > 0 && (
              <div className="row mb-3">
                {complaint.completionEvidence.map(
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
            )}

            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Optional comment. Required if you reopen the complaint."
              value={
                verificationComment
              }
              onChange={(e) =>
                setVerificationComment(
                  e.target.value
                )
              }
            />

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={() =>
                  handleVerification(
                    "confirm"
                  )
                }
              >
                Confirm Resolution
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() =>
                  handleVerification(
                    "reopen"
                  )
                }
              >
                Reopen Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintUpdateForm;