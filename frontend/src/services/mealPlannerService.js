import api from "../api";

// Get all published meal menus
export const getMealMenus = async () => {
  const response = await api.get("/meal-planner/menus");
  return response.data;
};

// Manager: publish a new meal menu
export const createMealMenu = async (menuData) => {
  const response = await api.post("/meal-planner/menus", menuData);
  return response.data;
};

// Student: confirm a meal
export const confirmMeal = async (mealMenuId) => {
  const response = await api.post(
    `/meal-planner/menus/${mealMenuId}/confirm`
  );

  return response.data;
};

// Student: cancel a meal
export const cancelMeal = async (mealMenuId) => {
  const response = await api.patch(
    `/meal-planner/menus/${mealMenuId}/cancel`
  );

  return response.data;
};

// Student: view own meal tokens
export const getMyMealTokens = async () => {
  const response = await api.get("/meal-planner/my-tokens");
  return response.data;
};

// Manager: get expected diner count for a meal
export const getExpectedDinerCount = async (mealMenuId) => {
  const response = await api.get(
    `/meal-planner/menus/${mealMenuId}/expected-diners`
  );

  return response.data;
};