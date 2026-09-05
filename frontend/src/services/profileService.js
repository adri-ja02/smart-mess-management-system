import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/profile`;

// ===============================
// Get Profile
// ===============================
export const getProfile = async () => {

  const token = localStorage.getItem("token");

  const res = await axios.get(
    API,
    {
      headers:{
        Authorization:`Bearer ${token}`,
      },
    }
  );


  return res.data;

};




// ===============================
// Update Profile
// ===============================
export const updateProfile = async (profile)=>{


  const token = localStorage.getItem("token");


  const formData = new FormData();



  formData.append(
    "name",
    profile.name
  );



  formData.append(
    "notificationPreference",
    profile.notificationPreference
  );



  if(
    profile.profilePhoto instanceof File
  ){

    formData.append(
      "profilePhoto",
      profile.profilePhoto
    );

  }



  const res = await axios.put(

    `${API}/update`,

    formData,

    {

      headers:{

        Authorization:
        `Bearer ${token}`,

      },

    }

  );


  return res.data;


};




// ===============================
// Change Password
// ===============================
export const changePassword = async(passwordData)=>{


const token = localStorage.getItem("token");


const res = await axios.put(

`${API}/change-password`,

passwordData,

{

headers:{

Authorization:
`Bearer ${token}`,

},

}

);


return res.data;


};