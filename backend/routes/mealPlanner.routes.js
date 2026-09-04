const express = require("express");

const {
  createMealMenu,
  updateMealMenu,
  getMealMenus,
  confirmMeal,
  cancelMeal,
  getMyMealTokens,
  getExpectedDinerCount,
} = require("../controllers/mealPlanner.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All meal planner routes require login
router.use(protect);

// Manager: publish a new menu
router.post("/menus", createMealMenu);

// Manager: edit an existing menu (including the check-in window)
router.patch("/menus/:mealMenuId", updateMealMenu);

// Student/Manager: view published menus
router.get("/menus", getMealMenus);

// Student: view own meal tokens
router.get("/my-tokens", getMyMealTokens);

// Student: confirm a meal
router.post("/menus/:mealMenuId/confirm", confirmMeal);

// Student: cancel a confirmed meal
router.patch("/menus/:mealMenuId/cancel", cancelMeal);

// Manager: view expected diner count
router.get(
  "/menus/:mealMenuId/expected-diners",
  getExpectedDinerCount
);

module.exports = router;