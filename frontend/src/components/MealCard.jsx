import { useEffect, useState } from "react";
import {
  confirmMeal,
  cancelMeal,
  getExpectedDinerCount,
} from "../services/mealPlannerService";

const MealCard = ({
  meal,
  role,
  confirmed,
  mealToken,
  onMealStatusChanged,
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expectedDiners, setExpectedDiners] = useState(null);
  const [newTokenCode, setNewTokenCode] = useState("");

  const cutoffPassed =
    new Date() >= new Date(meal.cutoffTime);

  const tokenCode =
    mealToken?.tokenCode || newTokenCode;

  useEffect(() => {
    const loadExpectedDiners = async () => {
      if (role !== "manager") {
        return;
      }

      try {
        const data = await getExpectedDinerCount(meal._id);
        setExpectedDiners(data.expectedDiners);
      } catch (err) {
        console.error("Could not load expected diner count", err);
      }
    };

    loadExpectedDiners();
  }, [meal._id, role]);

  const handleConfirm = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await confirmMeal(meal._id);

      setMessage(
        result.message || "Meal confirmed successfully"
      );

      if (result.mealToken?.tokenCode) {
        setNewTokenCode(result.mealToken.tokenCode);
      }

      if (onMealStatusChanged) {
        onMealStatusChanged(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not confirm meal"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await cancelMeal(meal._id);

      setMessage(
        result.message || "Meal cancelled successfully"
      );

      setNewTokenCode("");

      if (onMealStatusChanged) {
        onMealStatusChanged(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not cancel meal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title text-capitalize">
          {meal.mealType}
        </h5>

        <p className="mb-2">
          <strong>Date:</strong>{" "}
          {new Date(meal.date).toLocaleDateString()}
        </p>

        <p className="mb-2">
          <strong>Menu:</strong> {meal.menu}
        </p>

        <p className="mb-2">
          <strong>Price:</strong> ৳{meal.price}
        </p>

        <p className="mb-2">
          <strong>Dietary Notes:</strong>{" "}
          {meal.dietaryNotes || "None"}
        </p>

        <p className="mb-3">
          <strong>Cut-off:</strong>{" "}
          {new Date(meal.cutoffTime).toLocaleString()}
        </p>

        {message && (
          <div className="alert alert-success py-2">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2">
            {error}
          </div>
        )}

        {role === "student" && confirmed && tokenCode && (
          <div className="alert alert-success">
            <strong>Meal Token:</strong>

            <div className="mt-1">
              <code>{tokenCode}</code>
            </div>
          </div>
        )}

        {role === "student" && (
          <>
            {cutoffPassed ? (
              <div className="alert alert-secondary py-2 mb-0">
                Confirmation deadline has passed
              </div>
            ) : confirmed ? (
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Cancel Meal"}
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Confirm Meal"}
              </button>
            )}
          </>
        )}

        {role === "manager" && (
          <div className="alert alert-info mb-0">
            <strong>Expected Diners:</strong>{" "}
            {expectedDiners === null
              ? "Loading..."
              : expectedDiners}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;