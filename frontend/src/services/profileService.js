import axios from "axios";

const API = "http://localhost:5000/api/profile";

// Get Profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Update Profile
export const updateProfile = async (profile) => {

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("name", profile.name);

  formData.append(
    "notificationPreference",
    profile.notificationPreference
  );

  if (profile.profilePhoto) {
    formData.append(
      "profilePhoto",
      profile.profilePhoto
    );
  }

  const res = await axios.put(
    `${API}/update`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

// Change Password
export const changePassword = async (passwordData) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(
    `${API}/change-password`,
    passwordData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

