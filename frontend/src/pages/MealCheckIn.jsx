import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMealMenus,
  getMyMealTokens,
} from "../services/mealPlannerService";
import {
  getMealStatusGrid,
  manualCheckIn,
  markSkippedMeals,
  updateMealStatus,
} from "../services/mealRecordService";
import MyQrToken from "../components/MyQrToken";
import QrScanner from "../components/QrScanner";
import MealHistoryList from "../components/MealHistoryList";
import ManagerMealHistoryBrowser from "../components/ManagerMealHistoryBrowser";

const isToday = (dateValue) => {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

// FIX: "Upcoming" was previously just "not today," which meant a
// confirmed token from a *past* date (e.g. an old menu that never got
// swept) would incorrectly render under "Upcoming." This does a
// day-only comparison (time-of-day/timezone-safe) so only meals whose
// date is strictly after today count as upcoming.
const isFutureDate = (dateValue) => {
  const date = new Date(dateValue);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date > today;
};

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const statusChoices = [
  { value: "collected", label: "Collected" },
  { value: "late", label: "Late" },
  { value: "skipped", label: "Skipped" },
];

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

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

// Shared helper so every success message formats "Name (Room X, Bed Y)"
// the same way, instead of only showing the resident's name.
const formatResidentLabel = (resident) => {
  if (!resident) {
    return "resident";
  }

  const roomBed = resident.room
    ? ` (Room ${resident.room}${resident.bed ? `, Bed ${resident.bed}` : ""})`
    : "";

  return `${resident.name || "resident"}${roomBed}`;
};

/* =========================================================
   LOCAL SUBCOMPONENT: Manual Check-in search + confirm panel
   ========================================================= */
const ManualCheckInPanel = ({
  mealTypeOptions,
  selectedMealType,
  onMealTypeChange,
  pendingResidents,
  pendingLoading,
  onConfirm,
  onSelectResident,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [status, setStatus] = useState("collected");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelectedMatch(null);
    setSearchText("");
    setError("");
    setMessage("");
    if (onSelectResident) {
      onSelectResident(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMealType]);

  const matches = useMemo(() => {
    if (!searchText.trim()) {
      return [];
    }

    const query = searchText.trim().toLowerCase();

    return pendingResidents.filter((item) => {
      const name = item.resident?.name?.toLowerCase() || "";
      const room = String(item.resident?.room || "").toLowerCase();
      const bed = String(item.resident?.bed || "").toLowerCase();

      return (
        name.includes(query) || room.includes(query) || bed.includes(query)
      );
    });
  }, [searchText, pendingResidents]);

  const handleSelectMatch = (item) => {
    setSelectedMatch(item);
    setSearchText(item.resident?.name || "");

    if (onSelectResident) {
      onSelectResident(item.resident);
    }
  };

  const handleConfirm = async () => {
    if (!selectedMatch) {
      setError("Search and select a resident first");
      return;
    }

    // FIX: the meal-type dropdown can change out from under a pending
    // selection while the parent's grid fetch for the new meal type is
    // still in flight — pendingResidents can briefly still hold the
    // *previous* meal type's tokens. If a resident was picked during
    // that window, selectedMatch.mealToken points at the wrong meal
    // entirely, and the backend correctly (but confusingly) rejects it
    // as "already checked in" / "consumption record already exists" for
    // a token that was never really the one being confirmed. Re-validate
    // right before submitting: the selected token must still be present
    // in the *current* pending list for the *current* meal type.
    const stillPending = pendingResidents.some(
      (item) => item.mealToken === selectedMatch.mealToken
    );

    if (!stillPending) {
      setError(
        "That selection is out of date for the currently selected meal — please search again."
      );
      setSelectedMatch(null);
      setSearchText("");
      if (onSelectResident) {
        onSelectResident(null);
      }
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await onConfirm(selectedMatch.mealToken, status);
      setMessage(`${formatResidentLabel(selectedMatch.resident)} marked ${status}`);
      setSelectedMatch(null);
      setSearchText("");
      setStatus("collected");
    } catch (err) {
      setError(err.response?.data?.message || "Could not confirm check-in");
    } finally {
      setBusy(false);
    }
  };

  // FIX: while the grid for a newly selected meal type is still loading,
  // disable search/selection entirely rather than letting the manager
  // search and pick against a stale (previous meal type's) pending list.
  const searchDisabled = busy || pendingLoading;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">Manual Check-in</h5>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {message && <div className="alert alert-success py-2">{message}</div>}

        <div className="mb-3">
          <label className="form-label">Search resident</label>
          <input
            type="text"
            className="form-control"
            placeholder={
              pendingLoading
                ? "Loading residents for this meal..."
                : "Name, room, or bed"
            }
            value={searchText}
            disabled={searchDisabled}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSelectedMatch(null);
            }}
          />

          {pendingLoading && (
            <div className="form-text">
              Refreshing pending list for the selected meal…
            </div>
          )}

          {!pendingLoading && searchText && !selectedMatch && (
            <div
              className="list-group mt-1"
              style={{ maxHeight: 180, overflowY: "auto" }}
            >
              {matches.length === 0 ? (
                <div className="list-group-item text-muted small">
                  No match found
                </div>
              ) : (
                matches.map((item) => (
                  <button
                    type="button"
                    key={item.mealToken}
                    className="list-group-item list-group-item-action small"
                    onClick={() => handleSelectMatch(item)}
                  >
                    {item.resident?.name || "Unknown"} — Room{" "}
                    {item.resident?.room || "—"} | Bed{" "}
                    {item.resident?.bed || "—"}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="form-label">Meal</label>
            <select
              className="form-select"
              value={selectedMealType}
              disabled={busy}
              onChange={(e) => onMealTypeChange(e.target.value)}
            >
              {mealTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              disabled={busy}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary w-100"
          disabled={!selectedMatch || busy || pendingLoading}
          onClick={handleConfirm}
        >
          {busy ? "Confirming..." : "Confirm Check-in"}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   LOCAL SUBCOMPONENT: Today's meal counts summary
   Small stat strip for the manager view — collected / late /
   skipped / not-checked-in counts for the currently selected
   meal slot, derived from the same records+pending arrays that
   feed TodayStatusCards (no extra API call).
   ========================================================= */
const MealCountsSummary = ({ records, pending }) => {
  const counts = useMemo(() => {
    const base = { collected: 0, late: 0, skipped: 0 };

    records.forEach((record) => {
      if (base[record.status] !== undefined) {
        base[record.status] += 1;
      }
    });

    return {
      ...base,
      not_checked_in: pending.length,
      total: records.length + pending.length,
    };
  }, [records, pending]);

  const items = [
    { key: "collected", label: "Collected" },
    { key: "late", label: "Late" },
    { key: "skipped", label: "Skipped" },
    { key: "not_checked_in", label: "Not checked-in" },
  ];

  return (
    <div className="row g-3 mb-4">
      {items.map((item) => (
        <div className="col-6 col-md-3" key={item.key}>
          <div className="card shadow-sm h-100">
            <div className="card-body text-center py-3">
              <div
                className={`badge ${statusBadgeClass[item.key]} mb-2`}
                style={{ fontSize: "0.7rem" }}
              >
                {item.label}
              </div>
              <div className="fs-4 fw-semibold">{counts[item.key]}</div>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <div className="text-muted small text-end">
          {counts.total} confirmed meal{counts.total === 1 ? "" : "s"} for this slot
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   LOCAL SUBCOMPONENT: Today's status grid cards
   Recorded cards (those with a real recordId) can be edited inline
   via the same updateMealStatus endpoint the backend already
   exposes. Pending ("not_checked_in") cards have no record yet, so
   there's nothing to edit — they're handled by the Manual Check-in
   panel instead.
   ========================================================= */
const TodayStatusCards = ({
  records,
  pending,
  selectedResidentId,
  onSelectCard,
  onEditRecord,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("collected");
  const [savingId, setSavingId] = useState(null);
  const [editError, setEditError] = useState("");

  const cards = [
    ...records.map((record) => ({
      key: record._id,
      recordId: record._id,
      resident: record.resident,
      status: record.status,
      time: formatTime(record.checkInTime),
    })),
    ...pending.map((item) => ({
      key: item.mealToken,
      recordId: null,
      resident: item.resident,
      status: "not_checked_in",
      time: null,
    })),
  ];

  if (cards.length === 0) {
    return (
      <div className="alert alert-info">
        No confirmed meals for this slot yet.
      </div>
    );
  }

  const startEditing = (card, e) => {
    e.stopPropagation();
    setEditingId(card.recordId);
    setEditStatus(card.status);
    setEditError("");
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditError("");
  };

  const saveEditing = async (card, e) => {
    e.stopPropagation();
    setSavingId(card.recordId);
    setEditError("");

    try {
      await onEditRecord(card.recordId, editStatus);
      setEditingId(null);
    } catch (err) {
      setEditError(
        err.response?.data?.message || "Could not update status"
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="row g-3">
      {cards.map((card) => {
        const isSelected = card.resident?._id === selectedResidentId;
        const isEditing = editingId === card.recordId && card.recordId;

        return (
          <div className="col-md-6 col-lg-4" key={card.key}>
            <div
              role="button"
              tabIndex={0}
              className={`card shadow-sm h-100 ${
                isSelected ? "border-primary" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectCard && onSelectCard(card.resident)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSelectCard) {
                  onSelectCard(card.resident);
                }
              }}
            >
              <div className="card-body">
                <div className="text-muted small mb-1">
                  Room {card.resident?.room || "—"} | Bed{" "}
                  {card.resident?.bed || "—"}
                </div>
                <div className="fw-semibold mb-2">
                  {card.resident?.name || "Unknown"}
                </div>
                <span
                  className={`badge ${
                    statusBadgeClass[card.status] || "bg-secondary"
                  }`}
                >
                  {statusLabel[card.status] || card.status}
                </span>
                {card.time && (
                  <span className="text-muted small ms-2">{card.time}</span>
                )}

                {card.recordId && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        {editError && (
                          <div className="alert alert-danger py-1 px-2 small mb-2">
                            {editError}
                          </div>
                        )}
                        <div className="d-flex gap-1">
                          <select
                            className="form-select form-select-sm"
                            value={editStatus}
                            disabled={savingId === card.recordId}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            {statusChoices.map((choice) => (
                              <option key={choice.value} value={choice.value}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={savingId === card.recordId}
                            onClick={(e) => saveEditing(card, e)}
                          >
                            {savingId === card.recordId ? "..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={savingId === card.recordId}
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0"
                        onClick={(e) => startEditing(card, e)}
                      >
                        Edit status
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   PAGE: MealCheckIn
   ========================================================= */
const MealCheckIn = () => {
  const [todaysMenus, setTodaysMenus] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [gridRecords, setGridRecords] = useState([]);
  const [gridPending, setGridPending] = useState([]);
  // FIX: tracks whether the grid fetch for the currently selected meal
  // type is still in flight. Used to gate the Manual Check-in panel so
  // it never lets a manager search/select against a stale pending list
  // left over from the previously selected meal type.
  const [gridLoading, setGridLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sweepMessage, setSweepMessage] = useState("");
  const loadInitialDataRef = useRef(() => {});

  // FIX: shared "something changed" counter. Bumped after every check-in
  // mutation (QR scan, manual check-in, status edit, sweep). MealHistoryList
  // and ManagerMealHistoryBrowser both take this as a prop and include it
  // in their fetch effects, so a check-in anywhere on this page refreshes
  // every view that displays meal-record data — not just the "Today's
  // meal status" grid, which was the only thing being refetched before.
  const [refreshSignal, setRefreshSignal] = useState(0);
  const bumpRefreshSignal = () => setRefreshSignal((v) => v + 1);

  // Guards against setState calls landing after this page has unmounted —
  // e.g. a visibilitychange/focus refetch that's still in flight when the
  // user navigates away.
  const isMountedRef = useRef(true);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    user = null;
  }
  const role = user?.role;

  const selectedMenu = todaysMenus.find(
    (m) => m.mealType === selectedMealType
  );

  const loadGrid = useCallback(async (mealMenuId) => {
    if (!mealMenuId) {
      setGridRecords([]);
      setGridPending([]);
      setGridLoading(false);
      return;
    }

    setGridLoading(true);

    try {
      const data = await getMealStatusGrid(mealMenuId);
      if (!isMountedRef.current) return;
      setGridRecords(data.records || []);
      setGridPending(data.pending || []);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err.response?.data?.message || "Could not load today's meal status"
      );
    } finally {
      if (isMountedRef.current) {
        setGridLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const loadInitialData = async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError("");

        const menuData = await getMealMenus();
        if (!isMountedRef.current) return;

        const todays = menuData.filter((m) => isToday(m.date));
        setTodaysMenus(todays);

        if (todays.length > 0) {
          const defaultMeal =
            todays.find((m) => m.mealType === "lunch") || todays[0];
          setSelectedMealType(defaultMeal.mealType);
        }

        if (role === "student") {
          const tokenData = await getMyMealTokens();
          if (!isMountedRef.current) return;

          // Show every confirmed token, not just ones matching "today" —
          // a silent date-filter here was hiding freshly confirmed tokens
          // whenever isToday() didn't match exactly (menu for a different
          // day, timezone edge case, etc.), which looked identical to
          // "the QR never appeared." Today's meals are called out
          // separately in the UI below instead of being the only ones shown.
          const confirmed = tokenData.filter(
            (t) => t.status === "confirmed" && t.mealMenu
          );

          setMyTokens(confirmed);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(
          err.response?.data?.message || "Could not load check-in data"
        );
      } finally {
        if (showLoading && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialDataRef.current = loadInitialData;

    // Initial load (with spinner) on mount.
    loadInitialData(true);

    // Safety net: if this page was already mounted (kept alive by the
    // router/layout) when the student confirmed a meal elsewhere, refetch
    // silently whenever the tab/page regains visibility or focus, so the
    // QR always reflects the latest confirmation without a manual refresh.
    const handleVisible = () => {
      if (document.visibilityState === "visible") {
        loadInitialData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [role]);

  useEffect(() => {
    if (role === "manager" && selectedMenu) {
      loadGrid(selectedMenu._id);
    }
  }, [role, selectedMenu, loadGrid]);

  const handleManualConfirm = async (mealTokenId, status) => {
    await manualCheckIn(mealTokenId, status);
    await loadGrid(selectedMenu?._id);
    bumpRefreshSignal();
  };

  const handleEditRecord = async (recordId, status) => {
    await updateMealStatus(recordId, status);
    await loadGrid(selectedMenu?._id);
    bumpRefreshSignal();
  };

  const handleSweepSkipped = async () => {
    setSweepMessage("");
    setError("");

    try {
      const result = await markSkippedMeals();

      if (result.marked === 0) {
        setSweepMessage(
          "No meals were eligible to sweep yet — this runs only after a meal's service window has closed."
        );
      } else {
        setSweepMessage(`Marked ${result.marked} meal(s) as skipped.`);
      }

      await loadGrid(selectedMenu?._id);
      bumpRefreshSignal();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not run the skipped-meal sweep"
      );
    }
  };

  // FIX: QR check-ins used to only trigger loadGrid() via onCheckedIn.
  // Now also bumps refreshSignal so MealHistoryList / ManagerMealHistoryBrowser
  // pick up the change.
  const handleQrCheckedIn = () => {
    loadGrid(selectedMenu?._id);
    bumpRefreshSignal();
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2>Meal Check-in</h2>
        <p className="text-muted mb-0">
          {role === "manager"
            ? "QR meal check-in and consumption record"
            : "Show your QR code at the counter and track your meal history"}
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {role === "student" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Your Confirmed Meals</h5>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => loadInitialDataRef.current(false)}
            >
              Refresh
            </button>
          </div>

          {myTokens.length === 0 ? (
            <div className="alert alert-info">
              No confirmed meals yet. Confirm a meal on the Meal Planner
              page and it will appear here.
            </div>
          ) : (
            <>
              {(() => {
                const todaysTokens = myTokens.filter((t) =>
                  isToday(t.mealMenu.date)
                );
                // FIX: previously `!isToday(...)`, which meant a
                // confirmed token from a *past* date could render under
                // "Upcoming." Now strictly future-dated only.
                const upcomingTokens = myTokens.filter((t) =>
                  isFutureDate(t.mealMenu.date)
                );

                return (
                  <>
                    <h6 className="text-muted mb-2">Today</h6>
                    {todaysTokens.length === 0 ? (
                      <div className="alert alert-secondary py-2">
                        No confirmed meals for today.
                      </div>
                    ) : (
                      <div className="row g-4 mb-4">
                        {todaysTokens.map((token) => (
                          <div className="col-md-6 col-lg-4" key={token._id}>
                            <MyQrToken mealToken={token} />
                          </div>
                        ))}
                      </div>
                    )}

                    {upcomingTokens.length > 0 && (
                      <>
                        <h6 className="text-muted mb-2">Upcoming</h6>
                        <div className="row g-4 mb-4">
                          {upcomingTokens.map((token) => (
                            <div
                              className="col-md-6 col-lg-4"
                              key={token._id}
                            >
                              <MyQrToken mealToken={token} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </>
          )}

          <MealHistoryList refreshSignal={refreshSignal} />
        </>
      )}

      {role === "manager" && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <QrScanner onCheckedIn={handleQrCheckedIn} />
            </div>

            <div className="col-md-6">
              <ManualCheckInPanel
                mealTypeOptions={todaysMenus.map((m) => ({
                  value: m.mealType,
                  label: mealTypeLabels[m.mealType] || m.mealType,
                }))}
                selectedMealType={selectedMealType}
                onMealTypeChange={setSelectedMealType}
                pendingResidents={gridPending}
                pendingLoading={gridLoading}
                onConfirm={handleManualConfirm}
                onSelectResident={setSelectedResident}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Today's meal status — {mealTypeLabels[selectedMealType] || "—"}
            </h5>

            <button className="btn btn-outline-secondary" onClick={handleSweepSkipped}>
              Sweep Skipped Meals
            </button>
          </div>

          {sweepMessage && (
            <div className="alert alert-success">{sweepMessage}</div>
          )}

          <MealCountsSummary records={gridRecords} pending={gridPending} />

          <div className="mb-4">
            <TodayStatusCards
              records={gridRecords}
              pending={gridPending}
              selectedResidentId={selectedResident?._id}
              onSelectCard={setSelectedResident}
              onEditRecord={handleEditRecord}
            />
          </div>

          {selectedResident && (
            <MealHistoryList
              residentId={selectedResident._id}
              residentName={selectedResident.name}
              refreshSignal={refreshSignal}
            />
          )}

          <hr className="my-4" />

          {/* Read-only browser: any date, any meal type, every resident's
              record for that slot — separate from the live "today" grid
              above, which is scoped to check-in actions. */}
          <ManagerMealHistoryBrowser refreshSignal={refreshSignal} />
        </>
      )}
    </div>
  );
};

export default MealCheckIn;