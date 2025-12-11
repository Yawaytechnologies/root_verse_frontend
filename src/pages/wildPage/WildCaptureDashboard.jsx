// src/pages/WildCaptureDashboard.jsx
import React from "react";
import AppLayout from "../../components/wildLayout/AppLayout";
import KpiCardsRow from "../../components/wildDashboard/KpiCardsRow";
import CatchTrendChart from "../../components/wildDashboard/CatchTrendChart";
import TripGoalChart from "../../components/wildDashboard/TripGoalChart";
import ComplianceGauge from "../../components/wildDashboard/ComplianceGauge";
import LandingTable from "../../components/wildDashboard/LandingTable";
import InfoCardsRow from "../../components/wildDashboard/InfoCardsRow";

export default function WildCaptureDashboard() {
  return (
    <AppLayout>
      <KpiCardsRow />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <CatchTrendChart />
        </div>
        <TripGoalChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <LandingTable />
        </div>
        <ComplianceGauge />
      </div>

      <InfoCardsRow />
    </AppLayout>
  );
}
