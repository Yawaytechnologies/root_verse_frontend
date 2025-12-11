// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Aquaculture/Header.jsx";
import Sidebar from "./components/Aquaculture/Sidebar.jsx";
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
    <div className="min-h-screen flex">
      {/* Common sidebar */}
      <Sidebar />

      {/* Right side: header + routed content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
          <Routes>
            {/* default redirect */}
            <Route
              path="/"
              element={<Navigate to="/aquaculture/dashboard" replace />}
            />

            {/* Dashboard */}
            <Route
              path="/aquaculture/dashboard"
              element={<AquacultureDashboard />}
            />

            {/* Pond list + details */}
            <Route path="/aquaculture/ponds" element={<PondListPage />} />
            <Route
              path="/aquaculture/ponds/:pondId"
              element={<PondDetailsPage />}
            />
            <Route
              path="/aquaculture/harvest-batches"
              element={<HarvestBatchPage />}
            />
            <Route
              path="/aquaculture/crates"
              element={<CrateAssignmentPage />}
            />
            <Route
              path="/aquaculture/traceability"
              element={<TraceabilityLookupPage />}
            />
            {/* Daily logs */}
            <Route path="/aquaculture/logs/feed" element={<FeedLogPage />} />
            <Route path="/aquaculture/logs/water" element={<WaterLogPage />} />
            <Route
              path="/aquaculture/logs/health"
              element={<HealthLogPage />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
