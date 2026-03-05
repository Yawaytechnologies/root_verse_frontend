// src/modules/admin/ui/AdminHeader.jsx
import { useEffect, useState } from "react";
import { FiMenu, FiGlobe, FiUser, FiMaximize, FiMinimize } from "react-icons/fi";

export default function AdminHeader({ onToggleSidebar }) {
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
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  return (
    <header
      style={{ "--rv-accent": "#22e5a6" }}
      className={[
        "fixed top-0 right-0 left-[var(--rv-sidebar-offset,0px)] z-30",
        "h-16", // ✅ stable height
        "bg-[#070f0c] border-b border-white/10",
        "transition-all duration-200",
        scrolled
          ? "shadow-[0_18px_70px_rgba(0,0,0,0.40)]"
          : "shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
      ].join(" ")}
    >
      {/* aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(34,229,166,0.12),transparent_60%)]" />
        <div className="absolute -right-40 -top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(34,229,166,0.10),transparent_60%)]" />
      </div>

      {/* accent underline */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent,var(--rv-accent),transparent)] opacity-50" />

      <div className="relative h-full flex w-full min-w-0 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          className={[
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl",
            "bg-white/5 text-white/90 border border-white/10",
            "hover:bg-white/10 hover:border-white/15",
            "transition-all",
          ].join(" ")}
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0" />

        <div className="flex flex-shrink-0 items-center gap-3 ml-auto">
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
        "transition-all",
      ].join(" ")}
    >
      {children}
    </button>
  );
}