import { Navigate } from "react-router-dom";
import { isAuthed } from "../lib/store";

export default function ProtectedRoute({ children }) {
  if (!isAuthed()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
