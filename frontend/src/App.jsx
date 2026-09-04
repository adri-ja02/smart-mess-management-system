import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

import RoomManagement from "./pages/RoomManagement";
import RoomDetails from "./pages/RoomDetails";
import RoomEdit from "./pages/RoomEdit";

import LivingNeeds from "./pages/LivingNeeds";
import SpaceFitExplorer from "./pages/SpaceFitExplorer";
import MyReservations from "./pages/MyReservations";
import RequestBedForm from "./pages/RequestBedForm";
import PendingReservations from "./pages/PendingReservations";
import ReservationHistory from "./pages/ReservationHistory";
import Waitlist from "./pages/Waitlist";
import ManagerWaitlist from "./pages/ManagerWaitlist";

import MealPlanner from "./pages/MealPlanner";
import MealCheckIn from "./pages/MealCheckIn";
import Billing from "./pages/Billing";
import DemandForecast from "./pages/DemandForecast";
import FoodWaste from "./pages/FoodWaste";

/*
 * MODULE 3
 * CONFIDENTIAL COMPLAINT SYSTEM
 */

/* Resident */
import AnonymousComplaint from "./pages/AnonymousComplaint";
import ComplaintSubmitted from "./pages/ComplaintSubmitted";
import TrackComplaint from "./pages/TrackComplaint";

/* Admin */
import AdminComplaintList from "./pages/AdminComplaintList";
import AdminComplaintReview from "./pages/AdminComplaintReview";
import ComplaintAnalytics from "./pages/ComplaintAnalytics";

/* Manager */
import ManagerComplaintDashboard from "./pages/ManagerComplaintDashboard";
import ManagerComplaintDetail from "./pages/ManagerComplaintDetail";

function App() {
  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <Routes>

          {/* =========================================================
              DEFAULT ROUTE
          ========================================================= */}

          <Route
            path="/"
            element={
              <Navigate to="/auth" replace />
            }
          />

          {/* =========================================================
              AUTH
          ========================================================= */}

          <Route
            path="/auth"
            element={<Auth />}
          />

          {/* =========================================================
              CHANGE PASSWORD
          ========================================================= */}

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              STUDENT DASHBOARD
          ========================================================= */}

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MANAGER DASHBOARD
          ========================================================= */}

          <Route
            path="/manager"
            element={
              <ProtectedRoute role="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ADMIN DASHBOARD
          ========================================================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              PROFILE
          ========================================================= */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              STUDENT RESERVATIONS
          ========================================================= */}

          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute role="student">
                <MyReservations />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MANAGER - PENDING RESERVATIONS

              ONLY:
              - Pending
              - Approve
              - Reject
          ========================================================= */}

          <Route
            path="/pending-reservations"
            element={
              <ProtectedRoute role="manager">
                <PendingReservations />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MANAGER - RESERVATION HISTORY

              ONLY:
              - Approved
              - Rejected
              - Cancelled
              - Expired
              - View Details

              NO APPROVE / REJECT
          ========================================================= */}

          <Route
            path="/reservation-history"
            element={
              <ProtectedRoute role="manager">
                <ReservationHistory />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              STUDENT - WAITLIST
          ========================================================= */}

          <Route
            path="/waitlist"
            element={
              <ProtectedRoute role="student">
                <Waitlist />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MANAGER - WAITLIST
          ========================================================= */}

          <Route
            path="/manager-waitlist"
            element={
              <ProtectedRoute role="manager">
                <ManagerWaitlist />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ROOM MANAGEMENT - MANAGER
          ========================================================= */}

          <Route
            path="/rooms"
            element={
              <ProtectedRoute role="manager">
                <RoomManagement />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ROOM DETAILS
          ========================================================= */}

          <Route
            path="/rooms/:id"
            element={
              <RoomDetails />
            }
          />

          {/* =========================================================
              BED REQUEST - STUDENT
          ========================================================= */}

          <Route
            path="/rooms/:id/request-bed"
            element={
              <ProtectedRoute role="student">
                <RequestBedForm />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ROOM EDIT - MANAGER
          ========================================================= */}

          <Route
            path="/rooms/edit/:id"
            element={
              <ProtectedRoute role="manager">
                <RoomEdit />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MODULE 1 - SPACE FIT
          ========================================================= */}

          <Route
            path="/living-needs"
            element={
              <ProtectedRoute role="student">
                <LivingNeeds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spacefit"
            element={
              <ProtectedRoute role="student">
                <SpaceFitExplorer />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MODULE 2 - MEAL PLANNER
          ========================================================= */}

          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MODULE 2 - MEAL CHECK-IN
          ========================================================= */}

          <Route
            path="/meal-checkin"
            element={
              <ProtectedRoute>
                <MealCheckIn />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              BILLING
          ========================================================= */}

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              DEMAND FORECAST
          ========================================================= */}

          <Route
            path="/forecast"
            element={
              <ProtectedRoute>
                <DemandForecast />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              FOOD WASTE
          ========================================================= */}

          <Route
            path="/food-waste"
            element={
              <ProtectedRoute>
                <FoodWaste />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MODULE 3
              CONFIDENTIAL COMPLAINT SYSTEM
          ========================================================= */}

          {/* =========================================================
              RESIDENT - NEW COMPLAINT
          ========================================================= */}

          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute role="student">
                <AnonymousComplaint />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              RESIDENT - COMPLAINT SUBMITTED
          ========================================================= */}

          <Route
            path="/complaints/submitted"
            element={
              <ProtectedRoute role="student">
                <ComplaintSubmitted />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              RESIDENT - TOKEN TRACKING

              Token-based confidential follow-up.
          ========================================================= */}

          <Route
            path="/complaints/track"
            element={
              <TrackComplaint />
            }
          />

          {/* =========================================================
              MANAGER - VALID COMPLAINTS
          ========================================================= */}

          <Route
            path="/manager/complaints"
            element={
              <ProtectedRoute role="manager">
                <ManagerComplaintDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              MANAGER - COMPLAINT DETAIL
          ========================================================= */}

          <Route
            path="/manager/complaints/:id"
            element={
              <ProtectedRoute role="manager">
                <ManagerComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ADMIN - COMPLAINT LIST
          ========================================================= */}

          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute role="admin">
                <AdminComplaintList />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ADMIN - COMPLAINT ANALYTICS

              IMPORTANT:
              Keep this BEFORE /admin/complaints/:id/review.
          ========================================================= */}

          <Route
            path="/admin/complaints/analytics"
            element={
              <ProtectedRoute role="admin">
                <ComplaintAnalytics />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              ADMIN - INDEPENDENT COMPLAINT REVIEW
          ========================================================= */}

          <Route
            path="/admin/complaints/:id/review"
            element={
              <ProtectedRoute role="admin">
                <AdminComplaintReview />
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              404
          ========================================================= */}

          <Route
            path="*"
            element={
              <div className="text-center mt-5">
                <h2>
                  404 - Page Not Found
                </h2>
                <p className="text-muted">
                  The page you are looking for
                  does not exist.
                </p>
              </div>
            }
          />

        </Routes>
      </div>
    </>
  );
}

export default App;