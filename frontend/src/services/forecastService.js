import api from "../api";

export const getDemandForecast = async () => {
  const response = await api.get(
    "/forecast"
  );

  return response.data;
};