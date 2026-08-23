import { useEffect, useState } from "react"; 
 
import { 
  getReservationHistory, 
} from "../services/reservationService"; 
 
function ReservationHistory() { 
  const [reservations, setReservations] = useState([]); 
  const [loading, setLoading] = useState(true); 
 
  const [selectedCategory, setSelectedCategory] = 
    useState("approved"); 
 
  const [detailsReservation, setDetailsReservation] = 
    useState(null); 
 
  // =========================================================== 
  // LOAD HISTORY 
  // =========================================================== 
 
  useEffect(() => { 
    loadReservations(); 
  }, []); 
 
  const loadReservations = async () => { 
    try { 
      setLoading(true); 
 
      const res = 
        await getReservationHistory(); 
 
      setReservations( 
        res.reservations || [] 
      ); 
    } catch (error) { 
      console.error(error); 
 
      alert( 
        error.response?.data?.message || 
          "Failed to load reservation history." 
      ); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  // =========================================================== 
  // FORMAT DATE 
  // =========================================================== 
 
  const formatDate = (date) => { 
    if (!date) { 
      return "-"; 
    } 
 
    return new Date(date).toLocaleString("en-BD", { 
      year: "numeric", 
      month: "short", 
      day: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      hour12: true, 
    }); 
  }; 
 
  // =========================================================== 
  // STATUS BADGE 
  // =========================================================== 
 
  const getStatusBadge = (status) => { 
    switch (status) { 
 
      case "approved": 
        return ( 
          <span className="badge bg-success"> 
            Approved 
          </span> 
        ); 
 
      case "rejected": 
        return ( 
          <span className="badge bg-danger"> 
            Rejected 
          </span> 
        ); 
 
      case "cancelled": 
        return ( 
          <span className="badge bg-secondary"> 
            Cancelled 
          </span> 
        ); 
 
      case "expired": 
        return ( 
          <span className="badge bg-dark"> 
            Expired 
          </span> 
        ); 
 
      default: 
        return ( 
          <span className="badge bg-secondary"> 
            {status || "Unknown"} 
          </span> 
        ); 
    } 
  }; 
 
  // =========================================================== 
  // CATEGORIES 
  // =========================================================== 
 
  const categories = [ 
    { 
      key: "approved", 
      label: "Approved", 
      activeClass: "btn-success", 
    }, 
    { 
      key: "rejected", 
      label: "Rejected", 
      activeClass: "btn-danger", 
    }, 
    { 
      key: "cancelled", 
      label: "Cancelled", 
      activeClass: "btn-secondary", 
    }, 
    { 
      key: "expired", 
      label: "Expired", 
      activeClass: "btn-dark", 
    }, 
  ]; 
 
  // =========================================================== 
  // FILTER 
  // =========================================================== 
 
  const filteredReservations = 
    reservations.filter( 
      (reservation) => 
        reservation.status === 
        selectedCategory 
    ); 
 
  // =========================================================== 
  // LOADING 
  // =========================================================== 
 
  if (loading) { 
    return ( 
      <div className="container mt-5"> 
 
        <div className="text-center"> 
 
          <div 
            className="spinner-border" 
            role="status" 
          ></div> 
 
          <p className="mt-2"> 
            Loading reservation history... 
          </p> 
 
        </div> 
 
      </div> 
    ); 
  } 
 
  // =========================================================== 
  // PAGE 
  // =========================================================== 
 
  return ( 
    <div className="container mt-5"> 
 
      {/* ===================================================== 
          HEADER 
      ===================================================== */} 
 
      <div className="d-flex justify-content-between align-items-center mb-4"> 
 
        <div> 
 
          <h2 className="mb-1"> 
            Reservation History 
          </h2> 
 
          <p className="text-muted mb-0"> 
            View approved, rejected, cancelled and 
            expired reservations. 
          </p> 
 
        </div> 
 
        <button 
          type="button" 
          className="btn btn-outline-primary" 
          onClick={loadReservations} 
        > 
          Refresh 
        </button> 
 
      </div> 
 
      {/* ===================================================== 
          CATEGORY BUTTONS 
      ===================================================== */} 
 
      <div className="mb-4"> 
 
        {categories.map((category) => { 
 
          const count = 
            reservations.filter( 
              (reservation) => 
                reservation.status === 
                category.key 
            ).length; 
 
          const buttonClass = 
            selectedCategory === 
            category.key 
              ? category.activeClass 
              : `btn-outline-${category.activeClass.replace( 
                  "btn-", 
                  "" 
                )}`; 
 
          return ( 
            <button 
              type="button" 
              key={category.key} 
              className={`btn ${buttonClass} me-2 mb-2`} 
              onClick={() => 
                setSelectedCategory( 
                  category.key 
                ) 
              } 
            > 
              {category.label} 
 
              <span className="badge bg-light text-dark ms-2"> 
                {count} 
              </span> 
            </button> 
          ); 
        })} 
 
      </div> 
 
      {/* ===================================================== 
          EMPTY 
      ===================================================== */} 
 
      {filteredReservations.length === 0 ? ( 
 
        <div className="alert alert-info"> 
          No{" "} 
          {selectedCategory}{" "} 
          reservation records found. 
        </div> 
 
      ) : ( 
 
        <div className="table-responsive"> 
 
          <table className="table table-bordered table-hover align-middle"> 
 
            <thead className="table-dark"> 
 
              <tr> 
 
                <th> 
                  Student 
                </th> 
 
                <th> 
                  Building 
                </th> 
 
                <th> 
                  Room 
                </th> 
 
                <th> 
                  Bed 
                </th> 
 
                <th> 
                  Status 
                </th> 
 
                <th> 
                  Requested 
                </th> 
 
                <th> 
                  Hold Expires 
                </th> 
 
                <th> 
                  Action 
                </th> 
 
              </tr> 
 
            </thead> 
 
            <tbody> 
 
              {filteredReservations.map((r) => { 
 
                const holdExpired = 
                  r.holdExpiresAt && 
                  new Date( 
                    r.holdExpiresAt 
                  ) < new Date(); 
 
                return ( 
                  <tr key={r._id}> 
 
                    {/* STUDENT */} 
 
                    <td> 
 
                      <div className="fw-semibold"> 
                        {r.student?.name || 
                          r.applicantDetails?.fullName || 
                          "-"} 
                      </div> 
 
                      <small className="text-muted"> 
                        {r.student?.email || 
                          r.applicantDetails?.email || 
                          "-"} 
                      </small> 
 
                    </td> 
 
                    {/* BUILDING */} 
 
                    <td> 
                      {r.room?.building?.name || 
                        "-"} 
                    </td> 
 
                    {/* ROOM */} 
 
                    <td> 
                      {r.room?.roomNumber || 
                        "-"} 
                    </td> 
 
                    {/* BED */} 
 
                    <td> 
                      {r.bedNumber || "-"} 
                    </td> 
 
                    {/* STATUS */} 
 
                    <td> 
                      {getStatusBadge( 
                        r.status 
                      )} 
                    </td> 
 
                    {/* REQUESTED */} 
 
                    <td> 
                      {formatDate( 
                        r.createdAt 
                      )} 
                    </td> 
 
                    {/* HOLD EXPIRES */} 
 
                    <td 
                      className={ 
                        holdExpired 
                          ? "text-danger fw-bold" 
                          : "" 
                      } 
                    > 
 
                      {formatDate( 
                        r.holdExpiresAt 
                      )} 
 
                      {holdExpired && ( 
                        <span className="ms-1"> 
                          (expired) 
                        </span> 
                      )} 
 
                    </td> 
 
                    {/* VIEW DETAILS ONLY */} 
 
                    <td> 
 
                      <button 
                        type="button" 
                        className="btn btn-outline-primary btn-sm" 
                        onClick={() => 
                          setDetailsReservation( 
                            r 
                          ) 
                        } 
                      > 
                        View Details 
                      </button> 
 
                    </td> 
 
                  </tr> 
                ); 
              })} 
 
            </tbody> 
 
          </table> 
 
        </div> 
 
      )} 
 
      {/* ===================================================== 
          DETAILS MODAL 
      ===================================================== */} 
 
      {detailsReservation && ( 
 
        <div 
          className="modal d-block" 
          tabIndex="-1" 
          role="dialog" 
          style={{ 
            background: 
              "rgba(0,0,0,0.5)", 
          }} 
        > 
 
          <div 
            className="modal-dialog modal-dialog-scrollable" 
            role="document" 
          > 
 
            <div className="modal-content"> 
 
              {/* HEADER */} 
 
              <div className="modal-header"> 
 
                <div> 
 
                  <h5 className="modal-title"> 
                    Reservation Details 
                  </h5> 
 
                  <div className="mt-1"> 
                    {getStatusBadge( 
                      detailsReservation.status 
                    )} 
                  </div> 
 
                </div> 
 
                <button 
                  type="button" 
                  className="btn-close" 
                  aria-label="Close" 
                  onClick={() => 
                    setDetailsReservation( 
                      null 
                    ) 
                  } 
                /> 
 
              </div> 
 
              {/* BODY */} 
 
              <div className="modal-body"> 
 
                {/* ================================================= 
                    APPLICANT DETAILS 
                ================================================= */} 
 
                <h6 className="mb-3"> 
                  Applicant Information 
                </h6> 
 
                {detailsReservation 
                  .applicantDetails ? ( 
 
                  <table className="table table-sm table-borderless mb-3"> 
 
                    <tbody> 
 
                      <tr> 
                        <th 
                          className="text-muted" 
                          style={{ 
                            width: "40%", 
                          }} 
                        > 
                          Full Name 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .fullName 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Email 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .email 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Phone 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .phone || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Address 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .address || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Institution 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .institutionName || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Student ID 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .studentId || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Blood Group 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .bloodGroup || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Father's Name 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .fatherName || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Father's Phone 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .fatherPhone || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Mother's Name 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .motherName || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                      <tr> 
                        <th className="text-muted"> 
                          Mother's Phone 
                        </th> 
 
                        <td> 
                          { 
                            detailsReservation 
                              .applicantDetails 
                              .motherPhone || 
                            "-" 
                          } 
                        </td> 
                      </tr> 
 
                    </tbody> 
 
                  </table> 
 
                ) : ( 
 
                  <p className="text-muted"> 
                    No applicant details 
                    available. 
                  </p> 
 
                )} 
 
                <hr /> 
 
                {/* ================================================= 
                    RESERVATION INFORMATION 
                ================================================= */} 
 
                <h6 className="mb-3"> 
                  Reservation Information 
                </h6> 
 
                <table className="table table-sm table-borderless"> 
 
                  <tbody> 
 
                    <tr> 
                      <th 
                        className="text-muted" 
                        style={{ 
                          width: "40%", 
                        }} 
                      > 
                        Building 
                      </th> 
 
                      <td> 
                        {detailsReservation 
                          .room 
                          ?.building 
                          ?.name || "-"} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Floor 
                      </th> 
 
                      <td> 
                        {detailsReservation 
                          .room 
                          ?.floor 
                          ?.number ?? 
                          "-"} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Room 
                      </th> 
 
                      <td> 
                        {detailsReservation 
                          .room 
                          ?.roomNumber || 
                          "-"} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Bed 
                      </th> 
 
                      <td> 
                        {detailsReservation 
                          .bedNumber || 
                          "-"} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Status 
                      </th> 
 
                      <td> 
                        {getStatusBadge( 
                          detailsReservation 
                            .status 
                        )} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Requested 
                      </th> 
 
                      <td> 
                        {formatDate( 
                          detailsReservation 
                            .createdAt 
                        )} 
                      </td> 
                    </tr> 
 
                    <tr> 
                      <th className="text-muted"> 
                        Hold Expires 
                      </th> 
 
                      <td> 
                        {formatDate( 
                          detailsReservation 
                            .holdExpiresAt 
                        )} 
                      </td> 
                    </tr> 
 
                    {detailsReservation 
                      .approvedAt && ( 
 
                      <tr> 
                        <th className="text-muted"> 
                          Approved At 
                        </th> 
 
                        <td> 
                          {formatDate( 
                            detailsReservation 
                              .approvedAt 
                          )} 
                        </td> 
                      </tr> 
 
                    )} 
 
                    {detailsReservation 
                      .rejectionReason && ( 
 
                      <tr> 
                        <th className="text-muted"> 
                          Rejection Reason 
                        </th> 
 
                        <td className="text-danger"> 
                          { 
                            detailsReservation 
                              .rejectionReason 
                          } 
                        </td> 
                      </tr> 
 
                    )} 
 
                    {detailsReservation 
                      .cancelledAt && ( 
 
                      <tr> 
                        <th className="text-muted"> 
                          Cancelled At 
                        </th> 
 
                        <td> 
                          {formatDate( 
                            detailsReservation 
                              .cancelledAt 
                          )} 
                        </td> 
                      </tr> 
 
                    )} 
 
                  </tbody> 
 
                </table> 
 
              </div> 
 
              {/* FOOTER */} 
 
              <div className="modal-footer"> 
 
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => 
                    setDetailsReservation( 
                      null 
                    ) 
                  } 
                > 
                  Close 
                </button> 
 
              </div> 
 
            </div> 
 
          </div> 
 
        </div> 
 
      )} 
 
    </div> 
  ); 
} 
 
export default ReservationHistory;