import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiUser, FiPhone, FiMail, FiSearch, FiCheck, FiX,
  FiAlertCircle, FiLoader, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiEye, FiEdit2,
  FiToggleLeft, FiToggleRight, FiFilter, FiSlash,
} from "react-icons/fi";
import { MdSupervisorAccount } from "react-icons/md";

import { fetchCCOperators } from "../../../redux/action/collectionCentreOperatorActions";
import {
  selectCCList, selectCCListLoading, selectCCListError,
  selectCCCurrentPage, selectCCPageSize, selectCCTotalCount,
  setCCPage,
} from "../../../redux/reducer/ccOperatorSlice";
import { collectionCentreOperatorService } from "../../../redux/services/collectionCentreOperatorService";

/* ─── Theme ──────────────────────────────────────────────── */
const T = {
  accent:        "#D97706",
  accentLight:   "#FEF3C7",
  accentRing:    "#FCD34D",
  pageBg:        "#FAFAF9",
  cardBg:        "#FFFFFF",
  border:        "#E7E5E4",
  textPrimary:   "#1C1917",
  textSecondary: "#57534E",
  textMuted:     "#A8A29E",
  errorBg:       "#FFF1F2",
  errorBorder:   "#FECDD3",
  errorText:     "#BE123C",
  successBg:     "#F0FDF4",
  successText:   "#15803D",
};

/* ─── Atoms ──────────────────────────────────────────────── */
function StatusBadge({ value }) {
  const active = value === true || value === "true" || value === 1;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={active
        ? { background: "#DCFCE7", color: "#15803D" }
        : { background: "#F5F5F4", color: "#78716C" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#16A34A" : "#A8A29E" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: T.textMuted }}>{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : "font-medium"}`} style={{ color: T.textPrimary }}>
        {value || <span style={{ color: T.textMuted }}>—</span>}
      </p>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewModal({ operator, onClose, onEdit }) {
  if (!operator) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: T.cardBg }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: T.border }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: T.accent }}>
            <FiUser className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: T.textPrimary }}>{operator.full_name}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: T.textMuted }}>{operator.user_id}</p>
          </div>
          <StatusBadge value={operator.is_active} />
          <button onClick={onClose} className="ml-2 rounded-lg p-1.5 hover:bg-stone-100 transition" style={{ color: T.textMuted }}>
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 grid grid-cols-2 gap-4">
          <DetailRow label="User ID"     value={operator.user_id}   mono />
          <DetailRow label="Full Name"   value={operator.full_name} />
          <DetailRow label="Mobile"      value={operator.mobile}    mono />
          <DetailRow label="Email"       value={operator.email} />
          <DetailRow label="Role"        value={operator.role?.replace(/_/g, " ")} />
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: T.textMuted }}>Status</p>
            <StatusBadge value={operator.is_active} />
          </div>
          <div className="col-span-2 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: T.textMuted }}>Created At</p>
            <p className="text-sm font-medium" style={{ color: T.textPrimary }}>
              {operator.created_at ? new Date(operator.created_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: T.border, background: "#FAFAF9" }}>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold border transition hover:bg-stone-50"
            style={{ color: T.textSecondary, borderColor: T.border }}
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(operator); }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
            style={{ background: T.accent }}
          >
            <FiEdit2 className="h-3.5 w-3.5" /> Edit Status
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit (Status) Modal ────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: "active",    label: "Active",    desc: "Operator can log in and perform actions", color: "#15803D", bg: "#F0FDF4" },
  { value: "inactive",  label: "Inactive",  desc: "Operator cannot log in",                  color: "#78716C", bg: "#F5F5F4" },
  { value: "suspended", label: "Suspended", desc: "Account is temporarily suspended",        color: "#BE123C", bg: "#FFF1F2" },
];

