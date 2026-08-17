import { useState } from "react";
import { Outlet } from "react-router-dom";
import TradeprocessSidebar from "./TradeprocessSidebar";
import TradeprocessHeader from "./TradeprocessHeader";

export default function TradeprocessLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  const sidePadding = collapsed ? "lg:pl-20" : "lg:pl-72";

  return (
    <div className={`min-h-screen bg-[#F5F9FF] ${sidePadding}`}>
      <TradeprocessSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-col">
        <TradeprocessHeader onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
