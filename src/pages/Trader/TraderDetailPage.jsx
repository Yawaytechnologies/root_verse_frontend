import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import TraderAdminLayout from "../../pages/Trader/TraderAdminLayout";
import { fetchAdminTraderById } from "../../redux/action/adminTrader.actions";

import {
  clearSelectedTrader,
  selectAdminTraderState,
} from "../../redux/reducer/adminTrader.slice";

import {
  getTraderStatusKey,
  getTraderStatusLabel,
} from "../../redux/services/adminTrader.service";

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function formatStatus(item) {
  if (item?.status) return item.status;
  if (item?.approval_status) return item.approval_status;
  if (item?.verification_status) return item.verification_status;
  if (item?.is_active === true) return "Active";
  if (item?.is_active === false) return "Inactive";
  return "-";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-extrabold text-slate-950">
        {displayValue(value)}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-bold text-slate-600">
      {text}
    </div>
  );
}

function getCardTitle(type, item) {
  if (type === "quality_checkers") {
    return item.checker_name || item.name || "-";
  }

  if (type === "crate_packers") {
    return item.name || "-";
  }

  if (type === "transport_operators") {
    return item.full_name || item.name || "-";
  }

  return item.name || item.full_name || item.checker_name || "-";
}

function getFieldsByType(type, item) {
  if (type === "quality_checkers") {
    return [
      { label: "Checker Name", value: item.checker_name },
      { label: "Checker Code", value: item.checker_code },
      { label: "Phone", value: item.checker_phone },
      { label: "Email", value: item.checker_email },
      { label: "RootVerse Type", value: item.rootverse_type },
      { label: "Location ID", value: item.location_id },
      { label: "Trader ID", value: item.trader_id },
      { label: "Status", value: formatStatus(item) },
      { label: "Created At", value: formatDate(item.created_at) },
      { label: "Updated At", value: formatDate(item.updated_at) },
    ];
  }

  if (type === "crate_packers") {
    return [
      { label: "Name", value: item.name },
      { label: "Code", value: item.code },
      { label: "Phone", value: item.phone },
      { label: "Email", value: item.email },
      { label: "Date Of Birth", value: formatDate(item.date_of_birth) },
      { label: "Address", value: item.address },
      { label: "RootVerse Type", value: item.rootverse_type },
      { label: "Location ID", value: item.location_id },
      { label: "Trader ID", value: item.trader_id },
      { label: "Status", value: formatStatus(item) },
      { label: "Created At", value: formatDate(item.created_at) },
      { label: "Updated At", value: formatDate(item.updated_at) },
    ];
  }

  if (type === "transport_operators") {
    return [
      { label: "Full Name", value: item.full_name },
      { label: "Operator RV ID", value: item.operator_rv_id },
      { label: "Transport ID", value: item.transport_id },
      { label: "Mobile", value: item.mobile },
      { label: "Email", value: item.email },
      { label: "Vehicle No", value: item.vehicle_no },
      { label: "Vehicle Type", value: item.vehicle_type },
      { label: "Route Name", value: item.route_name },
      { label: "Trader ID", value: item.trader_id },
      { label: "Status", value: formatStatus(item) },
      { label: "Created At", value: formatDate(item.created_at) },
      { label: "Updated At", value: formatDate(item.updated_at) },
    ];
  }

  return Object.entries(item || {}).map(([key, value]) => ({
    label: key,
    value: String(value),
  }));
}

function PersonCard({ type, item }) {
  const title = getCardTitle(type, item);
  const fields = getFieldsByType(type, item);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-base font-extrabold text-slate-950">{title}</h4>

        <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold uppercase text-slate-600">
          {formatStatus(item)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <InfoBox
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </div>
  );
}

export default function TraderDetails() {
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

  const trader = selectedTrader;

  const districts = Array.isArray(trader?.operational_districts)
    ? trader.operational_districts.join(", ")
    : "-";

  const experience =
    trader?.years_of_experience !== null &&
    trader?.years_of_experience !== undefined
      ? `${trader.years_of_experience} Years`
      : trader?.experience || "-";

  const tabs = useMemo(
    () => [
      {
        key: "quality_checkers",
        title: "Quality Checkers",
        count: trader?.quality_checkers?.length || 0,
      },
      {
        key: "crate_packers",
        title: "Crate Packers",
        count: trader?.crate_packers?.length || 0,
      },
      {
        key: "transport_operators",
        title: "Transport Operators",
        count: trader?.transport_operators?.length || 0,
      },
    ],
    [trader]
  );

  const activeItems = Array.isArray(trader?.[activeTab])
    ? trader[activeTab]
    : [];

  const activeTitle =
    tabs.find((item) => item.key === activeTab)?.title || "Details";

  return (
    <TraderAdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">
            Trader Details
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            View selected trader employees and operators.
          </p>
        </div>

        <Link
          to="/admin/trader/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {detailLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
          Loading trader details...
        </div>
      ) : detailError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
          {detailError}
        </div>
      ) : !trader ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
          Trader not found.
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                {trader.company_logo_url || trader.profile_image_url ? (
                  <img
                    src={trader.company_logo_url || trader.profile_image_url}
                    alt={trader.trader_name || "Trader"}
                    className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-extrabold text-cyan-700">
                    {(trader.trader_name || trader.company_name || "T")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    {trader.trader_name || trader.company_name || "-"}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Code: {trader.trader_code || "-"}
                  </p>
                </div>
              </div>

              <StatusBadge trader={trader} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoBox label="Mobile" value={trader.mobile || trader.phone} />
              <InfoBox label="Email" value={trader.email} />
              <InfoBox label="Trader Type" value={trader.trader_type} />
              <InfoBox label="Districts" value={districts} />
              <InfoBox label="Markets" value={trader.markets || trader.market} />
              <InfoBox label="Experience" value={experience} />
              <InfoBox label="Trader ID" value={trader.id} />
              <InfoBox label="Active Status" value={formatStatus(trader)} />
              <InfoBox label="Registered Date" value={formatDate(trader.created_at)} />
            </div>

            <div className="mt-4">
              <InfoBox label="Address" value={trader.address} />
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-950">
              Select Details To View
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      active
                        ? "border-cyan-400 bg-cyan-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-extrabold text-slate-700">
                      {tab.title}
                    </p>

                    <h4 className="mt-2 text-3xl font-extrabold text-slate-950">
                      {tab.count}
                    </h4>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-950">
                {activeTitle} List
              </h3>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                Total: {activeItems.length}
              </span>
            </div>

            {activeItems.length === 0 ? (
              <EmptyBox
                text={`No ${activeTitle.toLowerCase()} found for this trader.`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeItems.map((item, index) => (
                  <PersonCard
                    key={item.id || index}
                    type={activeTab}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </TraderAdminLayout>
  );
}