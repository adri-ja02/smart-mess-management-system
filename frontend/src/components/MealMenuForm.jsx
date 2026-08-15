import { useState } from "react";
import { createMealMenu } from "../services/mealPlannerService";

const MealMenuForm = ({ onMenuCreated }) => {
  const [formData, setFormData] = useState({
    date: "",
    mealType: "breakfast",
    menu: "",
    price: "",
    dietaryNotes: "",
    cutoffTime: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const result = await createMealMenu(menuData);

      setMessage(result.message || "Meal menu published successfully");

      setFormData({
        date: "",
        mealType: "breakfast",
        menu: "",
        price: "",
        dietaryNotes: "",
        cutoffTime: "",
      });

      if (onMenuCreated) {
        onMenuCreated();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not publish the meal menu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h4 className="card-title mb-3">Publish Meal Menu</h4>

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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Menu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MealMenuForm;