import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  /* =========================================================
     HIDE NAVBAR ON LOGIN / REGISTER PAGE
     ========================================================= */

  if (location.pathname === "/auth") {
    return null;
  }

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  /* =========================================================
     GET FIRST NAME
     ========================================================= */

  const getFirstName = () => {
    if (!user?.name) {
      return "User";
    }

    return user.name.trim().split(" ")[0];
  };

  return (
    <nav className="main-navbar navbar navbar-expand-xl navbar-dark">

      <div className="navbar-container">

        {/* =====================================================
            PROJECT TITLE
            ===================================================== */}

        <Link
          to="/"
          className="project-title"
        >
          <span className="project-title-main">
            Smart Student Mess
          </span>

          <span className="title-ampersand">
            &
          </span>

          <span className="project-title-sub">
            SpaceFit Room Allocation System
          </span>
        </Link>


        {/* =====================================================
            MOBILE TOGGLER
            ===================================================== */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>


        {/* =====================================================
            NAVIGATION
            ===================================================== */}

        <div
          className="collapse navbar-collapse"
          id="mainNavbar"
        >

          <div className="navbar-menu">

            {/* =================================================
                NOT LOGGED IN
                ================================================= */}

            {!user && (
              <Link
                to="/auth"
                className="nav-box login-box"
              >
                Login / Register
              </Link>
            )}


            {/* =================================================
                LOGGED IN USERS
                ================================================= */}

            {user && (
              <>

                {/* =============================================
                    STUDENT / MANAGER DASHBOARD
                    ============================================= */}

                {(user.role === "student" ||
                  user.role === "manager") && (

                  <Link
                    to={
                      user.role === "student"
                        ? "/student"
                        : "/manager"
                    }
                    className="nav-box"
                  >
                    Dashboard
                  </Link>

                )}


                {/* =============================================
                    MEAL PLANNER
                    ============================================= */}

                {(user.role === "student" ||
                  user.role === "manager") && (

                  <Link
                    to="/meal-planner"
                    className="nav-box"
                  >
                    Meal Planner
                  </Link>

                )}


                {/* =============================================
                    MEAL CHECK-IN
                    ============================================= */}

                {(user.role === "student" ||
                  user.role === "manager") && (

                  <Link
                    to="/meal-checkin"
                    className="nav-box"
                  >
                    Meal Check-in
                  </Link>

                )}


                {/* =============================================
                    BILLING
                    HIDDEN FOR ADMIN
                    ============================================= */}

                {user.role !== "admin" && (

                  <Link
                    to="/billing"
                    className="nav-box"
                  >
                    Billing
                  </Link>

                )}


                {/* =============================================
                    FORECAST
                    HIDDEN FOR ADMIN
                    ============================================= */}

                {user.role !== "admin" && (

                  <Link
                    to="/forecast"
                    className="nav-box"
                  >
                    Forecast
                  </Link>

                )}


                {/* =============================================
                    FOOD WASTE
                    HIDDEN FOR ADMIN
                    ============================================= */}

                {user.role !== "admin" && (

                  <Link
                    to="/food-waste"
                    className="nav-box"
                  >
                    Food Waste
                  </Link>

                )}


                {/* =============================================
                    ADMIN PANEL
                    ============================================= */}

                {user.role === "admin" && (

                  <Link
                    to="/admin"
                    className="nav-box admin-box"
                  >
                    Admin Panel
                  </Link>

                )}


                {/* =============================================
                    PROFILE
                    ============================================= */}

                <div
                  className="profile-box"
                  onClick={() => navigate("/profile")}
                  title="View Profile"
                >

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

                  <span className="profile-name">
                    {getFirstName()}
                  </span>

                </div>


                {/* =============================================
                    LOGOUT
                    ============================================= */}

                <button
                  type="button"
                  className="logout-box"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </>
            )}

          </div>

        </div>

      </div>


      {/* =========================================================
          NAVBAR CSS
          ========================================================= */}

      <style>
        {`

        /* =====================================================
           GLOBAL
           ===================================================== */

        .main-navbar,
        .main-navbar * {
          box-sizing: border-box;
        }


        /* =====================================================
           NAVBAR
           ===================================================== */

        .main-navbar {
          width: 100%;

          min-height: 82px;

          background:
            linear-gradient(
              135deg,
              #28324A,
              #171D2E
            );

          border-bottom:
            1px solid rgba(255, 255, 255, 0.14);

          box-shadow:
            0 5px 18px rgba(0, 0, 0, 0.25);

          position: relative;

          z-index: 1000;
        }


        /* =====================================================
           CONTAINER
           ===================================================== */

        .navbar-container {
          width: 100%;

          max-width: 100%;

          margin: 0 auto;

          padding:
            11px 24px;

          display: flex;

          align-items: center;

          gap: 22px;
        }


        /* =====================================================
           PROJECT TITLE
           ===================================================== */

        .project-title {
          flex: 0 1 auto;

          min-width: 0;

          max-width: 600px;

          display: flex;

          align-items: center;

          justify-content: flex-start;

          flex-wrap: wrap;

          gap: 8px;

          color: #ffffff !important;

          text-decoration: none !important;

          line-height: 1.15;

          transition:
            all 0.25s ease;
        }


        .project-title:hover {
          transform:
            translateY(-1px);
        }


        /* =====================================================
           MAIN PROJECT TITLE
           ===================================================== */

        .project-title-main {
          color: #ffffff;

          font-size: 28px;

          font-weight: 800;

          letter-spacing: 0.2px;

          white-space: nowrap;

          text-shadow:
            0 2px 5px rgba(0, 0, 0, 0.30);
        }


        /* =====================================================
           AMPERSAND
           ===================================================== */

        .title-ampersand {
          width: 34px;

          height: 34px;

          flex-shrink: 0;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #7050bd,
              #554197
            );

          color: #ffffff;

          font-size: 21px;

          font-weight: 800;

          border:
            1px solid rgba(255, 255, 255, 0.45);

          box-shadow:
            0 3px 8px rgba(0, 0, 0, 0.30);
        }


        /* =====================================================
           SPACEFIT TITLE
           ===================================================== */

        .project-title-sub {
          color: #ddd6ff;

          font-size: 20px;

          font-weight: 750;

          white-space: nowrap;

          text-shadow:
            0 1px 4px rgba(0, 0, 0, 0.25);
        }


        /* =====================================================
           MOBILE TOGGLER
           ===================================================== */

        .navbar-toggler {
          margin-left: auto;

          flex-shrink: 0;

          border:
            1px solid rgba(255, 255, 255, 0.35);

          border-radius: 9px;

          padding:
            7px 10px;

          box-shadow: none !important;
        }


        .navbar-toggler:focus {
          box-shadow:
            0 0 0 3px
            rgba(255, 255, 255, 0.10)
            !important;
        }


        /* =====================================================
           COLLAPSE
           ===================================================== */

        .navbar-collapse {
          flex: 1;

          min-width: 0;

          justify-content: flex-end;
        }


        /* =====================================================
           NAVIGATION MENU
           ===================================================== */

        .navbar-menu {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          flex-wrap: wrap;

          gap: 7px;
        }


        /* =====================================================
           COMMON NAV BOX
           ===================================================== */

        .nav-box,
        .logout-box,
        .profile-box {
          min-height: 43px;

          flex-shrink: 0;

          border-radius: 10px;
        }


        /* =====================================================
           NAVIGATION BUTTON
           ===================================================== */

        .nav-box {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding:
            8px 14px;

          border:
            1px solid rgba(255, 255, 255, 0.30);

          background:
            rgba(255, 255, 255, 0.08);

          color: #ffffff !important;

          text-decoration: none !important;

          font-family:
            "Poppins",
            sans-serif;

          font-size: 14px;

          font-weight: 700;

          line-height: 1;

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
            0 5px 12px rgba(0, 0, 0, 0.25);
        }


        /* =====================================================
           ADMIN
           ===================================================== */

        .admin-box {
          min-width: 120px;

          background:
            rgba(112, 80, 189, 0.25);

          border-color:
            rgba(190, 170, 255, 0.45);
        }


        /* =====================================================
           LOGIN
           ===================================================== */

        .login-box {
          min-width: 150px;
        }


        /* =====================================================
           PROFILE
           ===================================================== */

        .profile-box {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding:
            4px 12px 4px 6px;

          background:
            rgba(255, 255, 255, 0.08);

          border:
            1px solid rgba(255, 255, 255, 0.32);

          cursor: pointer;

          white-space: nowrap;

          transition:
            all 0.2s ease;
        }


        .profile-box:hover {
          background:
            rgba(255, 255, 255, 0.18);

          border-color:
            rgba(255, 255, 255, 0.70);

          transform:
            translateY(-2px);

          box-shadow:
            0 5px 12px rgba(0, 0, 0, 0.25);
        }


        /* =====================================================
           PROFILE PHOTO
           ===================================================== */

        .profile-photo {
          width: 35px;

          height: 35px;

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
          width: 35px;

          height: 35px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            #ffffff;

          color:
            #28324A;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 16px;

          font-weight: 800;

          border:
            2px solid #ffffff;

          box-shadow:
            0 2px 5px rgba(0, 0, 0, 0.25);
        }


        /* =====================================================
           USER NAME
           ===================================================== */

        .profile-name {
          display: inline-block;

          max-width: 105px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #ffffff;

          font-size: 14px;

          font-weight: 700;

          letter-spacing: 0.1px;

          text-shadow:
            0 1px 3px rgba(0, 0, 0, 0.30);
        }


        /* =====================================================
           LOGOUT
           ===================================================== */

        .logout-box {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-width: 82px;

          padding:
            8px 15px;

          border:
            1px solid rgba(255, 255, 255, 0.40);

          background:
            rgba(255, 255, 255, 0.08);

          color: #ffffff;

          font-family:
            "Poppins",
            sans-serif;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          white-space: nowrap;

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
            0 5px 12px rgba(0, 0, 0, 0.25);
        }


        /* =====================================================
           LARGE DESKTOP
           ===================================================== */

        @media (min-width: 1500px) {

          .navbar-container {
            padding:
              12px 30px;

            gap: 25px;
          }

          .project-title-main {
            font-size: 29px;
          }

          .project-title-sub {
            font-size: 21px;
          }

          .nav-box,
          .logout-box {
            font-size: 14px;
          }
        }


        /* =====================================================
           LAPTOP
           ===================================================== */

        @media (max-width: 1499px) and (min-width: 1200px) {

          .navbar-container {
            padding:
              10px 16px;

            gap: 12px;
          }

          .project-title {
            max-width: 420px;
          }

          .project-title-main {
            font-size: 21px;
          }

          .project-title-sub {
            font-size: 15px;
          }

          .title-ampersand {
            width: 28px;

            height: 28px;

            font-size: 17px;
          }

          .nav-box,
          .logout-box {
            font-size: 13px;

            padding:
              7px 9px;
          }

          .profile-name {
            max-width: 70px;

            font-size: 13px;
          }

          .profile-photo,
          .profile-placeholder {
            width: 31px;

            height: 31px;
          }
        }


        /* =====================================================
           TABLET
           ===================================================== */

        @media (max-width: 1199px) {

          .navbar-container {
            padding:
              10px 18px;
          }

          .project-title {
            max-width: 75%;
          }

          .project-title-main {
            font-size: 20px;
          }

          .project-title-sub {
            font-size: 15px;
          }

          .title-ampersand {
            width: 27px;

            height: 27px;

            font-size: 17px;
          }

          .navbar-menu {
            width: 100%;

            padding-top: 15px;

            padding-bottom: 8px;

            display: flex;

            flex-direction: column;

            align-items: stretch;

            gap: 6px;
          }

          .nav-box,
          .logout-box,
          .profile-box {
            width: 100%;

            min-height: 46px;
          }

          .nav-box,
          .logout-box {
            justify-content: flex-start;

            padding:
              9px 15px;

            font-size: 15px;
          }

          .profile-box {
            justify-content: flex-start;

            padding:
              5px 12px;
          }

          .profile-name {
            max-width: none;

            font-size: 15px;
          }
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 576px) {

          .main-navbar {
            min-height: 70px;
          }

          .navbar-container {
            padding:
              9px 12px;
          }

          .project-title {
            max-width: 73%;

            gap: 5px;
          }

          .project-title-main {
            font-size: 17px;
          }

          .project-title-sub {
            font-size: 12px;

            white-space: normal;
          }

          .title-ampersand {
            width: 23px;

            height: 23px;

            font-size: 14px;
          }

          .nav-box,
          .logout-box {
            font-size: 14px;
          }

          .profile-name {
            font-size: 14px;
          }
        }

        `}
      </style>

    </nav>
  );
}

export default Navbar;