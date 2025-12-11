// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MaricultureLayout from "../src/layout/MaricultureLayout";

// Mariculture pages
import MaricultureDashboard from "./pages/mariculture/MaricultureDashboard";
import FarmRegistry from "./pages/mariculture/FarmRegistry";
import CultivationUnits from "./pages/mariculture/CultivationUnits";
import GrowthMonitoring from "./pages/mariculture/GrowthMonitoring";
import HarvestManagement from "./pages/mariculture/HarvestManagement";

function App() {
  return (
    
      <Routes>
        {/* All mariculture routes share this layout */}
        <Route path="/mariculture" element={<MaricultureLayout />}>
          {/* Default when you hit /mariculture → dashboard */}
          <Route index element={<MaricultureDashboard />} />

          {/* Or explicit path /mariculture/dashboard if you like */}
          <Route path="dashboard" element={<MaricultureDashboard />} />

          {/* Registry */}
          <Route path="farms" element={<FarmRegistry />} />
          <Route path="units" element={<CultivationUnits />} />

          {/* Operations */}
          <Route path="growth" element={<GrowthMonitoring />} />
          <Route path="harvests" element={<HarvestManagement />} />
        </Route>

        {/* Example: redirect root "/" into mariculture dashboard */}
        <Route path="/" element={<Navigate to="/mariculture" replace />} />

        {/* You can add admin / aquaculture / wildcapture layouts here later */}
      </Routes>
    
  );
}

export default App;
