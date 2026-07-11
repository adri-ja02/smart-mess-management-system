const Room = require("../models/Room");
const calculateSpaceFitScore = require("../utils/spaceFitCalculator");


// Student searches matching rooms

exports.getSpaceFitMatches = async(req,res)=>{

try{

const needs = req.body;


// get all available rooms
const rooms = await Room.find();


const matches = rooms.map(room=>{

    const score = calculateSpaceFitScore(
        room,
        needs
    );


    return {
        room,
        score
    };

})
.sort((a,b)=>b.score-a.score);



res.json({
success:true,
matches
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};