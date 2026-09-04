import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  role,
}) {
  const token =
    localStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Invalid user data in localStorage:",
      error
    );

    localStorage.removeItem("user");
  }

  // Not logged in
  if (!token) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  // User information missing
  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  // Role-protected route
  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;