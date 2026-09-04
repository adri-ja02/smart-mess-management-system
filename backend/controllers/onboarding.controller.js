const User = require("../models/User");


// Student submits onboarding

exports.submitOnboarding = async(req,res)=>{

try{

const user = await User.findById(req.user.id).select("-password");

user.universityId=req.body.universityId;
user.emergencyContact=req.body.emergencyContact;
user.moveInDate=req.body.moveInDate;
user.onboardingStatus="pending";


await user.save();


res.json({
success:true,
message:"Onboarding submitted",
user
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};

exports.getPendingOnboarding = async(req,res)=>{

try{

const users = await User.find({
    onboardingStatus:"pending"
}).select("-password");


res.json({
success:true,
users
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};

exports.updateOnboardingStatus = async(req,res)=>{

try{

const user = await User.findById(req.params.id);

if(!user){
return res.status(404).json({
message:"User not found"
});
}


user.onboardingStatus = req.body.status;

await user.save();


res.json({
success:true,
message:"Onboarding status updated",
user
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};

exports.getMyOnboardingStatus = async(req,res)=>{

try{

const user = await User.findById(req.user.id)
.select(
" name email universityId emergencyContact moveInDate onboardingStatus"
);


res.json({
success:true,
user
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};