// CrateListing.jsx — Admin Crate Listing Page (Tailwind + Lucide Icons)
// Theme: RootVerse PCC Panel — orange/amber

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package, RefreshCw, Eye, Pencil, X, Loader2, AlertTriangle,
  Inbox, Truck, Clock, Thermometer, ClipboardList, FileText,
  ChevronLeft, ChevronRight, Search, Filter, ArrowRight, Boxes,
} from "lucide-react";
import {
  fetchCratesAction,
  fetchCrateDetailAction,
  overrideCrateStatusAction,
} from "../../../redux/action/crateListingActions";
import {
  setFilters, setPage, clearSelectedCrate, clearOverrideState,
  resetFilters, selectCrates, selectCrateListLoading,
  selectCrateListError, selectCrateFilters, selectSelectedCrate,
  selectCrateDetailLoading, selectOverrideLoading,
  selectOverrideError, selectOverrideSuccess,
} from "../../../redux/reducer/crateListingSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const CRATE_STATUSES = [
  "RECEIVED_AT_COLLECTION_CENTRE",
  "SCHEDULED_FOR_DISPATCH",
  "IN_TRANSIT",
  "DELIVERED",
  "HOLD",
  "CANCELLED",
];

const REASON_CODES = [
  "QUALITY_ISSUE", "DAMAGED", "LOST",
  "WRONG_DESTINATION", "TEMPERATURE_BREACH", "OTHER",
];

