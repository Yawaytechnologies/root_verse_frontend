import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamplingRecords } from "../../../redux/action/samplingActions";
import { clearSamplingError } from "../../../redux/reducer/samplingSlice";

const PAGE_SIZE = 8;

const SearchIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const EyeIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RefreshIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
    <path d="M3 16v5h5" />
    <path d="M3 12A9 9 0 0 1 18.4 5.6L21 8" />
    <path d="M21 8V3h-5" />
  </svg>
);

const CloseIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const formatDate = (value, withTime = false) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
};

const valueOrDash = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const labelize = (key) => {
  const map = {
    username: "User Name",
    owner_id: "Owner ID",

    farm_code: "Farm Code",
    farm_name: "Farm Name",

    pond_code: "Pond Code",
    pond_name: "Pond Name",
    qr_code: "Pond QR Code",

    culture_code: "Culture Code",

    sampling_date: "Sampling Date",
    DOC: "DOC",
    sample_count: "Sample Count",
    sample_weight: "Sample Weight",
    ABW: "ABW",
    count_kg: "Count / KG",
    total_pl_stock: "Total PL Stock",
    expected_biomass: "Expected Biomass",

    created_at: "Created At",
    updated_at: "Updated At",
  };

  return (
    map[key] ||
    key
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const displayValue = (key, value) => {
  if (key === "sampling_date") return formatDate(value);

  if (key === "created_at" || key === "updated_at") {
    return formatDate(value, true);
  }

  return valueOrDash(value);
};

const detailGroups = [
  {
    title: "Owner",
    fields: ["username", "owner_id"],
  },
  {
    title: "Farm",
    fields: ["farm_code", "farm_name"],
  },
  {
    title: "Pond",
    fields: ["pond_code", "pond_name", "qr_code"],
  },
  {
    title: "Culture",
    fields: ["culture_code"],
  },
  {
    title: "Sampling",
    fields: ["sampling_date", "DOC", "sample_count", "sample_weight"],
  },
  {
    title: "Growth / Biomass",
    fields: ["ABW", "count_kg", "total_pl_stock", "expected_biomass"],
  },
  {
    title: "System Info",
    fields: ["created_at", "updated_at"],
  },
];

export default function SamplingRecords() {
  const dispatch = useDispatch();

  const {
    records = [],
    loading = false,
    error = null,
    message = "",
  } = useSelector((state) => state.sampling || {});

  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSamplingRecords());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return records;

    return records.filter((record) => {
      const searchableValues = [
        record.username,
        record.owner_id,

        record.farm_code,
        record.farm_name,

        record.pond_code,
        record.pond_name,
        record.qr_code,

        record.culture_code,

        record.sampling_date,
        record.DOC,
        record.sample_count,
        record.sample_weight,
        record.ABW,
        record.count_kg,
        record.total_pl_stock,
        record.expected_biomass,
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, safePage]);

  const showingStart =
    filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;

  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

  const handleRefresh = () => {
    dispatch(fetchSamplingRecords());
  };

  return (
    <section className="w-full px-3 py-3 text-[13px] sm:px-4 lg:px-6 [&_button]:text-[12px] [&_input]:text-[13px] [&_td]:text-[13px] [&_th]:text-[10px]">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
                <span className="text-base font-black">S</span>
              </div>

              <div>
                <h2 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                  Sampling List
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredRecords.length} record
                  {filteredRecords.length === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh"
              >
                <RefreshIcon
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="relative w-full lg:max-w-md">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search farm, pond, culture, pond QR..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700 sm:mx-5">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => dispatch(clearSamplingError())}
                className="font-semibold text-red-600 hover:text-red-800"
              >
                Close
              </button>
            </div>
          )}

          {!error && message && records.length > 0 && (
            <div className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] font-medium text-emerald-700 sm:mx-5">
              {message}
            </div>
          )}

          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      Farm
                    </th>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      Pond
                    </th>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      Culture
                    </th>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      Pond QR
                    </th>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      Sampling Date
                    </th>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-[0.18em] text-slate-400">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        {Array.from({ length: 6 }).map((__, cellIndex) => (
                          <td key={cellIndex} className="px-5 py-4">
                            <div className="h-4 w-full max-w-28 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedRecords.length > 0 ? (
                    paginatedRecords.map((record, index) => (
                      <tr
                        key={`${record.farm_code}-${record.pond_code}-${record.qr_code}-${index}`}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">
                            {valueOrDash(record.farm_code)}
                          </div>

                          <div className="mt-0.5 max-w-[180px] truncate text-[11px] font-medium text-slate-400">
                            {valueOrDash(record.farm_name)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-700">
                            {valueOrDash(record.pond_code)}
                          </div>

                          <div className="mt-1 text-[11px] font-medium text-slate-400">
                            {valueOrDash(record.pond_name)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                            {valueOrDash(record.culture_code)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                            {valueOrDash(record.qr_code)}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {formatDate(record.sampling_date)}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-600"
                          >
                            <EyeIcon />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center">
                        <p className="text-sm font-bold text-slate-700">
                          No sampling records found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try refreshing or changing the search text.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 p-3 lg:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="mt-3 h-3.5 w-full animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              ))
            ) : paginatedRecords.length > 0 ? (
              paginatedRecords.map((record, index) => (
                <div
                  key={`${record.farm_code}-${record.pond_code}-${record.qr_code}-${index}`}
                  className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Farm
                      </p>

                      <h3 className="mt-1 break-all text-sm font-bold text-slate-900">
                        {valueOrDash(record.farm_code)}
                      </h3>

                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        {valueOrDash(record.farm_name)}
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                      Pond QR: {valueOrDash(record.qr_code)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Pond
                      </p>

                      <p className="mt-1 break-all text-[13px] font-bold text-slate-800">
                        {valueOrDash(record.pond_code)}
                      </p>

                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        {valueOrDash(record.pond_name)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Culture
                      </p>

                      <p className="mt-1 text-[13px] font-bold text-slate-800">
                        {valueOrDash(record.culture_code)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-[13px] font-bold text-slate-800">
                        {formatDate(record.sampling_date)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-600"
                  >
                    <EyeIcon />
                    View Full Details
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center">
                <p className="text-sm font-bold text-slate-700">
                  No sampling records found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try refreshing or changing the search text.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">{showingStart}</span>{" "}
              to <span className="font-bold text-slate-800">{showingEnd}</span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {filteredRecords.length}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-500">
                    Sampling Details
                  </p>

                  <h3 className="mt-1 text-lg font-black text-slate-950">
                    Sampling Record
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                      Pond QR: {valueOrDash(selectedRecord.qr_code)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      Farm: {valueOrDash(selectedRecord.farm_code)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      Pond: {valueOrDash(selectedRecord.pond_code)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
              <div className="space-y-4">
                {detailGroups.map((group, groupIndex) => (
                  <section
                    key={group.title}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white">
                          {groupIndex + 1}
                        </span>

                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                          {group.title}
                        </h4>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                        {group.fields.length} fields
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                      {group.fields.map((key) => (
                        <div
                          key={key}
                          className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            {labelize(key)}
                          </p>

                          <p className="mt-1.5 break-words text-[13px] font-bold text-slate-900">
                            {displayValue(key, selectedRecord[key])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}