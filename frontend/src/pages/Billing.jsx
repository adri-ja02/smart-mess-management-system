import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  generateMonthlyBill,
  getBillingOverview,
  getMyBill,
  getOverdueBills,
} from "../services/billingService";

import {
  initiatePayment,
  getPaymentStatus,
} from "../services/sslcommerzService";

const Billing = () => {
  const { user } = useAuth();

  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  // Student bill
  const [bill, setBill] = useState(null);

  // Manager data
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [overdueBills, setOverdueBills] = useState([]);

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

      const data = await getMyBill(month, year);

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

      const data = await getBillingOverview(month, year);

      setStudents(data.students || []);
      setSummary(data.summary || null);

      const overdue = await getOverdueBills();

      setOverdueBills(overdue.bills || []);
    } catch (err) {
      console.error(
        "Manager billing error:",
        err
      );

      setStudents([]);
      setSummary(null);
      setOverdueBills([]);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Re-fetch so we also pick up dueDate/isOverdue fields
      await loadBill();
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
  // STUDENT - PAYMENT (SSLCommerz)
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
        await initiatePayment(bill._id);

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

  const checkPaymentStatus = async () => {
    if (!bill?._id) {
      return;
    }

    try {
      const response =
        await getPaymentStatus(bill._id);

      setBill((previous) => ({
        ...previous,
        status: response.status,
        paymentId: response.paymentId,
        paidAt: response.paidAt,
        receiptNumber:
          response.receiptNumber,
        dueDate: response.dueDate,
        isOverdue: response.isOverdue,
        daysOverdue: response.daysOverdue,
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

  const renderMonthSelector = () => (
    <div className="card p-4 mb-4 shadow-sm">
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
  // STATUS BADGE
  // =========================================================

  const renderStatusBadge = (status) => {
    if (status === "paid") {
      return (
        <span className="badge bg-success">
          PAID
        </span>
      );
    }

    if (status === "overdue") {
      return (
        <span className="badge bg-danger">
          OVERDUE
        </span>
      );
    }

    if (status === "not-generated") {
      return (
        <span className="badge bg-secondary">
          BILL NOT GENERATED
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        UNPAID
      </span>
    );
  };

  // =========================================================
  // MANAGER VIEW
  // =========================================================

  if (user?.role === "manager") {
    return (
      <div className="container py-4">

        {/* =================================================
            HIGHLIGHTED MANAGER HEADING
        ================================================== */}
        <div
          className="mb-4 p-3 rounded-4 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, #F3EEFF, #E8DFFF)",
            color: "#4B3F72",
            border:
              "1px solid #D6C8F0",
          }}
        >
          <h2 className="mb-1 fw-bold">
            Billing Overview
          </h2>

          <div
            style={{
              width: "70px",
              height: "4px",
              background: "#8064A2",
              borderRadius: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        <p className="text-muted">
          View student meal confirmations,
          payment status, and overdue reminders.
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

            <div className="col-md-3 mb-3">
              <div className="card p-3 shadow-sm h-100">
                <h6>Total Students</h6>
                <h3>
                  {summary.totalStudents}
                </h3>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card p-3 shadow-sm h-100">
                <h6>Confirmed Meals</h6>
                <h3>
                  {summary.confirmedMealStudents}
                </h3>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card p-3 shadow-sm h-100">
                <h6>Paid</h6>
                <h3>
                  {summary.paidStudents}
                </h3>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card p-3 shadow-sm h-100">
                <h6>Overdue</h6>

                <h3
                  className={
                    summary.overdueStudents > 0
                      ? "text-danger"
                      : ""
                  }
                >
                  {summary.overdueStudents}
                </h3>
              </div>
            </div>

          </div>
        )}

        {overdueBills.length > 0 && (
          <div className="alert alert-danger">
            <strong>
              {overdueBills.length}
            </strong>{" "}
            bill(s) across all months are
            currently overdue. Reminder emails
            are sent automatically once a bill
            passes its grace period.
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
                      <th>Student</th>
                      <th>Email</th>
                      <th>Confirmed Meals</th>
                      <th>Meal Charges</th>
                      <th>Total Bill</th>
                      <th>Payment Status</th>
                      <th>Receipt</th>
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
                            {student.confirmedMeals}
                          </td>

                          <td>
                            &#2547;{" "}
                            {Number(
                              student.mealCharges ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td>
                            &#2547;{" "}
                            {Number(
                              student.totalAmount ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {renderStatusBadge(
                              student.status
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
              No student billing records found
              for this month.
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

      {/* =================================================
          HIGHLIGHTED STUDENT HEADING
      ================================================== */}
      <div
        className="mb-4 p-3 rounded-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #F3EEFF, #E8DFFF)",
          color: "#4B3F72",
          border:
            "1px solid #D6C8F0",
        }}
      >
        <h2 className="mb-1 fw-bold">
          Monthly Billing
        </h2>

        <div
          style={{
            width: "70px",
            height: "4px",
            background: "#8064A2",
            borderRadius: "10px",
            marginTop: "8px",
          }}
        />
      </div>

      <p className="text-muted">
        View your monthly mess bill and make
        payments.
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

      {bill?.isOverdue &&
        bill.status !== "paid" && (
          <div
            className="alert alert-danger"
            style={{ maxWidth: "800px" }}
          >
            <strong>
              Overdue reminder:
            </strong>{" "}
            This bill was due on{" "}
            {bill.dueDate
              ? new Date(
                  bill.dueDate
                ).toLocaleDateString()
              : "an earlier date"}{" "}
            and is now{" "}
            {bill.daysOverdue} day
            {bill.daysOverdue === 1
              ? ""
              : "s"} overdue. Please pay as
            soon as possible.
          </div>
        )}

      {bill && (
        <div
          className="card shadow-sm p-4"
          style={{ maxWidth: "800px" }}
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

            {renderStatusBadge(
              bill.status
            )}

          </div>

          <hr />

          <div className="d-flex justify-content-between mb-3">
            <span>
              Meal Charges
            </span>

            <strong>
              &#2547;{" "}
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
              &#2547;{" "}
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
              &#2547;{" "}
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
              &#2547;{" "}
              {Number(
                bill.totalAmount || 0
              ).toFixed(2)}
            </h4>
          </div>

          {bill.dueDate &&
            bill.status !== "paid" && (
              <p className="text-muted mb-0 mt-2">
                Due by{" "}
                {new Date(
                  bill.dueDate
                ).toLocaleDateString()}
              </p>
            )}

          {bill.status !== "paid" && (
            <div className="d-flex gap-2 mt-4 flex-wrap">

              <button
                className="btn btn-success"
                onClick={handlePayment}
                disabled={paying}
              >
                {paying
                  ? "Opening Payment..."
                  : "Pay Now with SSLCommerz"}
              </button>

            </div>
          )}

          {bill.status === "paid" && (
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

          {bill.status !== "paid" && (
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