// src/modules/admin/pages/participant-registry/TransportOperatorList.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSearch, FiRefreshCw, FiLoader, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiTruck, FiPhone,
  FiEye, FiMail, FiUser, FiX, FiCalendar, FiToggleLeft, FiToggleRight,
} from "react-icons/fi";

import { fetchTransportOperators, updateTransportOperatorStatus } from "../../../../src/redux/action/transportOperatorActions";
import {
  setTransportPage, clearStatusError,
  selectTransportList, selectTransportListLoading, selectTransportListError,
  selectTransportCurrentPage, selectTransportPageSize, selectTransportTotalCount,
  selectStatusUpdatingId, selectStatusError,
} from "../../../../src/redux/reducer/transportOperatorSlice";

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  accent:        "#D97706",
  accentLight:   "#FEF3C7",
  pageBg:        "#FAFAF9",
  cardBg:        "#FFFFFF",
  border:        "#E7E5E4",
  textPrimary:   "#1C1917",
  textSecondary: "#57534E",
  textMuted:     "#A8A29E",
  errorBg:       "#FFF1F2",
  errorBorder:   "#FECDD3",
  errorText:     "#BE123C",
  activeBg:      "#DCFCE7",
  activeText:    "#15803D",
  activeDot:     "#16A34A",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isActive = r => r.is_active === true || r.is_active === 1;

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ─── Atoms ────────────────────────────────────────────────────────────────────

function StatusBadge({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={active ? { background: T.activeBg, color: T.activeText } : { background:"#F5F5F4", color:"#78716C" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? T.activeDot : "#A8A29E" }}/>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: T.border }}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "#F5F5F4" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: T.textMuted }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: T.textPrimary }}>{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Status Toggle ────────────────────────────────────────────────────────────

function StatusToggle({ operator, updatingId, onToggle }) {
  const busy    = updatingId === operator.user_id;
  const active  = isActive(operator);
  const next    = active ? "inactive" : "active";

  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(operator.user_id, next); }}
      disabled={busy}
      title={active ? "Deactivate" : "Activate"}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        border:     `1px solid ${active ? "#FCA5A5" : "#BBF7D0"}`,
        background: active ? "#FFF1F2" : "#F0FDF4",
        color:      active ? "#BE123C" : "#15803D",
      }}
    >
      {busy
        ? <FiLoader className="h-3.5 w-3.5 animate-spin" />
        : active
          ? <FiToggleRight className="h-3.5 w-3.5" />
          : <FiToggleLeft  className="h-3.5 w-3.5" />
      }
      {active ? "Deactivate" : "Activate"}
    </button>
  );
}

// ─── View Drawer ──────────────────────────────────────────────────────────────

