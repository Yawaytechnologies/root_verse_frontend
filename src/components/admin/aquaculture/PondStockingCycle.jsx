import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CalendarDays,
  Boxes,
  Hash,
  Fish,
  Table2,
  Eye,
  X,
} from "lucide-react";

import {
  fetchAllCultureCycles,
  fetchPondStockingByCultureCycleId,
} from "../../../redux/action/cultureCycleAction";

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

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  return number.toLocaleString("en-IN");
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
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

const PondStockingByCultureCycle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { culturecycleId } = useParams();

  const {
    cultureCycles,
    pondStocking,
    pondStockingLoading,
    pondStockingError,
    loading,
  } = useSelector((state) => state.cultureCycleApproval);

  const [selectedStocking, setSelectedStocking] = useState(null);

  const routedCycle = location.state?.cycle || null;

  const matchedCycle = useMemo(() => {
    if (routedCycle) return routedCycle;

    return (cultureCycles || []).find(
      (cycle) => Number(cycle.id) === Number(culturecycleId)
    );
  }, [cultureCycles, culturecycleId, routedCycle]);

  const stockingRows = useMemo(() => {
    return normalizeList(pondStocking);
  }, [pondStocking]);

  useEffect(() => {
    if (!cultureCycles?.length) {
      dispatch(fetchAllCultureCycles());
    }
  }, [dispatch, cultureCycles?.length]);

  useEffect(() => {
    if (culturecycleId) {
      dispatch(fetchPondStockingByCultureCycleId(culturecycleId));
    }
  }, [dispatch, culturecycleId]);

  const handleRefresh = () => {
    dispatch(fetchPondStockingByCultureCycleId(culturecycleId));
  };

  return (
    <div className="w-full bg-slate-100 px-3 py-3 text-sm">
      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                onClick={() =>
                  navigate("/admin/aqua-culture/culture-cycle-approval")
                }
                className="mb-3 inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                Pond Stocking
              </p>

              <h1 className="mt-1 text-lg font-black text-slate-900">
                Pond Stocking Details
              </h1>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Linked with culture cycle ID: {culturecycleId}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={pondStockingLoading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-sky-500 px-3 text-xs font-black text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={pondStockingLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="Culture Code"
              value={matchedCycle?.culture_code || "-"}
              icon={<Hash size={15} />}
            />

            <InfoCard
              label="Pond"
              value={`${getPondName(matchedCycle)} / ${getPondCode(matchedCycle)}`}
              icon={<Boxes size={15} />}
            />

            <InfoCard
              label="Farm"
              value={`${getFarmName(matchedCycle)} / ${getFarmCode(matchedCycle)}`}
              icon={<Fish size={15} />}
            />

            <InfoCard
              label="Cycle Period"
              value={`${formatDate(matchedCycle?.start_date)} - ${formatDate(
                matchedCycle?.end_date
              )}`}
              icon={<CalendarDays size={15} />}
            />
          </div>

          {pondStockingError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {pondStockingError}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Linked Pond Stocking
              </h2>

              <p className="text-[11px] font-bold text-slate-500">
                {stockingRows.length} record{stockingRows.length === 1 ? "" : "s"}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
              <Table2 size={13} />
              #{culturecycleId}
            </span>
          </div>

          <div className="block md:hidden">
            {pondStockingLoading || loading ? (
              <LoadingBlock text="Loading pond stocking..." />
            ) : !stockingRows.length ? (
              <EmptyBlock text="No pond stocking found for this culture cycle." />
            ) : (
              <div className="space-y-3 p-3">
                {stockingRows.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Species
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          {item.species || "-"}
                        </h3>

                        <p className="mt-1 truncate text-xs font-bold text-slate-500">
                          {item.hatchery || "-"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600">
                        ID #{item.id}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <MiniInfo
                        label="Stocking Date"
                        value={formatDate(item.stocking_date)}
                      />
                      <MiniInfo
                        label="Total PL Stocked"
                        value={formatNumber(item.total_PL_stocked)}
                      />
                    </div>

                    <button
                      onClick={() => setSelectedStocking(item)}
                      className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[11px] font-black text-white hover:bg-sky-600"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <Th>ID</Th>
                  <Th>Species</Th>
                  <Th>Hatchery</Th>
                  <Th>Stocking Date</Th>
                  <Th>Total PL</Th>
                  <Th>Action</Th>
                </tr>
              </thead>

              <tbody>
                {pondStockingLoading || loading ? (
                  <tr>
                    <td colSpan="6">
                      <LoadingBlock text="Loading pond stocking..." />
                    </td>
                  </tr>
                ) : !stockingRows.length ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyBlock text="No pond stocking found for this culture cycle." />
                    </td>
                  </tr>
                ) : (
                  stockingRows.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <Td>{item.id}</Td>
                      <Td strong>{item.species}</Td>
                      <Td>{item.hatchery}</Td>
                      <Td>{formatDate(item.stocking_date)}</Td>
                      <Td strong>{formatNumber(item.total_PL_stocked)}</Td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStocking(item)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[11px] font-black text-white hover:bg-sky-600"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedStocking && (
        <StockingDetailsModal
          item={selectedStocking}
          onClose={() => setSelectedStocking(null)}
        />
      )}
    </div>
  );
};

const StockingDetailsModal = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
              Pond Stocking Details
            </p>

            <h3 className="mt-1 truncate text-base font-black text-slate-900">
              {item?.species || "-"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Stocking ID" value={item?.id} />
            <DetailCard label="Culture Cycle ID" value={item?.culturecycle_id} />
            <DetailCard label="QR Code ID" value={item?.qr_code_id} />
            <DetailCard label="Species" value={item?.species} />
            <DetailCard label="Hatchery" value={item?.hatchery} />
            <DetailCard
              label="Batch Number"
              value={item?.hatchery_batch_number}
            />
            <DetailCard
              label="PL Age At Dispatch"
              value={item?.PL_age_at_dispatch}
            />
            <DetailCard label="Nursery Days" value={item?.nursery_days} />
            <DetailCard
              label="Stocking Date"
              value={formatDate(item?.stocking_date)}
            />
            <DetailCard
              label="PL Age At Stocked"
              value={item?.PL_age_at_stocked}
            />
            <DetailCard
              label="Total PL Stocked"
              value={formatNumber(item?.total_PL_stocked)}
            />
            <DetailCard
              label="Created At"
              value={item?.created_at ? new Date(item.created_at).toLocaleString() : "-"}
            />
            <DetailCard
              label="Updated At"
              value={item?.updated_at ? new Date(item.updated_at).toLocaleString() : "-"}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
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

const InfoCard = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-slate-400">{icon}</div>

      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-black text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
};

const MiniInfo = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
};

const LoadingBlock = ({ text }) => {
  return (
    <div className="px-4 py-8 text-center">
      <div className="mx-auto flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
        <RefreshCw size={15} className="animate-spin" />
        {text}
      </div>
    </div>
  );
};

const EmptyBlock = ({ text }) => {
  return (
    <div className="px-4 py-8 text-center text-xs font-bold text-slate-400">
      {text}
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

const Td = ({ children, strong = false }) => {
  return (
    <td
      className={`px-4 py-3 text-xs ${
        strong ? "font-black text-slate-900" : "font-bold text-slate-600"
      }`}
    >
      {children || "-"}
    </td>
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

export default PondStockingByCultureCycle;