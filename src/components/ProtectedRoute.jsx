import { Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen.jsx";

export default function ProtectedRoute({ session, loading, children }) {
  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
