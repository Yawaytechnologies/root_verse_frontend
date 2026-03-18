// src/modules/admin/participant-registry/components/CrateAssignTransport.jsx
import React, { useState } from "react";
import {
  FiSearch, FiEye, FiCheck, FiX,
  FiChevronDown, FiMapPin, FiThermometer,
} from "react-icons/fi";
import { MdOutlineInventory2, MdLocalShipping } from "react-icons/md";
import { TbQrcode } from "react-icons/tb";
import { T, STATUS_MAP } from "./pccTheme";

/* ── Atoms ── */
function StatusPill({ status }) {
  const key = status?.toLowerCase().replace(/\s/g, "") ?? "pending";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_MAP[key] ?? STATUS_MAP.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"/>{status}
    </span>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"/>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-stone-100 pl-10 pr-4 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition"
        style={{"--tw-ring-color":T.accent}}/>
    </div>
  );
}

function Input({ label, placeholder, type="text", required, icon:Icon, span }) {
  return (
    <div className={span===2?"sm:col-span-2":span===3?"sm:col-span-2 lg:col-span-3":""}>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required&&<span style={{color:T.accent}}> *</span>}
      </label>
      <div className="relative">
        {Icon&&<Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"/>}
        <input type={type} placeholder={placeholder}
          className={`w-full h-10 rounded-xl bg-stone-50 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${Icon?"pl-10 pr-4":"px-4"}`}
          style={{"--tw-ring-color":T.accent}}/>
      </div>
    </div>
  );
}

function Select({ label, options, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required&&<span style={{color:T.accent}}> *</span>}
      </label>
      <div className="relative">
        <select className="w-full h-10 rounded-xl bg-stone-50 px-4 pr-9 text-sm text-stone-800 ring-1 ring-stone-200 appearance-none focus:bg-white focus:outline-none focus:ring-2 transition"
          style={{"--tw-ring-color":T.accent}}>
          <option value="">Select…</option>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"/>
      </div>
    </div>
  );
}

function SectionHeader({ icon:Icon, title, sub, accentBg=true }) {
  return (
    <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:T.accent}}>
        <Icon className="h-5 w-5"/>
      </div>
      <div>
        <p className="font-semibold text-stone-800">{title}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
    </div>
  );
}

const ASSIGN_MOCK = [
  { crateId:"CRT-3821", source:"Vessel MFN-02", status:"Assigned",   date:"18/03/2026", assignedTo:"Ravi Logistics", driver:"K. Mani", vehicle:"TN01AB1234", notes:"Handle with care" },
  { crateId:"CRT-3822", source:"Farm BLK-07",   status:"In Transit", date:"18/03/2026", assignedTo:"Coastal Freight", driver:"S. Ram", vehicle:"TN32CD5678", notes:"—" },
  { crateId:"CRT-3823", source:"Vessel MFN-04", status:"Received",   date:"17/03/2026", assignedTo:"—",             driver:"—",       vehicle:"—",          notes:"—" },
];

const TRANSPORT_MOCK = [
  {
    crateId:"CRT-3822", status:"In Transit", centre:"Nagapattinam PCC",
    dest:"Chennai Cold Store", vehicle:"TN32CD5678", grade:"A",
    tags:"TAG-001,TAG-002", pickedUp:"18/03 10:42 UTC",
    gps:"13.0827,80.2707", temp:"4.2°C", tempAt:"18/03 10:45 UTC", tempOp:"OPR-041",
  },
];

