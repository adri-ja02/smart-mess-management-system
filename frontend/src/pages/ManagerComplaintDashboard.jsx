import { 
  useEffect, 
  useState, 
} from "react"; 
 
import { 
  getComplaintsForManager, 
  getComplaintStatsForManager, 
} from "../services/complaintService"; 
 
import ComplaintCard from "../components/ComplaintCard"; 
 
const CATEGORIES = [ 
  "Plumbing", 
  "Electrical", 
  "Furniture", 
  "Cleaning", 
  "Other", 
]; 
 
const URGENCIES = [ 
  "Low", 
  "Medium", 
  "High", 
  "Emergency", 
]; 
 
const STATUSES = [ 
  "Valid", 
  "Assigned", 
  "In Progress", 
  "Repair Completed", 
  "Reopened", 
]; 
 
function ManagerComplaintDashboard() { 
  const [complaints, setComplaints] = 
    useState([]); 
 
  const [loading, setLoading] = 
    useState(true); 
 
  const [error, setError] = 
    useState(""); 
 
  const [filters, setFilters] = 
    useState({ 
      status: "", 
      category: "", 
      urgency: "", 
    }); 
 
  const [stats, setStats] = 
    useState(null); 
 
  const [statsError, setStatsError] = 
    useState(""); 
 
  const loadStats = 
    async () => { 
      try { 
        const data = 
          await getComplaintStatsForManager(); 
 
        setStats(data); 
      } catch (err) { 
        setStatsError( 
          err.response?.data 
            ?.message || 
            "Could not load operational statistics." 
        ); 
      } 
    }; 
 
  const load = 
    async ( 
      activeFilters 
    ) => { 
      setLoading(true); 
      setError(""); 
 
      try { 
        const clean = 
          Object.fromEntries( 
            Object.entries( 
              activeFilters 
            ).filter( 
              ([, value]) => 
                value 
            ) 
          ); 
 
        const data = 
          await getComplaintsForManager( 
            clean 
          ); 
 
        setComplaints( 
          data.complaints || 
            [] 
        ); 
      } catch (err) { 
        setError( 
          err.response?.data 
            ?.message || 
            "Could not load work orders." 
        ); 
      } finally { 
        setLoading(false); 
      } 
    }; 
 
  useEffect(() => { 
    load(filters); 
  }, [filters]); 
 
  useEffect(() => { 
    loadStats(); 
  }, []); 
 
  const handleFilterChange = 
    (e) => { 
      setFilters( 
        (prev) => ({ 
          ...prev, 
          [e.target.name]: 
            e.target.value, 
        }) 
      ); 
    }; 
 
  return ( 
    <div> 
      <h4 className="mb-2"> 
        Maintenance Work Orders 
      </h4> 
 
      <p className="text-muted"> 
        Only complaints already marked{" "} 
        <strong>Valid</strong> by the 
        System Administrator appear here. 
        Confidential resident communication 
        is not visible. 
      </p> 
 
      <div className="alert alert-info"> 
        <strong> 
          Privacy boundary: 
        </strong>{" "} 
        The Mess Manager has no access to the 
        resident identity, private token, 
        resident questions, answers, or 
        protected comments. 
      </div> 
 
      <h6 className="mt-4 mb-2"> 
        Operational Maintenance Statistics 
      </h6> 
 
      <p className="text-muted small"> 
        These figures cover only the work 
        orders visible to the Mess Manager. 
        Integrity-review numbers (validated, 
        duplicate, insufficient evidence, 
        confirmed false) are reserved for the 
        System Administrator. 
      </p> 
 
      {statsError && ( 
        <div className="alert alert-warning py-2"> 
          {statsError} 
        </div> 
      )} 
 
      {stats && ( 
        <div className="row mb-4"> 
          <div className="col-md-3 mb-3"> 
            <div className="card shadow-sm"> 
              <div className="card-body"> 
                <small> 
                  Total Work Orders 
                </small> 
                <h3> 
                  { 
                    stats.totals 
                      .totalWorkOrders 
                  } 
                </h3> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-3 mb-3"> 
            <div className="card shadow-sm"> 
              <div className="card-body"> 
                <small> 
                  Unassigned 
                </small> 
                <h3> 
                  { 
                    stats.totals 
                      .unassigned 
                  } 
                </h3> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-3 mb-3"> 
            <div className="card shadow-sm border-danger"> 
              <div className="card-body"> 
                <small> 
                  Overdue / Escalated 
                </small> 
                <h3> 
                  { 
                    stats.totals 
                      .overdue 
                  }{" "} 
                  /{" "} 
                  { 
                    stats.totals 
                      .escalated 
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
                    stats.totals 
                      .reopened 
                  } 
                </h3> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-6 mb-3"> 
            <div className="card shadow-sm"> 
              <div className="card-body"> 
                <small> 
                  Closed (Resident Confirmed) 
                </small> 
                <h3> 
                  { 
                    stats.totals 
                      .closed 
                  } 
                </h3> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-6 mb-3"> 
            <div className="card shadow-sm"> 
              <div className="card-body"> 
                <small> 
                  Average Completion Time 
                </small> 
                <h3> 
                  { 
                    stats.averageCompletionTimeHours 
                  }{" "} 
                  hours 
                </h3> 
                <p className="text-muted small mb-0"> 
                  Worker assignment to 
                  resident-confirmed closure. 
                </p> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-6 mb-3"> 
            <div className="card shadow-sm h-100"> 
              <div className="card-body"> 
                <small> 
                  Work Orders by Status 
                </small> 
 
                <ul className="list-unstyled mb-0 mt-2"> 
                  {Object.entries( 
                    stats.byStatus 
                  ).map( 
                    ([ 
                      status, 
                      count, 
                    ]) => ( 
                      <li 
                        key={ 
                          status 
                        } 
                        className="d-flex justify-content-between" 
                      > 
                        <span> 
                          {status} 
                        </span> 
                        <strong> 
                          {count} 
                        </strong> 
                      </li> 
                    ) 
                  )} 
                </ul> 
              </div> 
            </div> 
          </div> 
 
          <div className="col-md-6 mb-3"> 
            <div className="card shadow-sm h-100"> 
              <div className="card-body"> 
                <small> 
                  Recurring Complaint Locations 
                </small> 
 
                {stats 
                  .recurringLocations 
                  .length === 0 ? ( 
                  <p className="text-muted small mb-0 mt-2"> 
                    No recurring locations 
                    among current work 
                    orders. 
                  </p> 
                ) : ( 
                  <ul className="list-unstyled mb-0 mt-2"> 
                    {stats.recurringLocations.map( 
                      (item) => ( 
                        <li 
                          key={ 
                            item.location 
                          } 
                          className="d-flex justify-content-between" 
                        > 
                          <span> 
                            { 
                              item.location 
                            } 
                          </span> 
                          <strong> 
                            { 
                              item.count 
                            } 
                          </strong> 
                        </li> 
                      ) 
                    )} 
                  </ul> 
                )} 
              </div> 
            </div> 
          </div> 
        </div> 
      )} 
 
      <div className="row mb-4"> 
        <div className="col-md-4"> 
          <select 
            name="status" 
            className="form-select" 
            value={ 
              filters.status 
            } 
            onChange={ 
              handleFilterChange 
            } 
          > 
            <option value=""> 
              All Operational Statuses 
            </option> 
 
            {STATUSES.map( 
              (status) => ( 
                <option 
                  key={status} 
                  value={status} 
                > 
                  {status} 
                </option> 
              ) 
            )} 
          </select> 
        </div> 
 
        <div className="col-md-4"> 
          <select 
            name="category" 
            className="form-select" 
            value={ 
              filters.category 
            } 
            onChange={ 
              handleFilterChange 
            } 
          > 
            <option value=""> 
              All Categories 
            </option> 
 
            {CATEGORIES.map( 
              (category) => ( 
                <option 
                  key={category} 
                  value={category} 
                > 
                  {category} 
                </option> 
              ) 
            )} 
          </select> 
        </div> 
 
        <div className="col-md-4"> 
          <select 
            name="urgency" 
            className="form-select" 
            value={ 
              filters.urgency 
            } 
            onChange={ 
              handleFilterChange 
            } 
          > 
            <option value=""> 
              All Priorities 
            </option> 
 
            {URGENCIES.map( 
              (urgency) => ( 
                <option 
                  key={urgency} 
                  value={urgency} 
                > 
                  {urgency} 
                </option> 
              ) 
            )} 
          </select> 
        </div> 
      </div> 
 
      {error && ( 
        <div className="alert alert-danger"> 
          {error} 
        </div> 
      )} 
 
      {loading ? ( 
        <p> 
          Loading work orders... 
        </p> 
      ) : complaints.length === 
        0 ? ( 
        <div className="alert alert-secondary"> 
          No valid work orders match the 
          selected filters. 
        </div> 
      ) : ( 
        complaints.map( 
          (complaint) => ( 
            <ComplaintCard 
              key={ 
                complaint._id 
              } 
              complaint={ 
                complaint 
              } 
            /> 
          ) 
        ) 
      )} 
    </div> 
  ); 
} 
 
export default ManagerComplaintDashboard;