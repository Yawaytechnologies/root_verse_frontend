// src/modules/aquaculture/pages/CrateAquaQrGenerator.jsx
// Adjust path only if your folder location is different.

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearCrateQrAquaBatch,
  clearCrateQrAquaStatus,
  selectCrateQrAquaCreateError,
  selectCrateQrAquaCreateLoading,
  selectCrateQrAquaDistricts,
  selectCrateQrAquaDistrictsError,
  selectCrateQrAquaDistrictsLoading,
  selectCrateQrAquaQrs,
  selectSelectedCrateQrAqua,
  setSelectedCrateQrAqua,
} from "../../../redux/reducer/crateQrAquaSlice";

import {
  createCrateQrAquaBatch,
  fetchCrateQrAquaDistricts,
} from "../../../redux/action/crateQrAquaActions";

import { Eye, Download, RefreshCw, Copy } from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export default function CrateAquaQrGenerator() {
  const dispatch = useDispatch();

  const districts = useSelector(selectCrateQrAquaDistricts);
  const districtsLoading = useSelector(selectCrateQrAquaDistrictsLoading);
  const districtsError = useSelector(selectCrateQrAquaDistrictsError);

  const qrs = useSelector(selectCrateQrAquaQrs);
  const createLoading = useSelector(selectCrateQrAquaCreateLoading);
  const createError = useSelector(selectCrateQrAquaCreateError);

  const selected = useSelector(selectSelectedCrateQrAqua);

  const [districtId, setDistrictId] = useState("");
  const [count, setCount] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCrateQrAquaDistricts());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [qrs.length]);

  const canGenerate = useMemo(() => {
    const c = Number(count);
    return districtId && Number.isFinite(c) && c > 0 && c <= 500;
  }, [districtId, count]);

  const getQrCode = (qr) => {
    return qr?.code || qr?.qr_code || qr?.qrs_code || "";
  };

  const districtLabel = (d) => {
    const name = d?.name || d?.district_name || "District";
    const code = d?.district_code || d?.code || "";
    const state = d?.state_name || "";
    const country = d?.country_code || "";

    return [name, code ? `(${code})` : "", state, country]
      .filter(Boolean)
      .join(" • ");
  };

  const makeQrDataUrl = async (code, size = 800) => {
    return await QRCode.toDataURL(code, {
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  };

  const downloadDataUrl = (dataUrl, filename) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onGenerate = async () => {
    dispatch(clearCrateQrAquaStatus());

    const c = Number(count);
    const did = Number(districtId);

    if (!did || !c) return;

    await dispatch(
      createCrateQrAquaBatch({
        count: c,
        districtId: did,
      })
    );

    setCount("");
  };

  const onClearAll = () => {
    dispatch(clearCrateQrAquaBatch());
    setDistrictId("");
    setCount("");
    setPage(1);
  };

  const openPreview = async (qr) => {
    const code = getQrCode(qr);
    if (!code) return;

    setPreviewLoading(true);

    try {
      const url = await makeQrDataUrl(code, 700);
      setPreviewUrl(url);
      setPreviewOpen(true);
      dispatch(setSelectedCrateQrAqua(qr));
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadSinglePng = async (qr, globalIndex) => {
    const code = getQrCode(qr);
    if (!code) return;

    const url = await makeQrDataUrl(code, 900);
    downloadDataUrl(url, `AQUA_QR_${globalIndex + 1}.png`);
  };

  const downloadAllPdf = async () => {
    if (!qrs.length) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageW = 210;
    const pageH = 297;
    const margin = 15;

    const qrSize = Math.min(pageW - margin * 2, pageH - margin * 2);
    const x = (pageW - qrSize) / 2;
    const y = (pageH - qrSize) / 2;

    for (let i = 0; i < qrs.length; i++) {
      const code = getQrCode(qrs[i]);
      if (!code) continue;

      const img = await makeQrDataUrl(code, 900);

      if (i > 0) doc.addPage();

      doc.addImage(img, "PNG", x, y, qrSize, qrSize);
    }

    doc.save(`crate_aqua_qrs_${Date.now()}.pdf`);
  };

  const copySelectedCode = async () => {
    const code = getQrCode(selected);
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  };

  const selectedCode = getQrCode(selected);

  const totalPages = Math.max(1, Math.ceil(qrs.length / ITEMS_PER_PAGE));
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageItems = qrs.slice(startIdx, endIdx);

  const gotoPrev = () => setPage((p) => Math.max(1, p - 1));
  const gotoNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="rounded-3xl border border-slate-200/80 bg-white/75 backdrop-blur shadow-[0_12px_40px_-28px_rgba(2,6,23,0.35)] overflow-hidden">
        <div className="px-5 md:px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-emerald-50/70 via-white/60 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                Crate QR Generator
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Reserve aquaculture crate QRs in bulk. Backend continues
                numbering.
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchCrateQrAquaDistricts())}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {(districtsError || createError) && (
            <div className="mt-4 space-y-2">
              {districtsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                  <div className="font-semibold text-red-800">
                    District Error
                  </div>
                  <div className="mt-1 text-red-700/90">{districtsError}</div>
                </div>
              )}

              {createError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                  <div className="font-semibold text-red-800">
                    Create Error
                  </div>
                  <div className="mt-1 text-red-700/90">{createError}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-5">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Type">
                <input
                  value="Aquaculture (A)"
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
                />
              </Field>

              <Field label="Count">
                <input
                  value={count}
                  onChange={(e) =>
                    setCount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="10"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Max 500 per batch.
                </p>
              </Field>

              <Field label="District">
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  disabled={districtsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"
                >
                  <option value="">
                    {districtsLoading
                      ? "Loading districts..."
                      : "Select district"}
                  </option>

                  {districts.map((d) => (
                    <option key={String(d.id)} value={String(d.id)}>
                      {districtLabel(d)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate || createLoading}
                className={[
                  "w-full sm:w-auto rounded-2xl px-6 py-3 text-sm font-semibold text-white transition",
                  "shadow-[0_12px_28px_-18px_rgba(16,185,129,0.85)]",
                  "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600",
                  "hover:brightness-110 active:scale-[0.99]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-100",
                ].join(" ")}
              >
                {createLoading ? "Generating..." : "Generate Batch"}
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Clear
              </button>

              <div className="flex-1" />
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-semibold">No delete policy</div>
              <div className="mt-1 text-amber-900/80">
                If you generate again, backend continues numbering.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Generated Batch
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {qrs.length
                    ? `${qrs.length} QR(s) generated`
                    : "No QRs generated yet"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={copySelectedCode}
                  disabled={!selectedCode}
                  className="min-w-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                  title="Copy raw code"
                >
                  <Copy className="h-4 w-4 shrink-0" />
                  <span className="truncate whitespace-nowrap">Copy</span>
                </button>

                <button
                  type="button"
                  onClick={downloadAllPdf}
                  disabled={!qrs.length}
                  className="min-w-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                  title="Download all QRs as PDF"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span className="truncate whitespace-nowrap">
                    Download PDF
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
              {qrs.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Generate a batch to see QRs here.
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-3 p-3">
                    {pageItems.map((qr, idx) => {
                      const globalIdx = startIdx + idx;
                      const qrCode = getQrCode(qr);
                      const active = selectedCode && selectedCode === qrCode;

                      return (
                        <div
                          key={qrCode || qr.id || globalIdx}
                          className={[
                            "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                            active
                              ? "ring-2 ring-emerald-200 bg-emerald-50/40"
                              : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                QR {globalIdx + 1}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                ID: {qr.id || "—"}
                              </div>
                            </div>

                            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                              {qr.status || "—"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => openPreview(qr)}
                              className="min-w-0 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4 shrink-0" />
                              <span className="truncate whitespace-nowrap">
                                View
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadSinglePng(qr, globalIdx)}
                              className="min-w-0 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              <Download className="h-4 w-4 shrink-0" />
                              <span className="truncate whitespace-nowrap">
                                Download
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <th className="px-4 py-3">QR</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200">
                        {pageItems.map((qr, idx) => {
                          const globalIdx = startIdx + idx;
                          const qrCode = getQrCode(qr);
                          const active = selectedCode && selectedCode === qrCode;

                          return (
                            <tr
                              key={qrCode || qr.id || globalIdx}
                              className={
                                active
                                  ? "bg-emerald-50/60"
                                  : "hover:bg-slate-50"
                              }
                            >
                              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                QR {globalIdx + 1}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-700">
                                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold">
                                  {qr.status || "—"}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                {qr.id || "—"}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openPreview(qr)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadSinglePng(qr, globalIdx)
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {qrs.length > 0 && (
                    <div className="px-3 pb-3">
                      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-600">
                          Showing {startIdx + 1}–
                          {Math.min(endIdx, qrs.length)} of {qrs.length}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={gotoPrev}
                            disabled={page === 1}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                          >
                            Prev
                          </button>

                          <div className="text-sm font-semibold text-slate-700">
                            {page} / {totalPages}
                          </div>

                          <button
                            type="button"
                            onClick={gotoNext}
                            disabled={page === totalPages}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {previewOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4 flex items-center justify-center">
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  QR Preview
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewOpen(false);
                    setPreviewUrl("");
                  }}
                  className="text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-center">
                {previewLoading ? (
                  <div className="text-sm text-slate-500">Loading...</div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="QR"
                    className="w-[320px] h-[320px] object-contain"
                  />
                ) : (
                  <div className="text-sm text-slate-500">No preview</div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="flex-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}