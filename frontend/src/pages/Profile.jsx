import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
} from "../services/profileService";
import ProfileForm from "../components/ProfileForm";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePhoto: "",
    notificationPreference: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();

      setProfile({
        name: res.user.name,
        email: res.user.email,
        profilePhoto: res.user.profilePhoto,
        notificationPreference:
          res.user.notificationPreference,
      });
    } catch (error) {
      console.log(error);
      alert("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setProfile({
        ...profile,
        profilePhoto: e.target.files[0],
      });
      return;
    }

    const { name, value, checked, type } = e.target;

    setProfile({
      ...profile,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(profile);

      alert("Profile Updated Successfully");

      loadProfile();
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="container mt-5">
      <h2>My Profile</h2>

      <ProfileForm
        profile={profile}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Profile;