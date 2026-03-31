// src/modules/admin/ui/AdminHeader.jsx  (Participant Registry / PCC)
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiGlobe, FiUser, FiMaximize, FiMinimize, FiLogOut } from "react-icons/fi";
import { logout } from "../../../redux/reducer/adminLoginSlice";
import { selectAdmin } from "../../../redux/reducer/adminLoginSlice";

const ACCENT = "#D97706";

export default function AdminHeader({ onToggleSidebar }) {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const admin       = useSelector(selectAdmin);

  const [scrolled,    setScrolled]    = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showLogout,  setShowLogout]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync fullscreen state when user presses Esc or uses browser controls
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  function handleLogout() {
    dispatch(logout());
    navigate("/admin/login", { replace: true });
  }

  // Display name: prefer admin profile, fall back to "Admin"
  const displayName = admin?.username ?? admin?.full_name ?? admin?.email ?? "Admin";
  const initials    = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        scrolled
          ? "bg-[#18120A]/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          : "bg-[#18120A] border-b border-white/8"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">

        {/* ── Sidebar toggle ── */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white/70 hover:bg-white/15 hover:text-white transition-all ring-1 ring-white/10 active:scale-95"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* ── Search bar ── */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
            <input
              type="text"
              placeholder="Search..."
              className="
                w-full h-10 rounded-2xl
                bg-white/8 border border-white/10
                pl-10 pr-4 text-sm
                text-white placeholder:text-white/30
                focus:bg-white/12 focus:border-white/25 focus:outline-none
                transition-all
              "
            />
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="ml-auto flex items-center gap-2">

          {/* Fullscreen toggle */}
          <HeaderIconBtn onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen
              ? <FiMinimize className="h-4 w-4" />
              : <FiMaximize className="h-4 w-4" />
            }
          </HeaderIconBtn>

          {/* Language */}
          <HeaderIconBtn className="hidden md:flex">
            <FiGlobe className="h-4 w-4" />
          </HeaderIconBtn>

          {/* User avatar + logout dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLogout(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white transition-all active:scale-95 ring-2 ring-amber-500/30 hover:ring-amber-500/60"
              style={{ background: `${ACCENT}33` }}
              title={displayName}
            >
              {initials
                ? <span className="text-xs font-bold" style={{ color: ACCENT }}>{initials}</span>
                : <FiUser className="h-4 w-4" style={{ color: ACCENT }} />
              }
            </button>

            {/* Dropdown */}
            {showLogout && (
              <>
                {/* click-outside overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLogout(false)}
                />
                <div
                  className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                  style={{ background: "#1C140C" }}
                >
                  {/* User info row */}
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    {admin?.email && (
                      <p className="text-xs text-white/40 truncate mt-0.5">{admin.email}</p>
                    )}
                  </div>

                  {/* Logout button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <FiLogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

function HeaderIconBtn({ children, className = "", onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}
