import { useNavigate } from "react-router-dom";
import ComplaintForm from "../components/ComplaintForm";

function AnonymousComplaint() {
  const navigate = useNavigate();

  const handleSubmitted = (data) => {
    navigate("/complaints/submitted", {
      state: {
        ticketNumber: data.ticketNumber,
        token: data.token,
      },
    });
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <ComplaintForm onSubmitted={handleSubmitted} />
      </div>
    </div>
  );
}

export default AnonymousComplaint;