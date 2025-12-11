// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import WildCaptureDashboard from "./pages/wildPage/WildCaptureDashboard";
import TripsPage from "./pages/wildPage/TripsPage";
import CatchLogsPage from "./pages/wildPage/CatchLogsPage";
import VesselRegistryPage from "./pages/wildPage/VesselRegistryPage";
import CratesPage from "./pages/wildPage/CratesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wild Capture base dashboard */}
        <Route path="/wild-capture" element={<WildCaptureDashboard />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/catch-logs" element={<CatchLogsPage />} />
        <Route path="/vessels" element={<VesselRegistryPage />} />
        <Route path="/crates" element={<CratesPage />} />

        {/* Fallback – send everything else here */}
        <Route
          path="*"
          element={<Navigate to="/wild-capture" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
