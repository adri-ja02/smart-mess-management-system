import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { requestReservation } from "../services/reservationService";
import { claimMatchedBed } from "../services/waitlistService";
import { saveSelectedBedId } from "../utils/bedSelection";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   BLOOD GROUPS
========================================================= */

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

/* =========================================================
   FIELD DEFINITIONS
   (used to build the form + drive validation together,
   so the two can't drift apart)
========================================================= */

const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone Number", type: "tel" },
  { name: "address", label: "Present Address", type: "textarea" },
  { name: "institutionName", label: "Institution Name", type: "text" },
  { name: "studentId", label: "Student ID", type: "text" },
  { name: "bloodGroup", label: "Blood Group", type: "select" },
  { name: "fatherName", label: "Father's Name", type: "text" },
  { name: "fatherPhone", label: "Father's Phone Number", type: "tel" },
  { name: "motherName", label: "Mother's Name", type: "text" },
  { name: "motherPhone", label: "Mother's Phone Number", type: "tel" },
];

/* =========================================================
   COMPONENT
========================================================= */

const RequestBedForm = () => {
  const { id: roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Passed from RoomDetails.jsx / Waitlist.jsx when the
  // student picks "Request This Bed". waitlistId is only
  // present when this is a matched-waitlist claim rather
  // than a normal fresh request.
  const {
    bedNumber,
    roomNumber,
    waitlistId,
  } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    institutionName: "",
    studentId: "",
    bloodGroup: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     MISSING CONTEXT
     (direct URL visit without going through bed selection)
  ======================================================= */

  if (!bedNumber) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          No bed was selected. Please go back to the room and
          select a bed before filling out this form.
        </div>

        <Link
          className="btn btn-secondary"
          to={roomId ? `/rooms/${roomId}` : "/student"}
        >
          Back to Room
        </Link>
      </div>
    );
  }

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    // Basic client-side check — the backend re-validates
    // every one of these fields regardless, so this is
    // purely for a fast/friendly error instead of a round
    // trip to the server.
    const missingField = FIELDS.find(
      (field) => !String(formData[field.name] || "").trim()
    );

    if (missingField) {
      setErrorMessage(
        `${missingField.label} is required.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = waitlistId
        ? await claimMatchedBed(waitlistId, formData)
        : await requestReservation({
            roomId,
            bedNumber,
            applicantDetails: formData,
          });

      alert(
        res.message || "Request sent to the manager."
      );

      if (roomId) {
        saveSelectedBedId(roomId, null);
      }

      navigate("/my-reservations");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1">
        Bed Reservation Details
      </h2>

      <p className="text-muted">
        Room {roomNumber || "-"} &middot; Bed {bedNumber}
      </p>

      <p className="text-muted">
        Please fill in your information below. Your manager
        will review these details before approving or
        rejecting your reservation request.
      </p>

      <hr />

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {FIELDS.map((field) => (
            <div
              className={
                field.type === "textarea"
                  ? "col-12 mb-3"
                  : "col-md-6 mb-3"
              }
              key={field.name}
            >
              <label
                className="form-label"
                htmlFor={field.name}
              >
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  className="form-control"
                  id={field.name}
                  name={field.name}
                  rows={2}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              ) : field.type === "select" ? (
                <select
                  className="form-select"
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Blood Group
                  </option>

                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : "Submit Request"}
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary ms-2"
          disabled={submitting}
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default RequestBedForm;
