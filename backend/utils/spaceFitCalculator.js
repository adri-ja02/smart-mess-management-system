const calculateSpaceFitScore = (room, needs) => {

    let score = 0;

    // Study space
    if(room.studySpace >= needs.studySpace){
        score += 20;
    }

    // Storage
    if(room.storage >= needs.storage){
        score += 20;
    }

    // Privacy
    if(room.privacy >= needs.privacy){
        score += 20;
    }

    // Budget
    if(room.rent <= needs.budget){
        score += 20;
    }

    // Roommate preference
    if(room.occupancy <= needs.roommateCount){
        score += 20;
    }


    return score;
};


module.exports = calculateSpaceFitScore;