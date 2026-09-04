const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");


// ===============================
// Get Profile
// ===============================
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("currentRoom");


    if (!user) {

      return res.status(404).json({
        success:false,
        message:"User not found"
      });

    }


    res.status(200).json({

      success:true,
      user

    });


  } catch(error) {


    console.log("GET PROFILE ERROR:", error);


    res.status(500).json({

      success:false,
      message:error.message

    });


  }

};





// ===============================
// Update Profile
// ===============================
exports.updateProfile = async (req,res)=>{


  console.log("\n========== UPDATE PROFILE ==========");

  console.log("BODY:", req.body);

  console.log("FILE:", req.file);



  let uploadedFile = null;



  try {


    const user = await User.findById(req.user.id);



    if(!user){


      return res.status(404).json({

        success:false,

        message:"User not found"

      });


    }





    // ===============================
    // Update Name
    // ===============================

    if(req.body.name){

      user.name = req.body.name;

    }





    // ===============================
    // Update Notification
    // ===============================

    if(req.body.notificationPreference !== undefined){

      user.notificationPreference =
        req.body.notificationPreference === "true";

    }








    // ===============================
    // Upload Profile Image
    // ===============================

    if(req.file){
      uploadedFile = req.file.path;

      console.log("Uploading file:", uploadedFile);

      if(!process.env.CLOUDINARY_CLOUD_NAME ||
         !process.env.CLOUDINARY_API_KEY ||
         !process.env.CLOUDINARY_API_SECRET){
        user.profilePhoto = `/uploads/${req.file.filename}`;
      } else {
        try {
          const result = await cloudinary.uploader.upload(uploadedFile, {
            folder: "SmartMess/ProfilePhotos",
            resource_type: "image",
            transformation: [
              {
                width: 500,
                height: 500,
                crop: "limit",
              },
            ],
          });

          console.log("Cloudinary Upload Success:");
          console.log(result.secure_url);

          user.profilePhoto = result.secure_url;
        } catch (uploadError) {
          console.log("Cloudinary Upload Error:", uploadError.message);
          user.profilePhoto = `/uploads/${req.file.filename}`;
        }
      }

      if (fs.existsSync(uploadedFile)) {
        fs.unlinkSync(uploadedFile);
      }
    }





    // ===============================
    // Save Database
    // ===============================

    await user.save();



    const updatedUser =
      await User.findById(req.user.id)
      .select("-password");





    console.log(
      "PROFILE UPDATED SUCCESSFULLY"
    );





    return res.status(200).json({

      success:true,

      message:
      "Profile updated successfully",

      user:updatedUser

    });






  } catch(error){



    console.log(
      "========== PROFILE UPDATE ERROR =========="
    );


    console.log(error);



    // remove temp file if failed

    if(uploadedFile && fs.existsSync(uploadedFile)){

      fs.unlinkSync(uploadedFile);

    }





    return res.status(500).json({

      success:false,

      message:error.message

    });



  }


};







// ===============================
// Change Password
// ===============================
exports.changePassword = async(req,res)=>{


try{


const {
currentPassword,
newPassword

}=req.body;



const user =
await User.findById(req.user.id);



if(!user){

return res.status(404).json({

success:false,

message:"User not found"

});

}




const isMatch =
await bcrypt.compare(
currentPassword,
user.password
);



if(!isMatch){

return res.status(400).json({

success:false,

message:"Current password is incorrect"

});

}



const hashedPassword = await bcrypt.hash(
newPassword,
10
);


user.password = hashedPassword;


await user.save();


return res.status(200).json({

message:"Password changed successfully"

});


} catch(error){

return res.status(500).json({

success:false,

message:error.message

});

}

};