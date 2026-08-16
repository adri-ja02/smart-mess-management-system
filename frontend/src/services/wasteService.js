import api from "../api";

export const getWasteSummary = async () => {
  const response = await api.get(
    "/waste/summary"
  );

  return response.data;
};