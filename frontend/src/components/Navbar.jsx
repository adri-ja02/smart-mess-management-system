import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow"
      style={{ background: "#6D597A" }}
    >
      <div className="container">

        {/* BRAND */}
        <Link className="navbar-brand fw-bold" to="/">
           Smart Student Mess and SpaceFit Room Allocation System
        </Link>

        {/* MOBILE TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">

            {/* =========================
                NOT LOGGED IN
            ========================= */}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Login / Register
                </Link>
              </li>
            )}

            {/* =========================
                LOGGED IN USERS
            ========================= */}
            {user && (
              <>

                {/* STUDENT */}
                {user.role === "student" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/student">
                      Dashboard
                    </Link>
                  </li>
                )}

                {/* MANAGER */}
                {user.role === "manager" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/manager">
                      Dashboard
                    </Link>
                  </li>
                )}
                {/* MODULE 2 - MEAL PLANNER */}
                {(user.role === "student" || user.role === "manager") && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/meal-planner">
                      Meal Planner
                    </Link>
                  </li>
                )}
                {/* MODULE 2 - MEAL CHECK-IN */}
                {/* FIX: this link was missing — MealCheckIn.jsx had no way
                    to be reached from the navbar. */}
                {(user.role === "student" || user.role === "manager") && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/meal-checkin">
                      Meal Check-in
                    </Link>
                  </li>
                )}

              <Link></Link>
              

<li className="nav-item">
  <Link className="nav-link" to="/billing">
    Billing
  </Link>
</li>

<li className="nav-item">
  <Link className="nav-link" to="/forecast">
    Forecast
  </Link>
</li>

<li className="nav-item">
  <Link className="nav-link" to="/food-waste">
    Food Waste
  </Link>
</li>

                {/* ADMIN */}
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Admin Panel
                    </Link>
                  </li>
                )}

                {/* USER INFO */}
                <li className="nav-item">
                  <span className="nav-link">👤 {user.name}</span>
                </li>

                {/* LOGOUT */}
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>

              </>
            )}

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
