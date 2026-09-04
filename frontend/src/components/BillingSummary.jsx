import { useEffect, useState } from "react";
import {
  generateMonthlyBill,
} from "../services/billingService";

import {
  initiatePayment,
} from "../services/sslcommerzService";

const BillingSummary = () => {
  const today = new Date();

  const [month, setMonth] = useState(
    today.getMonth() + 1
  );

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [bill, setBill] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadBill = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await generateMonthlyBill(
          month,
          year
        );

      setBill(result.bill);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load monthly bill"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBill();
  }, []);

  const handleGenerate = async () => {
    await loadBill();
  };

  const handlePayment = async () => {
    try {
      if (!bill) return;

      const result =
        await initiatePayment(
          bill._id
        );

      if (result.paymentUrl) {
        window.location.href =
          result.paymentUrl;
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start payment"
      );
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">

        <h4 className="card-title mb-4">
          Monthly Billing
        </h4>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="row mb-3">

          <div className="col-md-4">
            <label className="form-label">
              Month
            </label>

            <select
              className="form-select"
              value={month}
              onChange={(e) =>
                setMonth(
                  Number(e.target.value)
                )
              }
            >
              {Array.from(
                { length: 12 },
                (_, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {index + 1}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Year
            </label>

            <input
              type="number"
              className="form-control"
              value={year}
              onChange={(e) =>
                setYear(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Generate Bill"}
            </button>
          </div>

        </div>

        {bill && (
          <div className="mt-4">

            <div className="row">

              <div className="col-md-6">
                <p>
                  <strong>
                    Meal Charges:
                  </strong>{" "}
                  ৳{bill.mealCharges}
                </p>

                <p>
                  <strong>
                    Fixed Expenses:
                  </strong>{" "}
                  ৳{bill.fixedExpenses}
                </p>

                <p>
                  <strong>
                    Shared Expenses:
                  </strong>{" "}
                  ৳{bill.sharedExpenses}
                </p>
              </div>

              <div className="col-md-6">
                <h4>
                  Total: ৳
                  {bill.totalAmount}
                </h4>

                <p>
                  Status:{" "}
                  <strong>
                    {bill.status}
                  </strong>
                </p>
              </div>

            </div>

            {bill.status !== "paid" && (
              <button
                className="btn btn-success"
                onClick={handlePayment}
              >
                Pay with SSLCommerz
              </button>
            )}

            {bill.status === "paid" && (
              <div className="alert alert-success">
                Payment completed successfully.
                <br />

                Receipt:
                {" "}
                {bill.receiptNumber}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default BillingSummary;