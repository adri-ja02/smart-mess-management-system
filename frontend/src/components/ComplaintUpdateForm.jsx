import { useState } from "react";
import {
  addFollowUp,
  answerReviewQuestion,
} from "../services/complaintService";
import EvidenceUpload from "./EvidenceUpload";

function ComplaintUpdateForm({ token, complaint, onUpdated }) {
  const [note, setNote] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});

  const unansweredQuestions = (complaint.reviewQuestions || []).filter(
    (q) => !q.answer
  );

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    if (!note.trim() && evidence.length === 0) {
      setError("Add a note or upload evidence first.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = await addFollowUp(token, note.trim(), evidence);
      setNote("");
      setEvidence([]);
      onUpdated(data.complaint);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not add update. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (questionId) => {
    const answer = (answers[questionId] || "").trim();
    if (!answer) return;

    setError("");

    try {
      const data = await answerReviewQuestion(token, questionId, answer);
      setAnswers({ ...answers, [questionId]: "" });
      onUpdated(data.complaint);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit answer. Try again."
      );
    }
  };

  return (
    <div className="mt-4">
      {error && <div className="alert alert-danger">{error}</div>}

      {unansweredQuestions.length > 0 && (
        <div className="mb-4">
          <h6>Staff has a question for you</h6>
          {unansweredQuestions.map((q) => (
            <div key={q._id} className="card mb-2">
              <div className="card-body">
                <p className="mb-2">{q.question}</p>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your answer"
                    value={answers[q._id] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q._id]: e.target.value })
                    }
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleAnswer(q._id)}
                  >
                    Answer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmitUpdate}>
        <h6>Add Information</h6>

        <div className="mb-3">
          <textarea
            className="form-control"
            rows={3}
            placeholder="e.g. The fan also makes a loud noise before stopping."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <EvidenceUpload evidence={evidence} onChange={setEvidence} />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Update"}
        </button>
      </form>
    </div>
  );
}

export default ComplaintUpdateForm;