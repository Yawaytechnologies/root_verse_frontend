// src/modules/admin/wild-capture/pages/AdminQrGenerator.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import {
  FiCopy,
  FiRefreshCcw,
  FiAlertTriangle,
  FiEye,
  FiDownload,
} from "react-icons/fi";

import {
  setType,
  setCount,
  setSelectedCode,
  clearError,
} from "../../../redux/reducer/qrSlice";
import { reserveBulkQrs } from "../../../redux/action/qrActions";

const TYPES = [{ value: "VESSEL", label: "Vessel" }];

export default function AdminQrGenerator() {
  const dispatch = useDispatch();

  const qr = useSelector((s) => s.qr) || {};
  const {
    loading = false,
    error = null,
    type = "VESSEL",
    count = "",
    lastBatch = [],
    selectedCode = "",
    lastBatchMeta = null,
  } = qr;

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
    if (!Number.isInteger(n) || n <= 0) {
      alert("Enter a valid count (1, 2, 10, 50...)");
      return;
    }
    dispatch(reserveBulkQrs({ type, count: String(n) }));
  };

  // ✅ Download whole batch as PDF (ONE QR PER PAGE + NO COLLAPSE TEXT)
  const downloadBatchPdf = async () => {
    if (!lastBatch?.length) return alert("No batch available. Generate first.");

    // if huge, warn
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
        doc.text(`Type: ${type}`, margin, margin + 7);
        doc.text(`Generated: ${now.toLocaleString()}`, margin, margin + 13);
        doc.text(`Item: ${idx}/${total}`, margin, margin + 19);

        doc.setFontSize(10);
        doc.text(`Page: ${idx}`, pageW - margin, margin + 19, { align: "right" });

        // divider
        doc.setDrawColor(230, 233, 238);
        doc.setLineWidth(0.4);
        doc.line(margin, margin + 23, pageW - margin, margin + 23);
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

        // big QR box
        const qrSize = 110; // mm
        const qrX = (pageW - qrSize) / 2;
        const qrY = margin + 32;

        const dataUrl = await QRCodeLib.toDataURL(code, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 512,
        });

        // card border behind QR + text
        const cardW = Math.min(pageW - margin * 2, 160);
        const cardX = (pageW - cardW) / 2;
        const cardY = qrY - 10;
        const cardH = Math.min(pageH - cardY - margin, qrSize + 60);

        doc.setDrawColor(230, 233, 238);
        doc.setLineWidth(0.5);
        doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4);

        // QR image
        doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        // Code label (wrap properly, never overlap)
        const maxTextW = cardW - 16;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        const codeLines = doc.splitTextToSize(code, maxTextW);
        let afterCodeY = centerTextLines(codeLines, qrY + qrSize + 14, 7, 12, true);

        // Meta info
        const metaLines = [
          `Status: ${status}`,
          `Created: ${created}`,
        ];
        afterCodeY += 2;
        centerTextLines(metaLines, afterCodeY, 6, 10, false);

        // footer hint
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("Scan to identify this asset in RootVerse", pageW / 2, pageH - margin, {
          align: "center",
        });
        doc.setTextColor(0);
      }

      const fileName = `qr-batch-${type}-${now.toISOString().slice(0, 10)}.pdf`;
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
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">QR Type</label>
                <select
                  value={type}
                  onChange={(e) => dispatch(setType(e.target.value))}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
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
              <div className="mt-4 text-xs text-slate-600">
                Last batch:{" "}
                <span className="font-bold text-slate-900">{lastBatchMeta.count}</span> codes
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-400">No batch generated yet.</div>
            )}
          </div>

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
                  <th className="px-4 py-3 w-3/12 md:w-2/12 lg:w-2/12 text-right">
                    Actions
                  </th>
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
                          {it.type}
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
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
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
