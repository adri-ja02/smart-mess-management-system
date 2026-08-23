import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getComplaintsForManager } from "../services/complaintService";


function AdminComplaintList() {

    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);



    const loadComplaints = async () => {

        try {

            const data = await getComplaintsForManager();

            setComplaints(data.complaints || []);

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to load complaints"
            );

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        loadComplaints();

    }, []);



    if (loading) {

        return <p>Loading complaints...</p>;

    }



    return (

        <div className="container mt-4">


            <h3>
                Complaint Integrity Review
            </h3>


            <p className="text-muted">
                Review complaints before maintenance operations.
            </p>



            {
                complaints.length === 0 ?

                    <p>
                        No complaints available.
                    </p>

                    :

                    complaints.map((complaint) => (


                        <div
                            key={complaint._id}
                            className="card mb-3 shadow-sm"
                        >

                            <div className="card-body">


                                <h5>
                                    #{complaint.ticketNumber}
                                </h5>


                                <p>
                                    Location: {complaint.location}
                                </p>


                                <p>
                                    Category: {complaint.category}
                                </p>


                                <p>
                                    Status:
                                    {" "}
                                    <span className="badge bg-primary">
                                        {complaint.status}
                                    </span>
                                </p>



                                {
                                    complaint.credibilityFlags?.length > 0 && (

                                        <div className="alert alert-warning">

                                            ⚠ Credibility Issues Detected

                                        </div>

                                    )
                                }



                                <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                        navigate(
                                            `/admin/complaints/${complaint._id}/review`
                                        )
                                    }
                                >
                                    Open Review
                                </button>


                            </div>


                        </div>


                    ))

            }


        </div>

    );

}


export default AdminComplaintList;