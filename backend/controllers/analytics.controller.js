// Demand Forecast
const getDemandForecast = async (req, res) => {
  res.status(200).json({
    success: true,
    feature: "Smart Demand Forecast",
    predictedMeals: 120,
    expectedStudents: 118,
    confidence: "94%",
    date: "2026-07-20"
  });
};

// Food Waste Monitor
const getFoodWaste = async (req, res) => {
  res.status(200).json({
    success: true,
    feature: "Food Waste Monitor",
    totalMealsServed: 120,
    mealsConsumed: 110,
    mealsWasted: 10,
    wastePercentage: "8.3%"
  });
};

// Billing Summary
const getBillingSummary = async (req, res) => {
  res.status(200).json({
    success: true,
    feature: "SSLCommerz Billing",
    studentName: "Demo Student",
    totalBill: 5000,
    paid: 3000,
    due: 2000,
    paymentStatus: "Partial"
  });
};

module.exports = {
  getDemandForecast,
  getFoodWaste,
  getBillingSummary,
};