import { Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen.jsx";
import { isAdminEmail } from "../lib/admin.js";

export default function AdminRoute({ session, loading, children }) {
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;

  const email = session.user?.email;
  if (!isAdminEmail(email)) return <Navigate to="/app" replace />;

  return children;
}
