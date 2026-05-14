import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Search,
  RefreshCw,
  X,
  CalendarDays,
  Lock,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Table2,
} from "lucide-react";

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
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const getTotalPages = (items, pageSize) => {
  return Math.max(1, Math.ceil((items?.length || 0) / pageSize));
};

const paginateList = (items, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  return (items || []).slice(startIndex, startIndex + pageSize);
};

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
  const navigate = useNavigate();

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

  const [pendingPage, setPendingPage] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const [pendingPageSize, setPendingPageSize] = useState(5);
  const [activePageSize, setActivePageSize] = useState(5);

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

  const pendingTotalPages = useMemo(() => {
    return getTotalPages(pendingCycles, pendingPageSize);
  }, [pendingCycles, pendingPageSize]);

  const activeTotalPages = useMemo(() => {
    return getTotalPages(activeCycles, activePageSize);
  }, [activeCycles, activePageSize]);

  const paginatedPendingCycles = useMemo(() => {
    return paginateList(pendingCycles, pendingPage, pendingPageSize);
  }, [pendingCycles, pendingPage, pendingPageSize]);

  const paginatedActiveCycles = useMemo(() => {
    return paginateList(activeCycles, activePage, activePageSize);
  }, [activeCycles, activePage, activePageSize]);

  useEffect(() => {
    setPendingPage(1);
    setActivePage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (pendingPage > pendingTotalPages) {
      setPendingPage(pendingTotalPages);
    }
  }, [pendingPage, pendingTotalPages]);

  useEffect(() => {
    if (activePage > activeTotalPages) {
      setActivePage(activeTotalPages);
    }
  }, [activePage, activeTotalPages]);

  const handleStatusChange = async (id, newStatus, currentStatus) => {
    if (normalizeStatus(newStatus) === normalizeStatus(currentStatus)) return;

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

  const handleOpenPondStocking = (cycle) => {
    navigate(
      `/admin/aqua-culture/culture-cycle-approval/${cycle.id}/pond-stocking`,
      {
        state: { cycle },
      }
    );
  };

  return (
    <div className="w-full bg-slate-100 px-3 py-3 text-sm">
      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
          totalCount={pendingCycles.length}
          cycles={paginatedPendingCycles}
          loading={loading}
          updating={updating}
          updatingId={updatingId}
          currentPage={pendingPage}
          totalPages={pendingTotalPages}
          pageSize={pendingPageSize}
          onPageChange={setPendingPage}
          onPageSizeChange={(value) => {
            setPendingPageSize(Number(value));
            setPendingPage(1);
          }}
          onView={(cycle) => dispatch(setSelectedCultureCycle(cycle))}
          onPondStocking={handleOpenPondStocking}
          onStatusChange={handleStatusChange}
          type="pending"
        />

        <CycleTable
          title="Active Culture Cycles"
          badge="ACTIVE"
          count={activeCycles.length}
          totalCount={activeCycles.length}
          cycles={paginatedActiveCycles}
          loading={loading}
          updating={updating}
          updatingId={updatingId}
          currentPage={activePage}
          totalPages={activeTotalPages}
          pageSize={activePageSize}
          onPageChange={setActivePage}
          onPageSizeChange={(value) => {
            setActivePageSize(Number(value));
            setActivePage(1);
          }}
          onView={(cycle) => dispatch(setSelectedCultureCycle(cycle))}
          onPondStocking={handleOpenPondStocking}
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
  totalCount,
  cycles,
  loading,
  updating,
  updatingId,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onView,
  onPondStocking,
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

      <div className="block md:hidden">
        {loading ? (
          <LoadingBlock text="Loading culture cycles..." />
        ) : cycles.length === 0 ? (
          <EmptyBlock text="No culture cycles found." />
        ) : (
          <div className="space-y-3 p-3">
            {cycles.map((cycle) => {
              const status = normalizeStatus(cycle?.verification_status);
              const isUpdatingThis =
                updating && Number(updatingId) === Number(cycle.id);

              return (
                <div
                  key={cycle.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-slate-600">
                        {cycle?.culture_code || "-"}
                      </p>

                      <h3 className="mt-2 text-sm font-black text-slate-900">
                        {getPondName(cycle)}
                      </h3>

                      <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-slate-400">
                        {getPondCode(cycle)}
                      </p>
                    </div>

                    {isActiveTable ? (
                      <span
                        className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-black ${statusClass(
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
                          onStatusChange(cycle.id, event.target.value, status)
                        }
                        className={`h-8 shrink-0 rounded-lg border px-2.5 text-[11px] font-black outline-none ${statusClass(
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
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <MiniInfo label="Farm" value={getFarmName(cycle)} />
                    <MiniInfo
                      label="Period"
                      value={`${formatDate(cycle?.start_date)} - ${formatDate(
                        cycle?.end_date
                      )}`}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onView(cycle)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[11px] font-black text-white hover:bg-sky-600"
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button
                      onClick={() => onPondStocking(cycle)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3 text-[11px] font-black text-white hover:bg-indigo-600"
                    >
                      <Table2 size={14} />
                      Stocking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[840px] text-left">
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
                <td colSpan="5">
                  <LoadingBlock text="Loading culture cycles..." />
                </td>
              </tr>
            ) : cycles.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <EmptyBlock text="No culture cycles found." />
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
                            onStatusChange(cycle.id, event.target.value, status)
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
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onView(cycle)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[11px] font-black text-white hover:bg-sky-600"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() => onPondStocking(cycle)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3 text-[11px] font-black text-white hover:bg-indigo-600"
                        >
                          <Table2 size={14} />
                          Stocking
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalCount > 0 && (
        <PaginationControls
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};

const PaginationControls = ({
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const maxButtons = 5;
  const startPage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - maxButtons + 1)
  );
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  const pageNumbers = [];

  for (let page = startPage; page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[11px] font-bold text-slate-500">
        Showing <span className="font-black text-slate-800">{startItem}</span>
        {" - "}
        <span className="font-black text-slate-800">{endItem}</span>
        {" of "}
        <span className="font-black text-slate-800">{totalCount}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(event.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] font-black text-slate-700 outline-none focus:border-sky-400"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            First
          </button>

          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 rounded-lg border px-2 text-[11px] font-black ${
                page === currentPage
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Last
          </button>
        </div>
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
  const [fullViewImage, setFullViewImage] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-500">
              Culture Cycle Details
            </p>

            <h3 className="mt-1 truncate text-base font-black text-slate-900">
              {cycle?.culture_code || "-"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
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
            <DetailCard
              label="Farm Area"
              value={
                cycle?.farm?.farm_area_acres
                  ? `${cycle.farm.farm_area_acres} acres`
                  : "-"
              }
            />
            <DetailCard label="Water Source" value={cycle?.farm?.water_source} />
            <DetailCard label="Farm Address" value={cycle?.farm?.address} />
            <DetailCard
              label="Farm Gate Latitude"
              value={cycle?.farm?.farm_gate_latitude}
            />
            <DetailCard
              label="Farm Gate Longitude"
              value={cycle?.farm?.farm_gate_longitude}
            />
          </div>

          <SectionTitle title="Pond Details" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard label="Pond Name" value={getPondName(cycle)} />
            <DetailCard label="Pond Code" value={getPondCode(cycle)} />
            <DetailCard label="Pond Type" value={cycle?.pond?.pond_type} />
            <DetailCard
              label="Water Spread Area"
              value={
                cycle?.pond?.water_spread_area_acres
                  ? `${cycle.pond.water_spread_area_acres} acres`
                  : "-"
              }
            />
            <DetailCard label="Volume" value={cycle?.pond?.volume} />
            <DetailCard label="Pond GPS" value={cycle?.pond?.pond_gps} />
            <DetailCard label="Pond Status" value={cycle?.pond?.pond_status} />
            <DetailCard
              label="Pond Verification"
              value={cycle?.pond?.verification_status}
            />
          </div>

          <SectionTitle title="Images" />
          {cycle?.images?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cycle.images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setFullViewImage(image)}
                    className="group relative block w-full overflow-hidden bg-slate-100"
                  >
                    <img
                      src={image.image_url}
                      alt={image.description || "Culture cycle"}
                      className="h-40 w-full object-cover transition duration-200 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 hidden items-center justify-center bg-slate-950/45 group-hover:flex">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-800 shadow">
                        <Maximize2 size={14} />
                        Full View
                      </span>
                    </div>
                  </button>

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

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
          {isPending ? (
            <select
              value={status}
              disabled={isUpdatingThis}
              onChange={(event) =>
                onStatusChange(cycle.id, event.target.value, status)
              }
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

      {fullViewImage && (
        <FullImageView
          image={fullViewImage}
          onClose={() => setFullViewImage(null)}
        />
      )}
    </div>
  );
};

const FullImageView = ({ image, onClose }) => {
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.25;

  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-3 py-4">
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-slate-900">
              {image?.description || "Culture cycle image"}
            </p>

            <p className="mt-0.5 break-all text-[10px] font-semibold text-slate-400">
              {image?.storage_path || image?.image_url}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="flex h-8 items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 text-[11px] font-black text-slate-700 hover:bg-slate-200"
              title="Reset zoom"
            >
              <RotateCcw size={14} />
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-black p-4">
          <div className="flex min-h-full min-w-full items-center justify-center">
            <img
              src={image?.image_url}
              alt={image?.description || "Culture cycle full view"}
              className="select-none object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                maxHeight: zoom === 1 ? "80vh" : "none",
                maxWidth: zoom === 1 ? "100%" : "none",
              }}
              draggable={false}
            />
          </div>
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