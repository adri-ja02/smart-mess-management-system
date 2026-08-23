import { useState } from "react"; 
import { useNavigate, Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import roomService from "../services/roomService"; 
import RoomCard from "../components/RoomCard"; 
 
function StudentDashboard() { 
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
 
  const [rooms, setRooms] = useState([]); 
  const [showRooms, setShowRooms] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
 
  // ========================================================= 
  // LOAD ALL ROOMS 
  // ========================================================= 
 
  const loadRooms = async () => { 
    try { 
      setLoading(true); 
 
      const res = await roomService.getRooms(); 
 
      setRooms(res.data.rooms || []); 
      setShowRooms(true); 
    } catch (error) { 
      console.log("Room loading error:", error); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  // ========================================================= 
  // SEARCH THROUGH ANY ROOM DETAIL 
  // ========================================================= 
 
  const searchRoomDetails = (value, search) => { 
    if (value === null || value === undefined) { 
      return false; 
    } 
 
    if ( 
      typeof value === "string" || 
      typeof value === "number" 
    ) { 
      return String(value) 
        .toLowerCase() 
        .includes(search); 
    } 
 
    if (Array.isArray(value)) { 
      return value.some((item) => 
        searchRoomDetails(item, search) 
      ); 
    } 
 
    if (typeof value === "object") { 
      return Object.values(value).some((item) => 
        searchRoomDetails(item, search) 
      ); 
    } 
 
    return false; 
  }; 
 
  const filteredRooms = rooms.filter((room) => { 
    const search = searchTerm.trim().toLowerCase(); 
 
    if (!search) { 
      return true; 
    } 
 
    return searchRoomDetails(room, search); 
  }); 
 
  // ========================================================= 
  // LOGOUT 
  // ========================================================= 
 
  const handleLogout = () => { 
    logout(); 
    navigate("/auth"); 
  }; 
 
  // ========================================================= 
  // FORMATTED ROLE 
  // ========================================================= 
 
  const formattedRole = user?.role 
    ? user.role.charAt(0).toUpperCase() + 
      user.role.slice(1) 
    : "Student"; 
 
  // ========================================================= 
  // COMMON ACTION BUTTON STYLE 
  // ========================================================= 
 
  const actionButtonStyle = { 
    borderRadius: "50px", 
    fontWeight: "500", 
    padding: "10px 20px", 
    border: "1px solid transparent", 
    transition: "all 0.2s ease", 
    whiteSpace: "nowrap", 
  }; 
 
  return ( 
    <div 
      style={{ 
        minHeight: "100vh", 
        padding: "12px 0 30px", 
        position: "relative", 
        overflow: "hidden", 
 
        background: 
          "linear-gradient(135deg, #fff7ed 0%, #f0fdfa 35%, #eff6ff 68%, #fdf2f8 100%)", 
      }} 
    > 
      {/* ===================================================== 
          BACKGROUND DECORATIONS 
      ===================================================== */} 
 
      <div 
        style={{ 
          position: "absolute", 
          width: "300px", 
          height: "300px", 
          borderRadius: "50%", 
          background: "rgba(20, 184, 166, 0.14)", 
          top: "-120px", 
          left: "-100px", 
          filter: "blur(8px)", 
        }} 
      /> 
 
      <div 
        style={{ 
          position: "absolute", 
          width: "280px", 
          height: "280px", 
          borderRadius: "50%", 
          background: "rgba(249, 115, 22, 0.13)", 
          top: "8%", 
          right: "-130px", 
          filter: "blur(8px)", 
        }} 
      /> 
 
      <div 
        style={{ 
          position: "absolute", 
          width: "280px", 
          height: "280px", 
          borderRadius: "50%", 
          background: "rgba(139, 92, 246, 0.12)", 
          bottom: "-130px", 
          left: "8%", 
          filter: "blur(8px)", 
        }} 
      /> 
 
      <div 
        style={{ 
          position: "absolute", 
          width: "250px", 
          height: "250px", 
          borderRadius: "50%", 
          background: "rgba(236, 72, 153, 0.10)", 
          bottom: "4%", 
          right: "4%", 
          filter: "blur(8px)", 
        }} 
      /> 
 
      {/* ===================================================== 
          MAIN CONTAINER 
      ===================================================== */} 
 
      <div 
        className="container" 
        style={{ 
          maxWidth: "1200px", 
          position: "relative", 
          zIndex: 1, 
        }} 
      > 
        <div 
          className="card border-0" 
          style={{ 
            borderRadius: "18px", 
            overflow: "hidden", 
            background: "#ffffff", 
            boxShadow: 
              "0 14px 40px rgba(15, 23, 42, 0.13)", 
          }} 
        > 
          <div 
            className="card-body" 
            style={{ 
              padding: "14px 30px 30px", 
            }} 
          > 
            {/* ================================================= 
                HEADER 
            ================================================= */} 
 
            <div 
              className="text-center" 
              style={{ 
                marginBottom: "10px", 
              }} 
            > 
              <div 
                style={{ 
                  width: "100%", 
                  padding: "9px 20px", 
                  background: "#0f766e", 
                  borderRadius: "9px", 
                  color: "#ffffff", 
                  border: "1px solid #0f766e", 
                  boxShadow: 
                    "0 4px 12px rgba(15, 118, 110, 0.18)", 
                }} 
              > 
                <h2 
                  className="fw-bold mb-0" 
                  style={{ 
                    fontSize: "23px", 
                    lineHeight: "1.2", 
                  }} 
                > 
                  Student Dashboard 
                </h2> 
 
                <p 
                  className="mb-0" 
                  style={{ 
                    fontSize: "12px", 
                    marginTop: "2px", 
                    color: "#e6fffb", 
                  }} 
                > 
                  Smart Student Mess & SpaceFit Room 
                  Allocation System 
                </p> 
              </div> 
            </div> 
 
            <hr 
              style={{ 
                margin: "10px 0 18px", 
                borderColor: "#d7e9e7", 
              }} 
            /> 
 
            {/* ================================================= 
                STUDENT INFO 
            ================================================= */} 
 
            <div 
              className="mb-3" 
              style={{ 
                background: "#fff7ed", 
                border: "1px solid #fed7aa", 
                borderLeft: "4px solid #f97316", 
                borderRadius: "11px", 
                padding: "15px 18px", 
                boxShadow: 
                  "0 4px 12px rgba(249, 115, 22, 0.07)", 
              }} 
            > 
              <h5 
                className="fw-bold mb-2" 
                style={{ 
                  color: "#9a3412", 
                }} 
              > 
                Welcome, {user?.name} 👋 
              </h5> 
 
              <p className="mb-1"> 
                <strong>Email:</strong> {user?.email} 
              </p> 
 
              <p className="mb-0"> 
                <strong>Role:</strong>{" "} 
                <span 
                  style={{ 
                    color: "#7c3aed", 
                    fontWeight: "500", 
                  }} 
                > 
                  {formattedRole} 
                </span> 
              </p> 
            </div> 
 
            {/* ================================================= 
                ACTION BUTTONS 
            ================================================= */} 
 
            <div 
              className="d-flex flex-wrap" 
              style={{ 
                columnGap: "16px", 
                rowGap: "14px", 
                marginBottom: "18px", 
              }} 
            > 
              {/* MY PROFILE */} 
 
              <button 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#2563eb", 
                  borderColor: "#2563eb", 
                  color: "#ffffff", 
                }} 
                onClick={() => 
                  navigate("/profile") 
                } 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#1d4ed8"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#2563eb"; 
                }} 
              > 
                👤 My Profile 
              </button> 
 
              {/* SPACEFIT ROOMS */} 
 
              <button 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#7c3aed", 
                  borderColor: "#7c3aed", 
                  color: "#ffffff", 
                }} 
                onClick={() => 
                  navigate("/living-needs") 
                } 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#6d28d9"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#7c3aed"; 
                }} 
              > 
                🏠 Find SpaceFit Rooms 
              </button> 
 
              {/* MY RESERVATIONS */} 
 
              <Link 
                to="/my-reservations" 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#16a34a", 
                  borderColor: "#16a34a", 
                  color: "#ffffff", 
                }} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#15803d"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#16a34a"; 
                }} 
              > 
                📋 My Reservations 
              </Link> 
 
              {/* MY WAITLIST */} 
 
              <Link 
                to="/waitlist" 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#f59e0b", 
                  borderColor: "#f59e0b", 
                  color: "#ffffff", 
                }} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#d97706"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#f59e0b"; 
                }} 
              > 
                ⏳ My Waitlist 
              </Link> 
 
              {/* ================================================= 
                  FORCE NEXT ROW 
              ================================================= */} 
 
              <div 
                style={{ 
                  flexBasis: "100%", 
                  height: "0", 
                }} 
              /> 
 
              {/* ================================================= 
                  COMPLAINTS 
              ================================================= */} 
 
              <Link 
                to="/complaints/new" 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#dc2626", 
                  borderColor: "#dc2626", 
                  color: "#ffffff", 
                }} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#b91c1c"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#dc2626"; 
                }} 
              > 
                🛠️ Complaints 
              </Link> 
 
              {/* TRACK COMPLAINT */} 
 
              <Link 
                to="/complaints/track" 
                className="btn" 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "#0891b2", 
                  borderColor: "#0891b2", 
                  color: "#ffffff", 
                }} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#0e7490"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#0891b2"; 
                }} 
              > 
                🔎 Track My Complaint 
              </Link> 
            </div> 
 
            {/* ================================================= 
                DISCOVER ROOMS 
            ================================================= */} 
 
            <div className="row mt-3"> 
              <div className="col-md-6 mb-3"> 
                <div 
                  className="card h-100" 
                  style={{ 
                    borderRadius: "12px", 
                    background: "#fdf2f8", 
                    border: "1px solid #f9a8d4", 
                    boxShadow: 
                      "0 6px 16px rgba(236, 72, 153, 0.10)", 
                  }} 
                > 
                  <div className="card-body"> 
                    <h4 
                      className="fw-bold" 
                      style={{ 
                        color: "#be185d", 
                      }} 
                    > 
                      🏠 Discover Rooms 
                    </h4> 
 
                    <p 
                      style={{ 
                        color: "#6b5362", 
                      }} 
                    > 
                      Browse available rooms and 
                      explore Room Space Passport 
                      details. 
                    </p> 
 
                    <button 
                      className="btn" 
                      style={{ 
                        borderRadius: "7px", 
                        fontWeight: "400", 
                        fontSize: "15px", 
                        padding: "9px 22px", 
                        backgroundColor: "#db2777", 
                        border: 
                          "1px solid #db2777", 
                        color: "#ffffff", 
                        boxShadow: 
                          "0 4px 10px rgba(219, 39, 119, 0.18)", 
                      }} 
                      onClick={loadRooms} 
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = 
                          "#be185d"; 
                      }} 
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = 
                          "#db2777"; 
                      }} 
                    > 
                      Browse Rooms 
                    </button> 
                  </div> 
                </div> 
              </div> 
            </div> 
 
            {/* ================================================= 
                ROOMS + SEARCH 
            ================================================= */} 
 
            {showRooms && ( 
              <div className="mt-4"> 
                {/* ================================================= 
                    SEARCH BAR 
                ================================================= */} 
 
                <div 
                  className="mb-4" 
                  style={{ 
                    background: "#ecfeff", 
                    border: "1px solid #99f6e4", 
                    borderRadius: "12px", 
                    padding: "16px", 
                    boxShadow: 
                      "0 4px 12px rgba(20, 184, 166, 0.07)", 
                  }} 
                > 
                  <label 
                    className="fw-bold mb-2" 
                    style={{ 
                      color: "#0f766e", 
                      fontSize: "15px", 
                    }} 
                  > 
                    🔎 Find Your Required Room 
                  </label> 
 
                  <div className="input-group"> 
                    <span 
                      className="input-group-text" 
                      style={{ 
                        background: "#ffffff", 
                        border: 
                          "1px solid #99f6e4", 
                        color: "#0d9488", 
                        fontSize: "18px", 
                      }} 
                    > 
                      🔍 
                    </span> 
 
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search by building, room, floor, rent, amenities, bathroom, location..." 
                      value={searchTerm} 
                      onChange={(e) => 
                        setSearchTerm( 
                          e.target.value 
                        ) 
                      } 
                      style={{ 
                        border: 
                          "1px solid #99f6e4", 
                        boxShadow: "none", 
                        padding: "11px 14px", 
                      }} 
                    /> 
 
                    {searchTerm && ( 
                      <button 
                        className="btn" 
                        type="button" 
                        onClick={() => 
                          setSearchTerm("") 
                        } 
                        style={{ 
                          backgroundColor: 
                            "#14b8a6", 
                          border: 
                            "1px solid #14b8a6", 
                          color: "#ffffff", 
                          fontWeight: "400", 
                        }} 
                      > 
                        ✕ 
                      </button> 
                    )} 
                  </div> 
 
                  <small 
                    className="d-block mt-2" 
                    style={{ 
                      color: "#55736f", 
                      fontSize: "12px", 
                    }} 
                  > 
                    Search using any available 
                    room detail: building, room 
                    number, floor, rent, amenities, 
                    bathroom, location, bed, area, 
                    storage, lighting, ventilation, 
                    and more. 
                  </small> 
                </div> 
 
                {/* ================================================= 
                    ROOM HEADER 
                ================================================= */} 
 
                <div className="d-flex justify-content-between align-items-center mb-4"> 
                  <h3 
                    className="mb-0 fw-bold" 
                    style={{ 
                      color: "#334155", 
                    }} 
                  > 
                    Available Rooms 
                  </h3> 
 
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: "#7c3aed", 
                      borderRadius: "12px", 
                      padding: "7px 12px", 
                      fontWeight: "500", 
                    }} 
                  > 
                    {filteredRooms.length}{" "} 
                    {filteredRooms.length === 1 
                      ? "Room" 
                      : "Rooms"} 
                  </span> 
                </div> 
 
                {/* ================================================= 
                    LOADING / ROOM RESULTS 
                ================================================= */} 
 
                {loading ? ( 
                  <div className="text-center"> 
                    <div 
                      className="spinner-border" 
                      style={{ 
                        color: "#0d9488", 
                      }} 
                      role="status" 
                    /> 
 
                    <p className="mt-2"> 
                      Loading rooms... 
                    </p> 
                  </div> 
                ) : ( 
                  <div className="row"> 
                    {filteredRooms.length > 0 ? ( 
                      filteredRooms.map((room) => ( 
                        <RoomCard 
                          key={room._id} 
                          room={room} 
                        /> 
                      )) 
                    ) : ( 
                      <div className="col-12"> 
                        <div 
                          className="text-center p-4" 
                          style={{ 
                            background: "#fff1f2", 
                            border: 
                              "1px solid #fecdd3", 
                            borderRadius: "12px", 
                            color: "#be123c", 
                            boxShadow: 
                              "0 4px 12px rgba(225, 29, 72, 0.06)", 
                          }} 
                        > 
                          <div 
                            style={{ 
                              fontSize: "30px", 
                              marginBottom: "8px", 
                            }} 
                          > 
                            🔍 
                          </div> 
 
                          <h5 className="fw-bold"> 
                            No Matching Room Found 
                          </h5> 
 
                          <p className="mb-0 text-muted"> 
                            {searchTerm 
                              ? `No room matches "${searchTerm}". Try another room detail.` 
                              : "No rooms are currently available."} 
                          </p> 
                        </div> 
                      </div> 
                    )} 
                  </div> 
                )} 
              </div> 
            )} 
 
            {/* ================================================= 
                LOGOUT 
            ================================================= */} 
 
            <div 
              className="mt-3 pt-3" 
              style={{ 
                borderTop: 
                  "1px solid #dbe5e7", 
              }} 
            > 
              <button 
                className="btn" 
                style={{ 
                  borderRadius: "7px", 
                  fontWeight: "400", 
                  padding: "9px 18px", 
                  backgroundColor: "#dc2626", 
                  border: "1px solid #dc2626", 
                  color: "#ffffff", 
                }} 
                onClick={handleLogout} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#b91c1c"; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 
                    "#dc2626"; 
                }} 
              > 
                🚪 Logout 
              </button> 
            </div> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
} 
 
export default StudentDashboard;