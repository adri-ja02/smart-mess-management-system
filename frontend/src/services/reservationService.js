import API from "../api";


export const requestReservation = async (data) => {
    const res = await API.post(
        "/reservations",
        data
    );

    return res.data;
};


// ===========================================================
// STUDENT - MY RESERVATIONS
// ===========================================================

export const getMyReservations = async () => {
    const res = await API.get(
        "/reservations/my"
    );

    return res.data;
};


// ===========================================================
// STUDENT - CANCEL RESERVATION
// ===========================================================

export const cancelReservation = async (id) => {
    const res = await API.patch(
        `/reservations/${encodeURIComponent(id)}/cancel`,
        {}
    );

    return res.data;
};


// ===========================================================
// MANAGER - PENDING RESERVATIONS
// ===========================================================

export const getPendingReservations = async () => {
    const res = await API.get(
        "/reservations/pending"
    );

    return res.data;
};


// ===========================================================
// MANAGER - APPROVE RESERVATION
// ===========================================================

export const approveReservation = async (id) => {
    const res = await API.patch(
        `/reservations/${encodeURIComponent(id)}/approve`,
        {}
    );

    return res.data;
};


// ===========================================================
// MANAGER - REJECT RESERVATION
// ===========================================================


export const rejectReservation = async (
    id,
    reason
) => {
    const res = await API.patch(
        `/reservations/${encodeURIComponent(id)}/reject`,
        {
            reason,
        }
    );

    return res.data;
};


export const getReservationStatus = async (
    roomId
) => {
    const res = await API.get(
        `/reservations/status/${encodeURIComponent(roomId)}`
    );

    return res.data;
};