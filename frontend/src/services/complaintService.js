import api from "../api";

/* ================= FEATURE 1: SUBMIT ================= */

// Upload evidence files first, get back Cloudinary urls, then
// pass those urls into submitComplaint(). Works with or without
// a login, so it also doubles as the follow-up upload endpoint.
export const uploadEvidence = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("evidence", file));

  const response = await api.post("/complaints/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; // { success, evidence: [{url, public_id, type}] }
};

// Requires login (api.js attaches the JWT automatically) — the
// login is only ever used to write the identity vault, never
// shown to the manager.
export const submitComplaint = async (complaintData) => {
  const response = await api.post("/complaints", complaintData);
  return response.data; // { success, ticketNumber, token }
};

/* ================= FEATURE 2: TOKEN-BASED FOLLOW-UP ================= */

export const trackComplaint = async (token) => {
  console.log("Sending token:", token);

  const response = await api.post(
    "/complaints/track",
    {
      token: token.trim()
    }
  );

  console.log("Track response:", response.data);

  return response.data;
};

export const addFollowUp = async (token, note, evidence = []) => {
  const response = await api.post("/complaints/follow-up", {
    token,
    note,
    evidence,
  });
  return response.data;
};

export const answerReviewQuestion = async (token, questionId, answer) => {
  const response = await api.post("/complaints/answer", {
    token,
    questionId,
    answer,
  });
  return response.data;
};

/* ================= MANAGER / ADMIN ================= */

export const getComplaintsForManager = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/complaints${params ? `?${params}` : ""}`);
  return response.data;
};

export const getComplaintByIdForManager = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const askReviewQuestion = async (id, question) => {
  const response = await api.post(`/complaints/${id}/question`, { question });
  return response.data;
};

export const updateComplaintStatus = async (id, status, note) => {
  const response = await api.put(`/complaints/${id}/status`, { status, note });
  return response.data;
};

export const assignComplaint = async (
  id,
  workerType,
  workerName
) => {
  const response = await api.put(
    `/complaints/${id}/assign`,
    {
      workerType,
      workerName,
    }
  );

  return response.data;
};

// MODULE 3 FUNCTIONS HERE
export const submitReviewDecision = async (id, decisionData) => {
  const response = await api.put(
    `/complaints/${id}/review`,
    decisionData
  );

  return response.data;
};


export const requestSiteInspection = async (id) => {
  const response = await api.put(
    `/complaints/${id}/inspection`,
    {}
  );

  return response.data;
};




