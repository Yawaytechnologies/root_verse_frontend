// src/modules/admin/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../wildcapture/WildcaptureSidebar";
import AdminHeader from "../wildcapture/WildCaptureHeader";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const sidePadding = collapsed ? "lg:pl-20" : "lg:pl-72";

  return (
    <div
      className={`min-h-screen ${sidePadding} relative overflow-hidden`}
      style={{
        // 1) dots layer  2) light gradient layer
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(2, 6, 23, 0.1) 1.25px, transparent 1.25px),
          linear-gradient(135deg, rgba(236, 253, 245, 1) 0%, rgba(255, 255, 255, 1) 45%, rgba(209, 250, 229, 0.65) 100%)
        `,
        backgroundSize: "18px 18px, 100% 100%",
        backgroundPosition: "0 0, 0 0",
        backgroundAttachment: "fixed, fixed",
      }}
    >
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-col">
        <AdminHeader onToggleSidebar={handleToggleSidebar} />

        {/* important: keep main transparent so layout bg shows */}
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
