// src/modules/admin/aquaculture/pages/OwnerApproval.jsx
import React, { useMemo, useState } from "react";

const STATUS_TONE = { PENDING: "amber", APPROVED: "green", REJECTED: "red" };

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-black/5 ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 18a7 7 0 1 0-7-7 7 7 0 0 0 7 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricCard({ label, value, sub, icon, accent = false }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <div
            className="rvIconBubble flex h-10 w-10 items-center justify-center rounded-full text-white ring-1 ring-black/10"
            style={accent ? { background: "var(--rv-accent)" } : undefined}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
              {label}
            </div>
            <div className="mt-2.5 text-2xl font-semibold text-[var(--rv-ink)]">
              {value}
            </div>
            <div className="mt-1.5 text-sm text-[var(--rv-muted)]">{sub}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-black/5 transition ${
        active
          ? "text-white"
          : "bg-white text-slate-700 hover:bg-slate-50"
      }`}
      style={active ? { background: "var(--rv-accent)" } : undefined}
    >
      {children}
    </button>
  );
}

function ActionButton({ tone = "slate", onClick, children, icon }) {
  const tones = {
    slate: "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-black/10",
    green:
      "bg-emerald-600 text-white hover:bg-emerald-700 ring-1 ring-emerald-700/20",
    red: "bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-700/20",
  };
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${tones[tone]}`}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </button>
  );
}

