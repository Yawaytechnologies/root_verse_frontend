// src/modules/admin/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../wildcapture/WildcaptureSidebar";
import AdminHeader from "../wildcapture/WildCaptureHeader";

export default function AdminLayout() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => setIsDesktop(e.matches);

    onChange(mq);
    mq.addEventListener?.("change", onChange) ?? mq.addListener(onChange);

    return () => {
      mq.removeEventListener?.("change", onChange) ?? mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, isDesktop]);

  const handleToggleSidebar = () => {
    if (isDesktop) setCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  };

  // ✅ this drives the header's left offset
  const sidebarOffset = isDesktop ? (collapsed ? "5rem" : "18rem") : "0px";

  if (isDesktop) {
    const sidePadding = collapsed ? "pl-20" : "pl-72";

    return (
      <div
        style={{ "--rv-sidebar-offset": sidebarOffset }}
        className={`rv-layout-bg relative w-full min-h-[100dvh] ${sidePadding} overflow-x-hidden`}
      >
        <AdminSidebar collapsed={collapsed} mobileOpen={false} onCloseMobile={() => {}} />

        <div className="flex min-h-[100dvh] flex-col min-w-0">
          <AdminHeader onToggleSidebar={handleToggleSidebar} />

          <main className="flex-1 min-w-0 px-4 pb-6 pt-14 sm:px-6 lg:px-8 bg-transparent">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ "--rv-sidebar-offset": sidebarOffset }}
      className="rv-layout-bg relative w-full min-h-[100dvh] overflow-x-hidden"
    >
      <AdminSidebar collapsed={false} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-h-[100dvh] flex-col min-w-0">
        <AdminHeader onToggleSidebar={handleToggleSidebar} />

        <main className="flex-1 min-w-0 px-4 pb-6 pt-14 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
