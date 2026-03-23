// src/components/admin/cratePacker/CratePackerCreate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSave, FiRefreshCcw, FiAlertTriangle,
  FiUser, FiPhone, FiMail, FiMapPin,
  FiCalendar, FiHome, FiChevronDown, FiBox,
  FiSearch, FiEye, FiX,
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import {
  createCratePacker,
  fetchCratePackers,
  fetchLocations,
} from "../../../redux/action/cratepackerCreateActions";
import {
  clearCratePackerCreateState,
  selectCratePackerCreateError,
  selectCratePackerCreateLoading,
  selectCratePackerListLoading,
  selectCratePackerListError,
  selectCratePackers,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from "../../../redux/reducer/cratepackerCreateSlice";

/* ── Theme ── */
const A = "#D97706";

/* ── Helpers ── */
const toDDMMYYYY = (input) => {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }
  return input;
};

/* Auto-format DD-MM-YYYY as user types digits */
const autoFormatDOB = (raw) => {
  // strip everything except digits
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

/* Capitalize each word */
const capWords = (v) => v.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

const EMPTY_FORM = {
  name: "", phone: "", email: "",
  address: "", date_of_birth: "", location_id: "",
};

/* ═══════════════════════════════════
   ATOMS
═══════════════════════════════════ */
function InputField({ label, value, onChange, placeholder, type = "text", required, icon: Icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required && <span style={{ color: A }}> *</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />}
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 rounded-xl bg-stone-50 text-sm font-medium text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${Icon ? "pl-10 pr-4" : "px-4"}`}
          style={{ "--tw-ring-color": A }}
        />
      </div>
    </div>
  );
}

function LocationSelect({ value, onChange, options, loading, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        Location <span style={{ color: A }}>*</span>
      </label>
      <div className="relative">
        <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-stone-50 pl-10 pr-9 text-sm font-medium text-stone-900 ring-1 ring-stone-200 appearance-none focus:bg-white focus:outline-none focus:ring-2 transition disabled:opacity-60"
          style={{ "--tw-ring-color": A }}
        >
          <option value="">{loading ? "Loading locations…" : "Select location…"}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}{o.code ? ` (${o.code})` : ""}
            </option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
      active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-stone-100 text-stone-500 ring-stone-200"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-stone-400"}`} />
      {status || "active"}
    </span>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100">
        {Icon && <Icon className="h-4 w-4 text-stone-500" />}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-stone-800 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════ */
function PackerDetailModal({ packer, locationName, onClose }) {
  useEffect(() => {
    if (!packer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [packer]);

  if (!packer) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col h-full
                      md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-lg
                      bg-white shadow-2xl md:rounded-2xl md:ring-1 md:ring-black/10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4 shrink-0"
             style={{ background: `${A}10` }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
               style={{ background: A }}>
            {(packer.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-stone-900 text-base truncate">{packer.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {packer.code && (
                <span className="font-mono text-[11px] bg-white text-stone-600 px-2 py-0.5 rounded-lg ring-1 ring-stone-200">
                  {packer.code}
                </span>
              )}
              <StatusBadge status={packer.status} />
            </div>
          </div>
          <button onClick={onClose}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100 transition">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">

          {/* Identity */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">Identity</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Full Name"  value={packer.name}  icon={FiUser} />
            <DetailBox label="CP Code"   value={packer.code}  icon={FiBox} mono />
          </div>

          {/* Contact */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase pt-1">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Phone" value={packer.phone} icon={FiPhone} />
            <DetailBox label="Email" value={packer.email} icon={FiMail} />
          </div>

          {/* Personal */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase pt-1">Personal</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Date of Birth" value={packer.date_of_birth} icon={FiCalendar} />
            <DetailBox label="Location"      value={locationName || (packer.location_id != null ? `Loc ${packer.location_id}` : "—")} icon={FiMapPin} />
          </div>
          <DetailBox label="Address" value={packer.address} icon={FiHome} fullWidth />

          {/* System */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase pt-1">System</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Type"       value={packer.rootverse_type} icon={MdOutlineInventory2} />
            <DetailBox label="Status"     value={packer.status || "active"} icon={FiUser} />
            <DetailBox label="Created At" value={packer.created_at ? new Date(packer.created_at).toLocaleString() : "—"} icon={FiCalendar} />
            <DetailBox label="Updated At" value={packer.updated_at ? new Date(packer.updated_at).toLocaleString() : "—"} icon={FiCalendar} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-stone-100 px-5 py-4 bg-stone-50/60">
          <button onClick={onClose}
                  className="w-full rounded-xl bg-stone-200 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-300 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value, icon: Icon, mono, fullWidth }) {
  return (
    <div className={`rounded-xl bg-stone-50 ring-1 ring-stone-200 px-3.5 py-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-stone-400 shrink-0" />}
        <p className="text-[10px] font-bold tracking-[0.16em] text-stone-400 uppercase">{label}</p>
      </div>
      <p className={`text-sm font-semibold text-stone-800 break-words ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════ */
export default function CratePackerCreate() {
  const dispatch = useDispatch();

  const items         = useSelector(selectCratePackers);
  const listLoading   = useSelector(selectCratePackerListLoading);
  const listError     = useSelector(selectCratePackerListError);
  const createLoading = useSelector(selectCratePackerCreateLoading);
  const createError   = useSelector(selectCratePackerCreateError);
  const locations     = useSelector(selectLocations);
  const locLoading    = useSelector(selectLocationsLoading);
  const locError      = useSelector(selectLocationsError);

  const [form, setForm]               = useState(EMPTY_FORM);
  const [tableSearch, setTableSearch] = useState("");
  const [viewPacker, setViewPacker]   = useState(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    dispatch(fetchCratePackers());
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => { return () => { dispatch(clearCratePackerCreateState()); }; }, [dispatch]);

  /* ── Location lookup map ── */
  const locationMap = useMemo(() => {
    const m = new Map();
    (Array.isArray(locations) ? locations : []).forEach((l) => {
      const id = l?.id ?? l?.location_id;
      const name = l?.location_name ?? l?.name ?? l?.location_code;
      if (id != null) m.set(Number(id), name || `Loc ${id}`);
    });
    return m;
  }, [locations]);

  const getLocationName = (id) => (id != null ? locationMap.get(Number(id)) || `Loc ${id}` : "—");

  const validate = () => {
    const name = form.name.trim();
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!/^[A-Za-z\s.'-]+$/.test(name)) return "Name must contain only letters";

    const phone = form.phone.trim();
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";

    const email = form.email.trim();
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email address";

    if (!form.address.trim()) return "Address is required";

    if (!form.date_of_birth.trim()) return "Date of birth is required";
    if (!/^\d{2}-\d{2}-\d{4}$/.test(form.date_of_birth.trim())) return "DOB must be in DD-MM-YYYY format";

    if (!form.location_id) return "Location is required";
    if (Number.isNaN(Number(form.location_id))) return "Invalid location selected";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearCratePackerCreateState());
    const err = validate();
    if (err) return alert(err);
    const payload = {
      name:          form.name.trim(),
      phone:         form.phone.trim(),
      email:         form.email.trim(),
      address:       form.address.trim(),
      date_of_birth: toDDMMYYYY(form.date_of_birth.trim()),
      location_id:   Number(form.location_id),
    };
    const res = await dispatch(createCratePacker(payload));
    if (res.meta.requestStatus === "fulfilled") {
      setForm(EMPTY_FORM);
      dispatch(fetchCratePackers());
    }
  };

  const locationOptions = useMemo(() =>
    (Array.isArray(locations) ? locations : []).map((l) => ({
      id:    l.id,
      label: l.location_name || l.name || l.location_code || `Location #${l.id}`,
      code:  l.location_code || l.code || "",
    })), [locations]);

  const allItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

  const filteredItems = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(r =>
      [r.name, r.phone, r.email, r.code, r.address]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [allItems, tableSearch]);

  const anyError = createError || listError || locError;

  return (
    <div className="pccCratePacker min-h-full" style={{ background: "#F7F5F2" }}>
      <style>{`
        .pccCratePacker * { box-sizing: border-box; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MdOutlineInventory2 className="h-4 w-4" style={{ color: A }} />
              <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">
                Participant Registry
              </p>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Crate Packer</h1>
            <p className="mt-1 text-sm text-stone-500">Register and manage crate packer accounts</p>
          </div>
          <button
            type="button"
            onClick={() => { dispatch(fetchCratePackers()); dispatch(fetchLocations()); }}
            disabled={listLoading || locLoading}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 transition shadow-sm disabled:opacity-60"
          >
            <FiRefreshCcw className={`h-4 w-4 ${listLoading || locLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Error ── */}
        {anyError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />{anyError}
          </div>
        )}

        {/* ── Form ── */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                 style={{ background: A }}>
              <FiBox className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">Create Crate Packer</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="Full Name"    required value={form.name}    onChange={v => setField("name", capWords(v))}    placeholder="e.g. S. Karthik"  icon={FiUser} />
              <InputField label="Phone"        required value={form.phone}   onChange={v => setField("phone", v.replace(/\D/g, "").slice(0, 10))}   placeholder="10-digit mobile"   icon={FiPhone} />
              <InputField label="Email"        required value={form.email}   onChange={v => setField("email", v)}   placeholder="packer@email.com"  icon={FiMail} />

              {/* DOB with auto-dash formatting */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Date of Birth <span style={{ color: A }}>*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={form.date_of_birth}
                    onChange={(e) => setField("date_of_birth", autoFormatDOB(e.target.value))}
                    placeholder="DD-MM-YYYY"
                    maxLength={10}
                    className="w-full h-10 rounded-xl bg-stone-50 pl-10 pr-4 text-sm font-medium text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition"
                    style={{ "--tw-ring-color": A }}
                  />
                </div>
              </div>

              <InputField label="Address" required value={form.address} onChange={v => setField("address", v)} placeholder="Street, City" icon={FiHome} />
              <LocationSelect
                value={form.location_id}
                onChange={v => setField("location_id", v)}
                options={locationOptions}
                loading={locLoading}
                error={locError}
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={createLoading}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                      style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}>
                {createLoading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FiSave className="h-4 w-4" />}
                {createLoading ? "Creating…" : "Create Packer"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">

          {/* Table header bar */}
          <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                   style={{ background: A }}>
                <MdOutlineInventory2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">All Crate Packers</p>
                <p className="text-xs text-stone-500">
                  {listLoading ? "Loading…" : `${allItems.length} packer(s) registered`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus-within:ring-2 w-full sm:w-72 transition"
                 style={{ "--tw-ring-color": A }}>
              <FiSearch className="h-4 w-4 text-stone-400 shrink-0" />
              <input
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Search name, code, phone…"
                className="h-10 w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
              {tableSearch && (
                <button onClick={() => setTableSearch("")} className="text-stone-400 hover:text-stone-700 transition">
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile cards ── */}
          <div className="lg:hidden divide-y divide-stone-100">
            {listLoading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <span className="h-7 w-7 rounded-full border-[3px] border-stone-200 animate-spin"
                      style={{ borderTopColor: A }} />
                <span className="text-sm text-stone-400">Loading…</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${A}15` }}>
                  <FiBox className="h-7 w-7" style={{ color: A }} />
                </div>
                <p className="text-sm font-semibold text-stone-600">No packers found</p>
                <p className="text-xs text-stone-400">
                  {tableSearch ? "Try a different search term." : "Create a packer above."}
                </p>
              </div>
            ) : filteredItems.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between gap-3 px-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                       style={{ background: A }}>
                    {(r.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{r.name || "—"}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {r.code && (
                        <span className="font-mono text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg">
                          {r.code}
                        </span>
                      )}
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{r.phone || "—"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewPacker(r)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition active:scale-95"
                >
                  <FiEye className="h-3.5 w-3.5" /> View
                </button>
              </div>
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden lg:block">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#FAFAF9" }}>
                  {["#", "Packer", "Code", "Phone", "Location", "Status", ""].map(h => (
                    <th key={h}
                        className={`border-b border-stone-100 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase ${h === "" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="h-7 w-7 rounded-full border-[3px] border-stone-200 animate-spin"
                              style={{ borderTopColor: A }} />
                        <span className="text-sm text-stone-400">Loading…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${A}15` }}>
                          <FiBox className="h-7 w-7" style={{ color: A }} />
                        </div>
                        <p className="text-sm font-semibold text-stone-600">No packers found</p>
                        <p className="text-xs text-stone-400">
                          {tableSearch ? "Try a different search term." : "Create a packer above."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.map((r, i) => (
                  <tr key={r.id || i}
                      className="group hover:bg-amber-50/30 transition-colors"
                      style={i % 2 === 1 ? { background: "#FAFAF9" } : {}}>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle text-xs text-stone-400 font-mono w-10">
                      {i + 1}
                    </td>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                             style={{ background: A }}>
                          {(r.name || "?")[0].toUpperCase()}
                        </div>
                        <p className="font-semibold text-stone-800 truncate max-w-[140px]">{r.name || "—"}</p>
                      </div>
                    </td>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle whitespace-nowrap">
                      {r.code
                        ? <span className="font-mono text-xs bg-stone-100 px-2.5 py-1 rounded-lg text-stone-600 ring-1 ring-stone-200">{r.code}</span>
                        : <span className="text-stone-300 text-xs">—</span>}
                    </td>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-stone-700 text-sm">
                        <FiPhone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        {r.phone || "—"}
                      </span>
                    </td>

                    {/* Location — shows name instead of ID */}
                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold"
                            style={{ background: `${A}15`, color: A }}>
                        <FiMapPin className="h-3.5 w-3.5" />
                        {getLocationName(r.location_id)}
                      </span>
                    </td>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="border-b border-stone-100 px-4 py-3.5 align-middle text-right">
                      <button
                        onClick={() => setViewPacker(r)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition active:scale-95"
                      >
                        <FiEye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/60 px-5 py-3">
              <p className="text-xs text-stone-500">
                Showing <strong className="text-stone-800">{filteredItems.length}</strong> of{" "}
                <strong className="text-stone-800">{allItems.length}</strong> packer(s)
              </p>
              {tableSearch && (
                <button onClick={() => setTableSearch("")}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition">
                  Clear search ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail modal ── */}
      <PackerDetailModal
        packer={viewPacker}
        locationName={viewPacker ? getLocationName(viewPacker.location_id) : null}
        onClose={() => setViewPacker(null)}
      />
    </div>
  );
}