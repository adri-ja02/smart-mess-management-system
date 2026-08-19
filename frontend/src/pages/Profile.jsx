import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
} from "../services/profileService";

import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  // Get updateUser from AuthContext
  // This keeps Navbar/Dashboard user data synchronized
  // after the profile is updated.
  const { updateUser } = useAuth();

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
        name: res.user.name || "",
        email: res.user.email || "",
        profilePhoto: res.user.profilePhoto || "",
        notificationPreference:
          res.user.notificationPreference ?? true,
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

    const {
      name,
      value,
      checked,
      type,
    } = e.target;

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
      const result = await updateProfile(profile);

      // Keep the global logged-in user synchronized
      // with the updated profile.
      if (result?.user) {
        updateUser(result.user);

        setProfile({
          name: result.user.name || "",
          email: result.user.email || "",
          profilePhoto: result.user.profilePhoto || "",
          notificationPreference:
            result.user.notificationPreference ?? true,
        });
      }

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">
          My Profile
        </h2>

        <ProfileForm
          profile={profile}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default Profile;