// src/modules/admin/aquaculture/pages/AquaCultureDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

/* ── icons ── */
const FarmIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg>
);
const PondIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><ellipse cx="12" cy="14" rx="9" ry="5" stroke="currentColor" strokeWidth="1.8"/><path d="M6 11c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const FishIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/><path d="M20 7l2-3M20 17l2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const HarvestIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 17l5-5 4 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 7h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const DropIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
);
const LayersIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
);
const TrendIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 17l5-5 4 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 7h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const AlertIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3L2 21h20L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 9v5M12 17v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);
const MapPinIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>
);
const CheckCircleIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

/* ── data ── */
const STATS = [
  { label:"REGISTERED FARMS",   value:34,    sub:"Across all clusters",    Icon:LayersIcon },
  { label:"ACTIVE PONDS",       value:112,   sub:"Stocked this cycle",     Icon:DropIcon   },
  { label:"LIVE BIOMASS (MT)",  value:386.4, sub:"Estimated standing crop",Icon:TrendIcon  },
  { label:"HARVESTS THIS MONTH",value:19,    sub:"Completed this cycle",   Icon:HarvestIcon},
];

const CYCLES = [
  { id:1, code:"NA-FRM-001", farm:"Blue Creek",       pond:"P01", location:"Nagapattinam",   species:"Shrimp · L. vannamei", day:42, stage:"Mid Grow-Out",  daysToHarvest:35, biomass:"18.4 MT", pct:55 },
  { id:2, code:"NA-FRM-004", farm:"Sunrise Aquafarm", pond:"P07", location:"Tuticorin",      species:"Tilapia",               day:65, stage:"Pre-Harvest",   daysToHarvest:10, biomass:"22.1 MT", pct:87 },
  { id:3, code:"NA-FRM-009", farm:"Green Fields",     pond:"P03", location:"Ramanathapuram", species:"Shrimp · L. vannamei", day:18, stage:"Early Grow-Out", daysToHarvest:62, biomass:"7.9 MT",  pct:22 },
  { id:4, code:"NA-FRM-012", farm:"Delta Marine",     pond:"P11", location:"Cuddalore",      species:"Sea Bass",              day:31, stage:"Mid Grow-Out",  daysToHarvest:44, biomass:"11.2 MT", pct:41 },
];

const HEALTH = [
  { label:"Pending Approvals",  value:3,         note:"Owner + Farm",       Icon:AlertIcon,       warn:true  },
  { label:"Districts Covered",  value:11,        note:"Active zones",        Icon:MapPinIcon,      warn:false },
  { label:"Species Tracked",    value:8,         note:"Under active culture",Icon:FishIcon,        warn:false },
  { label:"System Status",      value:"Healthy", note:"All services live",   Icon:CheckCircleIcon, warn:false },
];

