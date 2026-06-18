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
import SpeciesManager from "./components/admin/wildcapture/SpeciesManager.jsx";
import QualityChecker from "./components/admin/wildcapture/QualityChecker.jsx";
import TripApprovalDetails from "./components/admin/wildcapture/TripApprovalDetails.jsx";
import LocationCreation from "./components/admin/wildcapture/LocationCreation.jsx";
import FishingMethodsPage from "./components/admin/wildcapture/FishingMethods.jsx";
import CrateQrWildGenerator from "./components/admin/wildcapture/CrateQrWild.jsx";
import QcInspectionTable from "./components/admin/wildcapture/QCInspectionTable.jsx";

//Total Traceability user module imports
import TotalTraceability from "./pages/consumertraceability/TotalTraceability.jsx";
// ===== Participant Registry admin side imports =====
import ParticipantLayout from "./components/admin/participantregistry/ParticipantLayout.jsx";
import ParticipantDashboard from "./components/admin/participantregistry/ParticipantDashboard.jsx";
import QualityController from "./components/admin/participantregistry/QualityController.jsx";
import CratePackerCreate from "./components/admin/participantregistry/CratePackerCreation.jsx";
import CratePackerListing from "./components/admin/participantregistry/CratePackerListing.jsx";
import TransportRegistration from "./components/admin/participantregistry/TransportRegisteration.jsx";
import TransportAssign from "./components/admin/participantregistry/TransportAssign.jsx";
import CrateReceiveStatus from "./components/admin/participantregistry/CrateStatus.jsx";
import OperatorRegistration from "./components/admin/participantregistry/CollectionOperatorCreation.jsx";
import CollectionCentreRegistration from "./components/admin/participantregistry/CollectionCenterCreation.jsx";
import CollectionCenterListing from "./components/admin/participantregistry/CollectionCenterListing.jsx";
import CollectionCentreOperatorCreation from "./components/admin/participantregistry/CollectionCentreOperatorCreation.jsx";
import TransportOperatorCreation from "./components/admin/participantregistry/TransportOperatorCreation.jsx";
import TransportOperatorList from "./components/admin/participantregistry/TransportOperatorListing.jsx";
import CollectionCentreOperatorListing from "./components/admin/participantregistry/CollectionCenterOperatorList.jsx";
import CrateListing from "./components/admin/participantregistry/CrateListing.jsx";
import QualityControllerListing from "./components/admin/participantregistry/QualityControllerListing.jsx";

import QualityInspectionLogs from "./components/admin/wildcapture/QualityInspectionLogs.jsx";
import LandingQCPage from "./components/admin/wildcapture/LandingQC.jsx";
import OwnerRegistration from "./components/admin/wildcapture/OwnerRegister.jsx";
import QrGeneratorPage from "./components/admin/wildcapture/AdminQrGenerator.jsx";
import VesselOwner from "./components/admin/wildcapture/VesselOwner.jsx";
import TripApproval from "./components/admin/wildcapture/TripApproval.jsx";

