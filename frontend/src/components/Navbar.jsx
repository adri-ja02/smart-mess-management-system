import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Get only the first name
  const getFirstName = () => {
    if (!user?.name) return "User";

    return user.name.trim().split(" ")[0];
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow"
      style={{
        background:
          "linear-gradient(135deg, #28324A, #171D2E)",
        padding: "10px 0",
      }}
    >
      <div className="container">

        {/* =====================================================
            PROJECT TITLE
        ===================================================== */}

        <Link
          className="navbar-brand project-title"
          to="/"
        >
          <span>
            Smart Student Mess
          </span>

          <span className="title-ampersand">
            &amp;
          </span>

          <span>
            SpaceFit Room Allocation System
          </span>
        </Link>


        {/* =====================================================
            MOBILE TOGGLER
        ===================================================== */}

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>


        {/* =====================================================
            NAVIGATION MENU
        ===================================================== */}

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-center gap-2">


            {/* =================================================
                NOT LOGGED IN
            ================================================= */}

            {!user && (
              <li className="nav-item">
                <Link
                  className="nav-box"
                  to="/auth"
                >
                  Login / Register
                </Link>
              </li>
            )}


            {/* =================================================
                LOGGED IN USERS
            ================================================= */}

            {user && (
              <>

                {/* =============================================
                    STUDENT DASHBOARD
                ============================================= */}

                {user.role === "student" && (
                  <li className="nav-item">
                    <Link
                      className="nav-box"
                      to="/student"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}


                {/* =============================================
                    MANAGER DASHBOARD
                ============================================= */}

                {user.role === "manager" && (
                  <li className="nav-item">
                    <Link
                      className="nav-box"
                      to="/manager"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}


                {/* =============================================
                    MEAL PLANNER
                ============================================= */}

                {(user.role === "student" ||
                  user.role === "manager") && (
                  <li className="nav-item">
                    <Link
                      className="nav-box"
                      to="/meal-planner"
                    >
                      Meal Planner
                    </Link>
                  </li>
                )}


                {/* =============================================
                    MEAL CHECK-IN
                ============================================= */}

                {(user.role === "student" ||
                  user.role === "manager") && (
                  <li className="nav-item">
                    <Link
                      className="nav-box"
                      to="/meal-checkin"
                    >
                      Meal Check-in
                    </Link>
                  </li>
                )}


                {/* =============================================
                    BILLING
                ============================================= */}

                <li className="nav-item">
                  <Link
                    className="nav-box"
                    to="/billing"
                  >
                    Billing
                  </Link>
                </li>


                {/* =============================================
                    FORECAST
                ============================================= */}

                <li className="nav-item">
                  <Link
                    className="nav-box"
                    to="/forecast"
                  >
                    Forecast
                  </Link>
                </li>


                {/* =============================================
                    FOOD WASTE
                ============================================= */}

                <li className="nav-item">
                  <Link
                    className="nav-box"
                    to="/food-waste"
                  >
                    Food Waste
                  </Link>
                </li>


                {/* =============================================
                    ADMIN
                ============================================= */}

                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link
                      className="nav-box"
                      to="/admin"
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}


                {/* =================================================
                    PROFILE PHOTO + FIRST NAME
                ================================================= */}

                <li className="nav-item">
                  <div
                    className="profile-box"
                    onClick={() => navigate("/profile")}
                    title="View Profile"
                  >

                    {/* PROFILE PHOTO */}

                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="profile-photo"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}


                    {/* FIRST NAME ONLY */}

                    <span className="profile-name">
                      {getFirstName()}
                    </span>

                  </div>
                </li>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <li className="nav-item">
                  <button
                    type="button"
                    className="logout-box"
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


      {/* =========================================================
          NAVBAR STYLING
      ========================================================= */}

      <style>
        {`

          /* =====================================================
             PROJECT TITLE
          ===================================================== */

          .project-title {
            display: flex;

            align-items: center;

            flex-wrap: wrap;

            gap: 7px;

            max-width: 520px;

            color: #ffffff !important;

            text-decoration: none !important;

            font-size: 22px;

            font-weight: 800;

            line-height: 1.2;

            letter-spacing: 0.2px;

            text-shadow:
              0 2px 5px rgba(0, 0, 0, 0.35);

            transition:
              all 0.25s ease;
          }


          .project-title:hover {
            color: #ffffff !important;

            transform:
              translateY(-1px);

            text-shadow:
              0 3px 9px rgba(0, 0, 0, 0.45);
          }


          /* =====================================================
             AMPERSAND
          ===================================================== */

          .title-ampersand {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            width: 28px;

            height: 28px;

            border-radius: 50%;

            background:
              rgba(255, 255, 255, 0.15);

            border:
              1px solid rgba(255, 255, 255, 0.35);

            font-size: 18px;

            font-weight: 800;

            color: #ffffff;

            box-shadow:
              0 2px 7px rgba(0, 0, 0, 0.25);
          }


          /* =====================================================
             NAVIGATION BOXES
          ===================================================== */

          .nav-box {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 38px;

            padding: 7px 11px;

            border-radius: 10px;

            border:
              1px solid rgba(255, 255, 255, 0.32);

            background:
              rgba(255, 255, 255, 0.08);

            color: #ffffff !important;

            text-decoration: none !important;

            font-size: 13px;

            font-weight: 600;

            white-space: nowrap;

            box-shadow:
              0 2px 5px rgba(0, 0, 0, 0.18);

            transition:
              all 0.2s ease;
          }


          /* =====================================================
             NAVIGATION HOVER
          ===================================================== */

          .nav-box:hover {
            background: #ffffff;

            color: #28324A !important;

            border-color: #ffffff;

            transform:
              translateY(-2px);

            box-shadow:
              0 4px 10px rgba(0, 0, 0, 0.25);
          }


          /* =====================================================
             PROFILE BOX
          ===================================================== */

          .profile-box {
            min-height: 38px;

            padding:
              4px 11px 4px 6px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            border-radius: 10px;

            border:
              1px solid rgba(255, 255, 255, 0.32);

            background:
              rgba(255, 255, 255, 0.08);

            cursor: pointer;

            transition:
              all 0.2s ease;

            white-space: nowrap;
          }


          /* =====================================================
             PROFILE HOVER
          ===================================================== */

          .profile-box:hover {
            background:
              rgba(255, 255, 255, 0.18);

            border-color:
              rgba(255, 255, 255, 0.65);

            transform:
              translateY(-2px);

            box-shadow:
              0 4px 10px rgba(0, 0, 0, 0.25);
          }


          /* =====================================================
             PROFILE PHOTO
          ===================================================== */

          .profile-photo {
            width: 31px;

            height: 31px;

            flex-shrink: 0;

            border-radius: 50%;

            object-fit: cover;

            border:
              2px solid #ffffff;

            box-shadow:
              0 2px 5px rgba(0, 0, 0, 0.30);
          }


          /* =====================================================
             PROFILE PLACEHOLDER
          ===================================================== */

          .profile-placeholder {
            width: 31px;

            height: 31px;

            flex-shrink: 0;

            border-radius: 50%;

            background: #ffffff;

            color: #28324A;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 14px;

            font-weight: 800;

            border:
              2px solid #ffffff;

            box-shadow:
              0 2px 5px rgba(0, 0, 0, 0.25);
          }


          /* =====================================================
             FIRST NAME
          ===================================================== */

          .profile-name {
            display: inline-block;

            max-width: 110px;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;

            color: #ffffff;

            font-size: 13px;

            font-weight: 700;

            letter-spacing: 0.1px;

            text-shadow:
              0 1px 3px rgba(0, 0, 0, 0.30);
          }


          /* =====================================================
             LOGOUT
          ===================================================== */

          .logout-box {
            min-height: 38px;

            padding:
              7px 13px;

            border-radius: 10px;

            border:
              1px solid rgba(255, 255, 255, 0.50);

            background:
              rgba(255, 255, 255, 0.08);

            color: #ffffff;

            font-size: 13px;

            font-weight: 600;

            cursor: pointer;

            box-shadow:
              0 2px 5px rgba(0, 0, 0, 0.18);

            transition:
              all 0.2s ease;
          }


          /* =====================================================
             LOGOUT HOVER
          ===================================================== */

          .logout-box:hover {
            background: #ffffff;

            color: #28324A;

            border-color: #ffffff;

            transform:
              translateY(-2px);

            box-shadow:
              0 4px 10px rgba(0, 0, 0, 0.25);
          }


          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 1200px) {

            .project-title {
              font-size: 19px;

              max-width: 400px;
            }


            .nav-box {
              font-size: 12px;

              padding:
                6px 8px;
            }


            .profile-name {
              max-width: 90px;

              font-size: 12px;
            }

          }


          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 991px) {

            .project-title {
              font-size: 18px;

              max-width: 75%;

              line-height: 1.25;
            }


            .title-ampersand {
              width: 24px;

              height: 24px;

              font-size: 16px;
            }


            .navbar-nav {
              padding-top: 15px;

              align-items:
                stretch !important;
            }


            .nav-box {
              width: 100%;

              margin: 3px 0;

              font-size: 14px;
            }


            .profile-box {
              width: 100%;

              height: 44px;

              margin: 3px 0;

              padding:
                5px 12px;

              justify-content:
                flex-start;
            }


            .profile-name {
              max-width: none;

              font-size: 14px;
            }


            .logout-box {
              width: 100%;

              margin: 3px 0;

              font-size: 14px;
            }

          }


          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 576px) {

            .project-title {
              font-size: 16px;

              max-width: 72%;
            }


            .title-ampersand {
              width: 22px;

              height: 22px;

              font-size: 14px;
            }


            .profile-name {
              font-size: 13px;
            }

          }

        `}
      </style>
    </nav>
  );
}

export default Navbar;