export default function CrateAssignTransport() {
  const [section, setSection] = useState("assign");
  const [q, setQ] = useState("");

  const filteredAssign = ASSIGN_MOCK.filter(r =>
    [r.crateId, r.source, r.status, r.assignedTo].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const SECTIONS = [
    { id:"assign",    label:"Crate Assignment",     icon:MdOutlineInventory2 },
    { id:"transport", label:"Transport Log",         icon:MdLocalShipping },
    { id:"log",       label:"Log New Entry",         icon:TbQrcode },
  ];

  return (
    <div className="pccCrateAssign space-y-5" style={{background:T.pageBg, minHeight:"100%"}}>
      <style>{`.pccCrateAssign * { box-sizing: border-box; }`}</style>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineInventory2 className="h-5 w-5" style={{color:T.accent}}/>
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Crate Assign & Transport</h1>
          <p className="mt-1 text-sm text-stone-500">Manage crate assignments, transport scheduling, and pickup logs</p>
        </div>

        {/* Section switcher */}
        <div className="flex flex-wrap gap-2 mb-5 rounded-2xl bg-white p-1.5 ring-1 ring-stone-200 shadow-sm">
          {SECTIONS.map(s=>{
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={()=>{setSection(s.id);setQ("");}}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition min-w-0"
                style={section===s.id?{background:T.accent,color:"#fff"}:{color:"#78716C"}}>
                <Icon className="h-4 w-4 shrink-0"/><span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ASSIGN */}
        {section === "assign" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:T.accent}}>
                  <MdOutlineInventory2 className="h-5 w-5"/>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Crate Assignment Queue</p>
                  <p className="text-xs text-stone-500">{filteredAssign.length} crate(s)</p>
                </div>
              </div>
              <div className="w-full sm:w-72"><SearchBar value={q} onChange={setQ} placeholder="Search crate ID, source, status…"/></div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {filteredAssign.length === 0 ? <p className="text-center text-stone-400 py-10 text-sm">No crates found.</p>
                : filteredAssign.map(r=>(
                <div key={r.crateId} className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
                    <div>
                      <p className="font-mono font-semibold" style={{color:T.accent}}>{r.crateId}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{r.source}</p>
                    </div>
                    <StatusPill status={r.status}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-4 py-3">
                    <div><p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Assigned To</p><p className="text-sm text-stone-700 mt-0.5">{r.assignedTo}</p></div>
                    <div><p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Driver</p><p className="text-sm text-stone-700 mt-0.5">{r.driver}</p></div>
                    <div><p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Vehicle</p><p className="font-mono text-sm text-stone-700 mt-0.5">{r.vehicle}</p></div>
                    <div><p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Date</p><p className="text-sm text-stone-700 mt-0.5">{r.date}</p></div>
                  </div>
                  <div className="border-t border-stone-100 px-4 py-3">
                    <button className="text-xs font-semibold rounded-lg px-3 py-1.5 ring-1 ring-stone-200 bg-white hover:bg-stone-50 transition" style={{color:T.accent}}>Assign / Update</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-bold tracking-[0.16em] text-stone-400">
                    {["Crate ID","Source","Status","Date","Assigned To","Driver","Vehicle","Notes",""].map(h=>(
                      <th key={h} className="border-b border-stone-100 px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssign.map(r=>(
                    <tr key={r.crateId} className="hover:bg-stone-50/60 transition">
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="font-mono font-semibold text-sm" style={{color:T.accent}}>{r.crateId}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.source}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><StatusPill status={r.status}/></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-500">{r.date}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-700">{r.assignedTo}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.driver}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded-lg">{r.vehicle}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-500">{r.notes}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 ring-stone-200 bg-white hover:bg-stone-50 transition" style={{color:T.accent}}>Assign</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-stone-400">Showing <strong className="text-stone-700">{filteredAssign.length}</strong> crate(s)</p>
            </div>
          </div>
        )}

        {/* TRANSPORT LOG */}
        {section === "transport" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <SectionHeader icon={MdLocalShipping} title="Active Transport Logs" sub="Live crate movement and temperature tracking"/>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-bold tracking-[0.16em] text-stone-400">
                    {["Crate ID","Status","From","To","Vehicle","Grade","Temp","Picked Up (UTC)","GPS",""].map(h=>(
                      <th key={h} className="border-b border-stone-100 px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRANSPORT_MOCK.map(r=>(
                    <tr key={r.crateId} className="hover:bg-stone-50/60 transition">
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="font-mono font-semibold" style={{color:T.accent}}>{r.crateId}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><StatusPill status={r.status}/></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.centre}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.dest}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded-lg">{r.vehicle}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{r.grade}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="flex items-center gap-1 text-xs text-sky-700 font-semibold"><FiThermometer className="h-3.5 w-3.5"/>{r.temp}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-500">{r.pickedUp}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><span className="flex items-center gap-1 text-xs text-stone-500"><FiMapPin className="h-3.5 w-3.5"/>{r.gps}</span></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                          <FiEye className="h-3.5 w-3.5"/>View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-stone-400">Showing <strong className="text-stone-700">{TRANSPORT_MOCK.length}</strong> active log(s)</p>
            </div>
          </div>
        )}

        {/* LOG NEW ENTRY */}
        {section === "log" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <SectionHeader icon={TbQrcode} title="Log Transport Entry" sub="Record crate pickup, vehicle, temperature, and GPS"/>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Crate ID" placeholder="Scan or type crate ID" icon={TbQrcode} required/>
                <Select label="Status" options={["Assigned","In Transit","Received","Exception"]} required/>
                <Select label="Collection Centre" options={["Nagapattinam PCC","Tuticorin Cold Hub","Chennai East Dock"]} required/>
                <Input label="Destination" placeholder="Destination name / centre" required/>
                <Input label="Scheduled Time" type="datetime-local" required/>
                <Input label="Assigned Vehicle No" placeholder="e.g. TN01AB1234" required/>
                <Select label="Quality Grade" options={["A","B","C","Rejected"]} required/>
                <Input label="Fish Tags" placeholder="TAG-001, TAG-002 (comma separated)"/>
                <Input label="Notes" placeholder="Additional notes"/>
                <Input label="Picked Up At (UTC)" type="datetime-local"/>
                <Input label="GPS Pickup (Lat, Long)" placeholder="13.0827, 80.2707" icon={FiMapPin}/>
              </div>

              {/* Temperature log sub-section */}
              <div className="mt-5 rounded-2xl bg-stone-50 ring-1 ring-stone-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FiThermometer className="h-4 w-4" style={{color:T.accent}}/>
                  <p className="text-sm font-semibold text-stone-700">Temperature Log</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Temp Value (°C)" placeholder="e.g. 4.2" type="number" icon={FiThermometer}/>
                  <Input label="Recorded At (UTC)" type="datetime-local"/>
                  <Input label="Temperature Logger Operator ID" placeholder="OPR-041"/>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97]"
                  style={{background:T.accent,boxShadow:T.accentShadow}}>
                  <FiCheck className="h-4 w-4"/> Save Transport Log
                </button>
                <button onClick={()=>setSection("assign")}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition">
                  <FiX className="h-4 w-4"/> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}