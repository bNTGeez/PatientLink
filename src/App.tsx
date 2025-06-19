import { Routes, Route, Navigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

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
          isAuthenticated ? <DoctorDashboard /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/dashboard/patient"
        element={
          isAuthenticated ? <PatientDashboard /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;
