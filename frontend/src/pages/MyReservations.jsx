import { useEffect, useState } from "react";
import {
  getMyReservations,
  cancelReservation,
} from "../services/reservationService";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const res = await getMyReservations();
      setReservations(res.reservations || []);
    } catch (error) {
      console.log(error);
      alert("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmCancel) return;

    try {
      const res = await cancelReservation(id);

      alert(res.message);

      loadReservations();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel reservation."
      );
    }
  };

  return (
    <div className="container mt-5">

      <h2 className="mb-4">
        My Reservations
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

          You have no reservations.

        </div>

      ) : (

        <table className="table table-bordered table-hover">

          <thead className="table-dark">

            <tr>

              <th>Room</th>

              <th>Bed</th>

              <th>Status</th>

              <th>Requested On</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {reservations.map((reservation) => (

              <tr key={reservation._id}>

                <td>

                  {reservation.room?.roomNumber}

                </td>

                <td>

                  {reservation.bedNumber}

                </td>

                <td>

                  {reservation.status}

                </td>

                <td>

                  {new Date(
                    reservation.createdAt
                  ).toLocaleDateString()}

                </td>

                <td>

                  {(reservation.status === "pending" ||
                    reservation.status === "approved") && (

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleCancel(reservation._id)
                      }
                    >
                      Cancel
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default MyReservations;