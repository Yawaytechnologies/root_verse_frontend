// src/modules/admin/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../wildcapture/WildcaptureSidebar";
import AdminHeader from "../wildcapture/WildCaptureHeader";
import WildCaptureDashboard from "../wildcapture/WildCaptureDashboard";

export default function AdminLayout() {
 const [collapsed, setCollapsed] = useState(false);   // desktop: full vs icons-only
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

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
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex min-h-screen flex-col">
        <AdminHeader onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}