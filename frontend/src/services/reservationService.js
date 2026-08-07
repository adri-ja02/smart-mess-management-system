import axios from "axios";

const API = "http://localhost:5000/api/reservations";

const getToken = () => localStorage.getItem("token");

/* =====================================
   Student Request Reservation
===================================== */

export const requestReservation = async (data) => {

    const res = await axios.post(

        API,

        data,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Student My Reservations
===================================== */

export const getMyReservations = async () => {

    const res = await axios.get(

        `${API}/my`,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Cancel Reservation
===================================== */

export const cancelReservation = async (id) => {

    const res = await axios.patch(

        `${API}/${id}/cancel`,

        {},

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Manager Pending Reservations
===================================== */

export const getPendingReservations = async () => {

    const res = await axios.get(

        `${API}/pending`,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Approve Reservation
===================================== */

export const approveReservation = async (id) => {

    const res = await axios.patch(

        `${API}/${id}/approve`,

        {},

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Reject Reservation
===================================== */

export const rejectReservation = async (id) => {

    const res = await axios.patch(

        `${API}/${id}/reject`,

        {},

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

//getreservation status
export const getReservationStatus = async (roomId) => {

    const res = await axios.get(

        `${API}/status/${roomId}`,

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return res.data;

};