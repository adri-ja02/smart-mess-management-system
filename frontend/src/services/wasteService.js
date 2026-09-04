import api from "../api";

// ===========================================================
// OVERALL WASTE SUMMARY (all-time + per-meal-type breakdown)
// ===========================================================

export const getWasteSummary = async () => {
  const response = await api.get(
    "/waste/summary"
  );

  return response.data;
};

// ===========================================================
// PER-MENU / PER-ITEM WASTE-RISK BREAKDOWN
// Used to flag low-demand items and high-waste-risk items
// before the next purchase or cook.
// ===========================================================

export const getWasteByMenu = async (limit) => {
  const response = await api.get(
    `/waste/by-menu${limit ? `?limit=${limit}` : ""}`
  );

  return response.data;
};

const wasteService = {
  getWasteSummary,
  getWasteByMenu,
};

export default wasteService;