import API from "../api";

// ===========================================================
// STUDENT - GET MY WAITLIST
// ===========================================================

export const getWaitlist = async () => {
  const res = await API.get("/waitlist");

  return res.data;
};

// ===========================================================
// STUDENT - GET MY WAITLIST NOTIFICATIONS
// ===========================================================

export const getNotifications = async () => {
  const res = await API.get(
    "/waitlist/notifications"
  );

  return res.data;
};

// ===========================================================
// STUDENT - JOIN WAITLIST
// ===========================================================

export const requestWaitlist = async (data) => {
  const res = await API.post(
    "/waitlist",
    data
  );

  return res.data;
};

// ===========================================================
// STUDENT - CLAIM MATCHED BED
// ===========================================================

export const claimMatchedBed = async (
  id,
  applicantDetails
) => {
  const res = await API.patch(
    `/waitlist/${encodeURIComponent(id)}/claim`,
    {
      applicantDetails,
    }
  );

  return res.data;
};

// ===========================================================
// STUDENT - LEAVE WAITLIST
// ===========================================================

export const cancelWaitlist = async (id) => {
  const res = await API.patch(
    `/waitlist/${encodeURIComponent(id)}/cancel`,
    {}
  );

  return res.data;
};

// ===========================================================
// MANAGER - GET MATCHING STUDENTS FOR ROOM
// ===========================================================

export const getMatchingStudents = async (
  roomId
) => {
  const res = await API.get(
    `/waitlist/match/${encodeURIComponent(roomId)}`
  );

  return res.data;
};

// ===========================================================
// MANAGER - GET ALL WAITLIST
// ===========================================================

export const getAllWaitlistForManager = async () => {
  const res = await API.get("/waitlist/all");

  return res.data;
};

// ===========================================================
// MANAGER - REJECT WAITLIST ENTRY
// ===========================================================

export const rejectWaitlistEntry = async (
  id,
  reason
) => {
  const res = await API.patch(
    `/waitlist/${encodeURIComponent(id)}/reject`,
    {
      reason: reason.trim(),
    }
  );

  return res.data;
};