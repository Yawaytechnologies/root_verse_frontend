import { NavLink, Link } from "react-router-dom";

import {
  FiHome,
  FiGrid,
  FiX,
  FiUserCheck,
  FiCpu,
} from "react-icons/fi";

const ACCENT = "#06B6D4";
const BG = "#0F172A";

const BASE = "/admin/trader";

const NAV = [
  {
    type: "link",
    to: `${BASE}/dashboard`,
    label: "Dashboard",
    icon: FiHome,
  },

  {
    type: "section",
    label: "Trader & Processor",
  },

  {
    type: "link",
    to: `${BASE}/approval`,
    label: "Trader Approval",
    icon: FiUserCheck,
  },

  {
    type: "link",
    to: `${BASE}/processor-approval`,
    label: "Processor Approval",
    icon: FiCpu,
  },
];

/* ========================================================================== */
/* MAIN SIDEBAR                                                               */
/* ========================================================================== */

export default function TradeprocessSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  return (
    <>
      {/* ================================================================ */}
      {/* MOBILE BACKDROP                                                  */}
      {/* ================================================================ */}

      <div
        onClick={onCloseMobile}
        className={`
          fixed inset-0 z-40
          transition-opacity duration-200
          lg:hidden

          ${
            mobileOpen
              ? "pointer-events-auto bg-black/55 opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR                                                   */}
      {/* ================================================================ */}

      <aside
        style={{
          background: BG,
        }}
        className={`
          fixed inset-y-0 left-0 z-40
          hidden flex-col
          border-r border-white/10
          shadow-[4px_0_24px_rgba(0,0,0,0.35)]
          transition-all duration-200
          lg:flex

          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* ================================================================ */}
      {/* MOBILE SIDEBAR                                                    */}
      {/* ================================================================ */}

      <aside
        style={{
          background: BG,
        }}
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-white/10
          shadow-[4px_0_32px_rgba(0,0,0,0.45)]
          transition-transform duration-200
          lg:hidden

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <SidebarInner
          collapsed={false}
          isMobile
          onCloseMobile={onCloseMobile}
        />
      </aside>
    </>
  );
}

/* ========================================================================== */
/* SIDEBAR CONTENT                                                            */
/* ========================================================================== */

