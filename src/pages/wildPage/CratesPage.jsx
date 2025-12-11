// src/pages/wildPage/CratesPage.jsx
import React, { useState } from "react";
import AppLayout from "../../components/wildLayout/AppLayout";
import Modal from "../../components/wildCommon/Modal";
import CrateDetails from "../../components/wildCapture/CrateDetails";
import { crates as initialCrates } from "../../data/wildCaptureMock";

export default function CratesPage() {
  const [crates] = useState(initialCrates); // read-only for now, admin controlled
  const [selectedCrate, setSelectedCrate] = useState(null);

  const handleOpen = (crate) => setSelectedCrate(crate);
  const handleClose = () => setSelectedCrate(null);

  return (
    <AppLayout>
      {/* Main card with small list view */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Crate Registry
            </p>
            <p className="text-[11px] text-slate-500">
              System-managed crates with capacity, status and last usage.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Total crates:{" "}
            <span className="font-semibold text-slate-900">
              {crates.length}
            </span>
          </p>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {crates.map((crate) => (
            <button
              key={crate.crateId}
              type="button"
              onClick={() => handleOpen(crate)}
              className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {crate.label || crate.crateId}
                </p>
                <p className="text-[11px] text-slate-500">
                  {crate.crateId} · QR: {crate.qrCode}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <p>
                  Size / Capacity:{" "}
                  <span className="font-semibold text-slate-900">
                    {crate.sizeCode} ({crate.capacityKg} kg)
                  </span>
                </p>
                <p>
                  Status:{" "}
                  <span className="font-semibold text-slate-900">
                    {crate.status}
                  </span>
                </p>
                <p>
                  Current Trip:{" "}
                  <span className="font-semibold text-slate-900">
                    {crate.currentTripId || "—"}
                  </span>
                </p>
              </div>
            </button>
          ))}

          {crates.length === 0 && (
            <p className="text-[11px] text-slate-400 py-6 text-center">
              No crates found.
            </p>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selectedCrate}
        onClose={handleClose}
        title="Crate Details"
      >
        {selectedCrate && <CrateDetails crate={selectedCrate} />}
      </Modal>
    </AppLayout>
  );
}