function stagePill(pct) {
  if (pct >= 80) return { bg:"#fef2f2", color:"#b91c1c", border:"#fecaca" };
  if (pct >= 50) return { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" };
  return               { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" };
}

export default function AquaCultureDashboard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const localTime = useMemo(() => new Intl.DateTimeFormat("en-IN", { hour:"2-digit", minute:"2-digit", hour12:false }).format(now), [now]);

  return (
    <div style={{ background:"#eef2f7", minHeight:"100%", padding:"28px 28px 60px", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ maxWidth:1040, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:"#0f172a", margin:0, letterSpacing:"-0.02em" }}>Aquaculture Dashboard</h1>
          <p style={{ fontSize:14, color:"#64748b", margin:"6px 0 0" }}>Quick overview of farms, ponds and current culture cycles.</p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
          {STATS.map(({ label, value, sub, Icon }) => (
            <div key={label} style={{ background:"#fff", borderRadius:16, padding:"20px 20px 18px", boxShadow:"0 2px 12px rgba(15,23,42,0.06)", border:"1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:"#1e293b", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon style={{ width:18, height:18 }}/>
                </div>
                <div>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:"#94a3b8", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:"#0f172a", lineHeight:1 }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two col ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

          {/* Pond Cycles */}
          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 12px rgba(15,23,42,0.06)", border:"1px solid rgba(0,0,0,0.05)", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"#64748b", textTransform:"uppercase" }}>CURRENT POND CYCLES</div>
                <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Key ponds being monitored this week.</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#64748b" }}>
                <ClockIcon style={{ width:14, height:14 }}/>
                <span>Local time</span>
                <span style={{ fontWeight:700, color:"#1e293b" }}>{localTime}</span>
              </div>
            </div>

            {/* col headers */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 56px 130px 90px 90px", padding:"8px 22px", background:"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
              {["Farm / Pond","Day","Stage","Harvest In","Biomass"].map(h => (
                <span key={h} style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</span>
              ))}
            </div>

            {CYCLES.map((c, i) => {
              const pill = stagePill(c.pct);
              return (
                <div key={c.id}
                  style={{ display:"grid", gridTemplateColumns:"1fr 56px 130px 90px 90px", padding:"13px 22px", borderBottom: i < CYCLES.length-1 ? "1px solid #f1f5f9" : "none", alignItems:"center" }}
                  onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  {/* Farm / Pond */}
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"#1e293b", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <DropIcon style={{ width:15, height:15 }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{c.code} · {c.farm} · {c.pond}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{c.location} · {c.species}</div>
                      <div style={{ marginTop:5, display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:100, height:3, borderRadius:99, background:"#f1f5f9", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${c.pct}%`, background: c.pct>=80?"#ef4444":c.pct>=50?"#f97316":"#22c55e", borderRadius:99 }}/>
                        </div>
                        <span style={{ fontSize:11, color:"#94a3b8" }}>{c.pct}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Day */}
                  <div style={{ fontSize:16, fontWeight:700, color:"#1e293b" }}>{c.day}</div>
                  {/* Stage */}
                  <div>
                    <span style={{ fontSize:11, fontWeight:600, background:pill.bg, color:pill.color, border:`1px solid ${pill.border}`, borderRadius:6, padding:"3px 9px" }}>
                      {c.stage}
                    </span>
                  </div>
                  {/* Harvest In */}
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:c.daysToHarvest<=15?"#dc2626":"#475569", fontWeight:c.daysToHarvest<=15?700:400 }}>
                    <ClockIcon style={{ width:13, height:13 }}/>
                    {c.daysToHarvest}d
                  </div>
                  {/* Biomass */}
                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{c.biomass}</div>
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Harvest Alert */}
            <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 12px rgba(15,23,42,0.06)", border:"1px solid rgba(0,0,0,0.05)", padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#1e293b", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <AlertIcon style={{ width:16, height:16 }}/>
                </div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", color:"#64748b", textTransform:"uppercase" }}>HARVEST ALERT</div>
              </div>
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#991b1b", marginBottom:4 }}>NA-FRM-004 · Sunrise Aquafarm · P07</div>
                <div style={{ fontSize:12, color:"#b91c1c" }}>Only <strong>10 days</strong> to harvest. Coordinate crate & logistics now.</div>
              </div>
            </div>

            {/* Culture Health */}
            <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 12px rgba(15,23,42,0.06)", border:"1px solid rgba(0,0,0,0.05)", overflow:"hidden", flex:1 }}>
              <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", color:"#64748b", textTransform:"uppercase" }}>CULTURE HEALTH</div>
                <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Live status indicators</div>
              </div>
              {HEALTH.map(({ label, value, note, Icon, warn }, i) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 20px", borderBottom: i < HEALTH.length-1 ? "1px solid #f1f5f9":"none" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"#1e293b", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon style={{ width:15, height:15 }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{label}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{note}</div>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color: warn ? "#dc2626" : "#1e293b" }}>{value}</div>
                </div>
              ))}
              {/* Biomass pill */}
              <div style={{ margin:"12px 16px 16px", background:"#1e293b", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", color:"rgba(255,255,255,0.5)", textTransform:"uppercase" }}>Live Biomass</div>
                  <div style={{ fontSize:24, fontWeight:800, color:"#fff", lineHeight:1.1, marginTop:4 }}>386.4 <span style={{ fontSize:13, fontWeight:600 }}>MT</span></div>
                </div>
                <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)" }}>
                  <TrendIcon style={{ width:20, height:20 }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}