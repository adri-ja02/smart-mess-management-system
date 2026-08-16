import { useEffect, useState } from "react";
import {
  getMyMealHistory,
  getResidentMealHistory,
} from "../services/mealRecordService";

const statusBadgeClass = {
  collected: "bg-success",
  late: "bg-warning text-dark",
  skipped: "bg-danger",
};

const statusLabel = {
  collected: "Collected",
  late: "Late",
  skipped: "Skipped",
};

// If residentId is provided (manager view), fetches that resident's
// history. Otherwise fetches the logged-in resident's own history.
const MealHistoryList = ({ residentId, residentName }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Guard against out-of-order responses. If a manager clicks resident A
    // then quickly clicks resident B, both requests are in flight; without
    // this guard whichever response lands last wins, even if it's the
    // stale one for A.
    let cancelled = false;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = residentId
          ? await getResidentMealHistory(residentId)
          : await getMyMealHistory();

        if (!cancelled) {
          setRecords(data.records || []);
        }
      } catch (err) {
        if (!cancelled) {
          // FIX: clear stale records on error too — previously only
          // `error` was set here, so if resident A's history had already
          // loaded and then resident B's request failed, the error banner
          // rendered on top of A's table, which reads as if the failed
          // request actually returned A's data.
          setError(
            err.response?.data?.message || "Could not load meal history"
          );
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [residentId]);

  const title = residentName
    ? `Resident Meal History — ${residentName}`
    : "My Meal History";

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">{title}</h5>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {records.length === 0 ? (
          <div className="alert alert-info mb-0">No meal records yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {record.mealMenu?.date
                        ? new Date(record.mealMenu.date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "-"}
                    </td>
                    <td className="text-capitalize">
                      {record.mealMenu?.mealType || "-"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          statusBadgeClass[record.status] || "bg-secondary"
                        }`}
                      >
                        {statusLabel[record.status] || record.status}
                      </span>
                    </td>
                    <td>
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString(
                            [],
                            { hour: "numeric", minute: "2-digit" }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealHistoryList;
