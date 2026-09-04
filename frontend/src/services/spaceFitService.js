import api from "../api";


// Submit student preferences and get SpaceFit matches
export const getSpaceFitMatches = async (preferences) => {
  const response = await api.post(
    "/spacefit",
    preferences
  );

  return response.data || { matches: [] };
};