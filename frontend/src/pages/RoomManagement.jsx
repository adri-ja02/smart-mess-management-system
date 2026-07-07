import RoomForm from "../components/RoomForm";

const RoomManagement=()=>{

return(

<div className="container mt-5">

<div className="card shadow border-0">

<div className="card-body p-5">

<div className="text-center mb-5">

<h2 className="fw-bold">

Room Management

</h2>

<p className="text-muted">

Create and manage Room Space Passport information

</p>

</div>

<RoomForm/>

</div>

</div>

</div>

);

};

export default RoomManagement;