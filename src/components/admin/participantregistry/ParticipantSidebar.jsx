// src/modules/admin/ui/AdminSidebar.jsx  (Participant Registry / PCC)
import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FiHome, FiDatabase, FiBox, FiX, FiGrid,
  FiTruck, FiUser, FiChevronDown,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

const ACCENT  = "#D97706";
const BG      = "#18120A";
const BG_LITE = "#261B0E";

const BASE = "/admin/participant-registry";

/* ─── Nav tree ───────────────────────────────────────────────
   type "link"  → plain NavLink
   type "group" → collapsible header + children
──────────────────────────────────────────────────────────── */
const NAV = [
  {
    type:  "link",
    to:    `${BASE}/dashboard`,
    label: "Dashboard",
    icon:  FiHome,
  },

  { type: "section", label: "Participant Registry" },

  {
    type:  "group",
    label: "Transport",
    icon:  FiTruck,
    children: [
      { to: `${BASE}/transport-registration`, label: "Transport Create" },
      { to: `${BASE}/transport-list`,         label: "Transport Listing" },
      { to: `${BASE}/transport-assign`,       label: "Assign & Dispatch" },
    ],
  },

  {
    type:  "group",
    label: "Operator",
    icon:  FiUser,
    children: [
      { to: `${BASE}/center-operator-registeration`, label: "Operator Create" },
      { to: `${BASE}/operator-list`,                 label: "Operator Listing" },
    ],
  },

  {
    type:  "group",
    label: "Crate",
    icon:  FiBox,
    children: [
      { to: `${BASE}/crate-packer`,       label: "Crate Create" },
      { to: `${BASE}/crate-list`,         label: "Crate Listing" },
      { to: `${BASE}/center-crate-status`,label: "Crate Receive Status" },
    ],
  },

  {
    type:  "group",
    label: "Quality Checker",
    icon:  FiDatabase,
    children: [
      { to: `${BASE}/quality-checker`,      label: "QC Create" },
      { to: `${BASE}/quality-checker-list`, label: "QC Listing" },
    ],
  },

  {
    type:  "group",
    label: "Collection Centre",
    icon:  MdStorefront,
    children: [
      { to: `${BASE}/collection-center-registration`, label: "Centre Create" },
      { to: `${BASE}/collection-center-list`,         label: "Centre Listing" },
    ],
  },
];

/* ─── helpers ────────────────────────────────────────────── */
function groupHasActive(children, pathname) {
  return children.some(c => pathname.startsWith(c.to));
}

