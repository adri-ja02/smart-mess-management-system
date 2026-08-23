import React, {
  useEffect,
  useState,
} from "react";

import {
  getDemandForecast,
} from "../services/forecastService";

const riskBadgeClass = (riskLevel) => {
  switch (riskLevel) {
    case "high":
      return "bg-danger";

    case "medium":
      return "bg-warning text-dark";

    case "low":
      return "bg-success";

    default:
      return "bg-secondary";
  }
};

const DemandForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDemandForecast();

      setForecast(data.forecast || []);
    } catch (err) {
      console.error("FORECAST ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Could not load demand forecast."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const upcoming = forecast.filter(
    (item) => item.isUpcoming
  );

  const lowDemandCount = forecast.filter(
    (item) => item.lowDemand
  ).length;

  const highRiskCount = forecast.filter(
    (item) => item.wasteRiskLevel === "high"
  ).length;

  return (
    <div className="container py-4">

      {/* =====================================================
          HIGHLIGHTED HEADING
      ====================================================== */}
      <div
        className="mb-4 p-3 rounded-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #EAF4FF, #DCEBFA)",
          color: "#28324A",
          border: "1px solid #C9DDF2",
        }}
      >
        <h2 className="mb-1 fw-bold">
          Smart Demand Forecast
        </h2>

        <div
          style={{
            width: "70px",
            height: "4px",
            background: "#5B8DB8",
            borderRadius: "10px",
            marginTop: "8px",
          }}
        />
      </div>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}
      <p className="text-muted">
        Compares confirmed meal tokens against actual
        check-ins and recent attendance history to estimate
        how many meals to prepare next, and flags low-demand
        items and waste risk before purchasing or cooking.
      </p>

      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading && (
        <div className="alert alert-info">
          Loading demand forecast...
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="alert alert-danger">
          <strong>Forecast Error:</strong> {error}
        </div>
      )}

      {/* =====================================================
          FORECAST CONTENT
      ====================================================== */}
      {!loading &&
        !error &&
        forecast.length > 0 && (
          <>
            {/* =================================================
                SUMMARY CARDS
            ================================================== */}
            <div className="row mb-4">

              {/* Upcoming Meals */}
              <div className="col-md-4 mb-3">
                <div className="card p-3 text-center shadow-sm h-100">
                  <h6 className="text-muted">
                    Upcoming Meals
                  </h6>

                  <h3>
                    {upcoming.length}
                  </h3>
                </div>
              </div>

              {/* Low Demand */}
              <div className="col-md-4 mb-3">
                <div className="card p-3 text-center shadow-sm h-100">
                  <h6 className="text-muted">
                    Low-Demand Items
                  </h6>

                  <h3>
                    {lowDemandCount}
                  </h3>
                </div>
              </div>

              {/* High Waste Risk */}
              <div className="col-md-4 mb-3">
                <div className="card p-3 text-center shadow-sm h-100">
                  <h6 className="text-muted">
                    High Waste-Risk Items
                  </h6>

                  <h3>
                    {highRiskCount}
                  </h3>
                </div>
              </div>

            </div>

            {/* =================================================
                FORECAST RESULTS
            ================================================== */}
            <div className="card shadow-sm p-4">

              <h5 className="mb-4">
                Forecast Results
              </h5>

              <div className="table-responsive">

                <table className="table table-bordered table-hover align-middle">

                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Meal Type</th>
                      <th>Menu</th>
                      <th>Confirmed Tokens</th>
                      <th>Actual Check-ins</th>
                      <th>Estimated Meals</th>
                      <th>Recent Attendance Rate</th>
                      <th>Waste Risk</th>
                      <th>Flags</th>
                    </tr>
                  </thead>

                  <tbody>

                    {forecast.map((item) => (
                      <tr key={item.mealMenuId}>

                        {/* Date */}
                        <td>
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {/* Meal Type */}
                        <td className="text-capitalize">
                          {item.mealType || "N/A"}
                        </td>

                        {/* Menu */}
                        <td>
                          {item.menu || "N/A"}
                        </td>

                        {/* Confirmed Tokens */}
                        <td>
                          {item.confirmedDiners ?? 0}
                        </td>

                        {/* Actual Check-ins */}
                        <td>
                          {item.actualCheckIns !== null
                            ? item.actualCheckIns
                            : "—"}
                        </td>

                        {/* Estimated Meals */}
                        <td>
                          <strong>
                            {item.estimatedMeals ?? 0}
                          </strong>
                        </td>

                        {/* Attendance Rate */}
                        <td>
                          {item.recentAttendanceRate !== null
                            ? `${item.recentAttendanceRate}%`
                            : "No history"}
                        </td>

                        {/* Waste Risk */}
                        <td>
                          <span
                            className={`badge ${riskBadgeClass(
                              item.wasteRiskLevel
                            )}`}
                          >
                            {item.wasteRiskLevel ===
                            "unknown"
                              ? "No history"
                              : item.wasteRiskLevel.toUpperCase()}
                          </span>
                        </td>

                        {/* Flags */}
                        <td>

                          {item.lowDemand && (
                            <span className="badge bg-info text-dark me-1">
                              Low demand
                            </span>
                          )}

                          {item.isUpcoming && (
                            <span className="badge bg-primary">
                              Upcoming
                            </span>
                          )}

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          </>
        )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {!loading &&
        !error &&
        forecast.length === 0 && (
          <div className="alert alert-warning">
            No forecast data is available yet.

            <br />

            <small>
              Make sure there are published meal menus
              and confirmed meal tokens.
            </small>
          </div>
        )}

    </div>
  );
};

export default DemandForecast;
