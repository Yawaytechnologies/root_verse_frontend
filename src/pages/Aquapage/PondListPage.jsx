// src/pages/Aquapage/PondListPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiDroplet, FiMapPin, FiActivity } from "react-icons/fi";

const ITEMS_PER_PAGE = 6;

const initialPonds = [
  {
    id: "RV-POND-01",
    name: "Pond A",
    species: "Vannamei",
    status: "Stocking",
    doc: 12,
    biomass: "0.9 T",
    survival: "98%",
  },
  {
    id: "RV-POND-02",
    name: "Pond B",
    species: "Black Tiger",
    status: "Grow-out",
    doc: 48,
    biomass: "3.1 T",
    survival: "93%",
  },
  {
    id: "RV-POND-03",
    name: "Pond C",
    species: "Tilapia",
    status: "Grow-out",
    doc: 72,
    biomass: "2.4 T",
    survival: "91%",
  },
  {
    id: "RV-POND-04",
    name: "Pond D",
    species: "Vannamei",
    status: "Ready for harvest",
    doc: 96,
    biomass: "4.0 T",
    survival: "89%",
  },
  {
    id: "RV-POND-05",
    name: "Pond E",
    species: "Vannamei",
    status: "Stocking",
    doc: 5,
    biomass: "0.3 T",
    survival: "99%",
  },
  {
    id: "RV-POND-06",
    name: "Pond F",
    species: "Black Tiger",
    status: "Pre-harvest sampling",
    doc: 88,
    biomass: "3.7 T",
    survival: "90%",
  },
  {
    id: "RV-POND-07",
    name: "Pond G",
    species: "Tilapia",
    status: "Grow-out",
    doc: 35,
    biomass: "1.6 T",
    survival: "94%",
  },
  {
    id: "RV-POND-08",
    name: "Pond H",
    species: "Vannamei",
    status: "Stocking",
    doc: 3,
    biomass: "0.2 T",
    survival: "99%",
  },
  {
    id: "RV-POND-09",
    name: "Pond I",
    species: "Black Tiger",
    status: "Grow-out",
    doc: 60,
    biomass: "2.9 T",
    survival: "92%",
  },
  {
    id: "RV-POND-10",
    name: "Pond J",
    species: "Vannamei",
    status: "Pre-harvest sampling",
    doc: 82,
    biomass: "3.5 T",
    survival: "90%",
  },
];

const statusClass = (status) => {
  if (status === "Ready for harvest")
    return "bg-emerald-50 text-emerald-800 border border-emerald-200";
  if (status === "Grow-out")
    return "bg-sky-50 text-sky-800 border border-sky-200";
  if (status === "Stocking")
    return "bg-amber-50 text-amber-800 border border-amber-200";
  if (status === "Pre-harvest sampling")
    return "bg-violet-50 text-violet-800 border border-violet-200";
  return "bg-slate-100 text-slate-800 border border-slate-200";
};

export default function PondListPage() {
  const navigate = useNavigate();
  const [ponds] = useState(initialPonds);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(ponds.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagePonds = ponds.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header WITHOUT Add Pond button */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Pond List
          </h1>
          <p className="text-xs text-slate-600">
            Overview of all active culture ponds registered for this farm.
          </p>
        </div>
      </div>

      {/* Pond cards (paginated) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pagePonds.map((pond) => (
          <div
            key={pond.id}
            className="rounded-2xl border border-sky-100 bg-white px-4 py-4 flex flex-col justify-between shadow-md h-full"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div>
                  <p className="text-xs text-slate-600">Pond ID</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {pond.id}
                  </p>
                </div>
                <div className="mt-1.5">
                  <p className="text-xs text-slate-600">Pond Name</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pond.name}
                  </p>
                </div>
                <div className="mt-1.5">
                  <p className="text-xs text-slate-600">Species</p>
                  <p className="text-sm text-slate-900 flex items-center gap-1">
                    <FiDroplet className="text-sky-600 text-[14px]" />
                    <span>{pond.species}</span>
                  </p>
                </div>
                <div className="mt-1.5">
                  <p className="text-xs text-slate-600">Status</p>
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 mt-0.5 text-[11px] font-medium " +
                      statusClass(pond.status)
                    }
                  >
                    <FiMapPin className="text-[12px]" />
                    {pond.status}
                  </span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <FiActivity className="text-sky-600 text-lg" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-md bg-sky-50 border border-sky-100 px-2 py-1.5">
                <p className="text-slate-600">DOC</p>
                <p className="text-slate-900 font-semibold">{pond.doc}</p>
              </div>
              <div className="rounded-md bg-sky-50 border border-sky-100 px-2 py-1.5">
                <p className="text-slate-600">Biomass</p>
                <p className="text-slate-900 font-semibold">
                  {pond.biomass}
                </p>
              </div>
              <div className="rounded-md bg-sky-50 border border-sky-100 px-2 py-1.5">
                <p className="text-slate-600">Survival</p>
                <p className="text-slate-900 font-semibold">
                  {pond.survival}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/aquaculture/ponds/${pond.id}`)}
              className="mt-4 w-full rounded-md border border-sky-400 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100 transition"
            >
              View Pond
            </button>
          </div>
        ))}
      </section>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`rounded-md border px-3 py-1 ${
                currentPage === 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className={`rounded-md border px-3 py-1 ${
                currentPage === totalPages
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
