import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";

import TraderAdminLayout from "../../pages/Trader/TraderAdminLayout";

import {
  fetchAdminTraders,
  updateAdminTraderStatus,
} from "../../redux/action/adminTrader.actions";

import {
  selectAdminTraderState,
  selectTraderStats,
  selectFilteredTraders,
  setTraderSearch,
  setTraderStatusFilter,
} from "../../redux/reducer/adminTrader.slice";

import {
  getTraderStatusKey,
  getTraderStatusLabel,
} from "../../redux/services/adminTrader.service";

const PAGE_SIZE = 10;

function StatCard({ title, value, borderClass, valueClass }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${borderClass}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <h2 className={`mt-2 text-3xl font-extrabold ${valueClass}`}>{value}</h2>
    </div>
  );
}

function StatusBadge({ trader }) {
  const statusKey = getTraderStatusKey(trader);
  const label = getTraderStatusLabel(trader);

  const className =
    statusKey === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : statusKey === "rejected"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}

function TraderAvatar({ trader }) {
  const image = trader.company_logo_url || trader.profile_image_url;
  const name = trader.trader_name || trader.company_name || "Trader";
  const firstLetter = name.charAt(0).toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-11 w-11 rounded-xl border border-slate-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-base font-bold text-cyan-700">
      {firstLetter}
    </div>
  );
}

function PaginationButton({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-cyan-500 bg-cyan-500 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function TraderRegistryDashboard() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading,
    error,
    statusError,
    search,
    statusFilter,
    statusUpdating,
  } = useSelector(selectAdminTraderState);

  const stats = useSelector(selectTraderStats);
  const traders = useSelector(selectFilteredTraders);

  const totalPages = Math.max(1, Math.ceil(traders.length / PAGE_SIZE));

  const paginatedTraders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return traders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [traders, currentPage]);

  const startCount =
    traders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endCount = Math.min(currentPage * PAGE_SIZE, traders.length);

  useEffect(() => {
    dispatch(fetchAdminTraders());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleApprove = (trader) => {
    dispatch(
      updateAdminTraderStatus({
        traderId: trader.id,
        status: "approved",
      })
    );
  };

  const handleReject = (trader) => {
    const ok = window.confirm(
      `Are you sure you want to reject ${trader.trader_name || "this trader"}?`
    );

    if (!ok) return;

    dispatch(
      updateAdminTraderStatus({
        traderId: trader.id,
        status: "rejected",
      })
    );
  };

  return (
    <TraderAdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-950">
          Trader Dashboard
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          View trader registry and approve trader organizations from the same
          list.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Traders"
          value={stats.total}
          borderClass="border-slate-200"
          valueClass="text-slate-950"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          borderClass="border-amber-300"
          valueClass="text-amber-600"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          borderClass="border-emerald-300"
          valueClass="text-emerald-600"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          borderClass="border-red-300"
          valueClass="text-red-600"
        />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                dispatch(setTraderSearch(event.target.value))
              }
              placeholder="Search by name, mobile, code, district..."
              className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) =>
                dispatch(setTraderStatusFilter(event.target.value))
              }
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={() => dispatch(fetchAdminTraders())}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {statusError && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {statusError}
          </div>
        )}

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[1150px] overflow-hidden rounded-2xl border border-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  Trader
                </th>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  Contact
                </th>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  District
                </th>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-extrabold uppercase text-slate-500">
                  Registered
                </th>
                <th className="px-5 py-4 text-right text-xs font-extrabold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    Loading traders...
                  </td>
                </tr>
              ) : paginatedTraders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No traders found.
                  </td>
                </tr>
              ) : (
                paginatedTraders.map((trader) => {
                  const statusKey = getTraderStatusKey(trader);

                  const districts = Array.isArray(trader.operational_districts)
                    ? trader.operational_districts.join(", ")
                    : "-";

                  const isUpdating = Boolean(statusUpdating?.[trader.id]);

                  const registeredDate =
                    trader.created_at ||
                    trader.createdAt ||
                    trader.registered_at ||
                    trader.registeredAt ||
                    "";

                  const formattedDate = registeredDate
                    ? new Date(registeredDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";

                  return (
                    <tr key={trader.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <TraderAvatar trader={trader} />

                          <div>
                            <p className="font-extrabold text-slate-950">
                              {trader.trader_name || trader.company_name || "-"}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              Code: {trader.trader_code || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {trader.mobile || trader.phone || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {trader.email || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {trader.trader_type || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 font-bold text-slate-800">
                        <span className="line-clamp-2">{districts}</span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge trader={trader} />
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {formattedDate}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/trader/dashboard/${trader.id}`}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                          >
                            <FiEye />
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleApprove(trader)}
                            disabled={isUpdating || statusKey === "approved"}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiCheckCircle />
                            {isUpdating ? "Saving" : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(trader)}
                            disabled={isUpdating || statusKey === "rejected"}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiXCircle />
                            Reject
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

        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-600">
            Showing {startCount} - {endCount} of {traders.length} traders
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <PaginationButton
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || loading}
            >
              <FiChevronLeft />
            </PaginationButton>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <PaginationButton
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                >
                  {page}
                </PaginationButton>
              )
            )}

            <PaginationButton
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages || loading}
            >
              <FiChevronRight />
            </PaginationButton>
          </div>
        </div>
      </section>
    </TraderAdminLayout>
  );
}