import React, { useEffect, useState } from "react";
import { getDemandForecast } from "../services/forecastService";

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

  const upcoming = forecast.filter((item) => item.isUpcoming);
  const lowDemandCount = forecast.filter((item) => item.lowDemand).length;
  const highRiskCount = forecast.filter(
    (item) => item.wasteRiskLevel === "high"
  ).length;

  return (
    <div className="container py-4">
      <h2>Smart Demand Forecast</h2>

      <p className="text-muted">
        Compares confirmed meal tokens against actual check-ins and
        recent attendance history to estimate how many meals to
        prepare next, and flags low-demand items and waste risk
        before purchasing or cooking.
      </p>

      {loading && (
        <div className="alert alert-info">
          Loading demand forecast...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <strong>Forecast Error:</strong> {error}
        </div>
      )}

      {!loading && !error && forecast.length > 0 && (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Upcoming Meals</h6>
                <h3>{upcoming.length}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Low-Demand Items</h6>
                <h3>{lowDemandCount}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 text-center">
                <h6 className="text-muted">High Waste-Risk Items</h6>
                <h3>{highRiskCount}</h3>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-4">
            <h5 className="mb-4">Forecast Results</h5>

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
                      <td>
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="text-capitalize">
                        {item.mealType || "N/A"}
                      </td>

                      <td>{item.menu || "N/A"}</td>

                      <td>{item.confirmedDiners ?? 0}</td>

                      <td>
                        {item.actualCheckIns !== null
                          ? item.actualCheckIns
                          : "\u2014"}
                      </td>

                      <td>
                        <strong>{item.estimatedMeals ?? 0}</strong>
                      </td>

                      <td>
                        {item.recentAttendanceRate !== null
                          ? `${item.recentAttendanceRate}%`
                          : "No history"}
                      </td>

                      <td>
                        <span
                          className={`badge ${riskBadgeClass(
                            item.wasteRiskLevel
                          )}`}
                        >
                          {item.wasteRiskLevel === "unknown"
                            ? "No history"
                            : item.wasteRiskLevel.toUpperCase()}
                        </span>
                      </td>

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

      {!loading && !error && forecast.length === 0 && (
        <div className="alert alert-warning">
          No forecast data is available yet.
          <br />
          <small>
            Make sure there are published meal menus and confirmed
            meal tokens.
          </small>
        </div>
      )}
    </div>
  );
};

export default DemandForecast;