function SidebarInner({
  collapsed,
  isMobile = false,
  onCloseMobile,
}) {
  return (
    <div
      className="
        relative flex h-full w-full
        flex-col overflow-hidden
      "
      style={{
        "--sidebar-accent": ACCENT,
      }}
    >
      {/* ================================================================ */}
      {/* BACKGROUND EFFECT                                                 */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-20 -top-20
            h-64 w-64 rounded-full
            opacity-20
          "
          style={{
            background: `
              radial-gradient(
                circle,
                ${ACCENT},
                transparent 65%
              )
            `,
          }}
        />
      </div>

      {/* ================================================================ */}
      {/* LOGO                                                              */}
      {/* ================================================================ */}

      <div
        className="
          relative flex shrink-0
          items-center justify-between
          border-b border-white/10
          px-5 py-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10
              shrink-0 items-center
              justify-center rounded-2xl
              text-sm font-extrabold
              text-white
            "
            style={{
              background: ACCENT,
            }}
          >
            RV
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div
                className="
                  truncate text-[15px]
                  font-extrabold leading-tight
                  text-white
                "
              >
                RootVerse
              </div>

              <div
                className="
                  mt-0.5 whitespace-nowrap
                  text-[10px] font-semibold
                  uppercase tracking-[0.22em]
                  text-white/45
                "
              >
                Trade & Processor
              </div>
            </div>
          )}
        </div>

        {/* Mobile close */}
        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="
              flex h-8 w-8
              shrink-0 items-center
              justify-center rounded-xl
              bg-white/[0.08]
              text-white/70
              ring-1 ring-white/10
              transition-colors
              hover:bg-white/15
              hover:text-white
            "
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ================================================================ */}
      {/* NAVIGATION                                                        */}
      {/* ================================================================ */}

      <div
        className="
          relative flex-1
          overflow-y-auto
          px-3 py-4
        "
      >
        {!collapsed && (
          <p
            className="
              mb-3 px-3
              text-[10px] font-bold
              uppercase tracking-[0.22em]
              text-white/35
            "
          >
            Panel
          </p>
        )}

        <nav className="space-y-1">
          {NAV.map((item, index) => {
            /* ========================================================== */
            /* SECTION LABEL                                              */
            /* ========================================================== */

            if (item.type === "section") {
              if (collapsed) {
                return (
                  <div
                    key={`section-${index}`}
                    className="
                      mx-2 my-4
                      h-px bg-white/10
                    "
                  />
                );
              }

              return (
                <p
                  key={`section-${index}`}
                  className="
                    mb-2 mt-6 px-3
                    text-[10px] font-bold
                    uppercase tracking-[0.22em]
                    text-white/35
                    first:mt-0
                  "
                >
                  {item.label}
                </p>
              );
            }

            /* ========================================================== */
            /* NAV ITEM                                                   */
            /* ========================================================== */

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}

                /*
                  Important:
                  only exact route becomes active.

                  /admin/trader/dashboard
                  will NOT stay active when you're on
                  /admin/trader/approval.
                */
                end

                title={
                  collapsed
                    ? item.label
                    : undefined
                }

                onClick={() => {
                  if (isMobile) {
                    onCloseMobile?.();
                  }
                }}

                className={({
                  isActive,
                }) =>
                  [
                    /*
                      Base
                    */
                    "group relative flex items-center",
                    "overflow-hidden rounded-xl",
                    "transition-all duration-150",
                    "outline-none",

                    /*
                      Size
                    */
                    collapsed
                      ? "mx-auto h-11 w-11 justify-center"
                      : "h-11 w-full gap-3 px-3",

                    /*
                      Active / default
                    */
                    isActive
                      ? "text-white"
                      : [
                          "text-white/55",
                          "hover:bg-white/[0.05]",
                          "hover:text-white",
                        ].join(" "),
                  ].join(" ")
                }

                style={({ isActive }) =>
                  isActive
                    ? {
                        background: `${ACCENT}18`,
                        boxShadow: `inset 0 0 0 1px ${ACCENT}28`,
                      }
                    : undefined
                }
              >
                {({ isActive }) => (
                  <>
                    {/* ================================================== */}
                    {/* ACTIVE LEFT LINE                                   */}
                    {/* ================================================== */}

                    {isActive &&
                      !collapsed && (
                        <span
                          className="
                            absolute bottom-2
                            left-0 top-2
                            w-[3px]
                            rounded-r-full
                          "
                          style={{
                            background: ACCENT,
                          }}
                        />
                      )}

                    {/* ================================================== */}
                    {/* ICON                                               */}
                    {/* ================================================== */}

                    <span
                      className={`
                        flex h-8 w-8
                        shrink-0 items-center
                        justify-center rounded-xl
                        transition-all duration-150

                        ${
                          isActive
                            ? ""
                            : "group-hover:bg-white/[0.06]"
                        }
                      `}
                      style={
                        isActive
                          ? {
                              background: `${ACCENT}28`,
                              color: ACCENT,
                            }
                          : undefined
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    {/* ================================================== */}
                    {/* LABEL                                              */}
                    {/* ================================================== */}

                    {!collapsed && (
                      <span
                        className={`
                          min-w-0 flex-1
                          truncate text-sm
                          transition-colors

                          ${
                            isActive
                              ? "font-semibold text-white"
                              : "font-medium text-white/60 group-hover:text-white"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* ================================================== */}
                    {/* ACTIVE DOT                                         */}
                    {/* ================================================== */}

                    {isActive &&
                      !collapsed && (
                        <span
                          className="
                            h-1.5 w-1.5
                            shrink-0 rounded-full
                          "
                          style={{
                            background: ACCENT,
                          }}
                        />
                      )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ================================================================ */}
      {/* BOTTOM BUTTON                                                     */}
      {/* ================================================================ */}

      <div
        className="
          relative shrink-0
          border-t border-white/10
          px-3 py-4
        "
      >
        <Link
          to="/admin/hub"
          title={
            collapsed
              ? "Back to Registry Hub"
              : undefined
          }
          className={`
            flex items-center
            justify-center
            rounded-xl
            text-sm font-semibold
            transition-all duration-150
            hover:brightness-110
            active:scale-[0.98]

            ${
              collapsed
                ? "mx-auto h-11 w-11"
                : "h-11 w-full gap-2"
            }
          `}
          style={{
            background: ACCENT,
            color: "#fff",
            boxShadow: `0 8px 20px ${ACCENT}33`,
          }}
        >
          <FiGrid className="h-4 w-4 shrink-0" />

          {!collapsed && (
            <span>
              Back to Registry Hub
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}