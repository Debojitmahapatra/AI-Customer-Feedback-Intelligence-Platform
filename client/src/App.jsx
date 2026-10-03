import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FeedbackDetails from "./pages/FeedbackDetails.jsx";
import HomePage from "./pages/HomePage.jsx";
import Inbox from "./pages/Inbox.jsx";
import Login from "./pages/Login.jsx";
import Members from "./pages/Members.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Themes from "./pages/Themes.jsx";
import ThemeDetails from "./pages/ThemeDetails.jsx";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Members />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Inbox />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox/:feedbackId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FeedbackDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/themes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Themes />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/themes/:theme"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ThemeDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;