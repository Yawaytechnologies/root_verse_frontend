import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import {
  fetchAdminTraders,
  updateAdminTraderStatus,
} from "../../../redux/action/adminTrader.actions";

import {
  selectAdminTraderState,
  selectFilteredTraders,
  setTraderSearch,
  setTraderStatusFilter,
} from "../../../redux/reducer/adminTrader.slice";

import {
  getTraderStatusKey,
  getTraderStatusLabel,
} from "../../../redux/services/adminTrader.service";

const PAGE_SIZE = 8;

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(item) {
  if (item?.status) return item.status;

  if (item?.approval_status) {
    return item.approval_status;
  }

  if (item?.verification_status) {
    return item.verification_status;
  }

  if (item?.is_active === true) {
    return "Active";
  }

  if (item?.is_active === false) {
    return "Inactive";
  }

  return "-";
}

function getDistricts(trader) {
  if (Array.isArray(trader?.operational_districts)) {
    return trader.operational_districts.join(", ");
  }

  return trader?.district || "-";
}

/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

function StatusBadge({ trader }) {
  const statusKey = getTraderStatusKey(trader);
  const label = getTraderStatusLabel(trader);

  const styles = {
    approved: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },

    rejected: {
      badge: "border-rose-200 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
    },

    pending: {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
  };

  const current = styles[statusKey] || styles.pending;

  return (
    <span
      className={`
        inline-flex shrink-0 items-center gap-1.5
        whitespace-nowrap rounded-full border
        px-2.5 py-1 text-[11px] font-bold
        ${current.badge}
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 shrink-0 rounded-full
          ${current.dot}
        `}
      />

      {label}
    </span>
  );
}

/* ========================================================================== */
/* TRADER AVATAR                                                              */
/* ========================================================================== */

function TraderAvatar({ trader, large = false }) {
  const image =
    trader?.company_logo_url ||
    trader?.profile_image_url;

  const name =
    trader?.trader_name ||
    trader?.company_name ||
    "Trader";

  const letter = name.charAt(0).toUpperCase();

  const size = large
    ? "h-16 w-16 rounded-2xl text-xl"
    : "h-11 w-11 rounded-xl text-sm";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`
          ${size}
          shrink-0 border border-slate-200
          bg-white object-cover
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${size}
        flex shrink-0 items-center justify-center
        bg-gradient-to-br from-cyan-50 to-sky-100
        font-black text-cyan-700
      `}
    >
      {letter}
    </div>
  );
}

/* ========================================================================== */
/* DETAIL ITEM                                                                */
/* ========================================================================== */

