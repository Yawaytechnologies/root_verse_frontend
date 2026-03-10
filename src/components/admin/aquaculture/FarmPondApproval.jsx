// src/modules/admin/aquaculture/pages/FarmPondApproval.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Farm & Pond Approval (simple + user-friendly)
 * ✅ One queue (Farm + Pond)
 * ✅ Filters: Status + Type + Search
 * ✅ Review modal: Details + Images + Verification checklist + Approve/Reject
 * ✅ FIXED: Modal is now scrollable + always fits in view (max-height + overflow)
 *
 * Replace mock data + generator functions with API later.
 */

const STATUS_TONE = { PENDING: "amber", APPROVED: "green", REJECTED: "red" };
const TYPE_TONE = { FARM: "blue", POND: "slate" };

/* ---------------- Icons ---------------- */
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
function IconQr(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 6h-1v-3h3v1m0 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- UI bits ---------------- */
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
    accent: "text-white ring-1 ring-black/10 hover:opacity-95",
  };
  const style = tone === "accent" ? { background: "var(--rv-accent)" } : undefined;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
        tones[tone] || tones.slate
      }`}
      style={style}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </button>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <div className="p-5">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
          {label}
        </div>
        <div className="mt-2.5 text-2xl font-semibold text-[var(--rv-ink)]">
          {value}
        </div>
        <div className="mt-1.5 text-sm text-[var(--rv-muted)]">{sub}</div>
      </div>
    </div>
  );
}

function ToggleCheck({ checked, label, hint, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl p-3 text-left ring-1 ring-black/5 transition ${
        checked ? "bg-emerald-50" : "bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md ring-1 ring-black/10 ${
            checked ? "bg-emerald-600 text-white" : "bg-white text-slate-400"
          }`}
        >
          {checked ? <IconCheck className="h-4 w-4" /> : null}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--rv-ink)]">
            {label}
          </div>
          <div className="mt-0.5 text-xs text-[var(--rv-muted)]">{hint}</div>
        </div>
      </div>
    </button>
  );
}

/* ✅ FIXED modal: fits in viewport + scrollable body */
function ModalShell({ open, title, subtitle, onClose, children }) {
  // lock background scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ✅ Center wrapper with padding, works on small height screens */}
      <div className="absolute inset-0 flex items-start justify-center p-3 md:p-6">
        {/* ✅ Modal card with max height and internal scrolling */}
        <div className="w-full max-w-[980px] max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/10 flex flex-col">
          {/* header stays fixed */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0">
            <div className="min-w-0">
              <div className="text-base font-semibold text-[var(--rv-ink)] truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-sm text-[var(--rv-muted)] truncate">
                  {subtitle}
                </div>
              ) : null}
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl bg-slate-100 p-2 text-slate-700 ring-1 ring-black/5 hover:bg-slate-200 shrink-0"
              aria-label="Close"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* ✅ scrollable content */}
          <div className="px-5 py-5 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mock generators ---------------- */
function genFarmId(n) {
  return `FRM-${String(n).padStart(4, "0")}`;
}
function genPondId(n) {
  return `POND-${String(n).padStart(4, "0")}`;
}
function makeQrPayload({ farmerId, farmId, pondId }) {
  return `ROOTVERSE|FARMER=${farmerId}|FARM=${farmId}|POND=${pondId}`;
}

