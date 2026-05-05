import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import QRCode from "qrcode";
import { generateAquacultureQRs } from "../../../redux/action/aquacultureQrActions";
import {
  resetGenerateState,
  selectGeneratedQRs,
  selectGenerateLoading,
  selectGenerateError,
  selectGenerateSuccess,
} from "../../../redux/reducer/aquacultureQRSlice";
import { TbQrcode, TbDownload, TbRefresh, TbChevronDown, TbMapPin, TbEye, TbX, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { IoWaterOutline } from "react-icons/io5";
import { PiWavesLight } from "react-icons/pi";
import { MdCheckCircle } from "react-icons/md";

const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";
const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 10;

const QR_TYPES = [
  { key: "farm", label: "Farm", Icon: IoWaterOutline, accent: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "pond", label: "Pond", Icon: PiWavesLight,   accent: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
];

async function makeDataUrl(value) {
  return QRCode.toDataURL(String(value), {
    width: 240, margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── QR Preview Modal ────────────────────────────────────────
function QRModal({ code, qrType, locationId, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);
  const type = QR_TYPES.find((t) => t.key === qrType) ?? QR_TYPES[0];

  useEffect(() => {
    makeDataUrl(code).then(setDataUrl);
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center gap-4"
           onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex items-center justify-between">
          <span className="font-bold text-slate-700 text-sm">QR Preview</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <TbX className="w-4 h-4" />
          </button>
        </div>
        <div className="w-48 h-48 rounded-xl flex items-center justify-center" style={{ background: type.bg }}>
          {dataUrl
            ? <img src={dataUrl} alt={`QR ${code}`} className="w-full h-full object-contain p-3" />
            : <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-400 rounded-full animate-spin" />}
        </div>
        <p className="text-xs font-mono font-bold text-slate-400 text-center break-all">{String(code)}</p>
        <button
          onClick={() => dataUrl && triggerDownload(dataUrl, `${qrType}-${locationId}-${code}.png`)}
          disabled={!dataUrl}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30"
          style={{ background: type.accent }}
        >
          <TbDownload className="w-4 h-4" /> Download
        </button>
      </div>
    </div>
  );
}

// ─── QR Table Row ────────────────────────────────────────────
function QRTableRow({ item, globalIndex, qrType, locationId, onPreview }) {
  const [dataUrl, setDataUrl] = useState(null);
  const code = item?.qrs_code ?? item?.code ?? item?.id ?? item ?? `${qrType}-${locationId}-${globalIndex + 1}`;
  const type = QR_TYPES.find((t) => t.key === qrType) ?? QR_TYPES[0];

  useEffect(() => {
    makeDataUrl(code).then(setDataUrl);
  }, [code]);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-semibold text-slate-400">{globalIndex + 1}</span>
      </td>
      <td className="px-4 py-3">
        {dataUrl ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100"
               style={{ background: type.bg }}>
            <img src={dataUrl} alt={code} className="w-full h-full object-contain p-0.5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center"
               style={{ background: type.bg }}>
            <div className="w-4 h-4 border-2 border-slate-200 border-t-sky-400 rounded-full animate-spin" />
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-bold text-slate-600 break-all">{String(code)}</span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize"
              style={{ background: type.bg, color: type.accent }}>
          {qrType}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(code)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:shadow-sm"
            style={{ borderColor: type.border, color: type.accent, background: type.bg }}
          >
            <TbEye className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={() => dataUrl && triggerDownload(dataUrl, `${qrType}-${locationId}-${code}.png`)}
            disabled={!dataUrl}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
            style={{ background: type.accent }}
          >
            <TbDownload className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function AquaQR() {
  const dispatch = useDispatch();

  const generatedQRs = useSelector(selectGeneratedQRs);
  const loading      = useSelector(selectGenerateLoading);
  const error        = useSelector(selectGenerateError);
  const success      = useSelector(selectGenerateSuccess);

  const [locations, setLocations]   = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError]     = useState(null);
  const [dropOpen, setDropOpen]     = useState(false);
  const dropRef                     = useRef(null);

  const [selectedLoc, setSelectedLoc] = useState(null);
  const [qrType, setQrType]           = useState("farm");
  const [year, setYear]               = useState(CURRENT_YEAR);
  const [count, setCount]             = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [previewCode, setPreviewCode] = useState(null);

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setLocLoading(true);
    fetch(`${BASE_URL}/api/districts`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? data?.districts ?? [];
        setLocations(list);
      })
      .catch(() => setLocError("Could not load locations. Check network."))
      .finally(() => setLocLoading(false));
  }, []);

  useEffect(() => () => { dispatch(resetGenerateState()); }, [dispatch]);

  const isValid = selectedLoc && year >= 2000 && count >= 1 && count <= 500;

  const handleGenerate = () => {
    if (!isValid || loading) return;
    dispatch(generateAquacultureQRs({
      district_id: selectedLoc.id,
      type: qrType,
      year: Number(year),
      qrs: Number(count),
    }));
  };

  const handleReset = () => {
    dispatch(resetGenerateState());
    setSelectedLoc(null);
    setQrType("farm");
    setYear(CURRENT_YEAR);
    setCount(10);
    setCurrentPage(1);
  };

  const qrItems = Array.isArray(generatedQRs)
    ? generatedQRs
    : generatedQRs?.data ?? generatedQRs?.qrs ?? [];

  const activeType = QR_TYPES.find((t) => t.key === qrType) ?? QR_TYPES[0];
  const locName = selectedLoc?.name ?? selectedLoc?.location_name ?? (selectedLoc ? `Location ${selectedLoc.id}` : null);

  const totalPages = Math.ceil(qrItems.length / PAGE_SIZE);
  const pagedItems = qrItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const downloadAll = async () => {
    for (let i = 0; i < qrItems.length; i++) {
      const item = qrItems[i];
      const code = item?.qrs_code ?? item?.code ?? item?.id ?? item ?? `${qrType}-${i}`;
      const url  = await makeDataUrl(code);
      triggerDownload(url, `${qrType}-${selectedLoc?.id}-${code}.png`);
      await new Promise((r) => setTimeout(r, 80));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-3 sm:px-6 py-6">

      {/* ── Header ── */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-100 flex items-center justify-center shadow-sm shrink-0">
              <TbQrcode className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
            </div>
            <h1 className="text-lg sm:text-[22px] font-extrabold text-slate-800 tracking-tight">Generate QR Codes</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm ml-[48px] sm:ml-[52px]">
            Pick a location, type &amp; count — download individually or all at once.
          </p>
        </div>

        {/* Header New Batch — solid + pulsing when success */}
        {success && (
          <button onClick={handleReset}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 animate-pulse"
            style={{ background: activeType.accent }}>
            <TbRefresh className="w-4 h-4" /> New Batch
          </button>
        )}
      </div>

      {/* ── Locked form nudge banner ── */}
      {success && (
        <div
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold"
          style={{ background: activeType.bg, borderColor: activeType.border, color: activeType.accent }}
        >
          <TbRefresh className="w-4 h-4 shrink-0 animate-spin" style={{ animationDuration: "2s" }} />
          <span>
            Form is locked — click{" "}
            <button
              onClick={handleReset}
              className="underline underline-offset-2 font-extrabold hover:opacity-70 transition-opacity"
              style={{ color: activeType.accent }}
            >
              New Batch
            </button>{" "}
            to generate a different set of QR codes.
          </span>
        </div>
      )}

      {/* ── Config card ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 mb-5">

        {/* Location */}
        <div className="mb-4" ref={dropRef}>
          <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Location</label>
          <div className="relative">
            <button type="button"
              onClick={() => !success && setDropOpen((o) => !o)}
              disabled={success || locLoading}
              className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border bg-white text-sm font-medium transition-all
                ${success || locLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-sky-400"}
                ${dropOpen ? "border-sky-400 ring-2 ring-sky-100 shadow-sm" : "border-slate-200"} text-slate-700`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <TbMapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate text-sm">{locLoading ? "Loading…" : locName ?? "Select a location"}</span>
              </span>
              <TbChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <div className="absolute z-30 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto">
                {locError && <p className="px-4 py-3 text-xs text-red-500">{locError}</p>}
                {!locError && locations.length === 0 && <p className="px-4 py-3 text-xs text-slate-400">No locations found</p>}
                {locations.map((loc) => {
                  const name = loc.name ?? loc.location_name ?? `Location ${loc.id}`;
                  const active = selectedLoc?.id === loc.id;
                  return (
                    <button key={loc.id} type="button"
                      onClick={() => { setSelectedLoc(loc); setDropOpen(false); }}
                      className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                        ${active ? "bg-sky-50 text-sky-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <span>{name}</span>
                      {active && <MdCheckCircle className="w-4 h-4 text-sky-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Year + Count */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
              min={2000} max={2100} disabled={success}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium bg-white
                         focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Count <span className="text-slate-300 normal-case font-normal">(max 500)</span>
            </label>
            <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))}
              min={1} max={500} disabled={success}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium bg-white
                         focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all" />
          </div>
        </div>

        {/* Type toggles */}
        <div className="mb-4">
          <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Type</label>
          <div className="flex gap-2 sm:gap-3">
            {QR_TYPES.map(({ key, label, Icon, accent, bg, border }) => {
              const active = qrType === key;
              return (
                <button key={key} type="button" disabled={success} onClick={() => setQrType(key)}
                  className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={active
                    ? { background: bg, borderColor: border, color: accent, boxShadow: `0 0 0 3px ${bg}` }
                    : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                >
                  <Icon className="w-4 h-4" style={{ color: active ? accent : undefined }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
            <span className="text-red-400 text-sm shrink-0 mt-0.5">⚠</span>
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Generate / Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {!success ? (
            <button onClick={handleGenerate} disabled={!isValid || loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              style={{ background: activeType.accent }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
              ) : (
                <><TbQrcode className="w-4 h-4" />Generate {count} {activeType.label} QR Codes</>
              )}
            </button>
          ) : (
            /* In-form New Batch — solid + pulsing */
            <button onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-all animate-pulse"
              style={{ background: activeType.accent }}>
              <TbRefresh className="w-4 h-4" /> New Batch
            </button>
          )}

          {selectedLoc && !success && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold flex-wrap">
              <TbMapPin className="w-3.5 h-3.5 shrink-0" style={{ color: activeType.accent }} />
              <span className="truncate max-w-[120px] sm:max-w-none">{locName}</span>
              <span className="text-slate-300">·</span>
              <span className="capitalize" style={{ color: activeType.accent }}>{qrType}</span>
              <span className="text-slate-300">·</span>
              {year}
            </div>
          )}
        </div>
      </div>

      {/* ── QR Table ── */}
      {success && qrItems.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Table header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: activeType.accent }} />
              <h2 className="text-slate-800 font-extrabold text-sm sm:text-base">
                {qrItems.length} {activeType.label} QR Codes
              </h2>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">— {locName} · {year}</span>
            </div>
            <button onClick={downloadAll}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: activeType.accent }}>
              <TbDownload className="w-3.5 h-3.5" /> Download All ({qrItems.length})
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">QR</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 w-20">Type</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item, i) => (
                  <QRTableRow
                    key={i}
                    item={item}
                    globalIndex={(currentPage - 1) * PAGE_SIZE + i}
                    qrType={qrType}
                    locationId={selectedLoc?.id}
                    onPreview={(code) => setPreviewCode(code)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium order-2 sm:order-1">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, qrItems.length)} of {qrItems.length}
              </p>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <TbChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="w-8 text-center text-slate-300 text-xs">…</span>
                    ) : (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                        style={currentPage === p
                          ? { background: activeType.accent, color: "#fff" }
                          : { border: "1px solid #e2e8f0", color: "#64748b" }}>
                        {p}
                      </button>
                    )
                  )}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <TbChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!success && !loading && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 sm:p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <TbQrcode className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">QR codes will appear here</p>
          <p className="text-slate-300 text-xs mt-1">Select a location and fill in the form above</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 sm:p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-100 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Generating QR codes…</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewCode && (
        <QRModal
          code={previewCode}
          qrType={qrType}
          locationId={selectedLoc?.id}
          onClose={() => setPreviewCode(null)}
        />
      )}
    </div>
  );
}