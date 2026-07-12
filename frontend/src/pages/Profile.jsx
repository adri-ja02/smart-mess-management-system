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

      if (result?.user?.profilePhoto) {
        setProfile((prev) => ({
          ...prev,
          profilePhoto: result.user.profilePhoto,
        }));
      }

      alert("Profile Updated Successfully");

      loadProfile();



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