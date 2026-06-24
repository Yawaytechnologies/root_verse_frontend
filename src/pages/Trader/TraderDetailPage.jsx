import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAdminTraderById,
} from "../../redux/action/adminTrader.actions";

import {
  clearSelectedTrader,
  selectAdminTraderState,
} from "../../redux/reducer/adminTrader.slice";

import {
  getTraderStatusKey,
  getTraderStatusLabel,
} from "../../redux/services/adminTrader.service";

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

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

function EmptyState({ title }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <p className="font-bold text-slate-600">{title}</p>
    </div>
  );
}

function QualityCheckerTable({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No quality checkers found for this trader." />;
  }

  return (
    <TableWrapper>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 bg-white">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <TableCell strong>{item.checker_name}</TableCell>
            <TableCell>{item.checker_code}</TableCell>
            <TableCell>{item.checker_phone}</TableCell>
            <TableCell>{item.checker_email}</TableCell>
            <TableCell>{item.location_id || "-"}</TableCell>
            <TableCell>
              {item.is_active ? (
                <ActiveBadge />
              ) : (
                <InactiveBadge />
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}

function CratePackerTable({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No crate packers found for this trader." />;
  }

  return (
    <TableWrapper>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>DOB</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 bg-white">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <TableCell strong>{item.name}</TableCell>
            <TableCell>{item.code}</TableCell>
            <TableCell>{item.phone}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.date_of_birth || "-"}</TableCell>
            <TableCell>{item.location_id || "-"}</TableCell>
            <TableCell>
              {String(item.status).toLowerCase() === "active" ? (
                <ActiveBadge />
              ) : (
                <InactiveBadge />
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}

function TransportOperatorTable({ rows }) {
  if (!rows.length) {
    return (
      <EmptyState title="No transport operators found for this trader." />
    );
  }

  return (
    <TableWrapper>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Operator RV ID</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Transport ID</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 bg-white">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <TableCell strong>{item.full_name}</TableCell>
            <TableCell>{item.operator_rv_id}</TableCell>
            <TableCell>{item.mobile}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.transport_id}</TableCell>
            <TableCell>
              <div>
                <p className="font-bold text-slate-900">
                  {item.vehicle_no || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.vehicle_type || "-"}
                </p>
              </div>
            </TableCell>
            <TableCell>{item.route_name}</TableCell>
            <TableCell>
              {item.is_active ? (
                <ActiveBadge />
              ) : (
                <InactiveBadge />
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] overflow-hidden rounded-2xl border border-slate-200 text-left">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children, strong }) {
  return (
    <td
      className={`px-5 py-4 text-sm ${
        strong ? "font-extrabold text-slate-950" : "font-semibold text-slate-700"
      }`}
    >
      {children || "-"}
    </td>
  );
}

function ActiveBadge() {
  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      Active
    </span>
  );
}

function InactiveBadge() {
  return (
    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
      Inactive
    </span>
  );
}

export default function TraderDetailPage() {
  const { traderId } = useParams();
  const dispatch = useDispatch();

  const { selectedTrader, detailLoading, detailError } = useSelector(
    selectAdminTraderState
  );

  const [activeTab, setActiveTab] = useState("quality_checkers");

  useEffect(() => {
    dispatch(fetchAdminTraderById(traderId));

    return () => {
      dispatch(clearSelectedTrader());
    };
  }, [dispatch, traderId]);

  const tabs = useMemo(() => {
    const trader = selectedTrader || {};

    return [
      {
        key: "quality_checkers",
        label: "Quality Checkers",
        count: trader.quality_checkers?.length || 0,
      },
      {
        key: "crate_packers",
        label: "Crate Packers",
        count: trader.crate_packers?.length || 0,
      },
      {
        key: "transport_operators",
        label: "Transport Operators",
        count: trader.transport_operators?.length || 0,
      },
    ];
  }, [selectedTrader]);

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">
          Loading trader details...
        </div>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-10 text-center font-bold text-red-700">
          {detailError}
        </div>
      </div>
    );
  }

  if (!selectedTrader) {
    return null;
  }

  const trader = selectedTrader;

  const logo = trader.company_logo_url || trader.profile_image_url;
  const districts = Array.isArray(trader.operational_districts)
    ? trader.operational_districts.join(", ")
    : "-";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Trader Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View selected trader employees and operators.
            </p>
          </div>

          <Link
            to="/admin/trader"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              {logo ? (
                <img
                  src={logo}
                  alt={trader.trader_name || "Trader"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-cyan-700">
                  {(trader.trader_name || "T").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {trader.trader_name || "-"}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    Code: {trader.trader_code || "-"}
                  </p>
                </div>

                <StatusBadge trader={trader} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoItem label="Mobile" value={trader.mobile} />
                <InfoItem label="Email" value={trader.email} />
                <InfoItem label="Trader Type" value={trader.trader_type} />
                <InfoItem label="Districts" value={districts} />
                <InfoItem label="Markets" value={trader.markets} />
                <InfoItem
                  label="Experience"
                  value={
                    trader.years_of_experience
                      ? `${trader.years_of_experience} Years`
                      : "-"
                  }
                />
              </div>

              <div className="mt-4">
                <InfoItem label="Address" value={trader.address} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-extrabold text-slate-900">
            Select Details To View
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-cyan-500 bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm font-extrabold ${
                      active ? "text-cyan-700" : "text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {tab.count}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {activeTab === "quality_checkers" && (
            <QualityCheckerTable rows={trader.quality_checkers || []} />
          )}

          {activeTab === "crate_packers" && (
            <CratePackerTable rows={trader.crate_packers || []} />
          )}

          {activeTab === "transport_operators" && (
            <TransportOperatorTable rows={trader.transport_operators || []} />
          )}
        </div>
      </div>
    </div>
  );
}