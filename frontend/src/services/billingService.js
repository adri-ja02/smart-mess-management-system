import api from "../api";

// ===========================================================
// STUDENT - GENERATE BILL
// ===========================================================

export const generateMonthlyBill = async (
  month,
  year
) => {
  const response = await api.post(
    "/billing/generate",
    {
      month,
      year,
    }
  );

  return response.data;
};

// ===========================================================
// STUDENT - GET MY BILL
// ===========================================================

export const getMyBill = async (
  month,
  year
) => {
  const response = await api.get(
    `/billing/my-bill?month=${month}&year=${year}`
  );

  return response.data;
};

// ===========================================================
// MANAGER - BILLING OVERVIEW
// ===========================================================

export const getBillingOverview = async (
  month,
  year
) => {
  const response = await api.get(
    `/billing/overview?month=${month}&year=${year}`
  );

  return response.data;
};

// ===========================================================
// MANAGER - OVERDUE BILLS
// ===========================================================

export const getOverdueBills = async () => {
  const response = await api.get(
    "/billing/overdue"
  );

  return response.data;
};

// ===========================================================
// DEFAULT EXPORT
// ===========================================================

const billingService = {
  generateMonthlyBill,
  getMyBill,
  getBillingOverview,
  getOverdueBills,
};

export default billingService;