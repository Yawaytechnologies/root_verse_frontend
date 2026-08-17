import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiGlobe,
  FiUser,
  FiMaximize,
  FiMinimize,
  FiLogOut,
} from "react-icons/fi";
import { logout, selectAdmin } from "../../../redux/reducer/adminLoginSlice";

const ACCENT = "#06B6D4";

export default function TradeprocessHeader({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);

  const [scrolled, setScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const displayName = admin?.username ?? admin?.full_name ?? admin?.email ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        scrolled
          ? "border-b border-white/10 bg-[#0F172A]/95 shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md"
          : "border-b border-white/8 bg-[#0F172A]"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/15 hover:text-white active:scale-95"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="max-w-md flex-1">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-full rounded-2xl border border-white/10 bg-white/8 pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus:border-white/25 focus:bg-white/12 focus:outline-none"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <HeaderIconBtn onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
          </HeaderIconBtn>

          <HeaderIconBtn className="hidden md:flex">
            <FiGlobe className="h-4 w-4" />
          </HeaderIconBtn>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLogout((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white ring-2 ring-cyan-500/30 transition-all hover:ring-cyan-500/60 active:scale-95"
              style={{ background: `${ACCENT}33` }}
              title={displayName}
            >
              {initials ? (
                <span className="text-xs font-bold" style={{ color: ACCENT }}>{initials}</span>
              ) : (
                <FiUser className="h-4 w-4" style={{ color: ACCENT }} />
              )}
            </button>

            {showLogout && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLogout(false)} />
                <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ background: "#1C140C" }}>
                  <div className="border-b border-white/8 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    {admin?.email && <p className="mt-0.5 truncate text-xs text-white/40">{admin.email}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
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
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/60 transition-all hover:bg-white/15 hover:text-white active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}
