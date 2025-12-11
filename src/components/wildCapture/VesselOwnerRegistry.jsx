// src/pages/wildCapture/VesselOwnerRegistry.jsx
import React from "react";
import {
  vesselOwner as defaultOwner,
  vessel as defaultVessel,
  legends,
} from "../../data/wildCaptureMock";

const badgeClass =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium";

export default function VesselOwnerRegistry({
  owner = defaultOwner,
  vessel = defaultVessel,
}) {
  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-900">
          Vessel Owner Registry
        </h1>
        <p className="text-[11px] text-slate-500">
          Read-only owner + vessel details, maintained by admin.
        </p>
      </div>

      {/* Owner + Vessel cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Owner card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Owner
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {owner.ownerName}
              </p>
              <p className="text-[11px] text-slate-500">
                Vessel Owner ID:{" "}
                <span className="font-mono font-semibold">
                  {owner.ownerId}
                </span>
              </p>
            </div>
            <span
              className={`${badgeClass} bg-emerald-50 text-emerald-700 border border-emerald-100`}
            >
              {owner.kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Contact Number
              </p>
              <p className="text-sm text-slate-900">
                {owner.contactNumber}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">E-mail</p>
              <p className="text-sm text-slate-900 break-all">
                {owner.email}
              </p>
            </div>
          </div>

          <div className="text-xs">
            <p className="text-[11px] font-medium text-slate-500">Address</p>
            <p className="text-sm text-slate-900 leading-snug">
              {owner.address}
            </p>
          </div>

          <div className="text-xs">
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Linked Vessels
            </p>
            <div className="flex flex-wrap gap-2">
              {(owner.linkedVessels || []).map((id) => (
                <span
                  key={id}
                  className={`${badgeClass} bg-slate-50 text-slate-700 border border-slate-200`}
                >
                  {id}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              (System-generated list of vessel IDs owned by the person)
            </p>
          </div>
        </div>

        {/* Vessel card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Vessel Registry
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {vessel.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Vessel ID:{" "}
                <span className="font-mono font-semibold">
                  {vessel.vesselId}
                </span>
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p className="font-medium">
                Type:{" "}
                <span className="font-semibold text-slate-900">
                  {vessel.typeCode} – {vessel.typeLabel}
                </span>
              </p>
              <p>
                Home Port:{" "}
                <span className="font-semibold text-slate-900">
                  {vessel.homePortCode} – {vessel.homePortLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Registration No.
              </p>
              <p className="text-sm text-slate-900">
                {vessel.registrationNo}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Fishing License No.
              </p>
              <p className="text-sm text-slate-900">
                {vessel.fishingLicenseNo}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Crew Capacity (Max)
              </p>
              <p className="text-sm text-slate-900">
                {vessel.crewCapacityMax}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Storage Capacity (kg)
              </p>
              <p className="text-sm text-slate-900">
                {vessel.storageCapacityKg.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Engine Power (HP)
              </p>
              <p className="text-sm text-slate-900">
                {vessel.enginePowerHp}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Fuel Type
              </p>
              <p className="text-sm text-slate-900">{vessel.fuelType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legends section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
          Code Legends
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Vessel Type */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Vessel Type
            </p>
            <ul className="space-y-1">
              {legends.vesselType.map((item) => (
                <li key={item.code} className="flex gap-2">
                  <span className="font-mono text-slate-900 w-6">
                    {item.code}
                  </span>
                  <span className="text-slate-800">
                    {item.en}{" "}
                    <span className="text-slate-500">/ {item.ta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Home Port */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Home Port
            </p>
            <ul className="space-y-1">
              {legends.homePort.map((item) => (
                <li key={item.code} className="flex gap-2">
                  <span className="font-mono text-slate-900 w-6">
                    {item.code}
                  </span>
                  <span className="text-slate-800">
                    {item.en}{" "}
                    <span className="text-slate-500">/ {item.ta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Species */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Species Codes
            </p>
            <ul className="space-y-1">
              {legends.species.map((item) => (
                <li key={item.code} className="flex gap-2">
                  <span className="font-mono text-slate-900 w-10">
                    {item.code}
                  </span>
                  <span className="text-slate-800">{item.en}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fishing Method */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1">
              Fishing Methods
            </p>
            <ul className="space-y-1">
              {legends.method.map((item) => (
                <li key={item.code} className="flex gap-2">
                  <span className="font-mono text-slate-900 w-6">
                    {item.code}
                  </span>
                  <span className="text-slate-800">{item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
