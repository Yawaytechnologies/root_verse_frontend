// src/components/qc/QcInspectionTable.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllQcInspections } from "../../../redux/action/qcInspectionActions";

function formatDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB");
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function badgeClass(value) {
  const v = String(value || "").toUpperCase();

  if (v === "PASS" || v === "A" || v === "CHECKED") {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  }

  if (v === "REJECT" || v === "C" || v === "SEVERE" || v === "MODERATE") {
    return "border border-red-200 bg-red-100 text-red-700";
  }

  if (v === "B") {
    return "border border-amber-200 bg-amber-100 text-amber-700";
  }

  return "border border-slate-200 bg-slate-100 text-slate-700";
}

/** ✅ smaller typography (mobile friendly) */
function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2 sm:py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium leading-snug text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}

/** ✅ smaller section headers */
function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 sm:py-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-800 sm:text-sm">
          {title}
        </h4>
        {subtitle ? (
          <p className="mt-1 text-[11px] leading-snug text-emerald-700/80 sm:text-xs">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function openImageInNewTab(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function ImageActionCard({ title, imageUrl, alt, onPreview }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </div>

      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={alt}
            className="h-40 w-full rounded-xl border border-slate-200 object-cover sm:h-52 lg:h-56"
          />

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onPreview?.(imageUrl, title)}
              className="w-full rounded-xl bg-emerald-900 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              View Full Image
            </button>

            <button
              type="button"
              onClick={() => openImageInNewTab(imageUrl)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Open Image
            </button>
          </div>
        </>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 sm:h-52 lg:h-56">
          No image
        </div>
      )}
    </div>
  );
}

