
import api from "../api";

// NOTE: no changes needed here — no bugs found in this file.

// Resident or manager: check in by QR token code
export const scanQrCheckIn = async (tokenCode) => {
  const response = await api.post("/meal-records/checkin/qr", {
    tokenCode,
  });
  return response.data;
};

// Manager: manually check in a resident by their meal token id
export const manualCheckIn = async (mealTokenId, status) => {
  const response = await api.post("/meal-records/checkin/manual", {
    mealTokenId,
    status,
  });
  return response.data;
};

// Manager: sweep confirmed-but-unscanned tokens past the service
// window and mark them "skipped"
export const markSkippedMeals = async () => {
  const response = await api.post("/meal-records/mark-skipped");
  return response.data;
};

// Resident: view own meal consumption history
export const getMyMealHistory = async () => {
  const response = await api.get("/meal-records/my-history");
  return response.data;
};

// Manager: view a specific resident's meal history
export const getResidentMealHistory = async (residentId) => {
  const response = await api.get(`/meal-records/history/${residentId}`);
  return response.data;
};

// Manager: status grid (recorded + pending) for one meal menu.
// This is also reused by ManagerMealHistoryBrowser to show every
// resident's record for a given date + meal type, since a MealMenu
// document already uniquely identifies (date, mealType).
export const getMealStatusGrid = async (mealMenuId) => {
  const response = await api.get(`/meal-records/status/${mealMenuId}`);
  return response.data;
};

// Manager: override an existing record's status
export const updateMealStatus = async (recordId, status) => {
  const response = await api.patch(`/meal-records/${recordId}/status`, {
    status,
  });
  return response.data;
};

// Manager: monthly consumption summary (billing/forecasting input)
export const getMonthlySummary = async (year, month) => {
  const response = await api.get("/meal-records/summary", {
    params: { year, month },
  });
  return response.data;
};