function EditStatusModal({ operator, onClose, onSaved }) {
  const [selected, setSelected] = useState(operator?.is_active ? "active" : "inactive");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  async function handleSave() {
    setLoading(true); setError(null);
    try {
      await collectionCentreOperatorService.setStatus(operator.user_id, selected);
      onSaved(operator.user_id, selected);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update status");
      setLoading(false);
    }
  }

  if (!operator) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: T.cardBg }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: T.border }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: T.accent }}>
            <FiEdit2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: T.textPrimary }}>Update Status</p>
            <p className="text-xs" style={{ color: T.textMuted }}>{operator.full_name} · {operator.user_id}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-stone-100 transition" style={{ color: T.textMuted }}>
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Status options */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <p className="text-xs font-semibold mb-1" style={{ color: T.textSecondary }}>Select new status</p>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition border"
              style={{
                borderColor: selected === opt.value ? T.accentRing : T.border,
                background:  selected === opt.value ? T.accentLight : "#FAFAF9",
              }}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: opt.bg, color: opt.color }}
              >
                {opt.value === "active"    && <FiToggleRight className="h-4 w-4" />}
                {opt.value === "inactive"  && <FiToggleLeft  className="h-4 w-4" />}
                {opt.value === "suspended" && <FiSlash       className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{opt.label}</p>
                <p className="text-xs" style={{ color: T.textMuted }}>{opt.desc}</p>
              </div>
              {selected === opt.value && <FiCheck className="h-4 w-4 shrink-0" style={{ color: T.accent }} />}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 border text-sm"
            style={{ background: T.errorBg, borderColor: T.errorBorder, color: T.errorText }}>
            <FiAlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: T.border, background: "#FAFAF9" }}>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold border transition hover:bg-stone-50"
            style={{ color: T.textSecondary, borderColor: T.border }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: T.accent }}
          >
            {loading ? <><FiLoader className="h-4 w-4 animate-spin" /> Saving…</> : <><FiCheck className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
// role: "COLLECTION_CENTRE_OPERATOR" | "TRANSPORT_OPERATOR"
export default function CollectionCentreOperatorList({ role = "COLLECTION_CENTRE_OPERATOR" }) {
  const dispatch = useDispatch();

  // Redux state
  const list        = useSelector(selectCCList);
  const loading     = useSelector(selectCCListLoading);
  const error       = useSelector(selectCCListError);
  const currentPage = useSelector(selectCCCurrentPage);
  const pageSize    = useSelector(selectCCPageSize);
  const totalCount  = useSelector(selectCCTotalCount);

  // Local UI state
  const [search,       setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState("");   // "" | "true" | "false"
  const [viewOp,       setViewOp]       = useState(null);
  const [editOp,       setEditOp]       = useState(null);
  // optimistic status updates (user_id -> is_active bool)
  const [statusPatch,  setStatusPatch]  = useState({});

  useEffect(() => {
    const params = { page: currentPage, page_size: pageSize, role };
    if (filterActive !== "") params.is_active = filterActive;
    dispatch(fetchCCOperators(params));
  }, [dispatch, currentPage, pageSize, filterActive, role]);

  function handleFilterChange(val) {
    setFilterActive(val);
    dispatch(setCCPage(1));
  }

  function handleStatusSaved(userId, newStatus) {
    // optimistic patch so the row updates instantly without waiting for a re-fetch
    setStatusPatch(prev => ({ ...prev, [userId]: newStatus === "active" }));
  }

  // Merge optimistic patches into the list
  const patchedList = list.map(op =>
    op.user_id in statusPatch
      ? { ...op, is_active: statusPatch[op.user_id] }
      : op
  );

  const filtered = search
    ? patchedList.filter(r =>
        [r.full_name, r.user_id, r.mobile, r.email, r.role, r.designation]
          .join(" ").toLowerCase().includes(search.toLowerCase())
      )
    : patchedList;

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  return (
    <div style={{ background: T.pageBg }} className="min-h-full">
      {/* Modals */}
      {viewOp && (
        <ViewModal
          operator={viewOp}
          onClose={() => setViewOp(null)}
          onEdit={op => setEditOp(op)}
        />
      )}
      {editOp && (
        <EditStatusModal
          operator={editOp}
          onClose={() => setEditOp(null)}
          onSaved={handleStatusSaved}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdSupervisorAccount className="h-4 w-4" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textMuted }}>
              Participant Registry
            </p>
          </div>
          <h1 className="text-xl font-bold" style={{ color: T.textPrimary }}>Collection Centre Operators</h1>
          <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
            View and manage operators assigned to collection centres
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: T.cardBg, borderColor: T.border }}>

          {/* Card header — search + filters */}
          <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: T.accent }}>
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>All Operators</p>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  {loading ? "Loading…" : `${totalCount ?? filtered.length} operator(s)`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Active filter */}
              <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1">
                <FiFilter className="h-3.5 w-3.5 ml-1.5" style={{ color: T.textMuted }} />
                {[["", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setFilterActive(val); setPage(1); }}
                    className="rounded-lg px-3 py-1 text-xs font-semibold transition"
                    style={filterActive === val
                      ? { background: T.accent, color: "#fff" }
                      : { color: T.textSecondary }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: T.textMuted }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, ID, email…"
                  className="h-10 w-full rounded-xl bg-stone-100 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-200 border border-transparent"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={() => dispatch(fetchCCOperators({ page: currentPage, page_size: pageSize, role, ...(filterActive !== "" && { is_active: filterActive }) }))}
                disabled={loading}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border transition hover:bg-stone-50 disabled:opacity-40"
                style={{ borderColor: T.border, color: T.textMuted }}
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ background: T.errorBg, borderColor: T.errorBorder }}>
              <FiAlertCircle className="h-4 w-4 shrink-0" style={{ color: T.errorText }} />
              <p className="text-sm" style={{ color: T.errorText }}>{error}</p>
              <button className="ml-auto" onClick={() => dispatch(fetchCCOperators({ page: currentPage, page_size: pageSize, role }))}>
                <FiRefreshCw className="h-4 w-4" style={{ color: T.errorText }} />
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: T.textMuted }}>
              <FiLoader className="h-4 w-4 animate-spin" /> Loading operators…
            </div>
          )}

          {/* ── Mobile cards ── */}
          {!loading && (
            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {filtered.length === 0
                ? <p className="text-center py-10 text-sm" style={{ color: T.textMuted }}>No operators found.</p>
                : filtered.map(r => (
                  <div key={r.user_id} className="rounded-2xl overflow-hidden ring-1 ring-stone-200">
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>{r.full_name}</p>
                        <p className="font-mono text-xs mt-0.5" style={{ color: T.textMuted }}>{r.user_id}</p>
                      </div>
                      <StatusBadge value={r.is_active} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-4 py-3">
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Mobile</p>
                        <p className="text-sm mt-0.5 font-mono" style={{ color: T.textSecondary }}>{r.mobile}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Email</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: T.textSecondary }}>{r.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <button
                        onClick={() => setViewOp(r)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition hover:bg-stone-50"
                        style={{ color: T.textSecondary, borderColor: T.border }}
                      >
                        <FiEye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => setEditOp(r)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition"
                        style={{ background: T.accent }}
                      >
                        <FiEdit2 className="h-3.5 w-3.5" /> Edit Status
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Desktop table ── */}
          {!loading && filtered.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    {["User ID", "Full Name", "Mobile", "Email", "Role", "Status", "Actions"].map(h => (
                      <th
                        key={h}
                        className="border-b px-4 py-3 text-left text-[10px] font-bold tracking-[0.16em] uppercase"
                        style={{ borderColor: T.border, color: T.textMuted }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.user_id} className="hover:bg-stone-50/60 transition">
                      <td className="border-b px-4 py-3.5 font-mono text-xs" style={{ borderColor: T.border, color: T.textMuted }}>
                        {r.user_id}
                      </td>
                      <td className="border-b px-4 py-3.5 font-semibold" style={{ borderColor: T.border, color: T.textPrimary }}>
                        {r.full_name}
                      </td>
                      <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}>
                        <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: T.textSecondary }}>
                          <FiPhone className="h-3.5 w-3.5" style={{ color: T.textMuted }} />{r.mobile}
                        </span>
                      </td>
                      <td className="border-b px-4 py-3.5 text-xs" style={{ borderColor: T.border, color: T.textSecondary }}>
                        <span className="flex items-center gap-1.5">
                          <FiMail className="h-3.5 w-3.5" style={{ color: T.textMuted }} />{r.email}
                        </span>
                      </td>
                      <td className="border-b px-4 py-3.5 text-xs" style={{ borderColor: T.border }}>
                        <span className="rounded-lg bg-stone-100 px-2 py-0.5 font-medium text-xs" style={{ color: T.textSecondary }}>
                          {r.role?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}>
                        <StatusBadge value={r.is_active} />
                      </td>
                      <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewOp(r)}
                            title="View details"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition hover:bg-stone-50"
                            style={{ color: T.textSecondary, borderColor: T.border }}
                          >
                            <FiEye className="h-3.5 w-3.5" /> View
                          </button>
                          <button
                            onClick={() => setEditOp(r)}
                            title="Edit status"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition"
                            style={{ background: T.accent }}
                          >
                            <FiEdit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages && totalPages > 1 ? (
                <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.border }}>
                  <p className="text-xs" style={{ color: T.textMuted }}>
                    Page <strong style={{ color: T.textPrimary }}>{currentPage}</strong> of {totalPages}
                    {totalCount && <> &nbsp;·&nbsp; {totalCount} total</>}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => dispatch(setCCPage(currentPage - 1))}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: T.border, color: T.textSecondary }}
                    >
                      <FiChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => dispatch(setCCPage(currentPage + 1))}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: T.border, color: T.textSecondary }}
                    >
                      Next <FiChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="px-5 py-3 text-xs" style={{ color: T.textMuted }}>
                  Showing <strong style={{ color: T.textPrimary }}>{filtered.length}</strong> operator(s)
                </p>
              )}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <p className="hidden lg:block text-center py-12 text-sm" style={{ color: T.textMuted }}>No operators found.</p>
          )}

        </div>
      </div>
    </div>
  );
}