//Aqua admin module imports
import AquaLayout from "./components/admin/aquaculture/AquaLayout";
import AquaDashboard from "./components/admin/aquaculture/AquaDashboard";
import AquaRegister from "./components/admin/aquaculture/AquaRegister";
import OwnerApproval from "./components/admin/aquaculture/OwnerApproval.jsx";
import FarmApproval from "./components/admin/aquaculture/FarmApproval.jsx";
import PondApproval from "./components/admin/aquaculture/PondApproval.jsx";
import DailyLog from "./components/admin/aquaculture/DailyLogs.jsx";
import AquaHarvest from "../src/components/admin/aquaculture/AquaHarvest.jsx";
import AquaCrate from "../src/components/admin/aquaculture/AquaCrate.jsx";
import AquaQR from "../src/components/admin/aquaculture/AquaQR.jsx"; // ← NEW
import CultureCycleApproval from "../src/components/admin/aquaculture/CultureCycle.jsx";
import PondStockingByCultureCycle from "./components/admin/aquaculture/PondStockingCycle.jsx";
import SamplingRecords from "./components/admin/aquaculture/SamplingRecords.jsx";
import TraderApproval from "./components/admin/aquaculture/TraderApproval.jsx";


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
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* ===== ADMIN SIDE ROUTES ===== */}

      {/* Auth + Hub */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/hub" element={<RegistryHubPage />} />

      {/* Wild-capture admin app */}
      <Route path="/admin/wild-capture" element={<WildCaptureLayout />}>
        <Route index element={<AdminWildCaptureDashboard />} />
        <Route path="dashboard" element={<AdminWildCaptureDashboard />} />
        <Route path="vessels" element={<VesselRegistryManagement />} />
        <Route path="quality-checker" element={<QualityChecker />} />
        <Route path="crate-wild" element={<CrateQrWildGenerator />} />
        <Route path="quality-inspection" element={<QcInspectionTable />} />
        <Route
          path="quality-inspection-logs"
          element={<QualityInspectionLogs />}
        />
        <Route path="qr-generator" element={<QrGeneratorPage />} />
        <Route path="vessel-owner" element={<VesselOwner />} />
        <Route path="trip-approval" element={<TripApproval />} />
        <Route path="fishing-methods" element={<FishingMethodsPage />} />
        <Route path="location-creation" element={<LocationCreation />} />
        <Route path="trip-approval/:id" element={<TripApprovalDetails />} />
        <Route path="species" element={<SpeciesManager />} />
      </Route>

      {/* Aquaculture admin app */}
      <Route path="/admin/aqua-culture" element={<AquaLayout />}>
        <Route index element={<AquaDashboard />} />
        <Route path="aqua-dashboard" element={<AquaDashboard />} />
        <Route path="ponds" element={<AquaRegister />} />
        <Route path="owner-approval" element={<OwnerApproval />} />
        <Route path="farm-pond-approval" element={<FarmApproval />} />
        <Route path="pond-approval" element={<PondApproval />} />
        <Route path="daily-log" element={<DailyLog />} />
        <Route path="aqua-harvest" element={<AquaHarvest />} />
        <Route path="aqua-crate" element={<AquaCrate />} />
        <Route path="aqua-qr" element={<AquaQR />} />
        <Route path="trader-approval" element={<TraderApproval />} />
        <Route
          path="culture-cycle-approval"
          element={<CultureCycleApproval />}
        />
         <Route
    path="culture-cycle-approval/:culturecycleId/pond-stocking"
    element={<PondStockingByCultureCycle />}
  />
  <Route path="sampling-records" element={<SamplingRecords />} />
      </Route>

      {/* Mariculture admin app */}
      <Route path="/admin/mari-culture" element={<MariLayout />}>
        <Route index element={<MariDashboard />} />
        <Route path="oceanfarm" element={<MariRegister />} />
      </Route>

      {/* Participant-Registry admin app */}
      <Route path="/admin/participant-registry" element={<ParticipantLayout />}>
        <Route index element={<ParticipantDashboard />} />
        <Route path="dashboard" element={<ParticipantDashboard />} />
        <Route path="quality-checker" element={<QualityController />} />
        <Route path="crate-packer" element={<CratePackerCreate />} />
        <Route path="crate-list" element={<CratePackerListing />} />
        <Route path="transport-assign" element={<TransportAssign />} />
        <Route path="center-crate-status" element={<CrateReceiveStatus />} />
        <Route
          path="collection-center-registration"
          element={<CollectionCentreRegistration />}
        />
        <Route
          path="collection-center-list"
          element={<CollectionCenterListing />}
        />
        <Route
          path="transport-operator-registration"
          element={<TransportOperatorCreation />}
        />
        <Route
          path="transport-operator-list"
          element={<TransportOperatorList />}
        />
        <Route
          path="center-operator-registeration"
          element={<CollectionCentreOperatorCreation />}
        />
        <Route
          path="center-operator-list"
          element={<CollectionCentreOperatorListing />}
        />
        <Route path="crate-listing" element={<CrateListing />} />
        <Route
          path="quality-checker-list"
          element={<QualityControllerListing />}
        />
      </Route>

      {/* ===== SEPARATE MARICULTURE MODULE (user) ===== */}
      <Route path="/mariculture" element={<MaricultureLayout />}>
        <Route index element={<MaricultureDashboard />} />
        <Route path="dashboard" element={<MaricultureDashboard />} />
        <Route path="farms" element={<FarmRegistry />} />
        <Route path="units" element={<CultivationUnits />} />
        <Route path="growth" element={<GrowthMonitoring />} />
        <Route path="harvests" element={<HarvestManagement />} />
      </Route>

      {/* ===== AQUACULTURE USER MODULE ===== */}
      <Route path="/aquaculture" element={<AquacultureLayout />}>
        <Route index element={<AquacultureDashboard />} />
        <Route path="dashboard" element={<AquacultureDashboard />} />
        <Route path="ponds" element={<PondListPage />} />
        <Route path="ponds/:pondId" element={<PondDetailsPage />} />
        <Route path="harvest-batches" element={<HarvestBatchPage />} />
        <Route path="crates" element={<CrateAssignmentPage />} />
        <Route path="traceability" element={<TraceabilityLookupPage />} />
        <Route path="logs/feed" element={<FeedLogPage />} />
        <Route path="logs/water" element={<WaterLogPage />} />
        <Route path="logs/health" element={<HealthLogPage />} />
        
      </Route>

      {/* ===== WILD CAPTURE USER CONSOLE ===== */}
      <Route path="/wild-capture" element={<WildCaptureUserDashboard />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/catch-logs" element={<CatchLogsPage />} />
      <Route path="/vessels" element={<VesselRegistryPage />} />
      <Route path="/crates" element={<CratesPage />} />

      {/* ===== STANDALONE TRACEABILITY (public) ===== */}
      <Route path="/traceability/total" element={<TotalTraceability />} />

      {/* ===== 404 FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
