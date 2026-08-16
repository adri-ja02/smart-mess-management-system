import React, { useEffect, useState } from "react";
import { getDemandForecast } from "../services/forecastService";

const DemandForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDemandForecast();

      setForecast(data);
    } catch (err) {
      console.error(err);

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
        historical consumption data.
      </p>

      {loading && (
        <div className="alert alert-info">
          Loading demand forecast...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && forecast && (
        <div className="card shadow-sm p-4">

          <h5 className="mb-4">
            Forecast Results
          </h5>

          <pre
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(
              forecast,
              null,
              2
            )}
          </pre>

        </div>
      )}

      {!loading && !error && !forecast && (
        <div className="alert alert-warning">
          No forecast data is available yet.
        </div>
      )}

    </div>
  );
};

export default DemandForecast;