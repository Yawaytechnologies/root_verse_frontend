// src/App.jsx
import "./global.css";
import MaricultureSidebar from "./components/mariculture/MaricultureSidebar.jsx";
import MaricultureDashboard from "./pages/mariculture/MaricultureDashboard.jsx";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* Fixed sidebar on the left */}
        <MaricultureSidebar />

        {/* Main content shifted right of sidebar, scrolls independently */}
        <div className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
          <MaricultureDashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
