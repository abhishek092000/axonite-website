import { Navigate } from "react-router-dom";
import { getAdminUser } from "../lib/store";

// Admin account management is reserved for the permanent main admin.
export default function MainAdminRoute({ children }) {
  const admin = getAdminUser();

  if (!admin?.is_main) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
