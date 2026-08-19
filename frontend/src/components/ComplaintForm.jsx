import { useEffect, useState } from "react";
import { submitComplaint } from "../services/complaintService";
import { getMyReservations } from "../services/reservationService";
import EvidenceUpload from "./EvidenceUpload";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Furniture",
  "Cleaning",
  "Other",
];

const URGENCIES = [
  "Low",
  "Medium",
  "High",
  "Emergency",
];

function ComplaintForm({ onSubmitted }) {
  const [form, setForm] = useState({
    location: "",
    category: CATEGORIES[0],
    urgency: "Low",
    description: "",
  });

  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD STUDENT'S CURRENT APPROVED ROOM
  ===================================================== */

  useEffect(() => {
    const loadCurrentRoom = async () => {
      try {
        setLoadingRoom(true);
        setError("");

        const res = await getMyReservations();

        const reservations = res.reservations || [];

        // Find current approved reservation
        const approvedReservation = reservations.find(
          (reservation) =>
            reservation.status === "approved" &&
            reservation.room?.roomNumber
        );

        if (approvedReservation) {
          setForm((prev) => ({
            ...prev,
            location: `Room ${approvedReservation.room.roomNumber}`,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            location: "",
          }));
        }
      } catch (error) {
        console.error(
          "Could not load current room:",
          error
        );

        setError(
          "Could not load your current room. Please try again."
        );
      } finally {
        setLoadingRoom(false);
      }
    };

    loadCurrentRoom();
  }, []);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =====================================================
     SUBMIT COMPLAINT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.location) {
      setError(
        "Your approved room could not be found."
      );
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe the problem.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = await submitComplaint({
        ...form,
        evidence,
      });

      onSubmitted(data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">
        Report an Issue
      </h4>

      <p className="text-muted small">
        Your name and student ID are never shown
        to the Mess Manager or maintenance staff.
        You'll get a secret token to track this
        complaint anonymously.
      </p>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row">

        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="col-md-4 mb-3">

          <label className="form-label">
            Location
          </label>

          {loadingRoom ? (
            <input
              type="text"
              className="form-control"
              value="Loading your room..."
              disabled
              readOnly
            />
          ) : form.location ? (
            <input
              type="text"
              name="location"
              className="form-control"
              value={form.location}
              readOnly
            />
          ) : (
            <input
              type="text"
              className="form-control"
              value="No approved room found"
              disabled
              readOnly
            />
          )}

          <small className="text-muted">
            Automatically taken from your current
            approved reservation.
          </small>

        </div>

        {/* =================================================
            CATEGORY
        ================================================= */}

        <div className="col-md-4 mb-3">

          <label className="form-label">
            Category
          </label>

          <select
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat}
              >
                {cat}
              </option>
            ))}
          </select>

        </div>

        {/* =================================================
            URGENCY
        ================================================= */}

        <div className="col-md-4 mb-3">

          <label className="form-label">
            Urgency
          </label>

          <select
            name="urgency"
            className="form-select"
            value={form.urgency}
            onChange={handleChange}
          >
            {URGENCIES.map((u) => (
              <option
                key={u}
                value={u}
              >
                {u}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      <div className="mb-3">

        <label className="form-label">
          Description
        </label>

        <textarea
          name="description"
          className="form-control"
          rows={4}
          placeholder="e.g. The bathroom tap in my room is leaking."
          value={form.description}
          onChange={handleChange}
        />

      </div>

      {/* =================================================
          EVIDENCE - OPTIONAL
      ================================================= */}

      <EvidenceUpload
        evidence={evidence}
        onChange={setEvidence}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={
          submitting ||
          loadingRoom ||
          !form.location
        }
      >
        {submitting
          ? "Submitting..."
          : "Submit Complaint"}
      </button>

    </form>
  );
}

export default ComplaintForm;