// src/modules/admin/wild-capture/pages/AdminQrGenerator.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import { FiCopy, FiRefreshCcw, FiAlertTriangle, FiEye, FiDownload } from "react-icons/fi";

// ✅ adjust these paths if your store files live elsewhere
import {
  setCount,
  setLocationId,
  setMethodId,
  setSelectedCode,
  clearError,
  // (optional) setType,
} from "../../../redux/reducer/qrSlice";
import { reserveBulkQrs } from "../../../redux/action/qrActions";

const API_BASE = "https://rootverse-backend-5qoo.onrender.com";

// ✅ UI label vs payload value
const TYPE_UI_LABEL = "Wild-Capture";
const TYPE_VALUE = "WC";

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.locations)) return payload.locations;
  if (Array.isArray(payload.methods)) return payload.methods;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function locLabel(l) {
  const name = l?.name ?? l?.location_name ?? l?.locationName ?? "";
  const code = l?.code ?? l?.location_code ?? l?.locationCode ?? "";
  if (name && code) return `${name} (${code})`;
  return name || code || `Location #${l?.id ?? "—"}`;
}

function methodLabel(m) {
  const name = m?.method_name ?? m?.name ?? m?.methodName ?? "";
  const code = m?.code ?? m?.method_code ?? m?.methodCode ?? "";
  if (name && code) return `${name} (${code})`;
  return name || code || `Method #${m?.id ?? "—"}`;
}

