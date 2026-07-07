import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword"; // ✅ NEW
import RoomManagement from "./pages/RoomManagement";
import RoomDetails from "./pages/RoomDetails";
import RoomEdit from "./pages/RoomEdit";

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