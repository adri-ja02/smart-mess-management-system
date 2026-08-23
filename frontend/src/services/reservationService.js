import API from "../api";

// ===========================================================
// STUDENT - REQUEST RESERVATION
// POST /api/reservations/request
// ===========================================================

export const requestReservation = async (data) => {
  const res = await API.post(
    "/reservations/request",
    data
  );

  return res.data;
};


// ===========================================================
// STUDENT - MY RESERVATIONS
// GET /api/reservations/my
// ===========================================================

export const getMyReservations = async () => {
  const res = await API.get(
    "/reservations/my"
  );

  return res.data;
};


// ===========================================================
// STUDENT - CANCEL RESERVATION
// DELETE /api/reservations/:id
// ===========================================================

export const cancelReservation = async (id) => {
  const res = await API.delete(
    `/reservations/${encodeURIComponent(id)}`
  );

  return res.data;
};


// ===========================================================
// MANAGER - ALL RESERVATIONS
// GET /api/reservations/pending
//
// The backend endpoint is still called "pending",
// but it now returns ALL reservation history.
// ===========================================================

export const getPendingReservations = async () => {
  const res = await API.get(
    "/reservations/pending"
  );

  return res.data;
};


// ===========================================================
// MANAGER - RESERVATION HISTORY
//
// Since /pending now returns ALL reservations,
// use the same endpoint here.
// ===========================================================

export const getReservationHistory = async () => {
  const res = await API.get(
    "/reservations/pending"
  );

  return res.data;
};


// ===========================================================
// MANAGER - APPROVE RESERVATION
// PUT /api/reservations/:id/approve
// ===========================================================

export const approveReservation = async (id) => {
  const res = await API.put(
    `/reservations/${encodeURIComponent(id)}/approve`
  );

  return res.data;
};


// ===========================================================
// MANAGER - REJECT RESERVATION
// PUT /api/reservations/:id/reject
// ===========================================================

export const rejectReservation = async (
  id,
  reason
) => {
  const res = await API.put(
    `/reservations/${encodeURIComponent(id)}/reject`,
    {
      reason,
    }
  );

  return res.data;
};


// ===========================================================
// GET RESERVATION STATUS
// GET /api/reservations/status/:roomId
// ===========================================================

export const getReservationStatus = async (
  roomId
) => {
  const res = await API.get(
    `/reservations/status/${encodeURIComponent(roomId)}`
  );

  return res.data;
};