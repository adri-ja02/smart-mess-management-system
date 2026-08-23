import { useCallback, useEffect, useState } from "react";

import MealMenuForm from "../components/MealMenuForm";
import MealCard from "../components/MealCard";

import {
  getMealMenus,
  getMyMealTokens,
} from "../services/mealPlannerService";

const getMonday = (date) => {
  const currentDate = new Date(date);
  const day = currentDate.getDay();

  const difference =
    currentDate.getDate() -
    day +
    (day === 0 ? -6 : 1);

  const monday = new Date(currentDate);

  monday.setDate(difference);
  monday.setHours(0, 0, 0, 0);

  return monday;
};

const MealPlanner = () => {
  const [menus, setMenus] = useState([]);
  const [mealTokens, setMealTokens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingMeal, setEditingMeal] = useState(null);

  const [weekStart, setWeekStart] = useState(
    getMonday(new Date())
  );

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user")
    );
  } catch (err) {
    user = null;
  }

  const role = user?.role;

  /* =========================================================
     LOAD MEAL PLANNER DATA
     ========================================================= */

  const loadMealPlannerData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const menuData =
          await getMealMenus();

        setMenus(menuData);

        if (role === "student") {
          const tokenData =
            await getMyMealTokens();

          setMealTokens(tokenData);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load meal planner data"
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [role]
  );

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadMealPlannerData();
  }, [loadMealPlannerData]);

  /* =========================================================
     MEAL TOKEN HELPERS
     ========================================================= */

  const getMealToken = (mealMenuId) => {
    return mealTokens.find((token) => {
      const tokenMealId =
        typeof token.mealMenu === "object"
          ? token.mealMenu?._id
          : token.mealMenu;

      return tokenMealId === mealMenuId;
    });
  };

  const isMealConfirmed = (mealMenuId) => {
    const token =
      getMealToken(mealMenuId);

    return token?.status === "confirmed";
  };

  /* =========================================================
     WEEK RANGE
     ========================================================= */

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(
    weekEnd.getDate() + 6
  );

  weekEnd.setHours(
    23,
    59,
    59,
    999
  );

  /* =========================================================
     MEAL TYPE ORDER
     ========================================================= */

  const mealTypeOrder = {
    breakfast: 1,
    lunch: 2,
    dinner: 3,
  };

  /* =========================================================
     WEEKLY MENUS
     ========================================================= */

  const weeklyMenus = menus
    .filter((meal) => {
      const mealDate =
        new Date(meal.date);

      return (
        mealDate >= weekStart &&
        mealDate <= weekEnd
      );
    })
    .sort(
      (firstMeal, secondMeal) => {
        const firstDate =
          new Date(firstMeal.date);

        const secondDate =
          new Date(secondMeal.date);

        if (
          firstDate.getTime() !==
          secondDate.getTime()
        ) {
          return firstDate - secondDate;
        }

        return (
          mealTypeOrder[
            firstMeal.mealType
          ] -
          mealTypeOrder[
            secondMeal.mealType
          ]
        );
      }
    );

  /* =========================================================
     WEEK NAVIGATION
     ========================================================= */

  const goToPreviousWeek = () => {
    const previousWeek =
      new Date(weekStart);

    previousWeek.setDate(
      previousWeek.getDate() - 7
    );

    setWeekStart(previousWeek);
  };

  const goToNextWeek = () => {
    const nextWeek =
      new Date(weekStart);

    nextWeek.setDate(
      nextWeek.getDate() + 7
    );

    setWeekStart(nextWeek);
  };

  const goToCurrentWeek = () => {
    setWeekStart(
      getMonday(new Date())
    );
  };

  /* =========================================================
     EDITING
     ========================================================= */

  const handleEditRequested = (
    meal
  ) => {
    setEditingMeal(meal);
  };

  const handleMenuUpdated = () => {
    setEditingMeal(null);
    loadMealPlannerData();
  };

  const handleCancelEdit = () => {
    setEditingMeal(null);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="container py-4">

      {/* =================================================
          HEADER
          ================================================= */}

      <div
        className="mb-4 p-3"
        style={{
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, #ecfeff, #f0f9ff)",
          border: "1px solid #a5f3fc",
          boxShadow:
            "0 3px 10px rgba(14, 165, 233, 0.08)",
        }}
      >
        <div>
          <h2
            className="mb-1 fw-bold"
            style={{
              color: "#0e7490",
            }}
          >
            Weekly Menu & Meal Token Planner
          </h2>

          <p className="text-muted mb-0">
            View weekly meal menus and manage
            meal confirmations.
          </p>
        </div>
      </div>

      {/* =================================================
          MANAGER MENU FORM
          ================================================= */}

      {role === "manager" && (
        <MealMenuForm
          onMenuCreated={
            loadMealPlannerData
          }
          editingMeal={editingMeal}
          onMenuUpdated={
            handleMenuUpdated
          }
          onCancelEdit={
            handleCancelEdit
          }
        />
      )}

      {/* =================================================
          WEEK SELECTOR
          ================================================= */}

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">

            <button
              className="btn btn-outline-secondary"
              onClick={
                goToPreviousWeek
              }
            >
              Previous Week
            </button>

            <div className="text-center">
              <h5 className="mb-1">
                Selected Week
              </h5>

              <span className="text-muted">
                {weekStart.toLocaleDateString()}{" "}
                -{" "}
                {weekEnd.toLocaleDateString()}
              </span>
            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={
                goToNextWeek
              }
            >
              Next Week
            </button>

          </div>

          <div className="text-center mt-3">

            <button
              className="btn btn-sm"
              onClick={
                goToCurrentWeek
              }
              style={{
                borderRadius: "9px",
                fontWeight: 600,
                color: "#0369a1",
                border:
                  "1px solid #7dd3fc",
                background: "#f0f9ff",
              }}
            >
              Current Week
            </button>

          </div>

        </div>
      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =================================================
          LOADING / CONTENT
          ================================================= */}

      {loading ? (
        <div className="text-center py-4">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

        </div>
      ) : weeklyMenus.length === 0 ? (

        <div className="alert alert-info">
          No meal menus have been published
          for this week.
        </div>

      ) : (

        <div className="row g-4">

          {weeklyMenus.map((meal) => {
            const mealToken =
              getMealToken(meal._id);

            return (
              <div
                className="col-md-6 col-lg-4"
                key={meal._id}
              >
                <MealCard
                  meal={meal}
                  role={role}
                  confirmed={
                    isMealConfirmed(
                      meal._id
                    )
                  }
                  mealToken={
                    mealToken
                  }
                  onMealStatusChanged={
                    loadMealPlannerData
                  }
                  onEdit={
                    role === "manager"
                      ? handleEditRequested
                      : undefined
                  }
                />
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default MealPlanner;