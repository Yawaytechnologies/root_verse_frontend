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
      className={`
        sticky top-0 z-30
        transition-colors duration-200
        ${scrolled
          ? "bg-[#f3f4f6] border-b border-slate-200 shadow-sm"
          : "bg-transparent border-b border-transparent"}
      `}
    >
      {/* this row is the header content, no card/rounded container */}
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Collapse / sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-black transition-colors"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="
                block w-full rounded-full border
                border-slate-200 bg-slate-50
                py-2.5 pl-9 pr-3 text-sm
                text-slate-800 placeholder:text-slate-400
                focus:bg-white focus:border-slate-400
                focus:outline-none focus:ring-2 focus:ring-slate-300
              "
            />
          </div>
        </div>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-3">
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
      className="
        flex h-10 w-10 items-center justify-center
        rounded-full
        bg-slate-100 text-slate-700
        border border-slate-200
        hover:bg-slate-200
        transition-colors
      "
    >
      {children}
    </button>
  );
}
