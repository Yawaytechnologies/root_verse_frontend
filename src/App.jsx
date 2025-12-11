// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <Routes>
      {/* default -> login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/hub" element={<RegistryHubPage />} />

      {/* wild-capture admin app */}
      <Route path="/admin/wild-capture" element={<WildCaptureLayout />}>
        {/* this is the dashboard INSIDE the layout */}
        <Route index element={<WildCaptureDashboard />} />
        <Route path="vessels" element={<VesselRegistryManagement />} />
        
      </Route>
      {/* wild-capture admin app */}
      <Route path="/admin/aqua-culture" element={<AquaLayout />}>
        {/* this is the dashboard INSIDE the layout */}
        <Route index element={<AquaDashboard />} />
        <Route path="ponds" element={<AquaRegister />} />
        
      </Route>
       {/* wild-capture admin app */}
      <Route path="/admin/mari-culture" element={<MariLayout />}>
        {/* this is the dashboard INSIDE the layout */}
        <Route index element={<MariDashboard />} />
        <Route path="oceanfarm" element={<MariRegister />} />
        
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
