import { useEffect, useState } from "react";

import {

  getPendingReservations,

  approveReservation,

  rejectReservation,

} from "../services/reservationService";

function PendingReservations() {

  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadReservations();

  }, []);

  const loadReservations = async () => {

    try {

      const res = await getPendingReservations();

      setReservations(res.reservations || []);

    } catch (error) {

      console.log(error);

      alert("Failed to load reservations.");

    } finally {

      setLoading(false);

    }

  };

  const handleApprove = async (id) => {

    try {

      const res = await approveReservation(id);

      alert(res.message);

      loadReservations();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Approval failed."
      );

    }

  };

  const handleReject = async (id) => {

    try {

      const res = await rejectReservation(id);

      alert(res.message);

      loadReservations();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Rejection failed."
      );

    }

  };

  return (

    <div className="container mt-5">

      <h2 className="mb-4">

        Pending Reservations

      </h2>

      {loading ? (

        <div className="text-center">

          <div
            className="spinner-border"
            role="status"
          ></div>

          <p className="mt-2">

            Loading...

          </p>

        </div>

      ) : reservations.length === 0 ? (

        <div className="alert alert-info">

          No pending reservations.

        </div>

      ) : (

        <table className="table table-bordered">

          <thead className="table-dark">

            <tr>

              <th>Student</th>

              <th>Room</th>

              <th>Bed</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {reservations.map((r) => (

              <tr key={r._id}>

                <td>{r.student?.name}</td>

                <td>{r.room?.roomNumber}</td>

                <td>{r.bedNumber}</td>

                <td>{r.status}</td>

                <td>

                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApprove(r._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(r._id)}
                  >
                    Reject
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}

export default PendingReservations;