import { useEffect, useState } from "react";

import {
  getWasteSummary,
} from "../services/wasteService";

const WasteCard = () => {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadWaste = async () => {
      try {
        const result =
          await getWasteSummary();

        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load waste information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadWaste();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          Loading food waste data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">

      <div className="card-body">

        <h4 className="card-title mb-3">
          Food Waste Monitor
        </h4>

        <div className="row">

          <div className="col-md-3">
            <strong>
              Total Records
            </strong>

            <h3>
              {data.totalRecords}
            </h3>
          </div>

          <div className="col-md-3">
            <strong>
              Collected
            </strong>

            <h3>
              {data.collected}
            </h3>
          </div>

          <div className="col-md-3">
            <strong>
              Skipped
            </strong>

            <h3>
              {data.skipped}
            </h3>
          </div>

          <div className="col-md-3">
            <strong>
              Waste Rate
            </strong>

            <h3>
              {data.wasteRate}%
            </h3>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WasteCard;