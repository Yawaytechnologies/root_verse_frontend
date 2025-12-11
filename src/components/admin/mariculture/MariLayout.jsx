// src/modules/admin/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MariSidebar from "../mariculture/MariSidebar";
import MariHeader from "../mariculture/MariHeader";
import MariDashboard from "../mariculture/MariDashboard";

export default function MariLayout() {
 const [collapsed, setCollapsed] = useState(false);   
  const [mobileOpen, setMobileOpen] = useState(false); 

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // mobile
      setMobileOpen((v) => !v);
    } else {
      // desktop collapse
      setCollapsed((v) => !v);
    }
  };

  // Push content depending on sidebar width
  const sidePadding = collapsed ? "lg:pl-20" : "lg:pl-72";

  return (
    <div className={`min-h-screen bg-[#F5F9FF] ${sidePadding}`}>
      {/* Sidebar (fixed) */}
      <MariSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex min-h-screen flex-col">
        <MariHeader onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}