import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./components/home";
import CrimeMap from "./components/heatmap";
import AlertForm from "./admin/alerts";
import AdminDashboard from "./admin/AdminDashboard";
import CrimeReportForm from "./components/submitcrime";
import Login from "./components/login";
import Register from "./components/Register";
import CrimeStatsDashboard from "./components/crime-stats";
import UserDashboard from "./components/dashboard";
import LatestCrimeReports from "./components/LatestCrimeReports";
import AuthGuard from "./components/AuthGuard";
import { Outlet } from "react-router-dom";
import MapTabs from "./components/MapTabs";
import GISAnalysis from "./components/GISAnalysis";

const ProtectedRoute = ({ allowedRoles }) => (
  <AuthGuard allowedRoles={allowedRoles}>
    <Outlet />
  </AuthGuard>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapTabs />} />
        <Route path="/gis" element={<GISAnalysis />} />
        {/* <Route path="/map" element={<CrimeMap />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/LatestCrimeReports" element={<LatestCrimeReports />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
          <Route path="/report" element={<CrimeReportForm />} />
          <Route path="/stats" element={<CrimeStatsDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/alerts" element={<AlertForm />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