const STATUS_CONFIG = {
  RECEIVED_AT_COLLECTION_CENTRE: { label: "At Centre",  color: "#2563EB", bg: "#EFF6FF", ring: "#BFDBFE" },
  SCHEDULED_FOR_DISPATCH:        { label: "Scheduled",  color: "#7C3AED", bg: "#F5F3FF", ring: "#DDD6FE" },
  IN_TRANSIT:                    { label: "In Transit", color: "#D97706", bg: "#FFFBEB", ring: "#FDE68A" },
  DELIVERED:                     { label: "Delivered",  color: "#059669", bg: "#ECFDF5", ring: "#A7F3D0" },
  HOLD:                          { label: "Hold",       color: "#DC2626", bg: "#FEF2F2", ring: "#FECACA" },
  CANCELLED:                     { label: "Cancelled",  color: "#6B7280", bg: "#F9FAFB", ring: "#E5E7EB" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val, fallback = "—") =>
  val !== null && val !== undefined && val !== "" ? val : fallback;

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtShortDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6B7280", bg: "#F9FAFB", ring: "#E5E7EB" };
  return (
    <span
      style={{ color: cfg.color, background: cfg.bg, border: `1.5px solid ${cfg.ring}` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide whitespace-nowrap"
    >
      <span style={{ background: cfg.color }} className="w-1.5 h-1.5 rounded-full shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-orange-600" />
        </div>
        <span className="font-bold text-[12px] text-gray-500 uppercase tracking-[0.1em]">
          {title}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

// ─── InfoGrid ─────────────────────────────────────────────────────────────────

function InfoGrid({ rows }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {rows.map(({ label, value, highlight }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className={`text-[13px] leading-snug ${highlight ? "font-bold text-orange-600" : "font-semibold text-gray-800"}`}>
            {value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ events }) {
  if (!events?.length)
    return (
      <div className="flex items-center gap-2 py-4 text-gray-400">
        <Inbox size={16} />
        <span className="text-[13px]">No status history available.</span>
      </div>
    );

  return (
    <div className="relative pl-7">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
      {events.map((ev, i) => {
        const isLast = i === events.length - 1;
        return (
          <div key={ev.event_id || i} className={`relative ${isLast ? "" : "mb-4"}`}>
            <div
              className={`absolute -left-7 top-2 w-3 h-3 rounded-full border-2 z-10 ${
                isLast
                  ? "bg-orange-500 border-white shadow-sm shadow-orange-200"
                  : "bg-white border-gray-300"
              }`}
            />
            <div className={`rounded-xl p-3.5 border ${isLast ? "border-orange-200 bg-orange-50/40" : "border-gray-100 bg-gray-50/60"}`}>
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ev.from_status && (
                    <>
                      <StatusBadge status={ev.from_status} />
                      <ArrowRight size={12} className="text-gray-400 shrink-0" />
                    </>
                  )}
                  <StatusBadge status={ev.to_status} />
                </div>
                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                  {fmtDate(ev.event_at_utc)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="font-semibold text-gray-600">{ev.actor_role?.replace(/_/g, " ")}</span>
                <span className="text-gray-300">·</span>
                <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{ev.actor_id}</span>
                {ev.remarks && (
                  <span className="ml-1 text-orange-600 italic">"{ev.remarks}"</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TempLogs ─────────────────────────────────────────────────────────────────

function TempLogs({ logs }) {
  if (!logs?.length)
    return (
      <div className="flex items-center gap-2 py-4 text-gray-400">
        <Thermometer size={16} />
        <span className="text-[13px]">No temperature logs recorded.</span>
      </div>
    );

  return (
    <div className="flex flex-col gap-2.5">
      {logs.map((log) => {
        const isHigh = parseFloat(log.temperature_value) > 8;
        return (
          <div
            key={log.id}
            className={`flex justify-between items-center rounded-xl p-3.5 border flex-wrap gap-3 ${
              isHigh ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isHigh ? "bg-red-100" : "bg-emerald-100"}`}>
                <Thermometer size={18} className={isHigh ? "text-red-500" : "text-emerald-600"} />
              </div>
              <div>
                <div className={`font-extrabold text-[18px] leading-none ${isHigh ? "text-red-600" : "text-emerald-600"}`}>
                  {log.temperature_value}°C
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {log.actor_role?.replace(/_/g, " ")}
                  <span className="mx-1 text-gray-300">·</span>
                  <span className="font-mono">{log.actor_id}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-gray-500 font-medium">{fmtDate(log.recorded_at_utc)}</div>
              {log.notes && (
                <div className="text-[11px] text-orange-600 mt-0.5 italic">{log.notes}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ onClose }) {
  const crate   = useSelector(selectSelectedCrate);
  const loading = useSelector(selectCrateDetailLoading);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[740px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Package size={20} className="text-orange-600" />
              </div>
              <div>
                <h2 className="m-0 font-extrabold text-[17px] text-gray-900 leading-tight">
                  {loading ? "Loading…" : (crate?.code || "Crate Detail")}
                </h2>
                {crate && !loading && (
                  <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                    ID #{crate.id} &nbsp;·&nbsp; Updated {fmtShortDate(crate.updated_at)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={32} className="animate-spin text-orange-400" />
              <p className="text-sm font-medium">Loading crate detail…</p>
            </div>
          ) : !crate ? (
            <div className="flex items-center gap-2 text-red-500 py-8">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">Failed to load crate detail.</span>
            </div>
          ) : (
            <>
              {/* Status pill + quick stats */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <StatusBadge status={crate.custody_status} />
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-[12px] text-gray-500 font-medium">
                  {crate.type && <><strong className="text-gray-700">{crate.type}</strong> &nbsp;·&nbsp;</>}
                  Grade <strong className="text-orange-600">{crate.grade || "—"}</strong>
                  {crate.total_weight && <>&nbsp;·&nbsp; <strong className="text-gray-700">{crate.total_weight} kg</strong></>}
                </span>
              </div>

              <Section title="Overview" icon={ClipboardList}>
                <InfoGrid
                  rows={[
                    { label: "Crate Code",            value: fmt(crate.code),                                             highlight: true },
                    { label: "Type",                  value: fmt(crate.type) },
                    { label: "Grade",                 value: fmt(crate.grade) },
                    { label: "Total Weight",          value: crate.total_weight ? `${crate.total_weight} kg` : "—" },
                    { label: "Production Category",   value: fmt(crate.production_category)?.replace(/_/g, " ") },
                    { label: "Received Centre",       value: fmt(crate.received_centre_id) },
                    { label: "Custodian Role",        value: fmt(crate.current_custodian_role)?.replace(/_/g, " ") },
                    { label: "Custodian ID",          value: fmt(crate.current_custodian_id) },
                  ]}
                />
              </Section>

              {crate.dispatch_assignment && (
                <Section title="Dispatch Assignment" icon={Truck}>
                  <InfoGrid
                    rows={[
                      { label: "Destination",        value: fmt(crate.dispatch_assignment.destination_name), highlight: true },
                      { label: "Transport Operator", value: fmt(crate.dispatch_assignment.transport_operator_id) },
                      { label: "Driver",             value: fmt(crate.dispatch_assignment.driver_name) },
                      { label: "Vehicle No",         value: fmt(crate.dispatch_assignment.vehicle_no) },
                      { label: "Centre",             value: fmt(crate.dispatch_assignment.centre_id) },
                      { label: "Scheduled",          value: fmtDate(crate.dispatch_assignment.scheduled_time_utc) },
                      { label: "Picked Up",          value: fmtDate(crate.dispatch_assignment.picked_up_at_utc) },
                      { label: "Delivered",          value: fmtDate(crate.dispatch_assignment.delivered_at_utc) },
                    ]}
                  />
                  {crate.dispatch_assignment.notes && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <FileText size={14} className="text-amber-600 mt-0.5 shrink-0" />
                      <span className="text-[13px] text-amber-800">{crate.dispatch_assignment.notes}</span>
                    </div>
                  )}
                </Section>
              )}

              <Section title="Status History" icon={Clock}>
                <Timeline events={crate.status_history} />
              </Section>

              <Section title="Temperature Logs" icon={Thermometer}>
                <TempLogs logs={crate.temperature_logs} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ crate, onClose, onSuccess }) {
  const dispatch        = useDispatch();
  const overrideLoading = useSelector(selectOverrideLoading);
  const overrideError   = useSelector(selectOverrideError);
  const overrideSuccess = useSelector(selectOverrideSuccess);

  const adminId = parseInt(localStorage.getItem("admin_id") || "1");

  const [form, setForm] = useState({
    new_status:  crate?.custody_status || "",
    reason_code: "",
    reason_text: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (overrideSuccess) {
      dispatch(clearOverrideState());
      onSuccess?.();
      onClose();
    }
  }, [overrideSuccess]);

  const validate = () => {
    const e = {};
    if (!form.new_status)         e.new_status  = "Status is required";
    if (!form.reason_code)        e.reason_code = "Reason code is required";
    if (!form.reason_text.trim()) e.reason_text = "Reason text is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    dispatch(overrideCrateStatusAction({ crateId: crate.id, payload: { ...form, admin_id: adminId } }));
  };

  const inputCls = (hasErr) =>
    `w-full px-3.5 py-2.5 rounded-lg border-[1.5px] text-[13px] text-gray-900 outline-none bg-white
    focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 transition-all
    ${hasErr ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`;

  const labelCls = "block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-[0.07em]";
  const errCls   = "text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f97316, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="flex justify-between items-start relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pencil size={15} className="text-orange-600" />
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Status Override</span>
              </div>
              <h2 className="m-0 font-extrabold text-[18px] text-gray-900 leading-tight">
                {crate?.code}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] text-gray-500 font-medium">Current:</span>
                <StatusBadge status={crate?.custody_status} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-orange-200 bg-white/60 flex items-center justify-center text-orange-600 hover:bg-white cursor-pointer transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className={labelCls}>New Status *</label>
            <select
              value={form.new_status}
              onChange={(e) => setForm((f) => ({ ...f, new_status: e.target.value }))}
              className={inputCls(!!errors.new_status)}
            >
              <option value="">— Select new status —</option>
              {CRATE_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
              ))}
            </select>
            {errors.new_status && (
              <p className={errCls}><AlertTriangle size={11} />{errors.new_status}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Reason Code *</label>
            <select
              value={form.reason_code}
              onChange={(e) => setForm((f) => ({ ...f, reason_code: e.target.value }))}
              className={inputCls(!!errors.reason_code)}
            >
              <option value="">— Select reason —</option>
              {REASON_CODES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
            {errors.reason_code && (
              <p className={errCls}><AlertTriangle size={11} />{errors.reason_code}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Reason Description *</label>
            <textarea
              value={form.reason_text}
              onChange={(e) => setForm((f) => ({ ...f, reason_text: e.target.value }))}
              placeholder="Describe the reason for this status override…"
              rows={4}
              className={`${inputCls(!!errors.reason_text)} resize-y leading-relaxed`}
            />
            {errors.reason_text && (
              <p className={errCls}><AlertTriangle size={11} />{errors.reason_text}</p>
            )}
          </div>

          {overrideError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{overrideError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-[13px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={overrideLoading}
              className={`flex-1 py-2.5 rounded-xl border-none text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2
                ${overrideLoading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 cursor-pointer hover:bg-orange-600 active:scale-[0.98]"}`}
            >
              {overrideLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Saving…</>
              ) : (
                <><Pencil size={14} /> Override Status</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ filters, onChange, onReset, onRefresh }) {
  const inputCls =
    "px-3 py-2.5 rounded-lg border-[1.5px] border-gray-200 text-[13px] text-gray-700 bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all hover:border-gray-300 min-w-0 w-full";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <Filter size={13} className="text-gray-400" />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">Filter Crates</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })} className={inputCls}>
            <option value="">All Statuses</option>
            {CRATE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={inputCls}
          />

          <input
            type="text"
            value={filters.centre_id}
            onChange={(e) => onChange({ centre_id: e.target.value })}
            placeholder="Centre ID"
            className={inputCls}
          />

          <input
            type="text"
            value={filters.transport_operator_id}
            onChange={(e) => onChange({ transport_operator_id: e.target.value })}
            placeholder="Transport Op ID"
            className={inputCls}
          />

          <input
            type="text"
            value={filters.destination_name}
            onChange={(e) => onChange({ destination_name: e.target.value })}
            placeholder="Destination"
            className={inputCls}
          />

          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 py-2.5 px-3 rounded-lg border-[1.5px] border-gray-200 bg-white text-[13px] font-semibold text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onRefresh}
              className="flex-1 py-2.5 px-3 rounded-lg border-none bg-orange-500 text-[13px] font-bold text-white cursor-pointer hover:bg-orange-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CrateListing() {
  const dispatch = useDispatch();
  const crates   = useSelector(selectCrates);
  const loading  = useSelector(selectCrateListLoading);
  const error    = useSelector(selectCrateListError);
  const filters  = useSelector(selectCrateFilters);

  const [viewOpen,  setViewOpen]  = useState(false);
  const [editCrate, setEditCrate] = useState(null);
  const [search,    setSearch]    = useState("");

  const loadCrates = useCallback(() => {
    dispatch(fetchCratesAction(filters));
  }, [dispatch, filters]);

  useEffect(() => { loadCrates(); }, []);

  const handleFilterChange  = (patch) => dispatch(setFilters(patch));
  const handleReset         = () => { dispatch(resetFilters()); dispatch(fetchCratesAction({})); };
  const handleApply         = () => dispatch(fetchCratesAction(filters));
  const handleView          = (id) => { dispatch(fetchCrateDetailAction(id)); setViewOpen(true); };
  const handleCloseView     = () => { setViewOpen(false); dispatch(clearSelectedCrate()); };
  const handleEdit          = (crate) => setEditCrate(crate);
  const handleCloseEdit     = () => setEditCrate(null);
  const handleEditSuccess   = () => loadCrates();
  const handlePageChange    = (p) => {
    dispatch(setPage(p));
    dispatch(fetchCratesAction({ ...filters, page: p }));
  };

  const filtered = search.trim()
    ? crates.filter((c) =>
        [c.code, c.current_custodian_id, c.received_centre_id, c.custody_status]
          .join(" ").toLowerCase().includes(search.toLowerCase())
      )
    : crates;


  return (
    <>
      <div className="min-h-screen bg-gray-50/80 font-sans">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Boxes size={22} className="text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.12em]">
                    Monitoring
                  </span>
                </div>
                <h1 className="m-0 text-[22px] font-extrabold text-gray-900 leading-tight tracking-tight">
                  Crate Listing
                </h1>
                <p className="m-0 text-[13px] text-gray-400 font-medium mt-0.5">
                  Track and manage all crates in the supply chain
                </p>
              </div>
            </div>
            <button
              onClick={loadCrates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-[13px] font-bold text-gray-600 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors active:scale-[0.97]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            onRefresh={handleApply}
          />

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-orange-600" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-gray-900">All Crates</div>
                  <div className="text-[12px] text-gray-400 font-medium mt-0.5">
                    {loading
                      ? "Loading…"
                      : <><strong className="text-gray-600">{filtered.length}</strong> crate(s) found</>
                    }
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code, custodian, centre…"
                  className="pl-9 pr-4 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-[13px] text-gray-700 outline-none w-full sm:w-[260px] bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all hover:border-gray-300"
                />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 size={32} className="animate-spin text-orange-400" />
                <p className="text-sm font-medium">Loading crates…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Inbox size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium">No crates found</p>
                <p className="text-[12px] text-gray-300">Try adjusting your filters</p>
              </div>
            )}

            {/* Data */}
            {!loading && !error && filtered.length > 0 && (
              <>
                {/* ── Desktop Table (md+) — 7 cols, no scroll ── */}
                <div className="hidden md:block">
                  <table className="w-full border-collapse table-fixed">
                    <colgroup>
                      <col className="w-10" />
                      <col className="w-[23%]" />
                      <col className="w-[11%]" />
                      <col className="w-[15%]" />
                      <col className="w-[21%]" />
                      <col className="w-[13%]" />
                      <col className="w-[17%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        {["#", "Crate", "Type / Grade", "Status", "Custodian / Centre", "Updated", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((crate, i) => (
                        <tr key={crate.id} className="hover:bg-orange-50/20 transition-colors">
                          {/* # */}
                          <td className="px-3 py-3 text-[12px] text-gray-400 font-semibold">
                            {(filters.page - 1) * filters.page_size + i + 1}
                          </td>

                          {/* Crate code + weight + production */}
                          <td className="px-3 py-3">
                            <div className="font-mono font-extrabold text-orange-600 text-[12px] tracking-wide truncate">
                              {crate.code}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {crate.total_weight && (
                                <span className="text-[10px] text-gray-500 font-semibold">{crate.total_weight} kg</span>
                              )}
                              {crate.production_category && (
                                <span className="text-[10px] text-gray-400 truncate">
                                  {crate.production_category.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Type + Grade stacked */}
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 text-[10px] font-bold w-fit">
                                {fmt(crate.type)}
                              </span>
                              <span className="bg-orange-100 text-orange-700 rounded px-1.5 py-0.5 text-[10px] font-extrabold w-fit">
                                {fmt(crate.grade)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <StatusBadge status={crate.custody_status} />
                          </td>

                          {/* Custodian + Centre stacked */}
                          <td className="px-3 py-3">
                            <div className="font-mono text-[11px] text-gray-700 font-semibold truncate">
                              {fmt(crate.current_custodian_id)}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400 mt-0.5 truncate">
                              {fmt(crate.received_centre_id)}
                            </div>
                          </td>

                          {/* Updated */}
                          <td className="px-3 py-3 text-[11px] text-gray-400 font-medium">
                            {fmtShortDate(crate.updated_at)}
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleView(crate.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold cursor-pointer hover:bg-blue-100 border border-blue-100 transition-colors"
                              >
                                <Eye size={11} /> View
                              </button>
                              <button
                                onClick={() => handleEdit(crate)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-[11px] font-bold cursor-pointer hover:bg-orange-100 border border-orange-100 transition-colors"
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile Cards (below md) ── */}
                <div className="flex flex-col gap-3 p-4 md:hidden">
                  {filtered.map((crate) => (
                    <div
                      key={crate.id}
                      className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm"
                    >
                      {/* Card top */}
                      <div className="flex justify-between items-start px-4 pt-4 pb-3 border-b border-gray-50">
                        <div>
                          <div className="font-mono font-extrabold text-[14px] text-orange-600 tracking-wide">
                            {crate.code}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-medium">ID #{crate.id}</div>
                        </div>
                        <StatusBadge status={crate.custody_status} />
                      </div>
                      {/* Card body */}
                      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {[
                          { label: "Type",      value: crate.type },
                          { label: "Grade",     value: crate.grade },
                          { label: "Weight",    value: crate.total_weight ? `${crate.total_weight} kg` : "—" },
                          { label: "Centre",    value: crate.received_centre_id },
                          { label: "Custodian", value: crate.current_custodian_id },
                          { label: "Updated",   value: fmtShortDate(crate.updated_at) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</div>
                            <div className="text-[12px] text-gray-700 font-semibold mt-0.5">{fmt(value)}</div>
                          </div>
                        ))}
                      </div>
                      {/* Card actions */}
                      <div className="flex gap-2 px-4 pb-4">
                        <button
                          onClick={() => handleView(crate.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[12px] font-bold cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleEdit(crate)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 text-[12px] font-bold cursor-pointer hover:bg-orange-100 transition-colors"
                        >
                          <Pencil size={13} /> Override
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3 bg-gray-50/40">
                <span className="text-[13px] text-gray-500 font-medium">
                  Showing <strong className="text-gray-700">{filtered.length}</strong> crate(s)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors
                      ${filters.page <= 1
                        ? "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                        : "border-gray-200 text-gray-600 cursor-pointer hover:bg-white bg-white"}`}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-lg text-[13px] font-bold min-w-[36px] text-center">
                    {filters.page}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filtered.length < filters.page_size}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors
                      ${filtered.length < filters.page_size
                        ? "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                        : "border-gray-200 text-gray-600 cursor-pointer hover:bg-white bg-white"}`}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewOpen  && <ViewModal onClose={handleCloseView} />}
      {editCrate && <EditModal crate={editCrate} onClose={handleCloseEdit} onSuccess={handleEditSuccess} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
      `}</style>
    </>
  );
}
