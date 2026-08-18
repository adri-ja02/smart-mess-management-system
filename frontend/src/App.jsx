import { Routes, Route, Navigate } from "react-router-dom";

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
import PendingReservations from "./pages/PendingReservations";
import Waitlist from "./pages/Waitlist";
import MealPlanner from "./pages/MealPlanner";
import MealCheckIn from "./pages/MealCheckIn";
import Billing from "./pages/Billing";
import DemandForecast from "./pages/DemandForecast";
import FoodWaste from "./pages/FoodWaste";
import AnonymousComplaint from "./pages/AnonymousComplaint";
import ComplaintSubmitted from "./pages/ComplaintSubmitted";
import TrackComplaint from "./pages/TrackComplaint";
import ManagerComplaintDashboard from "./pages/ManagerComplaintDashboard";
import ManagerComplaintDetail from "./pages/ManagerComplaintDetail";



function App() {
  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <Routes>
          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/auth" />} />

          {/* AUTH */}
          <Route path="/auth" element={<Auth />} />

          {/* CHANGE PASSWORD */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* STUDENT DASHBOARD */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER DASHBOARD */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute role="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute role="student">
                <MyReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pending-reservations"
            element={
              <ProtectedRoute role="manager">
                <PendingReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/waitlist"
            element={
              <ProtectedRoute role="student">
                <Waitlist />
              </ProtectedRoute>
            }
          />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ROOM MANAGEMENT */}
          <Route
            path="/rooms"
            element={
              <ProtectedRoute role="manager">
                <RoomManagement />
              </ProtectedRoute>
            }
          />

          {/* ROOM DETAILS */}
          <Route path="/rooms/:id" element={<RoomDetails />} />

          {/* ROOM EDIT */}
          <Route
            path="/rooms/edit/:id"
            element={
              <ProtectedRoute role="manager">
                <RoomEdit />
              </ProtectedRoute>
            }
          />

          {/* MODULE 1 - SPACE FIT */}
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

          {/* MODULE 2 - MEAL PLANNER */}
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />

          {/* MODULE 2 - MEAL CHECK-IN & CONSUMPTION RECORD (Sadia's feature) */}

          <Route
            path="/meal-checkin"
            element={
              <ProtectedRoute>
                <MealCheckIn />
              </ProtectedRoute>
            }
          />
        {/* BILLING */}
{/* BILLING - Student and Manager */}
<Route 
  path="/billing" 
  element={ 
    <ProtectedRoute> 
      <Billing /> 
    </ProtectedRoute> 
  } 

/>

{/* DEMAND FORECAST */}
<Route
  path="/forecast"
  element={
    <ProtectedRoute>
      <DemandForecast />
    </ProtectedRoute>
  }
/>

{/* FOOD WASTE MONITOR */}
<Route
  path="/food-waste"
  element={
    <ProtectedRoute>
      <FoodWaste />
    </ProtectedRoute>
  }
/>

{/* MODULE 3 - ANONYMOUS COMPLAINTS (Adrija's features) */}
<Route
  path="/complaints/new"
  element={
    <ProtectedRoute role="student">
      <AnonymousComplaint />
    </ProtectedRoute>
  }
/>

<Route
  path="/complaints/submitted"
  element={
    <ProtectedRoute role="student">
      <ComplaintSubmitted />
    </ProtectedRoute>
  }
/>


<Route path="/manager/complaints" element={<ManagerComplaintDashboard />} />
<Route path="/manager/complaints/:id" element={<ManagerComplaintDetail />} />
<Route path="/complaints/track" element={<TrackComplaint />} />



          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center mt-5">
                <h2>404 - Page Not Found</h2>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;