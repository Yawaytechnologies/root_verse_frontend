import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ===== Admin side imports =====
import AdminLoginPage from "./pages/admin/AdminLogin";
import WildCaptureLayout from "./components/admin/wildcapture/WildCaptureLayout";
import RegistryHubPage from "./components/admin/RegistryHub";
import WildCaptureDashboard from "./components/admin/wildcapture/WildCaptureDashboard";
import VesselRegistryManagement from "./components/admin/wildcapture/VesselRegistry";

import AquaLayout from "./components/admin/aquaculture/AquaLayout";
import AquaDashboard from "./components/admin/aquaculture/AquaDashboard";
import AquaRegister from "./components/admin/aquaculture/AquaRegister";

import MariLayout from "./components/admin/mariculture/MariLayout";
import MariDashboard from "./components/admin/mariculture/MariDashboard";
import MariRegister from "./components/admin/mariculture/MariRegister";

// ===== Mariculture (separate module) imports =====
import MaricultureLayout from "./layout/MaricultureLayout";
import MaricultureDashboard from "./pages/mariculture/MaricultureDashboard";
import FarmRegistry from "./pages/mariculture/FarmRegistry";
import CultivationUnits from "./pages/mariculture/CultivationUnits";
import GrowthMonitoring from "./pages/mariculture/GrowthMonitoring";
import HarvestManagement from "./pages/mariculture/HarvestManagement";

export default function App() {
  return (
    
      <Routes>
        {/* ===== DEFAULT REDIRECT ===== */}
        {/* You decide where root "/" should go.
            Option 1: Login
            Option 2: Mariculture dashboard
        */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        {/* Or: <Route path="/" element={<Navigate to="/mariculture" replace />} /> */}

        {/* ===== ADMIN SIDE ROUTES ===== */}

        {/* Auth + Hub */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/hub" element={<RegistryHubPage />} />

        {/* Wild-capture admin app */}
        <Route path="/admin/wild-capture" element={<WildCaptureLayout />}>
          <Route index element={<WildCaptureDashboard />} />
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

        {/* ===== SEPARATE MARICULTURE MODULE (non-admin) ===== */}
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

        {/* ===== 404 FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
        {/* Or change to: <Navigate to="/mariculture" replace /> if that’s your main app */}
      </Routes>
   
  );
}
