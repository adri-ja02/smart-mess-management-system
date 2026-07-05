import { Link } from "react-router-dom";

const ProfileForm = ({
  profile,
  handleChange,
  handleSubmit,
  handleImageChange,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      {/* Name */}
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          className="form-control"
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          value={profile.email}
          disabled
        />
      </div>
      {profile.profilePhoto &&
 typeof profile.profilePhoto === "string" && (
  <img
    src={`http://localhost:5000/uploads/${profile.profilePhoto}`}
    alt="Profile"
    width="150"
    className="mb-3 rounded-circle"
  />
)}
      {/* Profile Picture */}
      <div className="mb-3">
        <label className="form-label">Upload Profile Picture</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          name="profilePhoto"
          onChange={handleImageChange}
        />
      </div>

      {/* Show uploaded image if available */}
      {profile.profilePhoto && (
        <div className="mb-3 text-center">
          <img
            src={profile.profilePhoto}
            alt="Profile"
            width="120"
            height="120"
            className="rounded-circle border"
          />
        </div>
      )}

      {/* Notification Preference */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          name="notificationPreference"
          checked={profile.notificationPreference}
          onChange={handleChange}
        />

        <label className="form-check-label">
          Enable Notifications
        </label>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
        >
          Update Profile
        </button>

        <Link
          to="/change-password"
          className="btn btn-warning"
        >
          Change Password
        </Link>
      </div>
    </form>
  );
};

export default ProfileForm;