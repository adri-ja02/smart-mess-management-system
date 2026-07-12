import React, { useState } from "react";
import LivingNeedsForm from "../components/LivingNeedsForm";
import { useNavigate } from "react-router-dom";


const LivingNeeds = () => {

  const [, setMatches] = useState([]);

  const navigate = useNavigate();

  const handleMatches = (data) => {
    const nextMatches = Array.isArray(data)
      ? data
      : data?.matches || [];

    setMatches(nextMatches);

    localStorage.setItem(
      "spaceFitMatches",
      JSON.stringify(nextMatches)
    );

    navigate("/spacefit");
  };


  return (

    <div className="container mt-5">

      <div className="card shadow p-5">

        <h1 className="text-center mb-4">
          🏠 Living Needs Profile
        </h1>


        <p className="text-center text-muted mb-4">
          Tell us your preferences and SpaceFit will recommend suitable rooms.
        </p>


        <LivingNeedsForm 
          setMatches={handleMatches}
        />


      </div>

    </div>

  );

};


export default LivingNeeds;