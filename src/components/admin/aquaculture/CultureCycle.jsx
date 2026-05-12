import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Search, RefreshCw, X, CalendarDays, Lock } from "lucide-react";

import {
  fetchAllCultureCycles,
  updateCultureCycleVerificationStatus,
} from "../../../redux/action/cultureCycleAction";

import {
  setSelectedCultureCycle,
  clearSelectedCultureCycle,
  clearCultureCycleMessages,
} from "../../../redux/reducer/culturalCycleSlice";

const STATUS_OPTIONS = ["PENDING", "ACTIVE"];

const formatDate = (value) => {
  if (!value) return "-";

  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return "-";
};

const normalizeStatus = (status) => {
  return String(status || "PENDING").trim().toUpperCase();
};

const statusClass = (status) => {
  const value = normalizeStatus(status);

  if (value === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getPondName = (cycle) => {
  return cycle?.pond_name || cycle?.pond?.pond_name || "-";
};

const getPondCode = (cycle) => {
  return cycle?.pond_code || cycle?.pond?.pond_id || cycle?.pond?.qrs_code || "-";
};

const getFarmName = (cycle) => {
  return cycle?.farm_name || cycle?.farm?.farm_name || "-";
};

const getFarmCode = (cycle) => {
  return cycle?.farm_code || cycle?.farm?.farm_id || cycle?.farm?.farm_qrs || "-";
};

const getSearchText = (cycle) => {
  return [
    cycle?.culture_code,
    cycle?.pond_name,
    cycle?.pond_code,
    cycle?.farm_name,
    cycle?.farm_code,
    cycle?.user?.username,
    cycle?.user?.phone_no,
    cycle?.pond?.pond_name,
    cycle?.pond?.pond_id,
    cycle?.farm?.farm_name,
    cycle?.farm?.farm_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const CultureCycleApproval = () => {
  const dispatch = useDispatch();

  const {
    cultureCycles,
    selectedCultureCycle,
    loading,
    updating,
    updatingId,
    error,
    successMessage,
  } = useSelector((state) => state.cultureCycleApproval);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllCultureCycles());
  }, [dispatch]);

  useEffect(() => {
    if (!error && !successMessage) return;

    const timer = setTimeout(() => {
      dispatch(clearCultureCycleMessages());
    }, 2500);

    return () => clearTimeout(timer);
  }, [dispatch, error, successMessage]);

  const filteredCycles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return cultureCycles || [];

    return (cultureCycles || []).filter((cycle) =>
      getSearchText(cycle).includes(query)
    );
  }, [cultureCycles, searchTerm]);

  const pendingCycles = useMemo(() => {
    return filteredCycles.filter(
      (cycle) => normalizeStatus(cycle?.verification_status) === "PENDING"
    );
  }, [filteredCycles]);

  const activeCycles = useMemo(() => {
    return filteredCycles.filter(
      (cycle) => normalizeStatus(cycle?.verification_status) === "ACTIVE"
    );
  }, [filteredCycles]);

  const handleStatusChange = async (id, newStatus) => {
    const result = await dispatch(
      updateCultureCycleVerificationStatus({
        id,
        newStatus,
        remarks:
          newStatus === "ACTIVE"
            ? "Verified by reviewer"
            : "Moved back to pending by reviewer",
      })
    );

    if (updateCultureCycleVerificationStatus.fulfilled.match(result)) {
      dispatch(fetchAllCultureCycles());
    }
  };

  return (
    <div className="w-full bg-slate-100 px-3 py-3 text-sm">
      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-500">
                Aquaculture Ops
              </p>

              <h1 className="mt-1 text-lg font-black text-slate-900">
                Culture Cycle Approval
              </h1>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Change pending culture cycles to active.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search code, pond, farm..."
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-sky-400 focus:bg-white sm:w-64"
                />
              </div>

              <button
                onClick={() => dispatch(fetchAllCultureCycles())}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-sky-500 px-3 text-xs font-black text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {(error || successMessage) && (
            <div
              className={`mt-3 rounded-xl border px-3 py-2 text-xs font-bold ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || successMessage}
            </div>
          )}
        </div>

        <CycleTable
          title="Pending Culture Cycles"
          badge="PENDING"
          count={pendingCycles.length}
          cycles={pendingCycles}
          loading={loading}
          updating={updating}
          updatingId={updatingId}
          onView={(cycle) => dispatch(setSelectedCultureCycle(cycle))}
          onStatusChange={handleStatusChange}
          type="pending"
        />

        <CycleTable
          title="Active Culture Cycles"
          badge="ACTIVE"
          count={activeCycles.length}
          cycles={activeCycles}
          loading={loading}
          updating={updating}
          updatingId={updatingId}
          onView={(cycle) => dispatch(setSelectedCultureCycle(cycle))}
          onStatusChange={handleStatusChange}
          type="active"
        />
      </div>

      {selectedCultureCycle && (
        <CycleDetailsModal
          cycle={selectedCultureCycle}
          updating={updating}
          updatingId={updatingId}
          onClose={() => dispatch(clearSelectedCultureCycle())}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

const CycleTable = ({
  title,
  badge,
  count,
  cycles,
  loading,
  updating,
  updatingId,
  onView,
  onStatusChange,
  type,
}) => {
  const isActiveTable = type === "active";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-black text-slate-900">{title}</h2>

          <p className="text-[11px] font-bold text-slate-500">
            {count} culture cycle{count === 1 ? "" : "s"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black ${
            isActiveTable
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {badge}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <Th>Culture / Pond</Th>
              <Th>Farm</Th>
              <Th>Period</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center">
                  <div className="mx-auto flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
                    <RefreshCw size={15} className="animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : cycles.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-xs font-bold text-slate-400"
                >
                  No culture cycles found.
                </td>
              </tr>
            ) : (
              cycles.map((cycle) => {
                const status = normalizeStatus(cycle?.verification_status);
                const isUpdatingThis =
                  updating && Number(updatingId) === Number(cycle.id);

                return (
                  <tr
                    key={cycle.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="max-w-[185px] truncate rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600">
                        {cycle?.culture_code || "-"}
                      </div>

                      <div className="mt-1.5 text-xs font-black text-slate-900">
                        {getPondName(cycle)}
                      </div>

                      <div className="mt-0.5 max-w-[190px] truncate font-mono text-[10px] font-bold text-slate-400">
                        {getPondCode(cycle)}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="max-w-[180px] truncate text-xs font-black text-slate-900">
                        {getFarmName(cycle)}
                      </div>

                      <div className="mt-0.5 max-w-[180px] truncate font-mono text-[10px] font-bold text-slate-400">
                        {getFarmCode(cycle)}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1 text-xs font-bold text-slate-700">
                        <DateCell label="Start" value={cycle?.start_date} />
                        <DateCell label="End" value={cycle?.end_date} />
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      {isActiveTable ? (
                        <span
                          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-black ${statusClass(
                            status
                          )}`}
                        >
                          <Lock size={13} />
                          {status}
                        </span>
                      ) : (
                        <select
                          value={status}
                          disabled={isUpdatingThis}
                          onChange={(event) =>
                            onStatusChange(cycle.id, event.target.value)
                          }
                          className={`h-8 rounded-lg border px-2.5 text-[11px] font-black outline-none ${statusClass(
                            status
                          )} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <button
                        onClick={() => onView(cycle)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[11px] font-black text-white hover:bg-sky-600"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Th = ({ children }) => {
  return (
    <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
      {children}
    </th>
  );
};

const DateCell = ({ label, value }) => {
  return (
    <div className="flex items-center gap-1.5">
      <CalendarDays size={13} className="text-sky-500" />
      <span className="text-[10px] text-slate-400">{label}:</span>
      <span className="text-[11px] text-slate-700">{formatDate(value)}</span>
    </div>
  );
};

const CycleDetailsModal = ({
  cycle,
  updating,
  updatingId,
  onClose,
  onStatusChange,
}) => {
  const status = normalizeStatus(cycle?.verification_status);
  const isPending = status === "PENDING";
  const isUpdatingThis = updating && Number(updatingId) === Number(cycle.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-5 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-500">
              Culture Cycle Details
            </p>

            <h3 className="mt-1 text-base font-black text-slate-900">
              {cycle?.culture_code || "-"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-5">
          <SectionTitle title="Basic Details" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Culture Code" value={cycle?.culture_code} />
            <DetailCard label="Status" value={status} />
            <DetailCard label="Start Date" value={formatDate(cycle?.start_date)} />
            <DetailCard label="End Date" value={formatDate(cycle?.end_date)} />
          </div>

          <SectionTitle title="Owner Details" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Owner Name" value={cycle?.user?.username} />
            <DetailCard label="Phone" value={cycle?.user?.phone_no} />
            <DetailCard label="Owner ID" value={cycle?.user?.owner_id} />
            <DetailCard label="Address" value={cycle?.user?.address} />
          </div>

          <SectionTitle title="Farm Details" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Farm Name" value={getFarmName(cycle)} />
            <DetailCard label="Farm Code" value={getFarmCode(cycle)} />
            <DetailCard label="Farm Area" value={cycle?.farm?.farm_area_acres ? `${cycle.farm.farm_area_acres} acres` : "-"} />
            <DetailCard label="Water Source" value={cycle?.farm?.water_source} />
            <DetailCard label="Farm Address" value={cycle?.farm?.address} />
            <DetailCard label="Farm Gate Latitude" value={cycle?.farm?.farm_gate_latitude} />
            <DetailCard label="Farm Gate Longitude" value={cycle?.farm?.farm_gate_longitude} />
          </div>

          <SectionTitle title="Pond Details" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Pond Name" value={getPondName(cycle)} />
            <DetailCard label="Pond Code" value={getPondCode(cycle)} />
            <DetailCard label="Pond Type" value={cycle?.pond?.pond_type} />
            <DetailCard label="Water Spread Area" value={cycle?.pond?.water_spread_area_acres ? `${cycle.pond.water_spread_area_acres} acres` : "-"} />
            <DetailCard label="Volume" value={cycle?.pond?.volume} />
            <DetailCard label="Pond GPS" value={cycle?.pond?.pond_gps} />
            <DetailCard label="Pond Status" value={cycle?.pond?.pond_status} />
            <DetailCard label="Pond Verification" value={cycle?.pond?.verification_status} />
          </div>

          <SectionTitle title="Images" />

          {cycle?.images?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cycle.images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={image.image_url}
                    alt={image.description || "Culture cycle"}
                    className="h-40 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-700">
                      {image.description || "No description"}
                    </p>

                    <p className="mt-1 break-all text-[10px] font-semibold text-slate-400">
                      {image.storage_path || image.image_url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-400">
              No images found.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          {isPending ? (
            <select
              value={status}
              disabled={isUpdatingThis}
              onChange={(event) => onStatusChange(cycle.id, event.target.value)}
              className={`h-9 rounded-lg border px-3 text-xs font-black outline-none ${statusClass(
                status
              )} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-black ${statusClass(
                status
              )}`}
            >
              <Lock size={14} />
              {status}
            </span>
          )}

          <button
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }) => {
  return (
    <h4 className="mb-3 mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 first:mt-0">
      {title}
    </h4>
  );
};

const DetailCard = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
};

export default CultureCycleApproval;