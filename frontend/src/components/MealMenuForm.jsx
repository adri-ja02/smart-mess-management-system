import { useEffect, useState } from "react";
import {
  createMealMenu,
  updateMealMenu,
} from "../services/mealPlannerService";

const emptyForm = {
  date: "",
  mealType: "breakfast",
  menu: "",
  price: "",
  dietaryNotes: "",
  cutoffTime: "",
  checkInStart: "",
  checkInEnd: "",
};

// Converts an ISO date string to the value a <input type="date">
// expects (yyyy-MM-dd), in local time.
const toDateInputValue = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

// Converts an ISO date string to the value a <input type="datetime-local">
// expects (yyyy-MM-ddTHH:mm), in local time.
const toDateTimeInputValue = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// editingMeal: when set, the form switches to edit mode for that meal menu.
// onMenuCreated: called after a successful publish (create mode).
// onMenuUpdated: called after a successful edit (edit mode).
// onCancelEdit: called when the manager cancels an in-progress edit.
const MealMenuForm = ({
  onMenuCreated,
  editingMeal,
  onMenuUpdated,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(editingMeal);

  useEffect(() => {
    if (editingMeal) {
      setFormData({
        date: toDateInputValue(editingMeal.date),
        mealType: editingMeal.mealType,
        menu: editingMeal.menu,
        price: editingMeal.price,
        dietaryNotes: editingMeal.dietaryNotes || "",
        cutoffTime: toDateTimeInputValue(editingMeal.cutoffTime),
        checkInStart: toDateTimeInputValue(editingMeal.checkInStart),
        checkInEnd: toDateTimeInputValue(editingMeal.checkInEnd),
      });
      setMessage("");
      setError("");
    } else {
      setFormData(emptyForm);
    }
  }, [editingMeal]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const menuData = {
        ...formData,
        price: Number(formData.price),
      };

      if (isEditing) {
        const result = await updateMealMenu(editingMeal._id, menuData);

        setMessage(result.message || "Meal menu updated successfully");

        if (onMenuUpdated) {
          onMenuUpdated();
        }
      } else {
        const result = await createMealMenu(menuData);

        setMessage(result.message || "Meal menu published successfully");

        setFormData(emptyForm);

        if (onMenuCreated) {
          onMenuCreated();
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEditing
            ? "Could not update the meal menu"
            : "Could not publish the meal menu")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(emptyForm);
    setMessage("");
    setError("");

    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h4 className="card-title mb-3">
          {isEditing ? "Edit Meal Menu" : "Publish Meal Menu"}
        </h4>

        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Meal Date</label>

            <input
              type="date"
              className="form-control"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Meal Type</label>

            <select
              className="form-select"
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Menu</label>

            <textarea
              className="form-control"
              name="menu"
              rows="3"
              placeholder="Example: Rice, chicken curry, vegetables"
              value={formData.menu}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>

            <input
              type="number"
              className="form-control"
              name="price"
              min="0"
              step="0.01"
              placeholder="Enter meal price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Dietary Notes
            </label>

            <input
              type="text"
              className="form-control"
              name="dietaryNotes"
              placeholder="Example: Vegetarian option available"
              value={formData.dietaryNotes}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Confirmation Cut-off Time
            </label>

            <input
              type="datetime-local"
              className="form-control"
              name="cutoffTime"
              value={formData.cutoffTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Meal Check-in Start
              </label>

              <input
                type="datetime-local"
                className="form-control"
                name="checkInStart"
                value={formData.checkInStart}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Meal Check-in End
              </label>

              <input
                type="datetime-local"
                className="form-control"
                name="checkInEnd"
                value={formData.checkInEnd}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-text mb-3">
            Students checking in inside this window are marked
            "Collected." Check-ins after the end time are marked
            "Late." Confirmed meals with no check-in at all can be
            swept to "Skipped" once the window closes.
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Publishing..."
                : isEditing
                ? "Save Changes"
                : "Publish Menu"}
            </button>

            {isEditing && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealMenuForm;