function DetailItem({
  icon: Icon,
  label,
  value,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-xl border border-slate-200
        bg-slate-50/70 p-3.5
        ${className}
      `}
    >
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon className="shrink-0 text-sm" />}

        <p className="text-[10px] font-bold uppercase tracking-[0.08em]">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
        {displayValue(value)}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* ACTION BUTTONS                                                             */
/* ========================================================================== */

function ActionButtons({
  trader,
  statusUpdating,
  onView,
  onApprove,
  onReject,
  mode = "approval",
  mobile = false,
}) {
  const statusKey = getTraderStatusKey(trader);

  const isUpdating = Boolean(
    statusUpdating?.[trader.id]
  );

  /* ---------------------------------------------------------------------- */
  /* APPROVED TABLE                                                         */
  /* ---------------------------------------------------------------------- */

  if (mode === "approved") {
    return (
      <div
        className={`
          flex items-center gap-2
          ${mobile ? "w-full" : "justify-end"}
        `}
      >
        <button
          type="button"
          onClick={() => onView(trader)}
          className={`
            inline-flex items-center justify-center gap-1.5
            whitespace-nowrap rounded-lg
            border border-slate-200 bg-white
            font-bold text-slate-600 transition
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
            ${
              mobile
                ? "h-10 flex-1 px-3 text-xs"
                : "h-9 px-3 text-[11px]"
            }
          `}
        >
          <FiEye className="shrink-0" />
          View
        </button>

        <button
          type="button"
          onClick={() => onReject(trader)}
          disabled={isUpdating}
          className={`
            inline-flex items-center justify-center gap-1.5
            whitespace-nowrap rounded-lg
            border border-rose-200 bg-rose-50
            font-bold text-rose-600 transition
            hover:border-rose-300
            hover:bg-rose-100
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${
              mobile
                ? "h-10 flex-1 px-3 text-xs"
                : "h-9 px-3 text-[11px]"
            }
          `}
        >
          <FiXCircle className="shrink-0" />

          {isUpdating ? "Saving..." : "Revoke"}
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* APPROVAL QUEUE                                                         */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className={`
        flex items-center gap-2
        ${mobile ? "w-full" : "justify-end"}
      `}
    >
      <button
        type="button"
        onClick={() => onView(trader)}
        className={`
          inline-flex items-center justify-center gap-1.5
          whitespace-nowrap rounded-lg
          border border-slate-200 bg-white
          font-bold text-slate-600 transition
          hover:border-slate-300
          hover:bg-slate-50
          hover:text-slate-900
          ${
            mobile
              ? "h-10 flex-1 px-3 text-xs"
              : "h-9 px-3 text-[11px]"
          }
        `}
      >
        <FiEye className="shrink-0" />
        View
      </button>

      <button
        type="button"
        onClick={() => onApprove(trader)}
        disabled={isUpdating}
        className={`
          inline-flex items-center justify-center gap-1.5
          whitespace-nowrap rounded-lg
          bg-emerald-600 font-bold text-white
          transition
          hover:bg-emerald-700
          disabled:cursor-not-allowed
          disabled:opacity-40
          ${
            mobile
              ? "h-10 flex-1 px-3 text-xs"
              : "h-9 px-3 text-[11px]"
          }
        `}
      >
        <FiCheckCircle className="shrink-0" />

        {isUpdating ? "Saving..." : "Approve"}
      </button>

      {/* Pending trader only */}
      {statusKey !== "rejected" && (
        <button
          type="button"
          onClick={() => onReject(trader)}
          disabled={isUpdating}
          title="Reject trader"
          className={`
            inline-flex shrink-0 items-center justify-center
            rounded-lg border border-rose-200
            bg-rose-50 font-bold text-rose-600
            transition
            hover:border-rose-300
            hover:bg-rose-100
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${
              mobile
                ? "h-10 w-10"
                : "h-9 w-9"
            }
          `}
        >
          <FiXCircle />
        </button>
      )}
    </div>
  );
}

/* ========================================================================== */
/* MOBILE CARD                                                                */
/* ========================================================================== */

function TraderMobileCard({
  trader,
  statusUpdating,
  onView,
  onApprove,
  onReject,
  mode,
}) {
  return (
    <div className="border-b border-slate-100 p-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <TraderAvatar trader={trader} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-slate-950">
                {trader.trader_name ||
                  trader.company_name ||
                  "-"}
              </h3>

              <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                {trader.trader_code
                  ? `#${trader.trader_code}`
                  : "No trader code"}
              </p>
            </div>

            <StatusBadge trader={trader} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Contact
              </p>

              <p className="mt-1 truncate text-xs font-bold text-slate-700">
                {trader.mobile ||
                  trader.phone ||
                  "-"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Type
              </p>

              <p className="mt-1 truncate text-xs font-semibold capitalize text-slate-700">
                {trader.trader_type || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ActionButtons
          trader={trader}
          statusUpdating={statusUpdating}
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
          mode={mode}
          mobile
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* PAGINATION                                                                 */
/* ========================================================================== */

function TablePagination({
  page,
  setPage,
  totalItems,
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / PAGE_SIZE)
  );

  const start =
    totalItems === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const end = Math.min(
    page * PAGE_SIZE,
    totalItems
  );

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className="
        flex flex-col gap-3
        border-t border-slate-200
        bg-slate-50/60
        px-4 py-3.5
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-5
      "
    >
      <p className="text-center text-xs font-semibold text-slate-500 sm:text-left">
        Showing{" "}
        <span className="font-black text-slate-800">
          {start}
        </span>{" "}
        -{" "}
        <span className="font-black text-slate-800">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-800">
          {totalItems}
        </span>
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() =>
            setPage((current) =>
              Math.max(1, current - 1)
            )
          }
          disabled={page === 1}
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg border
            border-slate-200
            bg-white text-slate-600
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <FiChevronLeft />
        </button>

        <div
          className="
            flex h-9 min-w-[92px]
            items-center justify-center
            rounded-lg border
            border-slate-200
            bg-white px-3
            text-xs font-bold text-slate-600
          "
        >
          {page} / {totalPages}
        </div>

        <button
          type="button"
          onClick={() =>
            setPage((current) =>
              Math.min(
                totalPages,
                current + 1
              )
            )
          }
          disabled={page === totalPages}
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg border
            border-slate-200
            bg-white text-slate-600
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TABLE SECTION                                                              */
/* ========================================================================== */

function TraderTableSection({
  title,
  description,
  traders,
  loading,
  page,
  setPage,
  statusUpdating,
  onView,
  onApprove,
  onReject,
  mode = "approval",
}) {
  const paginatedTraders = useMemo(() => {
    const start =
      (page - 1) * PAGE_SIZE;

    return traders.slice(
      start,
      start + PAGE_SIZE
    );
  }, [traders, page]);

  return (
    <section
      className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white shadow-sm
      "
    >
      {/* Header */}
      <div
        className="
          flex flex-col gap-2
          border-b border-slate-200
          px-4 py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-950">
              {title}
            </h2>

            <span
              className="
                inline-flex min-w-7
                items-center justify-center
                rounded-full bg-slate-100
                px-2 py-0.5
                text-[10px]
                font-black text-slate-600
              "
            >
              {traders.length}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DESKTOP TABLE                                                      */}
      {/* ================================================================== */}

      <div className="hidden xl:block">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th
                className="
                  w-[24%] px-5 py-3.5
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Trader
              </th>

              <th
                className="
                  w-[22%] px-5 py-3.5
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Contact
              </th>

              <th
                className="
                  w-[14%] px-5 py-3.5
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Type
              </th>

              <th
                className="
                  w-[16%] px-5 py-3.5
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Status
              </th>

              <th
                className="
                  w-[24%] px-5 py-3.5
                  text-right text-[10px]
                  font-black uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-14 text-center"
                >
                  <FiRefreshCw className="mx-auto animate-spin text-xl text-cyan-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Loading traders...
                  </p>
                </td>
              </tr>
            ) : paginatedTraders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-14 text-center"
                >
                  <div
                    className="
                      mx-auto flex h-11 w-11
                      items-center justify-center
                      rounded-xl bg-slate-100
                      text-lg text-slate-400
                    "
                  >
                    <FiUsers />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No traders found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No traders are available in this section.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedTraders.map((trader) => (
                <tr
                  key={trader.id}
                  className="
                    transition-colors
                    hover:bg-slate-50/70
                  "
                >
                  {/* Trader */}
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <TraderAvatar trader={trader} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {trader.trader_name ||
                            trader.company_name ||
                            "-"}
                        </p>

                        <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                          {trader.trader_code
                            ? `#${trader.trader_code}`
                            : "No trader code"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {trader.mobile ||
                          trader.phone ||
                          "-"}
                      </p>

                      <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
                        {trader.email || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <p className="truncate text-xs font-semibold capitalize text-slate-700">
                      {trader.trader_type || "-"}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge trader={trader} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <ActionButtons
                      trader={trader}
                      statusUpdating={statusUpdating}
                      onView={onView}
                      onApprove={onApprove}
                      onReject={onReject}
                      mode={mode}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* MOBILE / TABLET                                                    */}
      {/* ================================================================== */}

      <div className="xl:hidden">
        {loading ? (
          <div className="px-5 py-14 text-center">
            <FiRefreshCw className="mx-auto animate-spin text-xl text-cyan-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading traders...
            </p>
          </div>
        ) : paginatedTraders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div
              className="
                mx-auto flex h-11 w-11
                items-center justify-center
                rounded-xl bg-slate-100
                text-lg text-slate-400
              "
            >
              <FiUsers />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              No traders found
            </p>
          </div>
        ) : (
          paginatedTraders.map((trader) => (
            <TraderMobileCard
              key={trader.id}
              trader={trader}
              statusUpdating={statusUpdating}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
              mode={mode}
            />
          ))
        )}
      </div>

      <TablePagination
        page={page}
        setPage={setPage}
        totalItems={traders.length}
      />
    </section>
  );
}

/* ========================================================================== */
/* DETAILS DRAWER                                                             */
/* ========================================================================== */

function TraderDetails({
  trader,
  onClose,
  onApprove,
  onReject,
  statusUpdating,
}) {
  if (!trader) {
    return null;
  }

  const statusKey =
    getTraderStatusKey(trader);

  const isUpdating = Boolean(
    statusUpdating?.[trader.id]
  );

  const districts =
    getDistricts(trader);

  const experience =
    trader?.years_of_experience !== null &&
    trader?.years_of_experience !== undefined
      ? `${trader.years_of_experience} Years`
      : trader?.experience || "-";

  const registeredDate =
    trader.created_at ||
    trader.createdAt ||
    trader.registered_at ||
    trader.registeredAt;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close trader details"
        onClick={onClose}
        className="
          absolute inset-0
          h-full w-full
          bg-slate-950/35
          backdrop-blur-[2px]
        "
      />

      {/* Drawer */}
      <aside
        className="
          absolute right-0 top-0
          flex h-full w-full
          flex-col bg-white
          shadow-2xl
          sm:max-w-xl
        "
      >
        {/* Header */}
        <div
          className="
            flex shrink-0
            items-center justify-between
            border-b border-slate-200
            px-4 py-4
            sm:px-6
          "
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600">
              Trader Profile
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-950">
              Registration Details
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl border
              border-slate-200
              text-slate-500 transition
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Profile */}
            <div
              className="
                rounded-2xl border
                border-slate-200
                bg-white p-4
                shadow-sm
              "
            >
              <div className="flex items-start gap-4">
                <TraderAvatar
                  trader={trader}
                  large
                />

                <div className="min-w-0 flex-1">
                  <StatusBadge trader={trader} />

                  <h4 className="mt-2 break-words text-xl font-black leading-tight text-slate-950">
                    {trader.trader_name ||
                      trader.company_name ||
                      "-"}
                  </h4>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Trader Code{" "}
                    <span className="text-slate-700">
                      {trader.trader_code || "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Contact Information
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={FiPhone}
                  label="Mobile"
                  value={
                    trader.mobile ||
                    trader.phone
                  }
                />

                <DetailItem
                  icon={FiMail}
                  label="Email"
                  value={trader.email}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Business Information
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={FiBriefcase}
                  label="Trader Type"
                  value={trader.trader_type}
                />

                <DetailItem
                  icon={FiMapPin}
                  label="Districts"
                  value={districts}
                />

                <DetailItem
                  icon={FiBriefcase}
                  label="Markets"
                  value={
                    trader.markets ||
                    trader.market
                  }
                />

                <DetailItem
                  icon={FiClock}
                  label="Experience"
                  value={experience}
                />
              </div>
            </div>

            {/* Registration Information */}
            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Registration Information
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={FiUser}
                  label="Trader ID"
                  value={trader.id}
                />

                <DetailItem
                  icon={FiCheckCircle}
                  label="Current Status"
                  value={formatStatus(trader)}
                />

                <DetailItem
                  icon={FiCalendar}
                  label="Registered Date"
                  value={formatDate(
                    registeredDate
                  )}
                />

                <DetailItem
                  icon={FiMapPin}
                  label="Address"
                  value={trader.address}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          className="
            shrink-0 border-t
            border-slate-200
            bg-white p-4
            sm:px-6
          "
        >
          {statusKey === "approved" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-11 rounded-xl
                  border border-slate-200
                  bg-white
                  text-sm font-bold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => onReject(trader)}
                disabled={isUpdating}
                className="
                  inline-flex h-11
                  items-center justify-center
                  gap-2 rounded-xl
                  border border-rose-200
                  bg-rose-50 px-4
                  text-sm font-bold
                  text-rose-600
                  transition
                  hover:bg-rose-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiXCircle />

                {isUpdating
                  ? "Saving..."
                  : "Revoke Approval"}
              </button>
            </div>
          ) : statusKey === "rejected" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-11 rounded-xl
                  border border-slate-200
                  bg-white
                  text-sm font-bold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => onApprove(trader)}
                disabled={isUpdating}
                className="
                  inline-flex h-11
                  items-center justify-center
                  gap-2 rounded-xl
                  bg-emerald-600 px-4
                  text-sm font-bold
                  text-white transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiCheckCircle />

                {isUpdating
                  ? "Saving..."
                  : "Approve Trader"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onApprove(trader)}
                disabled={isUpdating}
                className="
                  inline-flex h-11
                  items-center justify-center
                  gap-2 rounded-xl
                  bg-emerald-600 px-4
                  text-sm font-bold
                  text-white transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiCheckCircle />

                {isUpdating
                  ? "Saving..."
                  : "Approve Trader"}
              </button>

              <button
                type="button"
                onClick={() => onReject(trader)}
                disabled={isUpdating}
                className="
                  inline-flex h-11
                  items-center justify-center
                  gap-2 rounded-xl
                  border border-rose-200
                  bg-rose-50 px-4
                  text-sm font-bold
                  text-rose-600
                  transition
                  hover:bg-rose-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiXCircle />

                {isUpdating
                  ? "Saving..."
                  : "Reject Trader"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ========================================================================== */
/* MAIN COMPONENT                                                             */
/* ========================================================================== */

export default function TraderApproval() {
  const dispatch = useDispatch();

  const [approvalPage, setApprovalPage] =
    useState(1);

  const [approvedPage, setApprovedPage] =
    useState(1);

  const [
    selectedTraderId,
    setSelectedTraderId,
  ] = useState(null);

  const {
    loading,
    error,
    statusError,
    search,
    statusUpdating,
  } = useSelector(selectAdminTraderState);

  const traders = useSelector(
    selectFilteredTraders
  );

  /* ====================================================================== */
  /* SPLIT TABLE DATA                                                       */
  /* ====================================================================== */

  const approvalTraders = useMemo(() => {
    return traders.filter((trader) => {
      const status =
        getTraderStatusKey(trader);

      return status !== "approved";
    });
  }, [traders]);

  const approvedTraders = useMemo(() => {
    return traders.filter(
      (trader) =>
        getTraderStatusKey(trader) ===
        "approved"
    );
  }, [traders]);

  const selectedTrader =
    traders.find(
      (trader) =>
        trader.id === selectedTraderId
    ) || null;

  /* ====================================================================== */
  /* STATUS COUNTS                                                          */
  /* ====================================================================== */

  const pendingCount = useMemo(() => {
    return traders.filter(
      (trader) =>
        getTraderStatusKey(trader) ===
        "pending"
    ).length;
  }, [traders]);

  const rejectedCount = useMemo(() => {
    return traders.filter(
      (trader) =>
        getTraderStatusKey(trader) ===
        "rejected"
    ).length;
  }, [traders]);

  /* ====================================================================== */
  /* LOAD                                                                   */
  /* ====================================================================== */

  useEffect(() => {
    /*
      This page separates status into two tables.
      So keep the Redux status filter on "all".
    */

    dispatch(setTraderStatusFilter("all"));

    dispatch(fetchAdminTraders());
  }, [dispatch]);

  /* ====================================================================== */
  /* RESET PAGINATION AFTER SEARCH                                          */
  /* ====================================================================== */

  useEffect(() => {
    setApprovalPage(1);
    setApprovedPage(1);
  }, [search]);

  /* ====================================================================== */
  /* PROTECT APPROVAL PAGE                                                  */
  /* ====================================================================== */

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        approvalTraders.length /
          PAGE_SIZE
      )
    );

    if (approvalPage > totalPages) {
      setApprovalPage(totalPages);
    }
  }, [
    approvalTraders.length,
    approvalPage,
  ]);

  /* ====================================================================== */
  /* PROTECT APPROVED PAGE                                                  */
  /* ====================================================================== */

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        approvedTraders.length /
          PAGE_SIZE
      )
    );

    if (approvedPage > totalPages) {
      setApprovedPage(totalPages);
    }
  }, [
    approvedTraders.length,
    approvedPage,
  ]);

  /* ====================================================================== */
  /* ACTIONS                                                                */
  /* ====================================================================== */

  const handleView = (trader) => {
    setSelectedTraderId(trader.id);
  };

  const handleApprove = (trader) => {
    dispatch(
      updateAdminTraderStatus({
        traderId: trader.id,
        status: "approved",
      })
    );
  };

  const handleReject = (trader) => {
    const name =
      trader.trader_name ||
      trader.company_name ||
      "this trader";

    const isApproved =
      getTraderStatusKey(trader) ===
      "approved";

    const message = isApproved
      ? `Are you sure you want to revoke approval for ${name}?`
      : `Are you sure you want to reject ${name}?`;

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    dispatch(
      updateAdminTraderStatus({
        traderId: trader.id,
        status: "rejected",
      })
    );
  };

  /* ====================================================================== */
  /* UI                                                                     */
  /* ====================================================================== */

  return (
    <div className="min-h-full">
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}

      <div className="mb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
              Trader Management
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Trader Approval
            </h1>

            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Review trader registrations and manage approved traders.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchAdminTraders()
              )
            }
            disabled={loading}
            className="
              inline-flex h-10
              items-center justify-center
              gap-2 self-start
              rounded-xl border
              border-slate-200
              bg-white px-4
              text-xs font-bold
              text-slate-700
              shadow-sm transition
              hover:border-slate-300
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              lg:self-auto
            "
          >
            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SUMMARY CARDS                                                     */}
      {/* ================================================================= */}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total */}
        <div
          className="
            rounded-2xl border
            border-slate-200
            bg-white p-4
            shadow-sm
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>

              <p className="mt-1 text-2xl font-black text-slate-950">
                {traders.length}
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-slate-100
                text-slate-600
              "
            >
              <FiUsers />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          className="
            rounded-2xl border
            border-amber-100
            bg-white p-4
            shadow-sm
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Pending
              </p>

              <p className="mt-1 text-2xl font-black text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-amber-50
                text-amber-600
              "
            >
              <FiClock />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div
          className="
            rounded-2xl border
            border-emerald-100
            bg-white p-4
            shadow-sm
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Approved
              </p>

              <p className="mt-1 text-2xl font-black text-emerald-600">
                {approvedTraders.length}
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-emerald-50
                text-emerald-600
              "
            >
              <FiCheckCircle />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div
          className="
            rounded-2xl border
            border-rose-100
            bg-white p-4
            shadow-sm
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Rejected
              </p>

              <p className="mt-1 text-2xl font-black text-rose-600">
                {rejectedCount}
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-rose-50
                text-rose-600
              "
            >
              <FiXCircle />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SEARCH                                                            */}
      {/* ================================================================= */}

      <div
        className="
          mb-5 rounded-2xl
          border border-slate-200
          bg-white p-4
          shadow-sm
        "
      >
        <div className="relative">
          <FiSearch
            className="
              absolute left-3.5
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              dispatch(
                setTraderSearch(
                  event.target.value
                )
              )
            }
            placeholder="Search trader name, code, mobile, email, district..."
            className="
              h-11 w-full
              rounded-xl border
              border-slate-200
              bg-slate-50
              pl-10 pr-4
              text-sm font-medium
              text-slate-800
              outline-none transition
              placeholder:text-slate-400
              focus:border-cyan-500
              focus:bg-white
              focus:ring-4
              focus:ring-cyan-50
            "
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* ERRORS                                                            */}
      {/* ================================================================= */}

      {(error || statusError) && (
        <div className="mb-5 space-y-2">
          {error && (
            <div
              className="
                rounded-xl border
                border-rose-200
                bg-rose-50
                px-4 py-3
                text-xs font-semibold
                text-rose-700
              "
            >
              {error}
            </div>
          )}

          {statusError && (
            <div
              className="
                rounded-xl border
                border-rose-200
                bg-rose-50
                px-4 py-3
                text-xs font-semibold
                text-rose-700
              "
            >
              {statusError}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TABLES                                                            */}
      {/* ================================================================= */}

      <div className="space-y-5">
        {/* Approval Queue */}
        <TraderTableSection
          title="Approval Queue"
          description="Pending and rejected registrations that are not currently approved."
          traders={approvalTraders}
          loading={loading}
          page={approvalPage}
          setPage={setApprovalPage}
          statusUpdating={statusUpdating}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          mode="approval"
        />

        {/* Approved Traders */}
        <TraderTableSection
          title="Approved Traders"
          description="Traders that have already been reviewed and approved."
          traders={approvedTraders}
          loading={loading}
          page={approvedPage}
          setPage={setApprovedPage}
          statusUpdating={statusUpdating}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          mode="approved"
        />
      </div>

      {/* ================================================================= */}
      {/* DETAILS DRAWER                                                    */}
      {/* ================================================================= */}

      <TraderDetails
        trader={selectedTrader}
        onClose={() =>
          setSelectedTraderId(null)
        }
        onApprove={handleApprove}
        onReject={handleReject}
        statusUpdating={statusUpdating}
      />
    </div>
  );
}