function ModalShell({ open, title, subtitle, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-10 mx-auto w-[min(920px,92vw)]">
        <div className="rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/10">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="text-base font-semibold text-[var(--rv-ink)]">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-sm text-[var(--rv-muted)]">
                  {subtitle}
                </div>
              ) : null}
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl bg-slate-100 p-2 text-slate-700 ring-1 ring-black/5 hover:bg-slate-200"
              aria-label="Close"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerApproval() {
  const [rows, setRows] = useState(() => [
    {
      id: 1,
      ownerCode: "AQ-OWN-0012",
      name: "S. Karthik",
      phone: "98765 43210",
      district: "Nagapattinam",
      state: "Tamil Nadu",
      submittedAt: "2026-03-05 09:20",
      status: "PENDING",
      docs: ["Aadhaar.pdf"],
    },
    {
      id: 2,
      ownerCode: "AQ-OWN-0013",
      name: "M. Prakash",
      phone: "97979 11122",
      district: "Tuticorin",
      state: "Tamil Nadu",
      submittedAt: "2026-03-04 17:40",
      status: "PENDING",
      docs: ["PAN.jpg", "Aadhaar.jpg"],
    },
    {
      id: 3,
      ownerCode: "AQ-OWN-0008",
      name: "R. Shalini",
      phone: "90000 12345",
      district: "Ramanathapuram",
      state: "Tamil Nadu",
      submittedAt: "2026-03-01 11:10",
      status: "APPROVED",
      docs: ["Aadhaar.jpg"],
    },
    {
      id: 4,
      ownerCode: "AQ-OWN-0009",
      name: "V. Ramesh",
      phone: "95555 22233",
      district: "Cuddalore",
      state: "Tamil Nadu",
      submittedAt: "2026-03-02 14:55",
      status: "REJECTED",
      docs: ["Aadhaar_blur.jpg"],
    },
  ]);

  const [tab, setTab] = useState("PENDING");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.status === "PENDING").length;
    const approved = rows.filter((r) => r.status === "APPROVED").length;
    const rejected = rows.filter((r) => r.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (tab === "ALL" ? true : r.status === tab))
      .filter((r) => {
        if (!qq) return true;
        return (
          r.ownerCode.toLowerCase().includes(qq) ||
          r.name.toLowerCase().includes(qq) ||
          r.phone.toLowerCase().includes(qq) ||
          r.district.toLowerCase().includes(qq)
        );
      });
  }, [rows, tab, q]);

  function openReview(row) {
    setSelected(row);
    setDecisionNote("");
  }

  function closeReview() {
    setSelected(null);
    setDecisionNote("");
  }

  function setStatus(id, status) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              // keep note somewhere if you want; for now just closes
            }
          : r
      )
    );
    closeReview();
  }

  return (
    <div className="rvOwnerPage min-h-full">
      {/* ✅ CSS INSIDE THIS FILE (scoped to this page) */}
      <style>{`
        .rvOwnerPage{
          --rv-accent:#25B7FF;   /* your sidebar blue */
          --rv-bg:#EEF2F7;
          --rv-ink:#0F172A;
          --rv-muted:#64748B;
          background: var(--rv-bg);
        }
        .rvIconBubble{
          background: var(--rv-ink);
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header (smaller) */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--rv-ink)]">
            Owner Approval
          </h1>
          <p className="mt-1.5 text-sm text-[var(--rv-muted)]">
            Review owner registrations and approve or reject based on submitted
            details.
          </p>
        </div>

        {/* Metrics (compact) */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MetricCard
            label="PENDING OWNERS"
            value={stats.pending}
            sub="Awaiting admin action"
            icon={<IconUser className="h-5 w-5" />}
            accent
          />
          <MetricCard
            label="APPROVED"
            value={stats.approved}
            sub="Total approved owners"
            icon={<IconCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="REJECTED"
            value={stats.rejected}
            sub="Total rejected owners"
            icon={<IconX className="h-5 w-5" />}
          />
        </div>

        {/* List card */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex flex-col gap-3 px-6 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="relative pl-3">
              <span
                className="absolute left-0 top-1.5 h-5 w-1 rounded-full"
                style={{ background: "var(--rv-accent)" }}
              />
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                OWNER REQUESTS
              </div>
              <div className="mt-1 text-sm text-[var(--rv-muted)]">
                Filter, search, and review each owner submission.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TabButton active={tab === "PENDING"} onClick={() => setTab("PENDING")}>
                Pending
              </TabButton>
              <TabButton active={tab === "APPROVED"} onClick={() => setTab("APPROVED")}>
                Approved
              </TabButton>
              <TabButton active={tab === "REJECTED"} onClick={() => setTab("REJECTED")}>
                Rejected
              </TabButton>
              <TabButton active={tab === "ALL"} onClick={() => setTab("ALL")}>
                All
              </TabButton>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pb-4 pt-4">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <IconSearch className="h-5 w-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by Owner Code, Name, Phone, District..."
                className="w-full rounded-2xl bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 ring-1 ring-black/5 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  <th className="border-b border-slate-100 py-2.5 pr-4">OWNER</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">CONTACT</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">LOCATION</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">SUBMITTED</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">STATUS</th>
                  <th className="border-b border-slate-100 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">
                        No results
                      </div>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">
                        Try changing filters or search keywords.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">
                          {r.ownerCode}
                        </div>
                        <div className="mt-1 text-sm text-[var(--rv-muted)]">
                          {r.name}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-[var(--rv-ink)]">{r.phone}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          {r.docs?.length || 0} docs uploaded
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-[var(--rv-ink)]">{r.district}</div>
                        <div className="mt-1 text-sm text-[var(--rv-muted)]">{r.state}</div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-700">{r.submittedAt}</div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <Badge tone={STATUS_TONE[r.status] || "slate"}>{r.status}</Badge>
                      </td>

                      <td className="py-4 text-right align-top">
                        <div className="inline-flex items-center gap-2">
                          <ActionButton
                            onClick={() => openReview(r)}
                            icon={<IconEye className="h-4 w-4" />}
                          >
                            Review
                          </ActionButton>

                          {r.status === "PENDING" ? (
                            <>
                              <ActionButton
                                tone="green"
                                onClick={() => openReview(r)}
                                icon={<IconCheck className="h-4 w-4" />}
                              >
                                Approve
                              </ActionButton>

                              <ActionButton
                                tone="red"
                                onClick={() => openReview(r)}
                                icon={<IconX className="h-4 w-4" />}
                              >
                                Reject
                              </ActionButton>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-3 text-sm text-[var(--rv-muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--rv-ink)]">
                {filtered.length}
              </span>{" "}
              result(s)
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalShell
        open={!!selected}
        onClose={closeReview}
        title={selected ? `${selected.ownerCode} · ${selected.name}` : ""}
        subtitle={
          selected ? `${selected.district}, ${selected.state} · ${selected.phone}` : ""
        }
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  SUBMISSION DETAILS
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">Owner Code</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.ownerCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">Submitted At</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.submittedAt}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">District</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.district}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">State</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.state}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[var(--rv-muted)]">
                    Admin note (optional)
                  </div>
                  <textarea
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Reason for approval/rejection..."
                    className="mt-2 w-full rounded-2xl bg-white p-3 text-sm text-slate-800 ring-1 ring-black/5 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "var(--rv-accent)" }}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  ACTIONS
                </div>

                <div className="mt-3 grid gap-2">
                  {selected.status === "PENDING" ? (
                    <>
                      <ActionButton
                        tone="green"
                        onClick={() => setStatus(selected.id, "APPROVED")}
                        icon={<IconCheck className="h-4 w-4" />}
                      >
                        Approve Owner
                      </ActionButton>

                      <ActionButton
                        tone="red"
                        onClick={() => setStatus(selected.id, "REJECTED")}
                        icon={<IconX className="h-4 w-4" />}
                      >
                        Reject Owner
                      </ActionButton>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--rv-muted)]">
                      Already{" "}
                      <span className="font-semibold text-[var(--rv-ink)]">
                        {selected.status.toLowerCase()}
                      </span>
                      .
                    </div>
                  )}

                  <ActionButton
                    onClick={closeReview}
                    icon={<IconX className="h-4 w-4" />}
                  >
                    Close
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}