function ViewDrawer({ operator, updatingId, onClose, onToggle }) {
  if (!operator) return null;
  const active = isActive(operator);
  const next   = active ? "inactive" : "active";
  const busy   = updatingId === operator.user_id;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm shadow-2xl"
        style={{ background: T.cardBg, borderLeft: `1px solid ${T.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
              style={{ background: T.accent }}>
              <FiTruck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: T.textPrimary }}>Operator Details</p>
              <p className="text-xs font-mono" style={{ color: T.textMuted }}>{operator.user_id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="rounded-lg p-1.5 transition hover:bg-stone-100">
            <FiX className="h-4 w-4" style={{ color: T.textMuted }} />
          </button>
        </div>

        {/* Status banner */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b"
          style={{ borderColor: T.border, background: active ? T.activeBg : "#F5F5F4" }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: active ? T.activeText : T.textMuted }}>
              {active ? "Active Operator" : "Inactive Operator"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: active ? "#166534" : T.textMuted }}>
              {active ? "Can log in and perform transport actions" : "Blocked from all platform actions"}
            </p>
          </div>
          <StatusBadge active={active} />
        </div>

        {/* Detail rows */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <DetailRow icon={FiUser}     label="Full Name"    value={operator.full_name} />
          <DetailRow icon={FiPhone}    label="Mobile"       value={operator.mobile} />
          <DetailRow icon={FiMail}     label="Email"        value={operator.email} />
          <DetailRow icon={FiTruck}    label="Role"         value="Transport Operator" />
          <DetailRow icon={FiCalendar} label="Registered"   value={fmtDate(operator.created_at)} />
        </div>

        {/* Footer actions */}
        <div className="border-t px-5 py-4 flex flex-col gap-2" style={{ borderColor: T.border }}>
          {/* Status toggle */}
          <button
            disabled={busy}
            onClick={() => onToggle(operator.user_id, next)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: active ? T.errorBg  : "#F0FDF4",
              border:     `1px solid ${active ? "#FECDD3" : "#BBF7D0"}`,
              color:      active ? T.errorText : "#15803D",
            }}
          >
            {busy
              ? <><FiLoader className="h-4 w-4 animate-spin" /> Updating…</>
              : active
                ? <><FiToggleRight className="h-4 w-4" /> Deactivate Operator</>
                : <><FiToggleLeft  className="h-4 w-4" /> Activate Operator</>
            }
          </button>

          <button onClick={onClose}
            className="w-full rounded-xl px-5 py-2.5 text-sm font-semibold border transition hover:bg-stone-50"
            style={{ color: T.textSecondary, borderColor: T.border }}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function OperatorCard({ r, updatingId, onView, onToggle }) {
  const active = isActive(r);
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-stone-200">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-stone-100">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate" style={{ color: T.textPrimary }}>{r.full_name}</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: T.textMuted }}>{r.user_id}</p>
        </div>
        <StatusBadge active={active} />
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Mobile</p>
          <p className="text-sm mt-0.5 font-mono" style={{ color: T.textSecondary }}>{r.mobile}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textMuted }}>Email</p>
          <p className="text-sm mt-0.5 truncate" style={{ color: T.textSecondary }}>{r.email}</p>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => onView(r)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition hover:bg-stone-50"
          style={{ borderColor: T.border, color: T.textSecondary }}>
          <FiEye className="h-3.5 w-3.5" /> View
        </button>
        <StatusToggle operator={r} updatingId={updatingId} onToggle={onToggle} />
      </div>
    </div>
  );
}

// ─── Desktop table ────────────────────────────────────────────────────────────

const COLS = ["User ID", "Full Name", "Mobile", "Email", "Status", "Actions"];

function DesktopTable({ rows, updatingId, onView, onToggle }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            {COLS.map(h => (
              <th key={h}
                className="border-b px-4 py-3 text-left text-[10px] font-bold tracking-[0.16em] uppercase whitespace-nowrap"
                style={{ borderColor: T.border, color: T.textMuted }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.user_id}
              className="hover:bg-stone-50/60 transition cursor-pointer"
              onClick={() => onView(r)}>
              <td className="border-b px-4 py-3.5 font-mono text-xs"
                style={{ borderColor: T.border, color: T.textMuted }}>{r.user_id}</td>

              <td className="border-b px-4 py-3.5 font-semibold"
                style={{ borderColor: T.border, color: T.textPrimary }}>{r.full_name}</td>

              <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}>
                <span className="flex items-center gap-1.5" style={{ color: T.textSecondary }}>
                  <FiPhone className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                  {r.mobile}
                </span>
              </td>

              <td className="border-b px-4 py-3.5 text-xs max-w-[180px] truncate"
                style={{ borderColor: T.border, color: T.textSecondary }}>{r.email}</td>

              <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}>
                <StatusBadge active={isActive(r)} />
              </td>

              {/* Actions — stop propagation so row click doesn't also fire */}
              <td className="border-b px-4 py-3.5" style={{ borderColor: T.border }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(r)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition hover:bg-stone-100"
                    style={{ borderColor: T.border, color: T.textSecondary }}>
                    <FiEye className="h-3.5 w-3.5" /> View
                  </button>
                  <StatusToggle operator={r} updatingId={updatingId} onToggle={onToggle} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ current, total, onPrev, onNext }) {
  if (!total || total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.border }}>
      <p className="text-xs" style={{ color: T.textMuted }}>
        Page <strong style={{ color: T.textPrimary }}>{current}</strong> of {total}
      </p>
      <div className="flex gap-2">
        {[
          { label: "Prev", icon: FiChevronLeft,  disabled: current <= 1,     onClick: onPrev },
          { label: "Next", icon: FiChevronRight, disabled: current >= total, onClick: onNext },
        ].map(({ label, icon: Icon, disabled, onClick }) => (
          <button key={label} disabled={disabled} onClick={onClick}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: T.border, color: T.textSecondary }}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TransportOperatorList() {
  const dispatch = useDispatch();

  const list         = useSelector(selectTransportList);
  const listLoading  = useSelector(selectTransportListLoading);
  const listError    = useSelector(selectTransportListError);
  const currentPage  = useSelector(selectTransportCurrentPage);
  const pageSize     = useSelector(selectTransportPageSize);
  const totalCount   = useSelector(selectTransportTotalCount);
  const updatingId   = useSelector(selectStatusUpdatingId);
  const statusError  = useSelector(selectStatusError);

  const [search,       setSearch]    = useState("");
  const [activeFilter, setActive]    = useState("all");
  const [selected,     setSelected]  = useState(null); // operator in drawer

  const reload = () =>
    dispatch(fetchTransportOperators({ page: currentPage, page_size: pageSize }));

  useEffect(() => { reload(); }, [dispatch, currentPage, pageSize]);

  // Keep drawer data fresh after status update
  useEffect(() => {
    if (selected && !updatingId) {
      const fresh = list.find(r => r.user_id === selected.user_id);
      if (fresh) setSelected(fresh);
    }
  }, [list, updatingId]);

  const handleToggle = (operatorId, status) =>
    dispatch(updateTransportOperatorStatus({ operatorId, status }));

  // Client-side filter
  const filtered = list.filter(r => {
    const matchSearch = !search ||
      [r.full_name, r.user_id, r.mobile, r.email]
        .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchActive =
      activeFilter === "all"      ? true :
      activeFilter === "active"   ? isActive(r) :
                                    !isActive(r);
    return matchSearch && matchActive;
  });

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  return (
    <div style={{ background: T.pageBg }} className="min-h-full">

      {/* View drawer */}
      <ViewDrawer
        operator={selected}
        updatingId={updatingId}
        onClose={() => setSelected(null)}
        onToggle={handleToggle}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FiTruck className="h-4 w-4" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textMuted }}>
              Participant Registry
            </p>
          </div>
          <h1 className="text-xl font-bold" style={{ color: T.textPrimary }}>Transport Operators</h1>
          <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
            View, search and manage operator status
          </p>
        </div>

        {/* Status update error */}
        {statusError && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border"
            style={{ background: T.errorBg, borderColor: T.errorBorder }}>
            <FiAlertCircle className="h-4 w-4 shrink-0" style={{ color: T.errorText }} />
            <p className="text-sm" style={{ color: T.errorText }}>{statusError}</p>
            <button className="ml-auto" onClick={() => dispatch(clearStatusError())}>
              <FiX className="h-4 w-4" style={{ color: T.errorText }} />
            </button>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-sm border"
          style={{ background: T.cardBg, borderColor: T.border }}>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: T.border }}>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                style={{ background: T.accent }}>
                <FiTruck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>Transport Operators</p>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  {listLoading ? "Loading…" : `${totalCount ?? filtered.length} operator(s)`}
                </p>
              </div>
              <button onClick={reload} disabled={listLoading}
                className="ml-2 rounded-lg p-1.5 transition hover:bg-stone-100 disabled:opacity-40">
                <FiRefreshCw className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`}
                  style={{ color: T.textMuted }} />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
              {/* Active filter pills */}
              <div className="flex gap-1">
                {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([v,l]) => (
                  <button key={v} onClick={() => setActive(v)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    style={activeFilter === v
                      ? { background: T.accent, color: "#fff" }
                      : { background: "#F5F5F4", color: T.textSecondary }}>
                    {l}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: T.textMuted }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, ID, mobile…"
                  className="h-10 w-full rounded-xl bg-stone-100 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-200 border border-transparent" />
              </div>
            </div>
          </div>

          {/* List error */}
          {listError && (
            <div className="flex items-center gap-3 px-5 py-3 border-b"
              style={{ background: T.errorBg, borderColor: T.errorBorder }}>
              <FiAlertCircle className="h-4 w-4 shrink-0" style={{ color: T.errorText }} />
              <p className="text-sm" style={{ color: T.errorText }}>{listError}</p>
              <button className="ml-auto" onClick={reload}>
                <FiRefreshCw className="h-4 w-4" style={{ color: T.errorText }} />
              </button>
            </div>
          )}

          {/* Loading */}
          {listLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: T.textMuted }}>
              <FiLoader className="h-4 w-4 animate-spin" /> Loading operators…
            </div>
          )}

          {/* Content */}
          {!listLoading && !listError && (
            <>
              {filtered.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "#F5F5F4" }}>
                      <FiTruck className="h-6 w-6" style={{ color: T.textMuted }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: T.textMuted }}>No operators found</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="flex flex-col gap-3 p-4 lg:hidden">
                      {filtered.map(r => (
                        <OperatorCard key={r.user_id} r={r}
                          updatingId={updatingId}
                          onView={setSelected}
                          onToggle={handleToggle} />
                      ))}
                    </div>
                    {/* Desktop */}
                    <DesktopTable rows={filtered}
                      updatingId={updatingId}
                      onView={setSelected}
                      onToggle={handleToggle} />
                  </>
                )
              }

              <Pagination
                current={currentPage} total={totalPages}
                onPrev={() => dispatch(setTransportPage(currentPage - 1))}
                onNext={() => dispatch(setTransportPage(currentPage + 1))}
              />

              {!totalPages && filtered.length > 0 && (
                <p className="px-5 py-3 text-xs" style={{ color: T.textMuted }}>
                  Showing <strong style={{ color: T.textPrimary }}>{filtered.length}</strong> operator(s)
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}