/* ════════════════════════════════════════════════════════════
   Exported sidebar shell
════════════════════════════════════════════════════════════ */
export default function AdminSidebar({
  collapsed    = false,
  mobileOpen   = false,
  onCloseMobile = () => {},
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto bg-black/55"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      {/* Desktop sidebar */}
      <aside
        style={{ background: BG }}
        className={`
          hidden lg:flex lg:flex-col
          lg:fixed lg:inset-y-0 lg:left-0 lg:z-40
          border-r border-white/8
          shadow-[4px_0_24px_rgba(0,0,0,0.35)]
          transition-all duration-200
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <aside
        style={{ background: BG }}
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          border-r border-white/8
          shadow-[4px_0_32px_rgba(0,0,0,0.45)]
          transform transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarInner collapsed={false} isMobile onCloseMobile={onCloseMobile} />
      </aside>
    </>
  );
}

/* ─── Inner content ──────────────────────────────────────── */
function SidebarInner({ collapsed, isMobile, onCloseMobile }) {
  const { pathname } = useLocation();

  // pre-open any group whose child is currently active
  const initialOpen = NAV.reduce((acc, item) => {
    if (item.type === "group" && groupHasActive(item.children, pathname)) {
      acc[item.label] = true;
    }
    return acc;
  }, {});

  const [open, setOpen] = useState(initialOpen);

  function toggleGroup(label) {
    setOpen(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ "--pcc-accent": ACCENT, "--pcc-bg": BG, "--pcc-bg-lite": BG_LITE }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 65%)` }}
        />
      </div>

      {/* ── Brand ── */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0"
            style={{ background: ACCENT, color: "#fff" }}
          >
            RV
          </div>
          {!collapsed && (
            <div>
              <div className="text-[15px] font-extrabold tracking-tight text-white leading-tight">
                RootVerse
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45 mt-0.5">
                PCC Panel
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/8 text-white/70 hover:bg-white/15 transition-colors ring-1 ring-white/10"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <div className="relative flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Panel
          </p>
        )}

        <nav className="space-y-0.5">
          {NAV.map((item, idx) => {

            /* section divider */
            if (item.type === "section") {
              return collapsed
                ? <div key={`s-${idx}`} className="my-3 mx-2 h-px bg-white/10" />
                : (
                  <p key={`s-${idx}`} className="mt-5 mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    {item.label}
                  </p>
                );
            }

            /* plain link (Dashboard) */
            if (item.type === "link") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center rounded-2xl transition-all duration-150 overflow-hidden",
                      collapsed ? "h-12 w-12 mx-auto justify-center" : "h-11 w-full px-3 gap-3",
                      isActive ? "text-white" : "text-white/55 hover:text-white/90",
                    ].join(" ")
                  }
                  style={({ isActive }) =>
                    isActive ? { background: `${ACCENT}22`, boxShadow: `0 0 0 1px ${ACCENT}44` } : undefined
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: ACCENT }} />
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors`}
                        style={isActive ? { background: `${ACCENT}33` } : undefined}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      {!collapsed && (
                        <span className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            }

            /* group (collapsible) */
            if (item.type === "group") {
              const Icon      = item.icon;
              const isExpanded = !!open[item.label];
              const hasActive  = groupHasActive(item.children, pathname);

              return (
                <div key={item.label}>

                  {/* Group header button */}
                  <button
                    type="button"
                    onClick={() => !collapsed && toggleGroup(item.label)}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "group relative flex items-center w-full rounded-2xl transition-all duration-150 overflow-hidden",
                      collapsed ? "h-12 w-12 mx-auto justify-center" : "h-11 px-3 gap-3",
                      hasActive ? "text-white" : "text-white/55 hover:text-white/90",
                    ].join(" ")}
                    style={hasActive ? { background: `${ACCENT}18`, boxShadow: `0 0 0 1px ${ACCENT}33` } : undefined}
                  >
                    {/* Active left bar */}
                    {hasActive && !collapsed && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: ACCENT }} />
                    )}

                    {/* Icon */}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors"
                      style={hasActive ? { background: `${ACCENT}33` } : undefined}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    {!collapsed && (
                      <>
                        <span className={`flex-1 truncate text-sm font-semibold text-left ${hasActive ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                          {item.label}
                        </span>
                        <FiChevronDown
                          className="h-4 w-4 shrink-0 transition-transform duration-200"
                          style={{
                            transform:  isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            color:      hasActive ? ACCENT : "rgba(255,255,255,0.3)",
                          }}
                        />
                      </>
                    )}
                  </button>

                  {/* Children */}
                  {!collapsed && isExpanded && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5 pb-1">
                      {item.children.map(child => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            [
                              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                              isActive
                                ? "font-semibold text-white"
                                : "font-medium text-white/50 hover:text-white/85 hover:bg-white/5",
                            ].join(" ")
                          }
                          style={({ isActive }) =>
                            isActive ? { background: `${ACCENT}20`, color: "#fff" } : undefined
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {/* small dot indicator */}
                              <span
                                className="h-1.5 w-1.5 rounded-full shrink-0 transition-colors"
                                style={{ background: isActive ? ACCENT : "rgba(255,255,255,0.2)" }}
                              />
                              <span className="truncate">{child.label}</span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </nav>
      </div>

      {/* ── Bottom ── */}
      <div className="relative shrink-0 border-t border-white/10 px-3 py-4">
        <Link
          to="/admin/hub"
          title={collapsed ? "Back to Registry Hub" : undefined}
          className={[
            "flex items-center justify-center rounded-2xl font-semibold text-sm",
            "transition-all duration-150 active:scale-[0.97]",
            collapsed ? "h-11 w-11 mx-auto" : "h-11 w-full gap-2",
          ].join(" ")}
          style={{ background: ACCENT, color: "#fff", boxShadow: `0 8px 20px ${ACCENT}44` }}
        >
          <FiGrid className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Back to Registry Hub</span>}
        </Link>
      </div>
    </div>
  );
}