/* ---------------- Page ---------------- */
export default function FarmPondApproval() {
  // Theme scoped inside this file only
  const pageStyle = (
    <style>{`
      .rvFarmPondPage{
        --rv-accent:#25B7FF;
        --rv-bg:#EEF2F7;
        --rv-ink:#0F172A;
        --rv-muted:#64748B;
        background: var(--rv-bg);
      }
    `}</style>
  );

  const [items, setItems] = useState(() => [
    {
      id: 101,
      type: "FARM",
      status: "PENDING",
      submittedAt: "2026-03-06 09:10",
      farmerId: "FMR-00021",
      ownerName: "S. Karthik",
      district: "Nagapattinam",
      state: "Tamil Nadu",
      farmName: "Blue Creek Farm",
      farmArea: "12 acres",
      gps: "10.7671, 79.8421",
      farmGateImage: true,
      farmId: null,
      adminNote: "",
    },
    {
      id: 102,
      type: "POND",
      status: "PENDING",
      submittedAt: "2026-03-06 09:18",
      farmerId: "FMR-00021",
      ownerName: "S. Karthik",
      district: "Nagapattinam",
      state: "Tamil Nadu",
      farmName: "Blue Creek Farm",
      pondName: "P01",
      pondArea: "1.4 acres",
      cultureType: "Shrimp · L. vannamei",
      gps: "10.7675, 79.8430",
      pondImages: 2,
      northFacing: true,
      farmId: "FRM-0001",
      pondId: null,
      qrPayload: null,
      adminNote: "",
    },
    {
      id: 103,
      type: "FARM",
      status: "APPROVED",
      submittedAt: "2026-03-05 16:12",
      farmerId: "FMR-00018",
      ownerName: "M. Prakash",
      district: "Tuticorin",
      state: "Tamil Nadu",
      farmName: "Sunrise Aquafarm",
      farmArea: "8 acres",
      gps: "8.7642, 78.1348",
      farmGateImage: true,
      farmId: "FRM-0002",
      adminNote: "Verified gate image + watermark",
    },
    {
      id: 104,
      type: "POND",
      status: "REJECTED",
      submittedAt: "2026-03-05 16:30",
      farmerId: "FMR-00018",
      ownerName: "M. Prakash",
      district: "Tuticorin",
      state: "Tamil Nadu",
      farmName: "Sunrise Aquafarm",
      pondName: "P07",
      pondArea: "1.1 acres",
      cultureType: "Tilapia",
      gps: "8.7646, 78.1350",
      pondImages: 1,
      northFacing: false,
      farmId: "FRM-0002",
      pondId: null,
      qrPayload: null,
      adminNote: "Pond image not north-facing",
    },
  ]);

  const [statusTab, setStatusTab] = useState("PENDING"); // PENDING|APPROVED|REJECTED|ALL
  const [typeTab, setTypeTab] = useState("ALL"); // ALL|FARM|POND
  const [q, setQ] = useState("");

  const [selected, setSelected] = useState(null);
  const [checks, setChecks] = useState({
    inAppCamera: false,
    watermarkOk: false,
    northFacingOk: false,
  });

  const stats = useMemo(() => {
    const pending = items.filter((x) => x.status === "PENDING").length;
    const farmsPending = items.filter(
      (x) => x.status === "PENDING" && x.type === "FARM"
    ).length;
    const pondsPending = items.filter(
      (x) => x.status === "PENDING" && x.type === "POND"
    ).length;
    return { pending, farmsPending, pondsPending };
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items
      .filter((x) => (statusTab === "ALL" ? true : x.status === statusTab))
      .filter((x) => (typeTab === "ALL" ? true : x.type === typeTab))
      .filter((x) => {
        if (!qq) return true;
        const blob = [
          x.type,
          x.status,
          x.ownerName,
          x.farmerId,
          x.farmName,
          x.pondName,
          x.district,
          x.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(qq);
      })
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [items, statusTab, typeTab, q]);

  function openReview(row) {
    setSelected(row);
    setChecks({
      inAppCamera: false,
      watermarkOk: false,
      northFacingOk: row.type === "POND" ? false : true,
    });
  }

  function closeReview() {
    setSelected(null);
  }

  function updateNote(note) {
    setSelected((p) => (p ? { ...p, adminNote: note } : p));
  }

  function commitSelected(updated) {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setSelected(updated);
  }

  function approveSelected() {
    if (!selected) return;

    const needNorth = selected.type === "POND";
    const ok =
      checks.inAppCamera &&
      checks.watermarkOk &&
      (!needNorth || checks.northFacingOk);

    if (!ok) {
      alert("Complete verification checklist before approving.");
      return;
    }

    if (selected.type === "FARM") {
      const nextNum =
        1 +
        items.filter(
          (x) => x.type === "FARM" && x.status === "APPROVED" && x.farmId
        ).length;

      const updated = {
        ...selected,
        status: "APPROVED",
        farmId: selected.farmId || genFarmId(nextNum),
      };
      commitSelected(updated);
    } else {
      const nextNum =
        1 +
        items.filter(
          (x) => x.type === "POND" && x.status === "APPROVED" && x.pondId
        ).length;

      const farmId = selected.farmId || "FRM-????";
      const pondId = selected.pondId || genPondId(nextNum);

      const updated = {
        ...selected,
        status: "APPROVED",
        pondId,
        qrPayload: makeQrPayload({
          farmerId: selected.farmerId,
          farmId,
          pondId,
        }),
      };
      commitSelected(updated);
    }
  }

  function rejectSelected() {
    if (!selected) return;
    const updated = { ...selected, status: "REJECTED" };
    commitSelected(updated);
  }

  function printQr(payload) {
    const w = window.open("", "_blank", "width=520,height=620");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Pond QR</title>
          <style>
            body{font-family:Arial; padding:24px;}
            .box{border:1px solid #ddd; border-radius:12px; padding:16px;}
            .title{font-size:18px; font-weight:700; margin-bottom:8px;}
            .muted{color:#555; font-size:12px; margin-top:10px;}
            .code{font-family:monospace; white-space:pre-wrap; word-break:break-word; background:#f7f7f7; padding:12px; border-radius:10px;}
          </style>
        </head>
        <body>
          <div class="box">
            <div class="title">RootVerse Pond QR Payload</div>
            <div class="code">${payload}</div>
            <div class="muted">Replace this payload with real QR graphic later.</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <div className="rvFarmPondPage min-h-full">
      {pageStyle}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--rv-ink)]">
            Farm & Pond Approval
          </h1>
          <p className="mt-1.5 text-sm text-[var(--rv-muted)]">
            Review submissions. Verify images + watermark, then approve or reject.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MetricCard
            label="PENDING REQUESTS"
            value={stats.pending}
            sub="Awaiting admin action"
          />
          <MetricCard
            label="PENDING FARMS"
            value={stats.farmsPending}
            sub="Farm registrations"
          />
          <MetricCard
            label="PENDING PONDS"
            value={stats.pondsPending}
            sub="Pond registrations"
          />
        </div>

        {/* Queue */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex flex-col gap-3 px-6 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="relative pl-3">
              <span
                className="absolute left-0 top-1.5 h-5 w-1 rounded-full"
                style={{ background: "var(--rv-accent)" }}
              />
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                APPROVAL QUEUE
              </div>
              <div className="mt-1 text-sm text-[var(--rv-muted)]">
                One list for farms + ponds. Click Review to approve/reject.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TabButton active={statusTab === "PENDING"} onClick={() => setStatusTab("PENDING")}>
                Pending
              </TabButton>
              <TabButton active={statusTab === "APPROVED"} onClick={() => setStatusTab("APPROVED")}>
                Approved
              </TabButton>
              <TabButton active={statusTab === "REJECTED"} onClick={() => setStatusTab("REJECTED")}>
                Rejected
              </TabButton>
              <TabButton active={statusTab === "ALL"} onClick={() => setStatusTab("ALL")}>
                All
              </TabButton>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-4 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <TabButton active={typeTab === "ALL"} onClick={() => setTypeTab("ALL")}>
                All types
              </TabButton>
              <TabButton active={typeTab === "FARM"} onClick={() => setTypeTab("FARM")}>
                Farms
              </TabButton>
              <TabButton active={typeTab === "POND"} onClick={() => setTypeTab("POND")}>
                Ponds
              </TabButton>
            </div>

            <div className="relative w-full md:w-[420px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <IconSearch className="h-5 w-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search owner, farm, pond, farmer id, location..."
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
                  <th className="border-b border-slate-100 py-2.5 pr-4">TYPE</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">REQUEST</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">OWNER</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">LOCATION</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">SUBMITTED</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">STATUS</th>
                  <th className="border-b border-slate-100 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">
                        No results
                      </div>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">
                        Try changing filters or search.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => (
                    <tr key={x.id} className="border-t border-slate-100">
                      <td className="py-4 pr-4 align-top">
                        <Badge tone={TYPE_TONE[x.type]}>{x.type}</Badge>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">
                          {x.type === "FARM"
                            ? x.farmName
                            : `${x.farmName} · ${x.pondName}`}
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          Farmer:{" "}
                          <span className="font-semibold text-slate-700">
                            {x.farmerId}
                          </span>
                          {x.type === "FARM" && x.farmId ? (
                            <>
                              {" "}
                              · Farm ID:{" "}
                              <span className="font-semibold text-slate-700">
                                {x.farmId}
                              </span>
                            </>
                          ) : null}
                          {x.type === "POND" && x.pondId ? (
                            <>
                              {" "}
                              · Pond ID:{" "}
                              <span className="font-semibold text-slate-700">
                                {x.pondId}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-[var(--rv-ink)]">
                          {x.ownerName}
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          {x.type === "FARM"
                            ? x.farmArea
                            : `${x.pondArea} · ${x.cultureType}`}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-[var(--rv-ink)]">
                          {x.district}
                        </div>
                        <div className="mt-1 text-sm text-[var(--rv-muted)]">
                          {x.state}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-700">
                          {x.submittedAt}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <Badge tone={STATUS_TONE[x.status]}>{x.status}</Badge>
                      </td>

                      <td className="py-4 text-right align-top">
                        <ActionButton
                          onClick={() => openReview(x)}
                          icon={<IconEye className="h-4 w-4" />}
                        >
                          Review
                        </ActionButton>
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

      {/* Review Modal */}
      <ModalShell
        open={!!selected}
        onClose={closeReview}
        title={
          selected
            ? selected.type === "FARM"
              ? `Farm Review · ${selected.farmName}`
              : `Pond Review · ${selected.farmName} · ${selected.pondName}`
            : ""
        }
        subtitle={
          selected
            ? `${selected.ownerName} · ${selected.district}, ${selected.state} · Farmer ${selected.farmerId}`
            : ""
        }
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Left */}
            <div className="md:col-span-2">
              {/* Details */}
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  DETAILS
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">Type</div>
                    <div className="mt-1">
                      <Badge tone={TYPE_TONE[selected.type]}>{selected.type}</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">Submitted</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.submittedAt}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">GPS</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                      {selected.gps}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--rv-muted)]">Current Status</div>
                    <div className="mt-1">
                      <Badge tone={STATUS_TONE[selected.status]}>
                        {selected.status}
                      </Badge>
                    </div>
                  </div>

                  {selected.type === "FARM" ? (
                    <>
                      <div>
                        <div className="text-xs text-[var(--rv-muted)]">Farm Area</div>
                        <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                          {selected.farmArea}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--rv-muted)]">Farm ID</div>
                        <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                          {selected.farmId || "— (generated after approval)"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-xs text-[var(--rv-muted)]">Culture Type</div>
                        <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                          {selected.cultureType}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--rv-muted)]">Pond ID</div>
                        <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
                          {selected.pondId || "— (generated after approval)"}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[var(--rv-muted)]">Admin note</div>
                  <textarea
                    value={selected.adminNote || ""}
                    onChange={(e) => updateNote(e.target.value)}
                    placeholder="Reason for approval/rejection (keeps audit trail)"
                    className="mt-2 w-full rounded-2xl bg-white p-3 text-sm text-slate-800 ring-1 ring-black/5 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "var(--rv-accent)" }}
                    rows={3}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  IMAGES (EVIDENCE)
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selected.type === "FARM" ? (
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">
                        Farm Gate Image
                      </div>
                      <div className="mt-1 text-xs text-[var(--rv-muted)]">
                        Must be captured in-app + watermarked.
                      </div>
                      <div className="mt-3 h-28 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center text-xs text-slate-400">
                        Image preview placeholder
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">
                          Pond Image(s)
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          {selected.pondImages || 0} uploaded · North-facing required.
                        </div>
                        <div className="mt-3 h-28 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center text-xs text-slate-400">
                          Image preview placeholder
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">
                          Farm Gate Image (reference)
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          Ensure pond belongs to approved farm.
                        </div>
                        <div className="mt-3 h-28 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center text-xs text-slate-400">
                          Image preview placeholder
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right */}
            <div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  VERIFICATION (REQUIRED)
                </div>

                <div className="mt-3 grid gap-2">
                  <ToggleCheck
                    checked={checks.inAppCamera}
                    onToggle={() =>
                      setChecks((s) => ({ ...s, inAppCamera: !s.inAppCamera }))
                    }
                    label="Captured in-app camera"
                    hint="Gallery uploads must not be allowed."
                  />

                  <ToggleCheck
                    checked={checks.watermarkOk}
                    onToggle={() =>
                      setChecks((s) => ({ ...s, watermarkOk: !s.watermarkOk }))
                    }
                    label="Watermark verified"
                    hint="Must include Farmer ID, Farm Code, Pond Code, GPS, UTC time."
                  />

                  {selected.type === "POND" ? (
                    <ToggleCheck
                      checked={checks.northFacingOk}
                      onToggle={() =>
                        setChecks((s) => ({
                          ...s,
                          northFacingOk: !s.northFacingOk,
                        }))
                      }
                      label="Pond image is North-facing"
                      hint="Pond images must be captured facing North."
                    />
                  ) : null}
                </div>

                {/* Outputs */}
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-slate-700">
                    Generated outputs
                  </div>

                  {selected.type === "FARM" ? (
                    <div className="mt-2 text-sm text-[var(--rv-muted)]">
                      Farm ID:{" "}
                      <span className="font-semibold text-[var(--rv-ink)]">
                        {selected.farmId || "—"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">
                        Pond ID:{" "}
                        <span className="font-semibold text-[var(--rv-ink)]">
                          {selected.pondId || "—"}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-[var(--rv-muted)]">
                        QR payload (stored/printed):
                      </div>

                      <div className="mt-1 rounded-xl bg-white p-2 text-[11px] text-slate-700 ring-1 ring-black/5 break-words font-mono">
                        {selected.qrPayload || "— (generated after approval)"}
                      </div>

                      {selected.status === "APPROVED" && selected.qrPayload ? (
                        <div className="mt-3">
                          <ActionButton
                            tone="accent"
                            onClick={() => printQr(selected.qrPayload)}
                            icon={<IconQr className="h-4 w-4" />}
                          >
                            Print QR
                          </ActionButton>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 grid gap-2">
                  {selected.status === "PENDING" ? (
                    <>
                      <ActionButton
                        tone="green"
                        onClick={approveSelected}
                        icon={<IconCheck className="h-4 w-4" />}
                      >
                        Approve
                      </ActionButton>

                      <ActionButton
                        tone="red"
                        onClick={rejectSelected}
                        icon={<IconX className="h-4 w-4" />}
                      >
                        Reject
                      </ActionButton>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--rv-muted)]">
                      This request is already{" "}
                      <span className="font-semibold text-[var(--rv-ink)]">
                        {selected.status.toLowerCase()}
                      </span>
                      .
                    </div>
                  )}

                  <ActionButton
                    tone="slate"
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