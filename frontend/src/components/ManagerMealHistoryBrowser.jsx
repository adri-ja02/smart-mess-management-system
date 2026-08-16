import { useEffect, useMemo, useRef, useState } from "react";
import { getMealMenus } from "../services/mealPlannerService";
import { getMealStatusGrid } from "../services/mealRecordService";

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const statusLabel = {
  collected: "Collected",
  late: "Late",
  skipped: "Skipped",
  not_checked_in: "Not checked-in",
};

const statusBadgeClass = {
  collected: "bg-success",
  late: "bg-warning text-dark",
  skipped: "bg-danger",
  not_checked_in: "bg-secondary",
};

const methodLabel = {
  QR: "QR Scan",
  Manual: "Manual",
  System: "Auto (Sweep)",
};

// yyyy-mm-dd in *local* time, for the <input type="date"> value and for
// comparing against a menu's date without timezone drift.
const toDateInputValue = (value) => {
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

/* =========================================================
   MANAGER: Browse meal history by date + meal type.
   Feature 2 requirement — "manager should see all meal records
   by selecting date, meal type (breakfast/lunch/dinner)".

   Reuses existing endpoints only:
   - getMealMenus() to resolve (date, mealType) -> MealMenu._id
   - getMealStatusGrid(mealMenuId) for the recorded + pending list
   No backend changes required.

   FIX: accepts a `refreshSignal` prop — an incrementing counter owned by
   the parent page (MealCheckIn.jsx) that changes whenever a check-in
   mutation happens anywhere on the page (QR scan, manual check-in, status
   edit, sweep). Previously this component only refetched when the
   selected date/meal type changed, so a check-in done elsewhere on the
   page (e.g. via the QR scanner) never showed up here until the manager
   re-picked the same date/meal type. Including refreshSignal in the grid
   effect's dependency array fixes that.
   ========================================================= */
const ManagerMealHistoryBrowser = ({ refreshSignal }) => {
  const [menus, setMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [menusError, setMenusError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(new Date())
  );
  const [selectedMealType, setSelectedMealType] = useState("breakfast");

  const [records, setRecords] = useState([]);
  const [pending, setPending] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState("");

  const isMountedRef = useRef(true);

  // Load the full menu list once. getMealMenus() returns every published
  // menu (no server-side date filter, matching the pattern already used
  // in MealCheckIn.jsx), so we resolve date+mealType -> menu client-side.
  useEffect(() => {
    isMountedRef.current = true;

    const loadMenus = async () => {
      try {
        setMenusLoading(true);
        setMenusError("");
        const menuData = await getMealMenus();
        if (isMountedRef.current) {
          setMenus(menuData || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setMenusError(
            err.response?.data?.message || "Could not load meal menus"
          );
        }
      } finally {
        if (isMountedRef.current) {
          setMenusLoading(false);
        }
      }
    };

    loadMenus();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const matchedMenu = useMemo(() => {
    return menus.find(
      (m) =>
        toDateInputValue(m.date) === selectedDate &&
        m.mealType === selectedMealType
    );
  }, [menus, selectedDate, selectedMealType]);

  useEffect(() => {
    let cancelled = false;

    const loadGrid = async () => {
      if (!matchedMenu) {
        setRecords([]);
        setPending([]);
        setGridError("");
        return;
      }

      try {
        setGridLoading(true);
        setGridError("");
        const data = await getMealStatusGrid(matchedMenu._id);
        if (!cancelled) {
          setRecords(data.records || []);
          setPending(data.pending || []);
        }
      } catch (err) {
        if (!cancelled) {
          setGridError(
            err.response?.data?.message || "Could not load meal records"
          );
          setRecords([]);
          setPending([]);
        }
      } finally {
        if (!cancelled) {
          setGridLoading(false);
        }
      }
    };

    loadGrid();

    return () => {
      cancelled = true;
    };
  }, [matchedMenu, refreshSignal]);

  const rows = useMemo(() => {
    const recorded = records.map((record) => ({
      key: record._id,
      resident: record.resident,
      status: record.status,
      method: record.method,
      checkInTime: record.checkInTime,
    }));

    const notCheckedIn = pending.map((item) => ({
      key: item.mealToken,
      resident: item.resident,
      status: "not_checked_in",
      method: null,
      checkInTime: null,
    }));

    return [...recorded, ...notCheckedIn].sort((a, b) =>
      (a.resident?.name || "").localeCompare(b.resident?.name || "")
    );
  }, [records, pending]);

  const counts = useMemo(() => {
    const base = { collected: 0, late: 0, skipped: 0, not_checked_in: 0 };
    rows.forEach((row) => {
      if (base[row.status] !== undefined) {
        base[row.status] += 1;
      }
    });
    return base;
  }, [rows]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Meal History — All Records</h5>

        {menusError && (
          <div className="alert alert-danger py-2">{menusError}</div>
        )}

        <div className="row g-2 mb-3">
          <div className="col-6 col-md-4">
            <label className="form-label small text-muted">Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={menusLoading}
            />
          </div>
          <div className="col-6 col-md-4">
            <label className="form-label small text-muted">Meal</label>
            <select
              className="form-select"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              disabled={menusLoading}
            >
              {Object.entries(mealTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {menusLoading || gridLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : gridError ? (
          <div className="alert alert-danger py-2">{gridError}</div>
        ) : !matchedMenu ? (
          <div className="alert alert-info mb-0">
            No {mealTypeLabels[selectedMealType].toLowerCase()} menu was
            published for {selectedDate}.
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-success">
                Collected: {counts.collected}
              </span>
              <span className="badge bg-warning text-dark">
                Late: {counts.late}
              </span>
              <span className="badge bg-danger">
                Skipped: {counts.skipped}
              </span>
              <span className="badge bg-secondary">
                Not checked-in: {counts.not_checked_in}
              </span>
              <span className="text-muted small ms-auto">
                {rows.length} total confirmed meal{rows.length === 1 ? "" : "s"}
              </span>
            </div>

            {rows.length === 0 ? (
              <div className="alert alert-info mb-0">
                No confirmed meals for this slot.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Room / Bed</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.resident?.name || "Unknown"}</td>
                        <td>
                          Room {row.resident?.room || "—"} | Bed{" "}
                          {row.resident?.bed || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              statusBadgeClass[row.status] || "bg-secondary"
                            }`}
                          >
                            {statusLabel[row.status] || row.status}
                          </span>
                        </td>
                        <td>{row.method ? methodLabel[row.method] || row.method : "—"}</td>
                        <td>{formatTime(row.checkInTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerMealHistoryBrowser;