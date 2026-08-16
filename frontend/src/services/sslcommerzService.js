import api from "../api";

// Start SSLCommerz payment
export const initiatePayment = async (
  billId
) => {
  const response = await api.post(
    `/billing/pay/${billId}`
  );

  return response.data;
};

// Get current payment status (also carries overdue info)
export const getPaymentStatus = async (
  billId
) => {
  const response = await api.get(
    `/billing/payment-status/${billId}`
  );

  return response.data;
};
