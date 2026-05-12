// src/modules/admin/ui/AdminSidebar.jsx
import { NavLink, Link } from "react-router-dom";
import { FiHome, FiX, FiGrid, FiUser, FiCheckCircle } from "react-icons/fi";
import brandLogo from "../../../assets/AquaLogo.jpg";

import { LuLogs,LuClipboardCheck } from "react-icons/lu";
import { IoWaterOutline } from "react-icons/io5";
import { MdQrCodeScanner } from "react-icons/md";
import { PiWavesLight } from "react-icons/pi";
import { TbQrcode } from "react-icons/tb";   // ← NEW: QR generate icon

const nav = [
  { to: "/admin/aqua-culture/aqua-dashboard", label: "Dashboard", icon: FiHome },

  { type: "section", label: "Aquaculture Ops" },

  { to: "/admin/aqua-culture/owner-approval",     label: "Owner Approval", icon: FiUser },
  { to: "/admin/aqua-culture/farm-pond-approval", label: "Farm Approval",  icon: IoWaterOutline },
  { to: "/admin/aqua-culture/pond-approval",      label: "Pond Approval",  icon: PiWavesLight },
  { to: "/admin/aqua-culture/daily-log",          label: "Daily Log",      icon: LuLogs },
  { to: "/admin/aqua-culture/culture-cycle-approval",          label:"Culture Cycle Approval",      icon: LuClipboardCheck },
  { to: "/admin/aqua-culture/aqua-harvest",       label: "Harvest",        icon: FiCheckCircle },
  { to: "/admin/aqua-culture/aqua-crate",         label: "Crate",          icon: MdQrCodeScanner },
  { to: "/admin/aqua-culture/aqua-qr",            label: "Generate QR",    icon: TbQrcode },  // ← NEW
];

export default function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  return (
    <>
      {/* mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-200",
          mobileOpen
            ? "opacity-100 pointer-events-auto bg-black/55"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onCloseMobile}
      />

      {/* desktop */}
      <aside
        className={[
          "hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40",
          "border-r border-white/10",
          "bg-[#070b14]",
          "shadow-[0_24px_90px_rgba(0,0,0,0.55)]",
          "transition-all duration-200",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* mobile drawer */}
      <aside
        className={[
          "lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72",
          "border-r border-white/10",
          "bg-[#070b14]",
          "shadow-[0_24px_90px_rgba(0,0,0,0.60)]",
          "transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarInner collapsed={false} isMobile onCloseMobile={onCloseMobile} />
      </aside>
    </>
  );
}

function SidebarInner({ collapsed, isMobile, onCloseMobile }) {
  const ACCENT = "#38bdf8";

  return (
    <div className="relative flex h-full w-full flex-col" style={{ "--rv-accent": ACCENT }}>
      {/* aura */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_60%)]" />
        <div className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.10),transparent_60%)]" />
      </div>

      {/* brand */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
            <img
              src={brandLogo}
              alt="RootVerse"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          {!collapsed && (
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white">RootVerse</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Aquaculture Panel
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white/10 ring-1 ring-white/10"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* nav */}
      <div className="relative flex-1 px-4 py-4 overflow-y-auto rv-scrollbar">
        {!collapsed && (
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Panel
          </div>
        )}

        <nav className="space-y-2">
          {nav.map((item, idx) => {
            if (item.type === "section") {
              return collapsed ? (
                <div key={`sec-${idx}`} className="my-3 h-px w-full bg-white/10" />
              ) : (
                <div
                  key={`sec-${idx}`}
                  className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center rounded-2xl overflow-hidden",
                    collapsed ? "justify-center h-12 w-12 mx-auto" : "h-12 w-full px-4",
                    "transition-all duration-200",

                    isActive
                      ? "bg-white/6 ring-1 ring-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                      : "bg-transparent hover:bg-white/6 hover:ring-1 hover:ring-white/10 hover:shadow-[0_10px_24px_rgba(0,0,0,0.30)]",

                    // aura
                    "before:content-[''] before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-200",
                    "before:bg-[radial-gradient(520px_circle_at_85%_50%,rgba(56,189,248,0.18),transparent_55%)]",
                    isActive ? "before:opacity-100" : "group-hover:before:opacity-100",

                    // right active bar
                    "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2",
                    collapsed ? "after:right-1 after:h-5" : "after:right-3 after:h-6",
                    "after:w-[3px] after:rounded-full after:opacity-0 after:transition-opacity after:duration-200",
                    "after:bg-[var(--rv-accent)] after:shadow-[0_0_12px_rgba(56,189,248,0.45)]",
                    isActive ? "after:opacity-100" : "group-hover:after:opacity-100",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 text-white/70 group-hover:text-[var(--rv-accent)]" />

                {!collapsed && (
                  <span className="ml-3 truncate text-[15px] font-semibold text-white/90 group-hover:text-white">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* bottom */}
      <div className="relative border-t border-white/10 px-4 py-4">
        <Link
          to="/admin/hub"
          title={collapsed ? "Back to Registry Hub" : undefined}
          className={[
            "flex items-center justify-center rounded-2xl font-semibold",
            collapsed ? "h-12 w-12 mx-auto" : "h-12 w-full gap-2",
            "bg-[var(--rv-accent)] text-[#051018]",
            "hover:brightness-110 transition-all",
            "shadow-[0_10px_22px_rgba(56,189,248,0.22)]",
          ].join(" ")}
        >
          <FiGrid className="h-4 w-4" />
          {!collapsed && <span>Back to Registry Hub</span>}
        </Link>
      </div>
    </div>
  );
}