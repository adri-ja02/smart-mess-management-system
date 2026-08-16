import React, { useEffect, useState } from "react";
import { getDemandForecast } from "../services/forecastService";

const DemandForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Calling demand forecast API...");

      const data = await getDemandForecast();

      console.log("FORECAST API RESPONSE:", data);

      // Backend returns:
      // {
      //   message: "...",
      //   forecast: [...]
      // }

      setForecast(data.forecast || []);
    } catch (err) {
      console.error("FORECAST ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("RESPONSE:", err.response?.data);

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

  return (
    <div className="container py-4">

      <h2>
        Smart Demand Forecast
      </h2>

      <p className="text-muted">
        Predict expected meal demand using
        confirmed meal reservations.
      </p>

      {/* LOADING */}

      {loading && (
        <div className="alert alert-info">
          Loading demand forecast...
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          <strong>Forecast Error:</strong>{" "}
          {error}
        </div>
      )}

      {/* RESULTS */}

      {!loading && !error && forecast.length > 0 && (
        <div className="card shadow-sm p-4">

          <h5 className="mb-4">
            Forecast Results
          </h5>

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-light">

                <tr>
                  <th>Date</th>
                  <th>Meal Type</th>
                  <th>Menu</th>
                  <th>Expected Diners</th>
                  <th>Estimated Meals</th>
                </tr>

              </thead>

              <tbody>

                {forecast.map((item, index) => (

                  <tr key={item.mealMenuId || index}>

                    <td>
                      {item.date
                        ? new Date(
                            item.date
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      {item.mealType || "N/A"}
                    </td>

                    <td>
                      {item.menu || "N/A"}
                    </td>

                    <td>
                      {item.expectedDiners ?? 0}
                    </td>

                    <td>
                      {item.estimatedMeals ?? 0}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* NO DATA */}

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