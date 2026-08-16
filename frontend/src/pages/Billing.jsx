import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  generateMonthlyBill,
  getBillingOverview,
  getMyBill,
} from "../services/billingService";

import {
  initiatePayment,
  getPaymentStatus,
} from "../services/sslcommerzService";

const Billing = () => {
  const { user } = useAuth();

  const today = new Date();

  const [month, setMonth] = useState(
    today.getMonth() + 1
  );

  const [year, setYear] = useState(
    today.getFullYear()
  );

  // Student bill
  const [bill, setBill] = useState(null);

  // Manager data
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paying, setPaying] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // STUDENT - LOAD BILL
  // =========================================================

  const loadBill = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await getMyBill(
        month,
        year
      );

      setBill(data);
    } catch (err) {
      setBill(null);

      if (err.response?.status === 404) {
        setError(
          "No bill has been generated for this month yet."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Could not load bill."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MANAGER - LOAD BILLING OVERVIEW
  // =========================================================

  const loadManagerBilling = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data =
        await getBillingOverview(
          month,
          year
        );

      setStudents(
        data.students || []
      );

      setSummary(
        data.summary || null
      );
    } catch (err) {
      console.error(
        "Manager billing error:",
        err
      );

      setStudents([]);
      setSummary(null);

      setError(
        err.response?.data?.message ||
          "Could not load billing overview."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "manager") {
      loadManagerBilling();
    } else {
      loadBill();
    }
  }, [month, year, user]);

  // =========================================================
  // STUDENT - GENERATE BILL
  // =========================================================

  const handleGenerateBill = async () => {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const response =
        await generateMonthlyBill(
          month,
          year
        );

      setBill(response.bill);

      setMessage(
        "Monthly bill generated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not generate monthly bill."
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // STUDENT - PAYMENT
  // =========================================================

  const handlePayment = async () => {
    if (!bill?._id) {
      setError("Bill ID is missing.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const response =
        await initiatePayment(
          bill._id
        );

      if (response.paymentUrl) {
        window.location.href =
          response.paymentUrl;
      } else {
        setError(
          "Payment URL was not returned."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start payment."
      );
    } finally {
      setPaying(false);
    }
  };

  // =========================================================
  // STUDENT - CHECK PAYMENT
  // =========================================================

  const checkPaymentStatus =
    async () => {
      if (!bill?._id) return;

      try {
        const response =
          await getPaymentStatus(
            bill._id
          );

        setBill((previous) => ({
          ...previous,

          status:
            response.status,

          paymentId:
            response.paymentId,

          paidAt:
            response.paidAt,

          receiptNumber:
            response.receiptNumber,
        }));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not check payment status."
        );
      }
    };

  // =========================================================
  // MONTH SELECTOR
  // =========================================================

  const monthOptions = [
    [1, "January"],
    [2, "February"],
    [3, "March"],
    [4, "April"],
    [5, "May"],
    [6, "June"],
    [7, "July"],
    [8, "August"],
    [9, "September"],
    [10, "October"],
    [11, "November"],
    [12, "December"],
  ];

  // =========================================================
  // COMMON MONTH/YEAR SELECTOR
  // =========================================================

  const renderMonthSelector = () => (
    <div className="card p-4 mb-4">
      <h5>Select Billing Month</h5>

      <div className="row mt-3">

        <div className="col-md-6">
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
            {monthOptions.map(
              ([value, name]) => (
                <option
                  key={value}
                  value={value}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="col-md-6">
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

      </div>
    </div>
  );

  // =========================================================
  // MANAGER VIEW
  // =========================================================

  if (user?.role === "manager") {
    return (
      <div className="container py-4">

        <h2 className="mb-2">
          Billing Overview
        </h2>

        <p className="text-muted">
          View student meal confirmations
          and payment status.
        </p>

        {renderMonthSelector()}

        {loading && (
          <div className="alert alert-info">
            Loading billing overview...
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {summary && (
          <div className="row mb-4">

            <div className="col-md-3">
              <div className="card p-3">
                <h6>
                  Total Students
                </h6>

                <h3>
                  {summary.totalStudents}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3">
                <h6>
                  Confirmed Meals
                </h6>

                <h3>
                  {
                    summary.confirmedMealStudents
                  }
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3">
                <h6>
                  Paid
                </h6>

                <h3>
                  {summary.paidStudents}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3">
                <h6>
                  Unpaid
                </h6>

                <h3>
                  {summary.unpaidStudents}
                </h3>
              </div>
            </div>

          </div>
        )}

        {students.length > 0 && (
          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="mb-3">
                Student Billing Status
              </h5>

              <div className="table-responsive">

                <table className="table table-bordered table-hover">

                  <thead>
                    <tr>
                      <th>
                        Student
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Confirmed Meals
                      </th>

                      <th>
                        Meal Charges
                      </th>

                      <th>
                        Total Bill
                      </th>

                      <th>
                        Payment Status
                      </th>

                      <th>
                        Receipt
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {students.map(
                      (student) => (
                        <tr
                          key={
                            student.studentId
                          }
                        >

                          <td>
                            {student.name}
                          </td>

                          <td>
                            {student.email}
                          </td>

                          <td>
                            {
                              student.confirmedMeals
                            }
                          </td>

                          <td>
                            ৳{" "}
                            {Number(
                              student.mealCharges ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td>
                            ৳{" "}
                            {Number(
                              student.totalAmount ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td>

                            {student.status ===
                            "paid" ? (
                              <span className="badge bg-success">
                                PAID
                              </span>
                            ) : student.status ===
                              "not-generated" ? (
                              <span className="badge bg-secondary">
                                BILL NOT GENERATED
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                UNPAID
                              </span>
                            )}

                          </td>

                          <td>
                            {student.receiptNumber ||
                              "-"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {!loading &&
          students.length === 0 &&
          !error && (
            <div className="alert alert-info">
              No student billing records
              found for this month.
            </div>
          )}

      </div>
    );
  }

  // =========================================================
  // STUDENT VIEW
  // =========================================================

  return (
    <div className="container py-4">

      <h2 className="mb-2">
        Monthly Billing
      </h2>

      <p className="text-muted">
        View your monthly mess bill
        and make payments.
      </p>

      {renderMonthSelector()}

      <button
        className="btn btn-primary mb-4"
        onClick={handleGenerateBill}
        disabled={generating}
      >
        {generating
          ? "Generating..."
          : "Generate Monthly Bill"}
      </button>

      {loading && (
        <div className="alert alert-info">
          Loading bill...
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {bill && (
        <div
          className="card shadow-sm p-4"
          style={{
            maxWidth: "800px",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h4>
                Monthly Mess Bill
              </h4>

              <p className="text-muted mb-0">
                {month}/{year}
              </p>
            </div>

            <span
              className={`badge ${
                bill.status === "paid"
                  ? "bg-success"
                  : "bg-warning text-dark"
              }`}
              style={{
                fontSize: "14px",
              }}
            >
              {bill.status ||
                "unpaid"}
            </span>

          </div>

          <hr />

          <div className="d-flex justify-content-between mb-3">
            <span>
              Meal Charges
            </span>

            <strong>
              ৳{" "}
              {Number(
                bill.mealCharges || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <span>
              Fixed Expenses
            </span>

            <strong>
              ৳{" "}
              {Number(
                bill.fixedExpenses || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <span>
              Shared Expenses
            </span>

            <strong>
              ৳{" "}
              {Number(
                bill.sharedExpenses || 0
              ).toFixed(2)}
            </strong>
          </div>

          <hr />

          <div className="d-flex justify-content-between">

            <h5>
              Total Amount
            </h5>

            <h4>
              ৳{" "}
              {Number(
                bill.totalAmount || 0
              ).toFixed(2)}
            </h4>

          </div>

          {bill.status !==
            "paid" && (
            <button
              className="btn btn-success mt-4"
              onClick={
                handlePayment
              }
              disabled={paying}
            >
              {paying
                ? "Opening Payment..."
                : "Pay Now with SSLCommerz"}
            </button>
          )}

          {bill.status ===
            "paid" && (
            <div className="alert alert-success mt-4 mb-0">

              <strong>
                Payment completed
              </strong>

              {bill.receiptNumber && (
                <div>
                  Receipt:{" "}
                  {bill.receiptNumber}
                </div>
              )}

              {bill.paidAt && (
                <div>
                  Paid at:{" "}
                  {new Date(
                    bill.paidAt
                  ).toLocaleString()}
                </div>
              )}

            </div>
          )}

          {bill.status !==
            "paid" && (
            <button
              className="btn btn-outline-secondary mt-2"
              onClick={
                checkPaymentStatus
              }
            >
              Check Payment Status
            </button>
          )}

        </div>
      )}

    </div>
  );
};

export default Billing;