import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getComplaintByIdForManager,
    submitReviewDecision,
    requestSiteInspection,
} from "../services/complaintService";


function AdminComplaintReview() {

    const { id } = useParams();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);


    const loadComplaint = async () => {
        try {

            const data = await getComplaintByIdForManager(id);

            setComplaint(data.complaint);

        } catch (error) {

            console.log(error);
            alert(
                error.response?.data?.message ||
                "Failed to load complaint"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadComplaint();

    }, [id]);



    const handleDecision = async (decision) => {

        try {

            await submitReviewDecision(id, {
                decision,
                note: "Reviewed by Complaint Integrity Officer"
            });


            alert("Decision submitted");

            loadComplaint();


        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to submit decision"
            );

        }

    };



    const handleInspection = async () => {

        try {

            await requestSiteInspection(id);

            alert("Site inspection requested");

            loadComplaint();


        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to request inspection"
            );

        }

    };



    if (loading) {

        return <p>Loading complaint...</p>;

    }



    if (!complaint) {

        return <p>No complaint found</p>;

    }



    return (

        <div className="container mt-4">


            <h3>
                Complaint Integrity Review
            </h3>


            <hr />


            <h5>
                Ticket #{complaint.ticketNumber}
            </h5>
            <p>
                Review Decision:{" "}
                <strong>
                    {complaint.reviewDecision || "Not Reviewed Yet"}
                </strong>
            </p>


            <p>
                Location: {complaint.location}
            </p>


            <p>
                Category: {complaint.category}
            </p>


            <p>
                Urgency: {complaint.urgency}
            </p>



            <div className="card mb-3">

                <div className="card-header">
                    Description
                </div>

                <div className="card-body">

                    {complaint.description}

                </div>

            </div>
            {/* Evidence */}
            <div className="card mb-3">

                <div className="card-header">
                    Evidence
                </div>

                <div className="card-body">

                    {complaint.evidence?.length > 0 ? (

                        <div className="row">

                            {complaint.evidence.map((item, index) => (

                                <div
                                    className="col-md-4 mb-3"
                                    key={index}
                                >

                                    {item.type === "video" ? (

                                        <video
                                            controls
                                            className="w-100 rounded"
                                        >
                                            <source src={item.url} />
                                        </video>

                                    ) : (

                                        <img
                                            src={item.url}
                                            alt={`Evidence ${index + 1}`}
                                            className="img-fluid rounded"
                                        />

                                    )}

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="text-muted mb-0">
                            No evidence submitted.
                        </p>

                    )}

                </div>

            </div>
            {/* Relevant Complaint Records */}
            <div className="card mb-3">

                <div className="card-header">
                    Complaint Timeline / Relevant Records
                </div>

                <div className="card-body">

                    {complaint.timeline?.length > 0 ? (

                        complaint.timeline.map((item, index) => (

                            <div
                                key={index}
                                className="border-bottom pb-2 mb-2"
                            >

                                <strong>
                                    {item.status}
                                </strong>

                                {item.note && (

                                    <div className="text-muted">
                                        {item.note}
                                    </div>

                                )}

                            </div>

                        ))

                    ) : (

                        <p className="text-muted mb-0">
                            No complaint history available.
                        </p>

                    )}

                </div>

            </div>



            <div className="card mb-3">

                <div className="card-header bg-warning">

                    Credibility Flags

                </div>


                <div className="card-body">


                    {
                        complaint.credibilityFlags?.length > 0 ?

                            complaint.credibilityFlags.map(
                                (flag, index) => (

                                    <p key={index}>
                                        ⚠ {flag}
                                    </p>

                                )

                            )

                            :

                            <p>
                                No credibility issues detected
                            </p>

                    }


                </div>

            </div>



            <div className="mb-3">


                <h5>
                    Review Decision
                </h5>


                <button
                    className="btn btn-success me-2"
                    onClick={() => handleDecision("Valid")}
                >
                    Valid
                </button>


                <button
                    className="btn btn-warning me-2"
                    onClick={() => handleDecision("Insufficient Evidence")}
                >
                    Insufficient Evidence
                </button>


                <button
                    className="btn btn-secondary me-2"
                    onClick={() => handleDecision("Duplicate")}
                >
                    Duplicate
                </button>


                <button
                    className="btn btn-danger"
                    onClick={() => handleDecision("Confirmed False")}
                >
                    Confirmed False
                </button>


            </div>



            <button
                className="btn btn-primary"
                onClick={handleInspection}
            >

                Request Site Inspection

            </button>



        </div>

    );

}


export default AdminComplaintReview;