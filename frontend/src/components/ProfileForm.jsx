import { Link } from "react-router-dom";


const ProfileForm = ({
  profile,
  handleChange,
  handleSubmit,
}) => {


  let imageSrc = "/logo192.png";


  if(profile.profilePhoto instanceof File){

    imageSrc = URL.createObjectURL(
      profile.profilePhoto
    );

  }
  else if(
    profile.profilePhoto &&
    typeof profile.profilePhoto === "string"
  ){

    imageSrc = profile.profilePhoto;

  }



  return (

    <form onSubmit={handleSubmit}>


      {/* Profile Photo */}

      <div className="text-center mb-4">

        <img
          src={imageSrc}
          alt="Profile"
          width="150"
          height="150"
          className="rounded-circle border"
          style={{
            objectFit:"cover"
          }}
        />

      </div>




      {/* Name */}

      <div className="mb-3">

        <label className="form-label">
          Name
        </label>


        <input
          type="text"
          name="name"
          className="form-control"
          value={profile.name}
          onChange={handleChange}
        />


      </div>





      {/* Email */}

      <div className="mb-3">

        <label className="form-label">
          Email
        </label>


        <input
          type="email"
          className="form-control"
          value={profile.email}
          disabled
        />


      </div>





      {/* Upload */}

      <div className="mb-3">

        <label className="form-label">
          Upload Profile Picture
        </label>


        <input
          type="file"
          name="profilePhoto"
          accept="image/*"
          className="form-control"
          onChange={handleChange}
        />


      </div>






      {/* Notification */}

      <div className="form-check mb-3">


        <input
          className="form-check-input"
          type="checkbox"
          name="notificationPreference"
          checked={
            profile.notificationPreference
          }
          onChange={handleChange}
        />


        <label className="form-check-label">

          Enable Notifications

        </label>


      </div>






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