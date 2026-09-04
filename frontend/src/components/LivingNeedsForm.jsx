import React, { useState } from "react";
import { getSpaceFitMatches } from "../services/spaceFitService";

const LivingNeedsForm = ({ setMatches }) => {
  const [formData, setFormData] = useState({
    studySpace: 5,
    storage: 5,
    privacy: 5,
    budget: 7000,
    roommateCount: 1,
    noiseTolerance: 3,
    preferredFloor: 2,
    moveInDate: "",
    maxCampusTravelTime: 15,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const nextValue = type === "number" ? Number(value) : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const data = await getSpaceFitMatches(formData);
      setMatches(data?.matches || []);
    } catch (error) {
      console.log(error);
      setErrorMessage(
        error.response?.data?.message || "SpaceFit search failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (

    <form onSubmit={handleSubmit}>

      <div className="row g-4">
        <div className="col-md-4">
          <label className="form-label">Study Space</label>
          <input
            type="number"
            className="form-control"
            name="studySpace"
            min="1"
            max="10"
            value={formData.studySpace}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Storage</label>
          <input
            type="number"
            className="form-control"
            name="storage"
            min="1"
            max="10"
            value={formData.storage}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Privacy</label>
          <input
            type="number"
            className="form-control"
            name="privacy"
            min="1"
            max="10"
            value={formData.privacy}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Budget</label>
          <input
            type="number"
            className="form-control"
            name="budget"
            min="0"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Roommate Count</label>
          <input
            type="number"
            className="form-control"
            name="roommateCount"
            min="1"
            max="5"
            value={formData.roommateCount}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Noise Tolerance</label>
          <input
            type="number"
            className="form-control"
            name="noiseTolerance"
            min="1"
            max="5"
            value={formData.noiseTolerance}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Preferred Floor</label>
          <input
            type="number"
            className="form-control"
            name="preferredFloor"
            min="1"
            value={formData.preferredFloor}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Move-in Date</label>
          <input
            type="date"
            className="form-control"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Max Campus Travel Time (mins)</label>
          <input
            type="number"
            className="form-control"
            name="maxCampusTravelTime"
            min="5"
            value={formData.maxCampusTravelTime}
            onChange={handleChange}
          />
        </div>
      </div>



      {errorMessage && (
        <div className="alert alert-danger mt-4 mb-0">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Searching..." : "🔍 Find SpaceFit Rooms"}
      </button>


    </form>

  );

};


export default LivingNeedsForm;