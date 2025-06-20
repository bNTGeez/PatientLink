import { Routes, Route, Navigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Routes>
      {/* If authenticated, redirect to dashboard, otherwise show home */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
        }
      />

      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
      />

      {/* Direct routes to specific dashboards */}
      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/patient"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
