// src/modules/admin/ui/AdminHeader.jsx
import { useEffect, useState } from "react";
import { FiMenu, FiGlobe, FiUser, FiMaximize, FiMinimize } from "react-icons/fi";

export default function AdminHeader({ onToggleSidebar, accent = "#22e5a6" }) {
  const [scrolled, setScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // fullscreen can be blocked by browser policy
    }
  };

  return (
    <header
      style={{ "--rv-accent": accent }}
      className={[
        "sticky top-0 z-30 relative",
        "border-b border-white/10",
        "bg-[#070b14]/85 backdrop-blur-xl",
        "transition-all duration-200",
        scrolled ? "shadow-[0_18px_70px_rgba(0,0,0,0.40)] bg-[#070b14]/92" : "",
      ].join(" ")}
    >
      {/* ✅ subtle aura like sidebar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute -right-40 -top-24 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--rv-accent)_18%,transparent),transparent_60%)]" />
      </div>

      {/* ✅ accent underline (so it never looks plain) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent,var(--rv-accent),transparent)] opacity-50" />

      <div className="relative flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={[
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl",
            "bg-white/5 text-white/90 border border-white/10",
            "hover:bg-white/10 hover:border-white/15",
            "transition-colors",
            "shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
          ].join(" ")}
          title="Toggle sidebar"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Spacer (search removed) */}
        <div className="flex-1" />

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <RoundIconButton
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
          </RoundIconButton>

          <RoundIconButton title="Language">
            <FiGlobe className="h-4 w-4" />
          </RoundIconButton>

          <RoundIconButton title="Profile">
            <FiUser className="h-4 w-4" />
          </RoundIconButton>
        </div>
      </div>
    </header>
  );
}

function RoundIconButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-2xl",
        "bg-white/5 text-white/80 border border-white/10",
        "hover:bg-white/10 hover:text-[var(--rv-accent)] hover:border-[var(--rv-accent)]",
        "transition-colors",
      ].join(" ")}
    >
      {children}
    </button>
  );
}