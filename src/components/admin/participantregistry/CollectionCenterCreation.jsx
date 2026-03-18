// src/modules/admin/participant-registry/components/CollectionCentreRegistration.jsx
import React, { useState } from "react";
import {
  FiSearch, FiEye, FiCheck, FiX,
  FiChevronDown, FiPlus, FiMapPin, FiPhone, FiMail,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { BsSnow2 } from "react-icons/bs";
import { T, STATUS_MAP } from "./pccTheme";

/* ── Atoms ── */
function StatusPill({ status }) {
  const key = status?.toLowerCase().replace(/\s/g, "") ?? "pending";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_MAP[key] ?? STATUS_MAP.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{status}
    </span>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-stone-100 pl-10 pr-4 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition"
        style={{ "--tw-ring-color": T.accent }} />
    </div>
  );
}

function Input({ label, placeholder, type = "text", required, icon: Icon, span }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label} {required && <span style={{ color: T.accent }}>*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />}
        <input type={type} placeholder={placeholder}
          className={`w-full h-10 rounded-xl bg-stone-50 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${Icon ? "pl-10 pr-4" : "px-4"}`}
          style={{ "--tw-ring-color": T.accent }} />
      </div>
    </div>
  );
}

function Select({ label, options, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label} {required && <span style={{ color: T.accent }}>*</span>}
      </label>
      <div className="relative">
        <select className="w-full h-10 rounded-xl bg-stone-50 px-4 pr-9 text-sm text-stone-800 ring-1 ring-stone-200 appearance-none focus:bg-white focus:outline-none focus:ring-2 transition"
          style={{ "--tw-ring-color": T.accent }}>
          <option value="">Select…</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      </div>
    </div>
  );
}

