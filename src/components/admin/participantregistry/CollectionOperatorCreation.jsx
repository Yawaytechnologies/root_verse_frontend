// src/modules/admin/participant-registry/components/OperatorRegistration.jsx
import React, { useState } from "react";
import {
  FiUser, FiPhone, FiMail, FiSearch,
  FiEye, FiCheck, FiX, FiChevronDown, FiPlus,
} from "react-icons/fi";
import { MdSupervisorAccount } from "react-icons/md";
import { T, STATUS_MAP } from "./pccTheme";

/* ── Atoms ── */
function StatusPill({ status }) {
  const key = status?.toLowerCase().replace(/\s/g, "") ?? "pending";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_MAP[key] ?? STATUS_MAP.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
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

function Input({ label, placeholder, type = "text", required, icon: Icon }) {
  return (
    <div>
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

const MOCK = [
  { id: "OPR-041", name: "S. Karthik",   mobile: "98765 43210", centre: "Nagapattinam PCC",  role: "Centre Operator", status: "Active"  },
  { id: "OPR-042", name: "M. Priya",     mobile: "97979 11199", centre: "Tuticorin Cold Hub", role: "Supervisor",      status: "Pending" },
  { id: "OPR-043", name: "T. Dinesh",    mobile: "90001 33344", centre: "Chennai East Dock",  role: "Crate Scanner",   status: "Active"  },
];

export default function OperatorRegistration() {
  const [tab, setTab] = useState("list");
  const [q,   setQ]   = useState("");
  const filtered = MOCK.filter(r => [r.name, r.centre, r.role, r.id].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pccOperator space-y-5" style={{ background: T.pageBg, minHeight: "100%" }}>
      <style>{`.pccOperator * { box-sizing: border-box; }`}</style>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdSupervisorAccount className="h-5 w-5" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Operator Registration</h1>
          <p className="mt-1 text-sm text-stone-500">Register and manage collection centre operators</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[["list", "All Operators"], ["register", "Register New"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={tab === k ? { background: T.accent, color: "#fff" } : { background: "#F5F5F4", color: "#57534E" }}>
              {k === "register" && <FiPlus className="h-4 w-4" />}
              {l}
            </button>
          ))}
        </div>

        {/* LIST */}
        {tab === "list" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{ background: T.accent }}>
                  <FiUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Collection Centre Operators</p>
                  <p className="text-xs text-stone-500">{filtered.length} operator(s) registered</p>
                </div>
              </div>
              <div className="w-full sm:w-72">
                <SearchBar value={q} onChange={setQ} placeholder="Search name, centre, role…" />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {filtered.length === 0
                ? <p className="text-center text-stone-400 py-10 text-sm">No operators found.</p>
                : filtered.map(r => (
                  <div key={r.id} className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 overflow-hidden">
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
                      <div>
                        <p className="font-semibold text-stone-800">{r.name}</p>
                        <p className="font-mono text-xs text-stone-400 mt-0.5">{r.id}</p>
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-4 py-3">
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Phone</p>
                        <p className="text-sm text-stone-700 mt-0.5">{r.mobile}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Role</p>
                        <p className="text-sm text-stone-700 mt-0.5">{r.role}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Assigned Centre</p>
                        <p className="text-sm text-stone-700 mt-0.5">{r.centre}</p>
                      </div>
                    </div>
                    <div className="border-t border-stone-100 px-4 py-3">
                      <button className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-white ring-1 ring-stone-200 hover:bg-stone-50 transition">View Details</button>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-bold tracking-[0.16em] text-stone-400">
                    {["ID", "Name", "Mobile", "Assigned Centre", "Role", "Status", ""].map(h => (
                      <th key={h} className="border-b border-stone-100 px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-stone-50/60 transition">
                      <td className="border-b border-stone-100 px-4 py-3.5 font-mono text-xs text-stone-400">{r.id}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5 font-semibold text-stone-800">{r.name}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5">
                        <span className="flex items-center gap-1.5 text-stone-600"><FiPhone className="h-3.5 w-3.5 text-stone-400"/>{r.mobile}</span>
                      </td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-xs text-stone-600">{r.centre}</td>
                      <td className="border-b border-stone-100 px-4 py-3.5">
                        <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-lg text-stone-600 font-medium">{r.role}</span>
                      </td>
                      <td className="border-b border-stone-100 px-4 py-3.5"><StatusPill status={r.status} /></td>
                      <td className="border-b border-stone-100 px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                          <FiEye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-stone-400">
                Showing <strong className="text-stone-700">{filtered.length}</strong> operator(s)
              </p>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{ background: T.accent }}>
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">Register Collection Centre Operator</p>
                <p className="text-xs text-stone-500">Fill required fields to add a new operator</p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Operator RV ID / User ID" placeholder="Auto-generated on save" required />
                <Input label="Operator Name" placeholder="Full legal name" required />
                <Input label="Mobile Number" placeholder="10-digit mobile" type="tel" icon={FiPhone} required />
                <Input label="Email" placeholder="operator@email.com" type="email" icon={FiMail} />
                <Input label="Username / Login ID" placeholder="Login username" required />
                <Input label="Password" placeholder="Set initial password" type="password" required />
                <Select label="Assigned Collection Centre" options={["Nagapattinam PCC", "Tuticorin Cold Hub", "Chennai East Dock"]} required />
                <Select label="Role" options={["Centre Operator", "Supervisor", "Crate Scanner", "Cold Store Manager"]} required />
                <Select label="Operator Status" options={["Active", "Pending", "Inactive", "Suspended"]} required />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97]"
                  style={{ background: T.accent, boxShadow: T.accentShadow }}>
                  <FiCheck className="h-4 w-4" /> Register Operator
                </button>
                <button onClick={() => setTab("list")}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition">
                  <FiX className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}