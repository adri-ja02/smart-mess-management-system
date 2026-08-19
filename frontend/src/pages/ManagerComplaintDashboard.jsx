import { useEffect, useState } from "react";
import { getComplaintsForManager } from "../services/complaintService";
import ComplaintCard from "../components/ComplaintCard";

const CATEGORIES = ["Plumbing", "Electrical", "Furniture", "Cleaning", "Other"];
const URGENCIES = ["Low", "Medium", "High", "Emergency"];
const STATUSES = [
  "Submitted",
  "Under Review",
  "Insufficient Evidence",
  "Duplicate",
  "Confirmed False",
  "Valid",
  "Assigned",
  "In Progress",
  "Repair Completed",
  "Closed",
];

function ManagerComplaintDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    urgency: "",
  });

  const load = async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      // strip empty values so "All" doesn't send status=""
      const clean = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v)
      );
      const data = await getComplaintsForManager(clean);
      setComplaints(data.complaints);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h4 className="mb-3">Complaint Dashboard</h4>

      <p className="text-muted small">
        Complaints are shown anonymously. No resident name, ID, or contact
        detail is ever visible here.
      </p>

      <div className="row mb-4">
        <div className="col-md-4">
          <select
            name="status"
            className="form-select"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            name="category"
            className="form-select"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            name="urgency"
            className="form-select"
            value={filters.urgency}
            onChange={handleFilterChange}
          >
            <option value="">All Urgencies</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="text-muted">No complaints match these filters.</p>
      ) : (
        complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
      )}
    </div>
  );
}

export default ManagerComplaintDashboard;