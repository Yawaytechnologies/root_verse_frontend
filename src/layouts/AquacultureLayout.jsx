// src/layouts/AquacultureLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Aquaculture/Header.jsx";   // adjust path
import Sidebar from "../components/Aquaculture/Sidebar.jsx"; // adjust path

export default function AquacultureLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Left: aquaculture sidebar */}
      <Sidebar />

      {/* Right: header + page content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
          <Outlet /> {/* 🔹 Aquaculture pages render here */}
        </main>
      </div>
    </div>
  );
}
