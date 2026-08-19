import { useEffect, useState } from "react";
import {
  confirmMeal,
  cancelMeal,
  getExpectedDinerCount,
} from "../services/mealPlannerService";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const MealCard = ({
  meal,
  role,
  confirmed,
  mealToken,
  onMealStatusChanged,
  onEdit,
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
        const data = await getExpectedDinerCount(
          meal._id
        );

        setExpectedDiners(
          data.expectedDiners
        );
      } catch (err) {
        console.error(
          "Could not load expected diner count",
          err
        );
      }
    };

    loadExpectedDiners();
  }, [meal._id, role]);

  const handleConfirm = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      /*
        The backend checks whether the student has
        an approved reservation with an occupied bed.

        A token is created ONLY when that validation
        succeeds.
      */
      const result = await confirmMeal(
        meal._id
      );

      setMessage(
        result.message ||
          "Meal confirmed successfully"
      );

      if (result.mealToken?.tokenCode) {
        setNewTokenCode(
          result.mealToken.tokenCode
        );
      }

      if (onMealStatusChanged) {
        onMealStatusChanged(false);
      }
    } catch (err) {
      /*
        IMPORTANT:
        The backend sends the exact reason when the
        student does not have an occupied bed.

        Example:
        "Meal confirmation is only available
        to residents with an occupied bed."
      */
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
      const result = await cancelMeal(
        meal._id
      );

      setMessage(
        result.message ||
          "Meal cancelled successfully"
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
          {new Date(
            meal.date
          ).toLocaleDateString()}
        </p>

        <p className="mb-2">
          <strong>Menu:</strong>{" "}
          {meal.menu}
        </p>

        <p className="mb-2">
          <strong>Price:</strong>{" "}
          ৳{meal.price}
        </p>

        <p className="mb-2">
          <strong>Dietary Notes:</strong>{" "}
          {meal.dietaryNotes || "None"}
        </p>

        <p className="mb-2">
          <strong>Cut-off:</strong>{" "}
          {new Date(
            meal.cutoffTime
          ).toLocaleString()}
        </p>

        <p className="mb-3">
          <strong>
            Meal Check-in Window:
          </strong>{" "}
          {formatDateTime(
            meal.checkInStart
          )}{" "}
          &ndash;{" "}
          {formatDateTime(
            meal.checkInEnd
          )}
        </p>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="alert alert-success py-2">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger py-2">
            <strong>Meal confirmation failed:</strong>
            <div className="mt-1">
              {error}
            </div>
          </div>
        )}

        {/* MEAL TOKEN */}
        {role === "student" &&
          confirmed &&
          tokenCode && (
            <div className="alert alert-success">
              <strong>Meal Token:</strong>

              <div className="mt-1">
                <code>
                  {tokenCode}
                </code>
              </div>
            </div>
          )}

        {/* STUDENT ACTIONS */}
        {role === "student" && (
          <>
            {cutoffPassed ? (
              <div className="alert alert-secondary py-2 mb-0">
                Confirmation deadline has
                passed
              </div>
            ) : confirmed ? (
              <button
                className="btn btn-danger"
                onClick={
                  handleCancel
                }
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : "Cancel Meal"}
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={
                  handleConfirm
                }
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : "Confirm Meal"}
              </button>
            )}
          </>
        )}

        {/* MANAGER */}
        {role === "manager" && (
          <>
            <div className="alert alert-info">
              <strong>
                Expected Diners:
              </strong>{" "}
              {expectedDiners ===
              null
                ? "Loading..."
                : expectedDiners}
            </div>

            {onEdit && (
              <button
                type="button"
                className="btn btn-outline-primary mb-0"
                onClick={() =>
                  onEdit(meal)
                }
              >
                Edit Meal
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MealCard;