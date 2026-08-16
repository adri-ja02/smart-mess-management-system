import React, { useEffect, useState } from "react";
import {
  getWasteSummary,
  getWasteByMenu,
} from "../services/wasteService";

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

const FoodWaste = () => {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWasteData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, byMenuResponse] = await Promise.all([
        getWasteSummary(),
        getWasteByMenu(),
      ]);

      setSummary(summaryResponse);
      setItems(byMenuResponse.items || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load food waste data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWasteData();
  }, []);

  return (
    <div className="container py-4">
      <h2>Food Waste Monitor</h2>

      <p className="text-muted">
        Monitors meal consumption to identify potential food waste,
        and flags which specific menu items historically run high
        waste risk or low demand.
      </p>

      {loading && (
        <div className="alert alert-info">
          Loading food waste data...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Total Records</h6>
                <h3>{summary.totalRecords}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Collected</h6>
                <h3>{summary.collected}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Skipped</h6>
                <h3>{summary.skipped}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h6 className="text-muted">Overall Waste Rate</h6>
                <h3>
                  {summary.wasteRate}%{" "}
                  <span
                    className={`badge ${riskBadgeClass(
                      summary.riskLevel
                    )}`}
                    style={{ fontSize: "12px" }}
                  >
                    {summary.riskLevel.toUpperCase()}
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {summary.byMealType && (
            <div className="card shadow-sm p-4 mb-4">
              <h5 className="mb-3">Waste by Meal Type</h5>

              <div className="row">
                {Object.entries(summary.byMealType).map(
                  ([mealType, stats]) => (
                    <div className="col-md-4" key={mealType}>
                      <div className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-capitalize">
                            {mealType}
                          </strong>

                          <span
                            className={`badge ${riskBadgeClass(
                              stats.riskLevel
                            )}`}
                          >
                            {stats.riskLevel.toUpperCase()}
                          </span>
                        </div>

                        <div className="small text-muted">
                          Collected: {stats.collected} &middot; Late:{" "}
                          {stats.late} &middot; Skipped: {stats.skipped}
                        </div>

                        <div className="mt-1">
                          Waste rate: <strong>{stats.wasteRate}%</strong>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="card shadow-sm p-4">
            <h5 className="mb-3">
              Per-Menu Waste-Risk Breakdown
            </h5>

            <p className="text-muted">
              Sorted by waste rate, highest first &mdash; use this
              before deciding how much to buy or cook next time a
              similar item is on the menu.
            </p>

            {items.length === 0 && (
              <div className="alert alert-warning mb-0">
                No meal check-in records yet to build a breakdown from.
              </div>
            )}

            {items.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Meal Type</th>
                      <th>Menu</th>
                      <th>Confirmed</th>
                      <th>Collected</th>
                      <th>Late</th>
                      <th>Skipped</th>
                      <th>Waste Rate</th>
                      <th>Risk</th>
                      <th>Flags</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr key={item.mealMenuId}>
                        <td>
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="text-capitalize">
                          {item.mealType}
                        </td>

                        <td>{item.menu}</td>

                        <td>{item.confirmedDiners}</td>
                        <td>{item.collected}</td>
                        <td>{item.late}</td>
                        <td>{item.skipped}</td>

                        <td>{item.wasteRate}%</td>

                        <td>
                          <span
                            className={`badge ${riskBadgeClass(
                              item.riskLevel
                            )}`}
                          >
                            {item.riskLevel === "unknown"
                              ? "No data"
                              : item.riskLevel.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          {item.lowDemand && (
                            <span className="badge bg-info text-dark">
                              Low demand
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FoodWaste;
