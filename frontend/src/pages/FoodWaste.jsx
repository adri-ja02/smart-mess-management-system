import React, { useEffect, useState } from "react";
import { getWasteSummary } from "../services/wasteService";

const FoodWaste = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWasteData = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getWasteSummary();

      setData(response);
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

      <h2>
        Food Waste Monitor
      </h2>

      <p className="text-muted">
        Monitor meal consumption and identify
        potential food waste.
      </p>

      {loading && (
        <div className="alert alert-info">
          Loading food waste data...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="card shadow-sm p-4">

          <h5 className="mb-4">
            Waste Summary
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
              data,
              null,
              2
            )}
          </pre>

        </div>
      )}

      {!loading && !error && !data && (
        <div className="alert alert-warning">
          No food waste data is available yet.
        </div>
      )}

    </div>
  );
};

export default FoodWaste;