function ImagePreviewModal({ open, imageUrl, title, onClose }) {
  if (!open || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[1001] bg-black/90">
      <div className="flex h-full w-full flex-col">
        <div className="relative flex items-center justify-center border-b border-white/10 px-4 py-3">
          <h3 className="max-w-[80%] truncate text-base font-bold text-white sm:text-lg">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => openImageInNewTab(imageUrl)}
              className="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Open In New Tab
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ Fix "stuck" on mobile:
 * - modal uses 100dvh
 * - body is the only scroll area
 * - body scroll is locked behind modal (handled in parent via useEffect)
 * - `touch-pan-y` + WebkitOverflowScrolling
 */
function ViewInspectionModal({ open, item, onClose, onPreviewImage }) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/60">
      <div className="flex h-[100dvh] w-full items-stretch justify-center sm:items-center sm:p-4">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[96vh] sm:max-w-6xl sm:rounded-3xl sm:shadow-2xl">
          {/* ✅ compact sticky header */}
          <div className="sticky top-0 z-20 border-b border-emerald-900/20 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-3 py-2 text-white sm:px-5 sm:py-3">
            <div className="relative">
              {/* title centered always */}
              <h3 className="text-center text-lg font-bold text-white sm:text-2xl">
                QC Inspection Details
              </h3>

              {/* close small on mobile - no big button taking space */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 sm:px-4 sm:py-2 sm:text-sm"
              >
                Close
              </button>
            </div>

            {/* ✅ compact header cards (mobile responsive) */}
            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100 sm:text-[11px]">
                  Checker ID
                </div>
                <div className="mt-0.5 text-sm font-bold text-white sm:mt-1">
                  {item.qualityCheckerId ?? "-"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100 sm:text-[11px]">
                  Checker Name
                </div>
                <div className="mt-0.5 text-sm font-bold text-white sm:mt-1">
                  {item.qualityCheckerName || "-"}
                </div>
              </div>

              <div className="col-span-2 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm sm:col-span-1 sm:px-3 sm:py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100 sm:text-[11px]">
                  Filled Status
                </div>
                <div className="mt-0.5 text-sm font-bold text-white sm:mt-1">
                  {item.qrStatus || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ scroll body (ONLY this should scroll) */}
          <div
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto bg-gradient-to-b from-emerald-50 via-white to-slate-50 p-3 pb-8 sm:p-5"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SectionCard
                title="Inspection Summary"
                subtitle="Primary QR and inspection identity details."
              >
                {/* ✅ moved from header: QR + badges */}
                <div className="mb-3 rounded-xl border border-emerald-100 bg-white px-3 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
                    QR Code
                  </div>
                  <div className="mt-1 break-all text-sm font-bold text-slate-900">
                    {item.qrCode || "-"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badgeClass(
                        item.qcResult
                      )}`}
                    >
                      {item.qcResult}
                    </span>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badgeClass(
                        item.qualityGrade
                      )}`}
                    >
                      Grade {item.qualityGrade || "-"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="QR ID" value={item.id} />
                  <InfoRow label="QR Type" value={item.qrType} />
                  <InfoRow label="QR Status" value={item.qrStatus} />
                  <InfoRow label="QC Status" value={item.qcStatus} />
                  <InfoRow label="QC Result" value={item.qcResult} />
                  <InfoRow label="Quality Grade" value={item.qualityGrade} />
                </div>
              </SectionCard>

              <SectionCard
                title="Quality Metrics"
                subtitle="Quality values captured during inspection."
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="QC Score" value={item.qcScore} />
                  <InfoRow
                    label="Temperature"
                    value={item.temperatureC ? `${item.temperatureC}°C` : "-"}
                  />
                  <InfoRow label="Size" value={item.size} />
                  <InfoRow label="Damage" value={item.damage} />
                  <InfoRow label="Is Damaged" value={item.isDamaged ? "Yes" : "No"} />
                  <InfoRow label="Reject Reason" value={item.rejectReason} />
                  <InfoRow label="Water Temperature" value={item.waterTemperature} />
                  <InfoRow label="PH Level" value={item.phLevel} />
                  <InfoRow label="Odor Score" value={item.odorScore} />
                  <InfoRow label="Firmness Score" value={item.firmnessScore} />
                  <InfoRow label="Extra Grade" value={item.grade} />
                </div>
              </SectionCard>

              <SectionCard
                title="Catch Details"
                subtitle="What was filled and linked to this QR."
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="Weight" value={`${item.weight} kg`} />
                  <InfoRow label="Fish" value={item.fishName} />
                  <InfoRow label="Fish Code" value={item.fish?.fishCode} />
                  <InfoRow label="Vessel" value={item.vesselName} />
                  <InfoRow label="Vessel Code" value={item.vessel?.rvVesselId} />
                  <InfoRow label="Trip Code" value={item.trip?.tripCode} />
                  <InfoRow label="Trip Value" value={item.tripValue} />
                  <InfoRow label="Near Station" value={item.trip?.nearStation} />
                </div>
              </SectionCard>

              <SectionCard
                title="Linked Records"
                subtitle="Owner, checker, vessel and trip references."
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="Owner Name" value={item.ownerName} />
                  <InfoRow label="Owner Code" value={item.owner?.ownerCode || item.trip?.ownerCode} />
                  <InfoRow label="Owner Phone" value={item.owner?.phoneNo} />
                  <InfoRow label="Owner Address" value={item.owner?.address} />
                  <InfoRow label="Quality Checker Name" value={item.qualityCheckerName} />
                  <InfoRow label="Quality Checker ID" value={item.qualityCheckerId} />
                  <InfoRow label="Vessel Type" value={item.vessel?.vesselType} />
                  <InfoRow label="Home Port" value={item.vessel?.homePort} />
                </div>
              </SectionCard>

              <SectionCard title="Time & Location" subtitle="Timestamps and geo values.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow label="Date" value={formatDateOnly(item.date)} />
                  <InfoRow label="Time" value={item.time} />
                  <InfoRow label="Checked At" value={formatDateTime(item.checkedAt)} />
                  <InfoRow label="Filled At" value={formatDateTime(item.filledAt)} />
                  <InfoRow label="Created At" value={formatDateTime(item.createdAt)} />
                  <InfoRow label="Updated At" value={formatDateTime(item.updatedAt)} />
                  <InfoRow label="Latitude" value={item.latitude} />
                  <InfoRow label="Longitude" value={item.longitude} />
                </div>
              </SectionCard>

              <SectionCard
                title="Images"
                subtitle="Use full image preview on mobile for easier viewing."
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ImageActionCard
                    title="Catch Image"
                    imageUrl={item.imageUrl}
                    alt={item.qrCode}
                    onPreview={onPreviewImage}
                  />

                  <ImageActionCard
                    title="Fish Reference Image"
                    imageUrl={item.fish?.fishTypeUrl}
                    alt={item.fishName}
                    onPreview={onPreviewImage}
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopTable({ rows, onView }) {
  return (
    <div className="hidden md:block">
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full table-fixed">
          <thead className="bg-slate-100">
            <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
              <th className="w-[12%] px-4 py-3">Checker ID</th>
              <th className="w-[20%] px-4 py-3">QR Code</th>
              
              <th className="w-[14%] px-4 py-3">Vessel</th>
              <th className="w-[14%] px-4 py-3">Fish</th>
              <th className="w-[10%] px-4 py-3">Weight</th>
              <th className="w-[8%] px-4 py-3">Result</th>
              <th className="w-[6%] px-4 py-3">Grade</th>
              <th className="w-[10%] px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                  No inspection rows found.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm font-bold text-slate-900">
                      {item.qualityCheckerId ?? "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.qualityCheckerName || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="break-all text-base font-bold text-slate-900">
                      {item.qrCode}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{item.qrStatus}</div>
                  </td>

                 

                  <td className="px-4 py-3 align-top text-sm font-medium text-slate-800">
                    {item.vesselName}
                  </td>

                  <td className="px-4 py-3 align-top text-sm font-medium text-slate-800">
                    {item.fishName}
                  </td>

                  <td className="px-4 py-3 align-top text-sm font-semibold text-slate-900">
                    {item.weight} kg
                  </td>

                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(item.qcResult)}`}>
                      {item.qcResult}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(item.qualityGrade)}`}>
                      {item.qualityGrade}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top text-center">
                    <button
                      onClick={() => onView(item)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileCards({ rows, onView }) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
          No inspection rows found.
        </div>
      ) : (
        rows.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Checker
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {item.qualityCheckerId ?? "-"}{" "}
                  <span className="font-medium text-slate-500">
                    {item.qualityCheckerName ? `• ${item.qualityCheckerName}` : ""}
                  </span>
                </div>

                <div className="mt-3 break-all text-sm font-bold text-slate-900">
                  {item.qrCode}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {formatDateOnly(item.date)} • {item.time || "-"}
                </div>
              </div>

              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass(item.qcResult)}`}>
                {item.qcResult}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <InfoRow label="Vessel" value={item.vesselName} />
              <InfoRow label="Fish" value={item.fishName} />
              <InfoRow label="Weight" value={`${item.weight} kg`} />
              <InfoRow label="Grade" value={item.qualityGrade} />
            </div>

            <div className="mt-4">
              <button
                onClick={() => onView(item)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPrev, onNext, onPageChange }) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);

  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              p === currentPage
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function QcInspectionTable({ initialQualityCheckerId = 3 }) {
  const dispatch = useDispatch();
  const { items, loading, error, total, pagesFetched, lastFetchedAt } = useSelector(
    (state) => state.qcInspection
  );

  const [qualityCheckerId, setQualityCheckerId] = useState(
    initialQualityCheckerId ? String(initialQualityCheckerId) : ""
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [previewImage, setPreviewImage] = useState({
    open: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    dispatch(getAllQcInspections());
  }, [dispatch]);

  /** ✅ HARD FIX: lock background scroll when modal is open (prevents "stuck") */
  useEffect(() => {
    const anyModalOpen = Boolean(selectedItem) || Boolean(previewImage.open);
    if (!anyModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [selectedItem, previewImage.open]);

  const filteredItems = useMemo(() => {
    const entered = String(qualityCheckerId || "").trim();
    if (!entered) return items;
    return items.filter((it) => Number(it.qualityCheckerId) === Number(entered));
  }, [items, qualityCheckerId]);

  const summary = useMemo(() => {
    const passCount = filteredItems.filter((it) => it.qcResult === "PASS").length;
    const rejectCount = filteredItems.filter((it) => it.qcResult === "REJECT").length;
    const totalWeight = filteredItems.reduce(
      (sum, it) => sum + Number(it.weightValue || 0),
      0
    );

    return { passCount, rejectCount, totalWeight };
  }, [filteredItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [qualityCheckerId, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  function handlePreviewImage(url, title) {
    setPreviewImage({
      open: true,
      url: url || "",
      title: title || "Image Preview",
    });
  }

  function closePreviewImage() {
    setPreviewImage({ open: false, url: "", title: "" });
  }

  return (
    <div className="pt-8 md:pt-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              QC Inspection Table
            </h2>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Essential table columns only. Full inspection details are inside the popup.
            </p>
            {lastFetchedAt && (
              <p className="mt-1 text-xs text-slate-400">
                Loaded {total} filled QRS from backend across {pagesFetched} page(s)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quality Checker ID
              </label>
              <input
                type="number"
                value={qualityCheckerId}
                onChange={(e) => setQualityCheckerId(e.target.value)}
                placeholder="Enter ID"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rows Per Page
              </label>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={() => dispatch(getAllQcInspections())}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filtered Rows
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {filteredItems.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">Loaded total: {total}</div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Pass
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-800">
              {summary.passCount}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Reject
            </div>
            <div className="mt-2 text-2xl font-bold text-red-800">
              {summary.rejectCount}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Total Weight
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-800">
              {summary.totalWeight.toFixed(2)} kg
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
              Loading QC inspection data...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <DesktopTable rows={pagedRows} onView={setSelectedItem} />
              <MobileCards rows={pagedRows} onView={setSelectedItem} />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <ViewInspectionModal
        open={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onPreviewImage={handlePreviewImage}
      />

      <ImagePreviewModal
        open={previewImage.open}
        imageUrl={previewImage.url}
        title={previewImage.title}
        onClose={closePreviewImage}
      />
    </div>
  );
}