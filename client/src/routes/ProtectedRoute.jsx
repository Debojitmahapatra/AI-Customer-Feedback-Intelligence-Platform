import { Navigate, useLocation } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingState message="Restoring your session..." />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}

export default ProtectedRoute;