export default function AdminQrGenerator() {
  const dispatch = useDispatch();

  const qr = useSelector((s) => s.qr) || {};
  const {
    loading = false,
    error = null,
    count = "",
    locationId = "",
    methodId = "",
    lastBatch = [],
    selectedCode = "",
    lastBatchMeta = null,
  } = qr;

  // dropdown data
  const [locations, setLocations] = useState([]);
  const [methods, setMethods] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);

  // fetch locations + methods
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setMetaLoading(true);
      setMetaError(null);

      try {
        const [locRes, mRes] = await Promise.all([
          fetch(`${API_BASE}/api/locations`),
          fetch(`${API_BASE}/api/fishing-methods`),
        ]);

        const locJson = await locRes.json().catch(() => null);
        const mJson = await mRes.json().catch(() => null);

        if (!locRes.ok) throw new Error(locJson?.message || "Failed to load locations");
        if (!mRes.ok) throw new Error(mJson?.message || "Failed to load fishing methods");

        const locs = normalizeList(locJson);
        const meths = normalizeList(mJson);

        if (!alive) return;

        setLocations(locs);
        setMethods(meths);

        // auto-select first
        if (!locationId && locs?.[0]?.id != null) dispatch(setLocationId(String(locs[0].id)));
        if (!methodId && meths?.[0]?.id != null) dispatch(setMethodId(String(meths[0].id)));

        // optional: force WC in store if you still keep type there
        // dispatch(setType(TYPE_VALUE));
      } catch (e) {
        if (!alive) return;
        setMetaError(e?.message || "Failed to load dropdowns");
      } finally {
        if (alive) setMetaLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // keep selectedCode valid
  useEffect(() => {
    if (!lastBatch?.length) return;
    const exists = selectedCode && lastBatch.some((x) => x.code === selectedCode);
    if (!exists) dispatch(setSelectedCode(lastBatch[lastBatch.length - 1].code));
  }, [lastBatch, selectedCode, dispatch]);

  const selected = useMemo(() => {
    if (!selectedCode) return null;
    return lastBatch.find((x) => x.code === selectedCode) || null;
  }, [lastBatch, selectedCode]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ✅");
    } catch {
      alert("Copy failed ❌");
    }
  };

  const onGenerate = () => {
    const n = Number(count);

    if (!locationId) return alert("Location is required");
    if (!methodId) return alert("Fishing method is required");

    if (!Number.isInteger(n) || n <= 0) {
      alert("Enter a valid count (1, 2, 10, 50...)");
      return;
    }

    // ✅ send WC always
    dispatch(
      reserveBulkQrs({
        type: TYPE_VALUE,
        count: String(n),
        locationId,
        methodId,
      })
    );
  };

  const downloadBatchPdf = async () => {
    if (!lastBatch?.length) return alert("No batch available. Generate first.");

    if (lastBatch.length > 300) {
      const ok = window.confirm(
        `This batch has ${lastBatch.length} QRs. This may take time. Continue?`
      );
      if (!ok) return;
    }

    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;

      const now = new Date();
      const title = "RootVerse • QR Batch";

      const drawHeader = (idx, total) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(title, margin, margin);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Type: ${TYPE_UI_LABEL} (${TYPE_VALUE})`, margin, margin + 7);
        doc.text(`Location ID: ${locationId || "—"}`, margin, margin + 13);
        doc.text(`Method ID: ${methodId || "—"}`, margin, margin + 19);

        doc.setFontSize(10);
        doc.text(`Item: ${idx}/${total}`, margin, margin + 25);
        doc.text(`Page: ${idx}`, pageW - margin, margin + 25, { align: "right" });

        doc.setDrawColor(230, 233, 238);
        doc.setLineWidth(0.4);
        doc.line(margin, margin + 29, pageW - margin, margin + 29);
      };

      const centerTextLines = (lines, yStart, lineHeight = 6, fontSize = 12, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(fontSize);

        const cx = pageW / 2;
        let y = yStart;
        for (const line of lines) {
          doc.text(String(line), cx, y, { align: "center" });
          y += lineHeight;
        }
        return y;
      };

      for (let i = 0; i < lastBatch.length; i++) {
        if (i > 0) doc.addPage();

        const it = lastBatch[i] || {};
        const code = String(it.code ?? "");
        const status = String(it.status ?? "—");
        const created = it.created_at ? new Date(it.created_at).toLocaleString() : "—";

        drawHeader(i + 1, lastBatch.length);

        const qrSize = 110;
        const qrX = (pageW - qrSize) / 2;
        const qrY = margin + 40;

        const dataUrl = await QRCodeLib.toDataURL(code, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 512,
        });

        const cardW = Math.min(pageW - margin * 2, 160);
        const cardX = (pageW - cardW) / 2;
        const cardY = qrY - 10;
        const cardH = Math.min(pageH - cardY - margin, qrSize + 60);

        doc.setDrawColor(230, 233, 238);
        doc.setLineWidth(0.5);
        doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4);

        doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        const maxTextW = cardW - 16;
        const codeLines = doc.splitTextToSize(code, maxTextW);
        let afterCodeY = centerTextLines(codeLines, qrY + qrSize + 14, 7, 12, true);

        const metaLines = [`Status: ${status}`, `Created: ${created}`];
        afterCodeY += 2;
        centerTextLines(metaLines, afterCodeY, 6, 10, false);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("Scan to identify this asset in RootVerse", pageW / 2, pageH - margin, {
          align: "center",
        });
        doc.setTextColor(0);
      }

      const fileName = `qr-batch-${TYPE_VALUE}-${now.toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error(e);
      alert("PDF generation failed. Check console.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Admin QR Generator
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Reserve QR codes in bulk from backend. No delete. Backend continues numbering automatically.
            </p>
          </div>
        </div>

        {metaError && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <FiAlertTriangle className="mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Dropdown load failed</div>
                <div className="text-xs opacity-90">{metaError}</div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-amber-900 border border-amber-200 hover:bg-amber-100"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <div className="flex items-start gap-2">
              <FiAlertTriangle className="mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Failed</div>
                <div className="text-xs opacity-90">{error}</div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearError())}
                className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-rose-900 border border-rose-200 hover:bg-rose-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-12">
          {/* Left panel */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* ✅ Type read-only (Wild-Capture) */}
              <div>
                <label className="text-xs font-semibold text-slate-600">Type</label>
                <div className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 flex items-center">
                  <span className="font-semibold">{TYPE_UI_LABEL}</span>
                  <span className="ml-2 text-xs text-slate-500">({TYPE_VALUE})</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={count}
                  onChange={(e) => dispatch(setCount(e.target.value))}
                  placeholder="Enter count (eg: 10)"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Enter a new count every time. After generation, it resets.
                </p>
              </div>

              {/* Location dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-600">Location</label>
                <select
                  value={locationId}
                  onChange={(e) => dispatch(setLocationId(e.target.value))}
                  disabled={metaLoading || !locations.length}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none disabled:bg-slate-100"
                >
                  {!locations.length ? (
                    <option value="">{metaLoading ? "Loading locations..." : "No locations"}</option>
                  ) : (
                    <>
                      <option value="">Select location</option>
                      {locations.map((l) => (
                        <option key={l.id} value={String(l.id)}>
                          {locLabel(l)}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Method dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-600">Fishing Method</label>
                <select
                  value={methodId}
                  onChange={(e) => dispatch(setMethodId(e.target.value))}
                  disabled={metaLoading || !methods.length}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none disabled:bg-slate-100"
                >
                  {!methods.length ? (
                    <option value="">{metaLoading ? "Loading methods..." : "No methods"}</option>
                  ) : (
                    <>
                      <option value="">Select method</option>
                      {methods.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {methodLabel(m)}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGenerate}
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow
                  ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 active:scale-[0.98]"
                  }`}
              >
                <FiRefreshCcw className="h-4 w-4" />
                {loading ? "Generating..." : "Generate Batch"}
              </button>

              <button
                type="button"
                onClick={downloadBatchPdf}
                disabled={!lastBatch?.length}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow
                  ${
                    lastBatch?.length
                      ? "bg-white border border-slate-200 text-slate-900 hover:bg-slate-100"
                      : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <FiDownload className="h-4 w-4" />
                Download PDF
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <div className="font-bold">No delete policy</div>
              <div className="mt-1">
                This page never deletes QR codes. If you generate again, backend continues numbering.
              </div>
            </div>

            {lastBatchMeta?.count ? (
              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <div>
                  Last batch:{" "}
                  <span className="font-bold text-slate-900">{lastBatchMeta.count}</span> codes
                </div>
                <div>
                  Type: <span className="font-bold text-slate-900">{TYPE_UI_LABEL} (WC)</span>
                </div>
                <div>
                  Location ID: <span className="font-bold text-slate-900">{locationId || "—"}</span>
                </div>
                <div>
                  Method ID: <span className="font-bold text-slate-900">{methodId || "—"}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-400">No batch generated yet.</div>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Selected QR
                </div>
                <div className="mt-1 break-all text-lg font-extrabold text-slate-900">
                  {selectedCode || "—"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {selected?.created_at
                    ? `Created: ${new Date(selected.created_at).toLocaleString()}`
                    : "—"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Status:{" "}
                  <span className="font-semibold text-slate-800">
                    {selected?.status || "—"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Type: <span className="font-semibold text-slate-800">{TYPE_UI_LABEL} (WC)</span>
                  {"  "}•{"  "}
                  Location ID:{" "}
                  <span className="font-semibold text-slate-800">
                    {selected?.location_id ?? locationId ?? "—"}
                  </span>
                  {"  "}•{"  "}
                  Method ID:{" "}
                  <span className="font-semibold text-slate-800">
                    {selected?.method_id ?? methodId ?? "—"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedCode}
                onClick={() => copy(selectedCode)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm
                  ${
                    selectedCode
                      ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <FiCopy className="h-4 w-4" />
                Copy
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center rounded-2xl bg-slate-50 p-4 sm:p-6">
              {selectedCode ? (
                <div className="w-full max-w-[320px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                  <div className="flex justify-center">
                    <QRCode value={selectedCode} size={190} />
                  </div>
                  <div className="mt-3 text-center text-xs font-bold text-slate-800 break-all">
                    {selectedCode}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Generate a batch and select a code.</div>
              )}
            </div>
          </div>
        </div>

        {/* Batch table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Generated Batch</div>
            <div className="text-xs text-slate-500">
              Total codes in this batch:{" "}
              <span className="font-semibold text-slate-900">{lastBatch.length}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto md:overflow-x-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-slate-100">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3 w-7/12 md:w-6/12 lg:w-4/12">Code</th>
                  <th className="px-4 py-3 hidden md:table-cell md:w-2/12">Type</th>
                  <th className="px-4 py-3 w-2/12">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell lg:w-2/12">Created</th>
                  <th className="px-4 py-3 w-3/12 md:w-2/12 lg:w-2/12 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {lastBatch.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No data. Enter count and click “Generate Batch”.
                    </td>
                  </tr>
                ) : (
                  lastBatch.map((it) => (
                    <tr
                      key={it.id}
                      onClick={() => dispatch(setSelectedCode(it.code))}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        it.code === selectedCode ? "bg-amber-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 max-w-0">
                        <div className="truncate font-extrabold text-slate-900" title={it.code}>
                          {it.code}
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell max-w-0">
                        <div className="truncate text-sm text-slate-700" title={it.type}>
                          {it.type || TYPE_VALUE}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {it.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-700">
                        {it.created_at ? new Date(it.created_at).toLocaleString() : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => dispatch(setSelectedCode(it.code))}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                            aria-label="View"
                            title="View"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => copy(it.code)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                            aria-label="Copy"
                            title="Copy"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-200">
            Deleting is intentionally disabled. Backend continues after last reserved QR.
          </div>
        </div>
      </div>
    </div>
  );
}
