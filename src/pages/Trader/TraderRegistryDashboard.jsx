import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAdminTraders,
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

function StatCard({ title, value, borderClass, valueClass }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${borderClass}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <h2 className={`mt-2 text-3xl font-extrabold ${valueClass}`}>
        {value}
      </h2>
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
  const name = trader.trader_name || "Trader";
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

export default function TraderRegistryDashboard() {
  const dispatch = useDispatch();

  const { loading, error, search, statusFilter } = useSelector(
    selectAdminTraderState
  );

  const stats = useSelector(selectTraderStats);
  const traders = useSelector(selectFilteredTraders);

  useEffect(() => {
    dispatch(fetchAdminTraders());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Trader Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View trader registry and manage trader-wise quality checkers, crate
            packers, and transport operators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xl">
              <input
                value={search}
                onChange={(event) =>
                  dispatch(setTraderSearch(event.target.value))
                }
                placeholder="Search by name, mobile, code, district..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div className="flex gap-3">
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
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[950px] overflow-hidden rounded-2xl border border-slate-200 text-left">
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
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      Loading traders...
                    </td>
                  </tr>
                ) : traders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      No traders found.
                    </td>
                  </tr>
                ) : (
                  traders.map((trader) => {
                    const districts = Array.isArray(
                      trader.operational_districts
                    )
                      ? trader.operational_districts.join(", ")
                      : "-";

                    return (
                      <tr key={trader.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <TraderAvatar trader={trader} />

                            <div>
                              <p className="font-extrabold text-slate-950">
                                {trader.trader_name || "-"}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                Code: {trader.trader_code || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {trader.mobile || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {trader.email || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800">
                          {trader.trader_type || "-"}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800">
                          {districts}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge trader={trader} />
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            to={`/admin/trader/${trader.id}`}
                            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}