function Toggle({ label, hint }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
      <div className="flex items-center gap-3">
        <BsSnow2 className="h-5 w-5 shrink-0" style={{ color: on ? T.accent : "#A8A29E" }} />
        <div>
          <p className="text-sm font-semibold text-stone-800">{label}</p>
          {hint && <p className="text-xs text-stone-500 mt-0.5">{hint}</p>}
        </div>
      </div>
      <button type="button" onClick={() => setOn(v => !v)}
        className="relative shrink-0 h-6 w-11 rounded-full transition-colors"
        style={{ background: on ? T.accent : "#D6D3D1" }}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

const MOCK = [
  { id: "CC-001", name: "Nagapattinam PCC — East Dock", type: "Primary PCC",  district: "Nagapattinam", cold: true,  capacity: "500 crates", contact: "S. Ravi",   status: "Active" },
  { id: "CC-002", name: "Tuticorin Cold Hub",           type: "Cold Store",    district: "Tuticorin",    cold: true,  capacity: "800 crates", contact: "M. Priya",  status: "Active" },
  { id: "CC-003", name: "Chennai Marina Point",         type: "Sub PCC",       district: "Chennai",      cold: false, capacity: "200 crates", contact: "T. Dinesh", status: "Draft"  },
];

export default function CollectionCentreRegistration() {
  const [tab, setTab] = useState("list");
  const [q,   setQ]   = useState("");
  const filtered = MOCK.filter(r => [r.name, r.type, r.district, r.id].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pccCentre space-y-5" style={{ background: T.pageBg, minHeight: "100%" }}>
      <style>{`.pccCentre * { box-sizing: border-box; }`}</style>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdStorefront className="h-5 w-5" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Collection Centre Registration</h1>
          <p className="mt-1 text-sm text-stone-500">Register and manage collection centres and cold stores</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[["list","All Centres"],["register","Register New"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={tab===k ? {background:T.accent,color:"#fff"} : {background:"#F5F5F4",color:"#57534E"}}>
              {k==="register" && <FiPlus className="h-4 w-4"/>}{l}
            </button>
          ))}
        </div>

        {/* LIST */}
        {tab === "list" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:T.accent}}>
                  <MdStorefront className="h-5 w-5"/>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Registered Centres</p>
                  <p className="text-xs text-stone-500">{filtered.length} centre(s) found</p>
                </div>
              </div>
              <div className="w-full sm:w-72"><SearchBar value={q} onChange={setQ} placeholder="Search name, type, district…"/></div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {filtered.length === 0 ? <p className="text-center text-stone-400 py-10 text-sm">No centres found.</p>
                : filtered.map(r => (
                <div key={r.id} className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{r.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono text-[11px] text-stone-400">{r.id}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">{r.type}</span>
                      </div>
                    </div>
                    <StatusPill status={r.status}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">District</p>
                      <p className="text-sm text-stone-700 mt-0.5">{r.district}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Capacity</p>
                      <p className="text-sm text-stone-700 mt-0.5">{r.capacity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Cold Storage</p>
                      <p className="text-sm font-semibold mt-0.5" style={{color: r.cold?"#059669":"#78716C"}}>
                        {r.cold ? "Available ❄️" : "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Contact</p>
                      <p className="text-sm text-stone-700 mt-0.5">{r.contact}</p>
                    </div>
                  </div>
                  <div className="border-t border-stone-100 px-4 py-3">
                    <button className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-white ring-1 ring-stone-200 hover:bg-stone-50 transition">View Details</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-bold tracking-[0.16em] text-stone-400">
                    {["ID","Centre Name","Type","District","Cold Storage","Capacity","Contact","Status",""].map(h=>(
                      <th key={h} className="border-b border-stone-100 px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r=>(
                    <tr key={r.id} className="hover:bg-stone-50/60 transition">
                      <td className="border-b border-stone-100 px-4 py-3.5 font-mono text-xs text-stone-400">{r.id}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 font-semibold text-stone-800 max-w-[200px] truncate">{r.name}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">{r.type}</span>
                      </td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.district}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5">
                        {r.cold
                          ? <span className="flex items-center gap-1 text-emerald-700 text-xs font-semibold"><BsSnow2 className="h-3.5 w-3.5"/> Available</span>
                          : <span className="text-stone-400 text-xs">Not available</span>}
                      </td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.capacity}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.contact}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><StatusPill status={r.status}/></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                          <FiEye className="h-3.5 w-3.5"/>View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-stone-400">Showing <strong className="text-stone-700">{filtered.length}</strong> centre(s)</p>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:T.accent}}>
                <MdStorefront className="h-5 w-5"/>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Register Collection Centre</p>
                <p className="text-xs text-stone-500">Fill all required fields to register a new centre</p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Collection Centre ID" placeholder="Auto-generated on save" required />
                <Input label="Collection Centre Name" placeholder="Display name" required />
                <Select label="District / Region / State" options={["Nagapattinam, TN","Tuticorin, TN","Chennai, TN","Ramanathapuram, TN"]} required />
                <Input label="Address" placeholder="Operational location address" required span={2} />
                <Input label="GPS Coordinates" placeholder="Lat, Long (e.g. 10.7671, 79.8421)" icon={FiMapPin} />
                <Select label="Centre Type" options={["Primary PCC","Sub PCC","Cold Store","Transit Hub"]} required />
                <Select label="Supports Supply Types" options={["Wild Capture","Aquaculture","Mariculture","All"]} required />
                <Input label="Storage Capacity" placeholder="e.g. 500 crates / 2 tonnes" />
                <Input label="Contact Person" placeholder="Name" required />
                <Input label="Contact Mobile" placeholder="10-digit mobile" type="tel" icon={FiPhone} required />
                <Input label="Email" placeholder="centre@email.com" type="email" icon={FiMail} />
                <Select label="Centre Status" options={["Draft","Pending Approval","Active","Inactive","Suspended"]} required />
                <div className="sm:col-span-2 lg:col-span-3">
                  <Toggle label="Cold Storage Available" hint="Centre has refrigeration / cold room facility" />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97]"
                  style={{background:T.accent,boxShadow:T.accentShadow}}>
                  <FiCheck className="h-4 w-4"/> Register Centre
                </button>
                <button onClick={()=>setTab("list")}
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