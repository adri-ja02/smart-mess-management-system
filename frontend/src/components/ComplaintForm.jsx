import {
  useState,
} from "react";

import {
  submitComplaint,
} from "../services/complaintService";

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


function ComplaintForm({
  onSubmitted,
}) {
  const [form, setForm] =
    useState({
      location: "",
      category:
        CATEGORIES[0],
      urgency: "Low",
      description: "",
      concernsManager: false,
    });


  const [evidence, setEvidence] =
    useState([]);


  const [submitting, setSubmitting] =
    useState(false);


  const [error, setError] =
    useState("");


  /* =====================================================
     HANDLE FORM CHANGE
  ===================================================== */

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  /* =====================================================
     HANDLE MANAGER CONCERN CARD CLICK
  ===================================================== */

  const handleManagerConcernClick =
    () => {
      setForm((prev) => ({
        ...prev,
        concernsManager:
          !prev.concernsManager,
      }));
    };


  /* =====================================================
     SUBMIT COMPLAINT
  ===================================================== */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const trimmedLocation =
        form.location.trim();

      const trimmedDescription =
        form.description.trim();


      if (!trimmedLocation) {
        setError(
          "Please enter the complaint location or room."
        );

        return;
      }


      if (!trimmedDescription) {
        setError(
          "Please describe the problem."
        );

        return;
      }


      setError("");
      setSubmitting(true);

      try {
        const data =
          await submitComplaint({
            ...form,

            location:
              trimmedLocation,

            description:
              trimmedDescription,

            evidence,
          });

        onSubmitted(data);

      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Could not submit complaint."
        );

      } finally {
        setSubmitting(false);
      }
    };


  return (
    <form
      onSubmit={
        handleSubmit
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex align-items-start gap-3 mb-4">

        <div
          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "50px",
            height: "50px",
            fontSize: "22px",
          }}
        >
          <i className="bi bi-shield-lock" />
        </div>


        <div>

          <h4 className="mb-1">
            Anonymous Complaint
          </h4>

          <p className="text-muted mb-0">
            Submit a confidential complaint directly
            to the System Administrator.
          </p>

        </div>

      </div>


      {/* =================================================
          CONFIDENTIALITY INFORMATION
      ================================================= */}

      <div className="alert alert-info border-0 shadow-sm">

        <div className="d-flex align-items-start">

          <i className="bi bi-lock-fill me-2 mt-1" />

          <div>

            <strong>
              Confidential communication
            </strong>

            <div className="mt-1">
              Your identity is stored in a protected
              identity vault. The Mess Manager,
              maintenance staff, and technician
              cannot see who submitted this complaint.
            </div>

          </div>

        </div>

      </div>


      <div className="alert alert-secondary border-0">

        <div className="d-flex align-items-start">

          <i className="bi bi-key-fill me-2 mt-1" />

          <div>

            <strong>
              Keep your private token safe
            </strong>

            <div className="mt-1">
              After submission, you will receive a
              private token. Use this token to track
              your complaint and communicate with the
              System Administrator.
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >

          <i className="bi bi-exclamation-triangle-fill me-2" />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =================================================
          COMPLAINT DETAILS
      ================================================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="mb-1">
            Complaint Details
          </h5>

          <p className="text-muted small mb-4">
            Provide the basic information about
            the problem.
          </p>


          <div className="row">

            {/* ===========================================
                LOCATION
            =========================================== */}

            <div className="col-md-4 mb-3">

              <label
                className="form-label fw-semibold"
                htmlFor="complaintLocation"
              >
                Location / Room
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-geo-alt" />
                </span>

                <input
                  id="complaintLocation"
                  name="location"
                  type="text"
                  className="form-control"
                  value={
                    form.location
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Room 203"
                  maxLength={200}
                />

              </div>

              <div className="form-text">
                Enter the room number or exact location
                where the problem occurred.
              </div>

            </div>


            {/* ===========================================
                CATEGORY
            =========================================== */}

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold">
                Category
              </label>

              <select
                name="category"
                className="form-select"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              >

                {CATEGORIES.map(
                  (category) => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>

                  )
                )}

              </select>

              <div className="form-text">
                Select the type of problem.
              </div>

            </div>


            {/* ===========================================
                URGENCY
            =========================================== */}

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold">
                Urgency
              </label>

              <select
                name="urgency"
                className="form-select"
                value={
                  form.urgency
                }
                onChange={
                  handleChange
                }
              >

                {URGENCIES.map(
                  (urgency) => (

                    <option
                      key={urgency}
                      value={urgency}
                    >
                      {urgency}
                    </option>

                  )
                )}

              </select>

              <div className="form-text">
                Select how urgent the problem is.
              </div>

            </div>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Description
            </label>

            <textarea
              name="description"
              className="form-control"
              rows={6}
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the issue clearly. Include what happened, where the problem is, and any useful details..."
            />

            <div className="form-text">
              A clear description helps the System
              Administrator understand the problem.
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          MANAGER CONCERN
          ALWAYS HIGHLIGHTED IN BLUE
      ================================================= */}

      <div
        className={`card shadow-sm mb-4 ${
          form.concernsManager
            ? "border-primary"
            : "border-primary border-opacity-50"
        }`}
        style={{
          backgroundColor:
            form.concernsManager
              ? "rgba(13, 110, 253, 0.12)"
              : "rgba(13, 110, 253, 0.05)",

          cursor: "pointer",

          transition:
            "all 0.2s ease",

          boxShadow:
            form.concernsManager
              ? "0 0 0 2px rgba(13, 110, 253, 0.12)"
              : "0 2px 8px rgba(13, 110, 253, 0.08)",
        }}
        onClick={
          handleManagerConcernClick
        }
      >

        <div className="card-body p-4">

          <div className="d-flex align-items-start">

            <div
              className="form-check me-3"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <input
                type="checkbox"
                className="form-check-input"
                id="concernsManager"
                name="concernsManager"
                checked={
                  form.concernsManager
                }
                onChange={
                  handleChange
                }
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  marginTop: "2px",
                }}
              />

            </div>


            <div className="flex-grow-1">

              <label
                className="form-label fw-semibold mb-1 text-primary"
                htmlFor="concernsManager"
                style={{
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-person-exclamation me-2" />

                This complaint concerns the Mess Manager
              </label>


              <p className="text-muted small mb-0">
                If selected, the complaint will not be
                routed to the Mess Manager. The System
                Administrator will route it to an
                authorized alternative.
              </p>


              {form.concernsManager && (

                <div className="alert alert-primary mt-3 mb-0 py-2">

                  <i className="bi bi-info-circle-fill me-2" />

                  <strong>
                    Special routing selected.
                  </strong>{" "}

                  This complaint will be handled through
                  the authorized alternative route.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          EVIDENCE
      ================================================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="mb-3">

            <h5 className="mb-1">
              Supporting Evidence
            </h5>

            <p className="text-muted small mb-0">
              Add photos or videos if they help
              explain the problem.
            </p>

          </div>


          <EvidenceUpload
            evidence={
              evidence
            }
            onChange={
              setEvidence
            }
          />

        </div>

      </div>


      {/* =================================================
          SUBMIT
      ================================================= */}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">

        <div className="text-muted small">

          <i className="bi bi-shield-check me-1" />

          Your complaint will be submitted securely
          to the System Administrator.

        </div>


        <button
          type="submit"
          className="btn btn-primary px-4 py-2"
          disabled={
            submitting ||
            !form.location.trim() ||
            !form.description.trim()
          }
        >

          {submitting ? (

            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />

              Submitting...
            </>

          ) : (

            <>
              <i className="bi bi-send me-2" />

              Submit Complaint to Admin
            </>

          )}

        </button>

      </div>

    </form>
  );
}


export default ComplaintForm;