// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import MainLayout from "./layouts/MainLayout.jsx";
import AquacultureDashboard from "./pages/AquacultureDashboard.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* All main user-side pages share the same Header + Sidebar */}
        <Route path="/" element={<MainLayout />}>
          {/* default route */}
          <Route
            index
            element={<Navigate to="/aquaculture/dashboard" replace />}
          />

          {/* Aquaculture user dashboard */}
          <Route
            path="aquaculture/dashboard"
            element={<AquacultureDashboard />}
          />

          {/* Later you can add: */}
          {/* <Route path="wild/dashboard" element={<WildDashboard />} /> */}
          {/* <Route path="mariculture/dashboard" element={<MaricultureDashboard />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
