import { useEffect, useState } from "react";

import {
    getAllWaitlistForManager,
    rejectWaitlistEntry,
} from "../services/waitlistService";

function ManagerWaitlist() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // =======================================================
    // LOAD WAITLIST
    // =======================================================

    const loadWaitlist = async () => {
        try {
            setLoading(true);

            const res =
                await getAllWaitlistForManager();

            setEntries(
                res.entries || []
            );

        } catch (error) {
            console.error(
                "Failed to load manager waitlist:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load waitlist."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWaitlist();

        const interval =
            setInterval(() => {
                loadWaitlist();
            }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // =======================================================
    // REJECT WAITLIST
    // =======================================================

    const handleReject = async (id) => {
        const reason =
            window.prompt(
                "Reason for rejecting this waitlist request:"
            );

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            alert(
                "A rejection reason is required."
            );
            return;
        }

        setProcessingId(id);

        try {
            const res =
                await rejectWaitlistEntry(
                    id,
                    reason.trim()
                );

            alert(
                res.message ||
                "Waitlist request rejected successfully."
            );

            await loadWaitlist();

        } catch (error) {
            console.error(
                "Failed to reject waitlist entry:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Rejection failed."
            );

        } finally {
            setProcessingId(null);
        }
    };

    // =======================================================
    // DATE FORMAT
    // =======================================================

    const formatJoinedAt = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleString(
            "en-BD",
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }
        );
    };

    // =======================================================
    // STATUS BADGE
    // =======================================================

    const getStatusBadge = (status) => {
        switch (status) {
            case "matched":
                return "badge bg-success";

            case "waiting":
                return "badge bg-warning text-dark";

            case "expired":
                return "badge bg-secondary";

            case "cancelled":
                return "badge bg-danger";

            default:
                return "badge bg-secondary";
        }
    };

    // =======================================================
    // LOADING
    // =======================================================

    if (loading && entries.length === 0) {
        return (
            <div className="container mt-4 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="mt-3 text-muted">
                    Loading waitlist...
                </p>

            </div>
        );
    }

    // =======================================================
    // RENDER
    // =======================================================

    return (
        <div className="container mt-4 mb-5">

            {/* HEADER */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        <div>

                            <h2 className="fw-bold mb-1">
                                Manager Waitlist
                            </h2>

                            <p className="text-muted mb-0">
                                View and manage students
                                waiting for beds.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={loadWaitlist}
                            disabled={loading}
                        >
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                    </div>

                </div>

            </div>

            {/* EMPTY */}

            {entries.length === 0 ? (

                <div className="alert alert-info shadow-sm">
                    No students are currently
                    on a waitlist.
                </div>

            ) : (

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle mb-0">

                                <thead className="table-dark">

                                    <tr>

                                        <th>
                                            Rank
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Building
                                        </th>

                                        <th>
                                            Room No
                                        </th>

                                        <th>
                                            Bed
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Joined On
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {entries.map(
                                        (entry) => (

                                            <tr
                                                key={
                                                    entry._id
                                                }
                                            >

                                                {/* RANK */}

                                                <td>
                                                    <span className="badge bg-secondary">
                                                        #
                                                        {entry.rank ??
                                                            "-"}
                                                    </span>
                                                </td>

                                                {/* STUDENT */}

                                                <td>

                                                    <div className="fw-semibold">
                                                        {entry.studentName ||
                                                            entry.student?.name ||
                                                            "-"}
                                                    </div>

                                                    {entry.student?.email && (
                                                        <div className="text-muted small">
                                                            {
                                                                entry.student.email
                                                            }
                                                        </div>
                                                    )}

                                                </td>

                                                {/* BUILDING */}

                                                <td>

                                                    <span className="fw-semibold">
                                                        {
                                                            entry.buildingName ||
                                                            entry.room?.building?.name ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                {/* ROOM */}

                                                <td>
                                                    {
                                                        entry.roomNumber ||
                                                        entry.room?.roomNumber ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* BED */}

                                                <td>
                                                    <span className="fw-semibold">
                                                        {
                                                            entry.bedNumber ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={getStatusBadge(
                                                            entry.status
                                                        )}
                                                    >
                                                        {
                                                            entry.status ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                {/* JOINED */}

                                                <td>
                                                    {formatJoinedAt(
                                                        entry.createdAt
                                                    )}
                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    {[
                                                        "waiting",
                                                        "matched",
                                                    ].includes(
                                                        entry.status
                                                    ) ? (

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            disabled={
                                                                processingId ===
                                                                entry._id
                                                            }
                                                            onClick={() =>
                                                                handleReject(
                                                                    entry._id
                                                                )
                                                            }
                                                        >
                                                            {processingId ===
                                                            entry._id
                                                                ? "Rejecting..."
                                                                : "Reject"}
                                                        </button>

                                                    ) : entry.status ===
                                                      "cancelled" ? (

                                                        <span className="text-danger fw-semibold">
                                                            Rejected
                                                        </span>

                                                    ) : (

                                                        <span className="text-muted small">
                                                            No action
                                                        </span>

                                                    )}

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

        </div>
    );
}

export default ManagerWaitlist;