// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AquacultureLayout from "./layouts/AquacultureLayout.jsx";

import HarvestBatchPage from "./pages/Aquapage/HarvestBatchPage";
import AquacultureDashboard from "./pages/Aquapage/AquacultureDashboard.jsx";
import PondListPage from "./pages/Aquapage/PondListPage.jsx";
import PondDetailsPage from "./pages/Aquapage/PondDetailsPage.jsx";
import FeedLogPage from "./pages/Aquapage/FeedLogPage.jsx";
import WaterLogPage from "./pages/Aquapage/WaterLogPage.jsx";
import HealthLogPage from "./pages/Aquapage/HealthLogPage.jsx";
import CrateAssignmentPage from "./pages/Aquapage/CrateAssignmentPage";
import TraceabilityLookupPage from "./pages/Aquapage/TraceabilityLookupPage";
import "./global.css";

function App() {
  return (
    <Routes>
      {/* Root -> redirect to aquaculture dashboard */}
      <Route
        path="/"
        element={<Navigate to="/aquaculture/dashboard" replace />}
      />

      {/* ✅ Aquaculture-only layout */}
      <Route path="/aquaculture" element={<AquacultureLayout />}>
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

      {/* Later:
      <Route path="/wild-capture" element={<WildLayout />}>...</Route>
      <Route path="/mariculture" element={<MaricultureLayout />}>...</Route>
      */}
    </Routes>
  );
}

export default App;
