// src/modules/admin/ui/AdminHeader.jsx
import { useEffect, useState } from "react";
import { FiMenu, FiSearch, FiGlobe, FiUser } from "react-icons/fi";

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
      className={[
        // ✅ make it fill the remaining content area (uses CSS var set in AdminLayout)
        "fixed top-0 right-0 left-[var(--rv-sidebar-offset,0px)] z-30",
        "transition-all duration-200",
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-emerald-100 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="flex w-full min-w-0 items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={[
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
            "bg-[#0B1B16] text-white",
            "ring-1 ring-emerald-300/30",
            "hover:bg-[#0E241D] hover:ring-emerald-300/50",
            "transition-all",
          ].join(" ")}
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className={[
                "block w-full rounded-full border",
                "border-emerald-100 bg-white/75 backdrop-blur",
                "py-2.5 pl-9 pr-3 text-sm",
                "text-slate-800 placeholder:text-slate-400",
                "shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
                "focus:bg-white focus:border-emerald-300",
                "focus:outline-none focus:ring-2 focus:ring-emerald-200/70",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Right icons */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-3 ml-auto">
          <RoundIconButton>
            <FiGlobe className="h-4 w-4" />
          </RoundIconButton>
          <RoundIconButton>
            <FiUser className="h-4 w-4" />
          </RoundIconButton>
        </div>
      </div>
    </header>
  );
}

function RoundIconButton({ children }) {
  return (
    <button
      type="button"
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full",
        "bg-white/70 backdrop-blur",
        "text-slate-700 border border-emerald-100",
        "shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
        "hover:bg-white hover:border-emerald-200",
        "transition-all",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
