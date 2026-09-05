import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/admin`;

/* =========================
   AUTH HEADER
========================= */
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async () => {
  const res = await axios.get(`${API}/users`, authHeader());
  return res.data;
};

/* =========================
   GET PENDING MANAGERS
========================= */
export const getPendingManagers = async () => {
  const res = await axios.get(`${API}/pending-managers`, authHeader());
  return res.data;
};

/* =========================
   APPROVE MANAGER
========================= */
export const approveManager = async (id) => {
  const res = await axios.put(
    `${API}/approve/${id}`,
    {},
    authHeader()
  );

  return res.data;
};

/* =========================
   REJECT MANAGER
========================= */
export const rejectManager = async (id) => {
  const res = await axios.put(
    `${API}/reject/${id}`,
    {},
    authHeader()
  );

  return res.data;
};

/* =========================
   BLOCK USER
========================= */
export const blockUser = async (id) => {
  const res = await axios.put(
    `${API}/block/${id}`,
    {},
    authHeader()
  );

  return res.data;
};

/* =========================
   UNBLOCK USER
========================= */
export const unblockUser = async (id) => {
  const res = await axios.put(
    `${API}/unblock/${id}`,
    {},
    authHeader()
  );

  return res.data;
};