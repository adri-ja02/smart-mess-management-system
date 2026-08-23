import {
  useEffect,
  useState,
} from "react";

import {
  getComplaintAnalytics,
} from "../services/complaintService";

function ComplaintAnalytics() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const load =
      async () => {
        try {
          const response =
            await getComplaintAnalytics();

          setData(response);
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              "Could not load complaint analytics."
          );
        } finally {
          setLoading(false);
        }
      };

    load();
  }, []);

  if (loading) {
    return (
      <p>
        Loading complaint analytics...
      </p>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const {
    totals,
    averageResponseTimeHours,
    averageResolutionTimeHours,
    recurringLocations,
  } = data;

  return (
    <div>
      <h3 className="mb-4">
        Complaint Service Analytics
      </h3>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Total Complaints
              </small>
              <h3>
                {
                  totals.total
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Validated
              </small>
              <h3>
                {
                  totals.validated
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Duplicate
              </small>
              <h3>
                {
                  totals.duplicate
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Insufficient Evidence
              </small>
              <h3>
                {
                  totals.insufficientEvidence
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Confirmed False
              </small>
              <h3>
                {
                  totals.confirmedFalse
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Overdue
              </small>
              <h3>
                {
                  totals.overdue
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Escalated
              </small>
              <h3>
                {
                  totals.escalated
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small>
                Reopened
              </small>
              <h3>
                {
                  totals.reopened
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>
                Average Response Time
              </h5>

              <h2>
                {
                  averageResponseTimeHours
                }{" "}
                hours
              </h2>

              <p className="text-muted">
                Complaint submission to
                administrator decision.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>
                Average Resolution Time
              </h5>

              <h2>
                {
                  averageResolutionTimeHours
                }{" "}
                hours
              </h2>

              <p className="text-muted">
                Complaint submission to
                resident-confirmed closure.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5>
            Recurring Complaint Locations
          </h5>

          {recurringLocations.length ===
          0 ? (
            <p className="text-muted">
              No recurring locations yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      Location
                    </th>
                    <th>
                      Complaint Count
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recurringLocations.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.location
                        }
                      >
                        <td>
                          {
                            item.location
                          }
                        </td>

                        <td>
                          {
                            item.count
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintAnalytics;