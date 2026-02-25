// src/modules/admin/ui/AdminSidebar.jsx
import { NavLink, Link } from "react-router-dom";
import {
  FiHome,
  FiAnchor,
  FiTruck,
  FiClipboard,
  FiBox,
  FiFileText,
  FiDatabase,
  FiMapPin,
  FiX,
  FiGrid,
   FiHash,
  FiUser,
} from "react-icons/fi";

/** ✅ Wild Capture — Admin nav (with section headings) */
const nav = [
  { to: "/admin/participant-registry/dashboard", label: "Dashboard", icon: FiHome },

  // --- Operations 
  { type: "section", label: "Participant Registry" },
   
   { to: "/admin/participant-registry/quality-checker", label: "Quality Checker", icon: FiDatabase },
   { to: "/admin/participant-registry/crate-packer", label: "Crate Packer", icon: FiBox },
   

   

   


  // { to: "/admin/wild-capture/vessels", label: "Vessels", icon: FiAnchor },
  
   
  // { to: "/admin/wild-capture/catch-logs", label: "Catch Logs", icon: FiClipboard },
  // { to: "/admin/wild-capture/landing-qc", label: "Landing & QC", icon: FiClipboard },
  // { to: "/admin/wild-capture/crates", label: "Crates", icon: FiBox },
  // { to: "/admin/wild-capture/pcc-receipts", label: "PCC Receipts", icon: FiFileText },
  // { to: "/admin/wild-capture/dispatch-transport", label: "Dispatch & Transport", icon: FiTruck },

  // --- Master Data
  // { type: "section", label: "Master Data" },

  // { to: "/admin/wild-capture/master/species-grades", label: "Species & Grades", icon: FiDatabase },
  // { to: "/admin/wild-capture/master/gear-methods", label: "Gear & Methods", icon: FiDatabase },
  // { to: "/admin/wild-capture/master/fao-zones", label: "FAO Zones", icon: FiMapPin },
  // { to: "/admin/wild-capture/master/ports-landing-centers", label: "Ports & Landing Centers", icon: FiMapPin },
];

export default function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40
          bg-[#f3f4f6] border-r border-slate-300
          transition-all duration-200
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72
          bg-[#f3f4f6] border-r border-slate-300
          transform transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarInner collapsed={false} isMobile onCloseMobile={onCloseMobile} />
      </aside>
    </>
  );
}

function SidebarInner({ collapsed, isMobile, onCloseMobile }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-slate-300 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#111827] grid place-items-center text-white text-lg font-bold">
            RV
          </div>
          {!collapsed && (
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                RootVerse
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!collapsed && (
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Panel
          </div>
        )}

        <nav className="space-y-3">
          {nav.map((item, idx) => {
            // ✅ Section heading support
            if (item.type === "section") {
              return collapsed ? (
                <div key={`sec-${idx}`} className="my-2 h-px w-full bg-slate-300/80" />
              ) : (
                <div
                  key={`sec-${idx}`}
                  className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
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
                className={({ isActive }) =>
                  [
                    "group flex items-center rounded-2xl py-2 text-sm font-medium transition-colors",
                    collapsed ? "w-14 justify-center mx-auto" : "w-full px-4",
                    isActive
                      ? "bg-[#374151] text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)]"
                      : "bg-[#4b5563] text-slate-50 shadow-[0_10px_22px_rgba(15,23,42,0.18)] hover:bg-[#374151]",
                  ].join(" ")
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-black/10 text-slate-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  {!collapsed && <span className="truncate text-[15px]">{item.label}</span>}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom "Back to Registry Hub" */}
      <div className="border-t border-slate-300 px-4 py-3">
        <Link
          to="/admin/hub"
          className={[
            "flex items-center justify-center rounded-xl text-xs font-semibold",
            "bg-white text-slate-800 shadow-sm hover:bg-slate-100",
            "transition-colors duration-150",
            collapsed ? "h-10 w-10 mx-auto" : "h-10 w-full gap-2",
          ].join(" ")}
        >
          <FiGrid className="h-4 w-4" />
          {!collapsed && <span>Back to Registry Hub</span>}
        </Link>
      </div>
    </div>
  );
}
