// src/modules/admin/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../wildcapture/WildcaptureSidebar";
import AdminHeader from "../wildcapture/WildCaptureHeader";

const SIDEBAR_EXPANDED_PX = 288; // w-72
const SIDEBAR_COLLAPSED_PX = 80; // w-20
const HEADER_H_PX = 64; // h-16

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

  // ✅ single source of truth for offsets
  const sidebarOffsetPx = isDesktop
    ? collapsed
      ? SIDEBAR_COLLAPSED_PX
      : SIDEBAR_EXPANDED_PX
    : 0;

  return (
    <div
      style={{
        "--rv-sidebar-offset": `${sidebarOffsetPx}px`,
        "--rv-header-h": `${HEADER_H_PX}px`,
      }}
      className="rv-layout-bg relative w-full min-h-[100dvh] overflow-x-hidden"
    >
      <AdminSidebar
        collapsed={isDesktop ? collapsed : false}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ✅ Header is fixed, content must be offset by sidebar + header height */}
      <div className="min-h-[100dvh] min-w-0">
        <AdminHeader onToggleSidebar={handleToggleSidebar} />

        <main
          className={[
            // ✅ push content to the right of sidebar (desktop only)
            "ml-[var(--rv-sidebar-offset)]",
            // ✅ push content below fixed header
            "pt-[var(--rv-header-h)]",
            // spacing
            "min-h-[100dvh] min-w-0 px-4 pb-6 sm:px-6 lg:px-8",
            "bg-transparent",
          ].join(" ")}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}