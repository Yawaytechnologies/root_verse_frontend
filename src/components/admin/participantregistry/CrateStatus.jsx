// src/modules/admin/participant-registry/components/CrateReceiveStatus.jsx
import React, { useState } from "react";
import {
  FiSearch, FiEye, FiCheck, FiX,
  FiChevronDown, FiUpload, FiAlertTriangle,
} from "react-icons/fi";
import { MdOutlineQrCodeScanner, MdOutlineInventory } from "react-icons/md";
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

function Select({ label, options, required, span }) {
  return (
    <div className={span===2?"sm:col-span-2":""}>
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

const CRATE_MOCK = [
  { crateId:"CRT-3819", source:"Farm BLK-05",   status:"Received",   date:"17/03/2026 14:22 UTC" },
  { crateId:"CRT-3820", source:"Vessel MFN-01", status:"Exception",  date:"17/03/2026 16:05 UTC" },
  { crateId:"CRT-3821", source:"Vessel MFN-02", status:"In Transit", date:"18/03/2026 09:10 UTC" },
  { crateId:"CRT-3822", source:"Farm BLK-07",   status:"Assigned",   date:"18/03/2026 08:30 UTC" },
];

export default function CrateReceiveStatus() {
  const [section, setSection] = useState("status");
  const [q, setQ] = useState("");

  const filtered = CRATE_MOCK.filter(r =>
    [r.crateId, r.source, r.status].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const SECTIONS = [
    { id:"status",  label:"Crate Status List",       icon:MdOutlineInventory },
    { id:"update",  label:"Exception Update",         icon:FiAlertTriangle },
  ];

  return (
    <div className="pccCrateStatus space-y-5" style={{background:T.pageBg, minHeight:"100%"}}>
      <style>{`.pccCrateStatus * { box-sizing: border-box; }`}</style>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineQrCodeScanner className="h-5 w-5" style={{color:T.accent}}/>
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Crate Receive Status</h1>
          <p className="mt-1 text-sm text-stone-500">Track crate receive status and submit exception updates</p>
        </div>

        {/* Section switcher */}
        <div className="flex gap-2 mb-5 rounded-2xl bg-white p-1.5 ring-1 ring-stone-200 shadow-sm">
          {SECTIONS.map(s=>{
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={()=>{setSection(s.id);setQ("");}}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                style={section===s.id?{background:T.accent,color:"#fff"}:{color:"#78716C"}}>
                <Icon className="h-4 w-4 shrink-0"/>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* STATUS LIST */}
        {section === "status" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:T.accent}}>
                  <MdOutlineInventory className="h-5 w-5"/>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Crate Status Overview</p>
                  <p className="text-xs text-stone-500">{filtered.length} crate(s) tracked</p>
                </div>
              </div>
              <div className="w-full sm:w-72">
                <SearchBar value={q} onChange={setQ} placeholder="Search crate ID, source, status…"/>
              </div>
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/50">
              {["Received","In Transit","Assigned","Exception"].map(s=>{
                const count = CRATE_MOCK.filter(c=>c.status===s).length;
                return (
                  <div key={s} className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 ring-1 ring-stone-200 text-xs">
                    <StatusPill status={s}/>
                    <span className="font-bold text-stone-700">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {filtered.length === 0 ? <p className="text-center text-stone-400 py-10 text-sm">No crates found.</p>
                : filtered.map(r=>(
                <div key={r.crateId} className={`rounded-2xl ring-1 overflow-hidden ${r.status==="Exception"?"bg-rose-50 ring-rose-200":"bg-stone-50 ring-stone-200"}`}>
                  <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
                    <div>
                      <p className="font-mono font-semibold" style={{color:T.accent}}>{r.crateId}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{r.source}</p>
                    </div>
                    <StatusPill status={r.status}/>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Date / Time</p>
                      <p className="text-sm text-stone-700 mt-0.5">{r.date}</p>
                    </div>
                    {r.status === "Exception" && (
                      <div className="col-span-2">
                        <button
                          onClick={()=>setSection("update")}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition"
                          style={{background:"#E11D48"}}>
                          <FiAlertTriangle className="h-3.5 w-3.5"/> Submit Exception
                        </button>
                      </div>
                    )}
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
                    {["Crate ID","Source","Status","Date / Time (UTC)",""].map(h=>(
                      <th key={h} className="border-b border-stone-100 px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r=>(
                    <tr key={r.crateId} className={`transition ${r.status==="Exception"?"bg-rose-50/40 hover:bg-rose-50":"hover:bg-stone-50/60"}`}>
                      <td className="border-b border-stone-100 px-4 py-3.5">
                        <span className="font-mono font-semibold" style={{color:T.accent}}>{r.crateId}</span>
                      </td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-stone-600">{r.source}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><StatusPill status={r.status}/></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-500">{r.date}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {r.status==="Exception" && (
                            <button onClick={()=>setSection("update")}
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition"
                              style={{background:"#E11D48"}}>
                              <FiAlertTriangle className="h-3.5 w-3.5"/> Exception
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                            <FiEye className="h-3.5 w-3.5"/> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-stone-400">Showing <strong className="text-stone-700">{filtered.length}</strong> crate(s)</p>
            </div>
          </div>
        )}

        {/* EXCEPTION UPDATE */}
        {section === "update" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{background:"#E11D48"}}>
                  <FiAlertTriangle className="h-5 w-5"/>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Crate Status Exception Update</p>
                  <p className="text-xs text-stone-500">Controlled corrections and approvals — requires supervisor sign-off</p>
                </div>
              </div>
              <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                Requires Approval
              </span>
            </div>

            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Crate ID" placeholder="Scan or type crate ID" icon={TbQrcode} required/>
                <Select label="Current Status" options={["Assigned","In Transit","Received","Exception"]} required/>
                <Select label="New Status" options={["Received","Exception","Rejected","On Hold"]} required/>
                <Select label="Reason Code" options={["QC_FAIL","DAMAGE","TEMP_BREACH","MISMATCH","DELAY","MISSING_TAG","OTHER"]} required/>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Detailed Remarks <span style={{color:T.accent}}>*</span>
                  </label>
                  <textarea rows={3} placeholder="Describe the exception clearly — what happened, when, where, and impact…"
                    className="w-full rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 resize-none transition"
                    style={{"--tw-ring-color":T.accent}}/>
                </div>

                <Input label="Requested By" placeholder="Operator ID or Name" required/>
                <Input label="Approved By" placeholder="Supervisor ID or Name"/>
                <Input label="Updated At (UTC)" type="datetime-local" required/>

                {/* File upload */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Attachment / Evidence</label>
                  <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-10 text-center cursor-pointer transition-colors hover:border-amber-400 hover:bg-amber-50/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                      <FiUpload className="h-6 w-6 text-stone-400"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-700">Drop photo or document here</p>
                      <p className="text-xs text-stone-400 mt-1">PNG, JPG, PDF · Max 10MB</p>
                    </div>
                    <button type="button"
                      className="rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition"
                      style={{background:T.accent}}>
                      Browse Files
                    </button>
                    <input type="file" className="hidden" accept="image/*,.pdf"/>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97]"
                  style={{background:"#E11D48",boxShadow:"0 4px 14px rgba(225,29,72,0.28)"}}>
                  <FiCheck className="h-4 w-4"/> Submit Exception
                </button>
                <button onClick={()=>setSection("status")}
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