// src/pages/wildPage/VesselRegistryPage.jsx
import React, { useState } from "react";
import AppLayout from "../../components/wildLayout/AppLayout";
import Modal from "../../components/wildCommon/Modal";
import VesselOwnerRegistry from "../../components/wildCapture/VesselOwnerRegistry";
import {
  vesselOwner,
  vessel,
} from "../../data/wildCaptureMock";

// for now just one record; later make this an array from API
const rows = [
  {
    id: vesselOwner.ownerId,
    owner: vesselOwner,
    vessel,
  },
];

export default function VesselRegistryPage() {
  const [selected, setSelected] = useState(null);

  const handleOpen = (row) => setSelected(row);
  const handleClose = () => setSelected(null);

  return (
    <AppLayout>
      {/* List of vessels (small cards / rows) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Vessel Registry
            </p>
            <p className="text-[11px] text-slate-500">
              Select a vessel to view full owner & registry details.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => handleOpen(row)}
              className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {row.vessel.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {row.vessel.vesselId} · Reg: {row.vessel.registrationNo}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>
                  Owner:{" "}
                  <span className="font-semibold text-slate-900">
                    {row.owner.ownerName}
                  </span>
                </p>
                <p>
                  Port:{" "}
                  <span className="font-semibold text-slate-900">
                    {row.vessel.homePortCode} – {row.vessel.homePortLabel}
                  </span>
                </p>
              </div>
            </button>
          ))}

          {rows.length === 0 && (
            <p className="text-[11px] text-slate-400 py-6 text-center">
              No vessels found.
            </p>
          )}
        </div>
      </div>

      {/* Detail modal – same style as Trip details modal */}
      <Modal
        open={!!selected}
        onClose={handleClose}
        title="Vessel & Owner Details"
      >
        {selected && (
          <VesselOwnerRegistry
            owner={selected.owner}
            vessel={selected.vessel}
          />
        )}
      </Modal>
    </AppLayout>
  );
}
