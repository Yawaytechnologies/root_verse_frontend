// src/modules/admin/ui/AdminHeader.jsx  (Participant Registry / PCC)
import { useEffect, useState } from "react";
import { FiMenu, FiSearch, FiGlobe, FiUser, FiBell } from "react-icons/fi";

const ACCENT = "#D97706"; // amber-600 — PCC manage button colour

export default function AdminHeader({ onToggleSidebar }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {/* Notification bell */}
          <HeaderIconBtn>
            <FiBell className="h-4 w-4" />
          </HeaderIconBtn>

          {/* Language */}
          <HeaderIconBtn className="hidden md:flex">
            <FiGlobe className="h-4 w-4" />
          </HeaderIconBtn>

          {/* User avatar */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white ring-2 transition-all active:scale-95"
            style={{ background: `${ACCENT}33`, ringColor: `${ACCENT}66` }}
          >
            <FiUser className="h-4 w-4" style={{ color: ACCENT }} />
          </button>
        </div>

      </div>
    </header>
  );
}

function HeaderIconBtn({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}