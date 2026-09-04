const express=require("express");

const router=express.Router();

const {
submitOnboarding,
getPendingOnboarding,
updateOnboardingStatus,
getMyOnboardingStatus
}=require("../controllers/onboarding.controller");


const { protect } = require("../middleware/auth.middleware");


router.post(
"/submit",
protect,
submitOnboarding
);


router.get(
"/pending",
protect,
getPendingOnboarding
);

router.put(
"/status/:id",
protect,
updateOnboardingStatus
);

router.get(
"/my-status",
protect,
getMyOnboardingStatus
);


module.exports=router;