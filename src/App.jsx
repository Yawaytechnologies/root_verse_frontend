// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./global.css";

// ===== Admin side imports =====
import AdminLoginPage from "./pages/admin/AdminLogin";
import WildCaptureLayout from "./components/admin/wildcapture/WildCaptureLayout";
import RegistryHubPage from "./components/admin/RegistryHub";
import AdminWildCaptureDashboard from "./components/admin/wildcapture/WildCaptureDashboard";
import VesselRegistryManagement from "./components/admin/wildcapture/VesselRegistry";

import AquaLayout from "./components/admin/aquaculture/AquaLayout";
import AquaDashboard from "./components/admin/aquaculture/AquaDashboard";
import AquaRegister from "./components/admin/aquaculture/AquaRegister";

import MariLayout from "./components/admin/mariculture/MariLayout";
import MariDashboard from "./components/admin/mariculture/MariDashboard";
import MariRegister from "./components/admin/mariculture/MariRegister";

// ===== Mariculture (user module) imports =====
import MaricultureLayout from "./layout/MaricultureLayout";
import MaricultureDashboard from "./pages/mariculture/MaricultureDashboard";
import FarmRegistry from "./pages/mariculture/FarmRegistry";
import CultivationUnits from "./pages/mariculture/CultivationUnits";
import GrowthMonitoring from "./pages/mariculture/GrowthMonitoring";
import HarvestManagement from "./pages/mariculture/HarvestManagement";

// ===== Aquaculture (user module) imports =====
import AquacultureLayout from "./components/Aquaculture/AquacultureLayout.jsx";
import HarvestBatchPage from "./pages/Aquapage/HarvestBatchPage";
import AquacultureDashboard from "./pages/Aquapage/AquacultureDashboard.jsx";
import PondListPage from "./pages/Aquapage/PondListPage.jsx";
import PondDetailsPage from "./pages/Aquapage/PondDetailsPage.jsx";
import FeedLogPage from "./pages/Aquapage/FeedLogPage.jsx";
import WaterLogPage from "./pages/Aquapage/WaterLogPage.jsx";
import HealthLogPage from "./pages/Aquapage/HealthLogPage.jsx";
import CrateAssignmentPage from "./pages/Aquapage/CrateAssignmentPage";
import TraceabilityLookupPage from "./pages/Aquapage/TraceabilityLookupPage";

// ===== Wild Capture (user console) imports – from HEAD =====
import WildCaptureUserDashboard from "./pages/wildPage/WildCaptureDashboard";
import TripsPage from "./pages/wildPage/TripsPage";
import CatchLogsPage from "./pages/wildPage/CatchLogsPage";
import VesselRegistryPage from "./pages/wildPage/VesselRegistryPage";
import CratesPage from "./pages/wildPage/CratesPage";

export default function App() {
  return (
    <Routes>
      {/* ===== DEFAULT REDIRECT ===== */}
      {/* Currently root goes to Admin Login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      {/* If you want user-side aqua default later:
          <Route path="/" element={<Navigate to="/aquaculture/dashboard" replace />} />
      */}

      {/* ===== ADMIN SIDE ROUTES ===== */}

      {/* Auth + Hub */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/hub" element={<RegistryHubPage />} />

      {/* Wild-capture admin app */}
      <Route path="/admin/wild-capture" element={<WildCaptureLayout />}>
        <Route index element={<AdminWildCaptureDashboard />} />
        <Route path="vessels" element={<VesselRegistryManagement />} />
      </Route>

      {/* Aquaculture admin app */}
      <Route path="/admin/aqua-culture" element={<AquaLayout />}>
        <Route index element={<AquaDashboard />} />
        <Route path="ponds" element={<AquaRegister />} />
      </Route>

      {/* Mariculture admin app */}
      <Route path="/admin/mari-culture" element={<MariLayout />}>
        <Route index element={<MariDashboard />} />
        <Route path="oceanfarm" element={<MariRegister />} />
      </Route>

      {/* ===== SEPARATE MARICULTURE MODULE (user) ===== */}
      <Route path="/mariculture" element={<MaricultureLayout />}>
        {/* default: /mariculture */}
        <Route index element={<MaricultureDashboard />} />

        {/* also allow /mariculture/dashboard explicitly */}
        <Route path="dashboard" element={<MaricultureDashboard />} />

        {/* Registry */}
        <Route path="farms" element={<FarmRegistry />} />
        <Route path="units" element={<CultivationUnits />} />

        {/* Operations */}
        <Route path="growth" element={<GrowthMonitoring />} />
        <Route path="harvests" element={<HarvestManagement />} />
      </Route>

      {/* ===== AQUACULTURE USER MODULE ===== */}
      <Route path="/aquaculture" element={<AquacultureLayout />}>
        <Route index element={<AquacultureDashboard />} />
        {/* Dashboard */}
        <Route path="dashboard" element={<AquacultureDashboard />} />

        {/* Pond list + details */}
        <Route path="ponds" element={<PondListPage />} />
        <Route path="ponds/:pondId" element={<PondDetailsPage />} />

        {/* Harvest / crates / traceability */}
        <Route path="harvest-batches" element={<HarvestBatchPage />} />
        <Route path="crates" element={<CrateAssignmentPage />} />
        <Route path="traceability" element={<TraceabilityLookupPage />} />

        {/* Daily logs */}
        <Route path="logs/feed" element={<FeedLogPage />} />
        <Route path="logs/water" element={<WaterLogPage />} />
        <Route path="logs/health" element={<HealthLogPage />} />
      </Route>

      {/* ===== WILD CAPTURE USER CONSOLE (from HEAD) ===== */}
      {/* Uses AppLayout inside each page, paths match your navItems */}
      <Route path="/wild-capture" element={<WildCaptureUserDashboard />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/catch-logs" element={<CatchLogsPage />} />
      <Route path="/vessels" element={<VesselRegistryPage />} />
      <Route path="/crates" element={<CratesPage />} />

      {/* ===== 404 FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
