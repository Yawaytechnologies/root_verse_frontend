import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiFileText,
  FiMail,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  fetchAdminProcessors,
  updateAdminProcessorStatus,
} from "../../../redux/action/adminProcessor.actions";

import {
  selectAdminProcessorState,
  selectFilteredProcessors,
  setProcessorSearch,
  setProcessorStatusFilter,
} from "../../../redux/reducer/adminProcessor.slice";

const PAGE_SIZE = 6;

/* ==========================================================================
   HELPERS
   ========================================================================== */

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

function getProcessorName(processor) {
  return (
    processor?.processor_name ||
    processor?.company_name ||
    "Processor"
  );
}

/*
  Temporary two-state model:

  is_active: false -> Pending
  is_active: true  -> Approved

  If backend later adds status / approval_status,
  approved will still work.
*/
function getProcessorStatus(processor) {
  const explicitStatus =
    processor?.status ||
    processor?.approval_status ||
    processor?.verification_status;

  if (explicitStatus) {
    const normalized = String(explicitStatus)
      .trim()
      .toLowerCase();

    if (normalized === "approved") {
      return "approved";
    }

    return "pending";
  }

  return processor?.is_active === true
    ? "approved"
    : "pending";
}

/* ==========================================================================
   STATUS BADGE
   ========================================================================== */

function StatusBadge({ status }) {
  const approved = status === "approved";

  return (
    <span
      className={`
        inline-flex shrink-0 items-center gap-1.5
        whitespace-nowrap rounded-full border
        px-2.5 py-1 text-[11px] font-bold

        ${
          approved
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 shrink-0 rounded-full
          ${
            approved
              ? "bg-emerald-500"
              : "bg-amber-500"
          }
        `}
      />

      {approved ? "Approved" : "Pending"}
    </span>
  );
}

/* ==========================================================================
   PROCESSOR AVATAR
   ========================================================================== */

function ProcessorAvatar({
  processor,
  large = false,
}) {
  const image =
    processor?.company_logo_url ||
    processor?.profile_image_url ||
    processor?.logo_url;

  const name = getProcessorName(processor);

  const firstLetter = name
    .charAt(0)
    .toUpperCase();

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
      {firstLetter}
    </div>
  );
}

/* ==========================================================================
   DETAIL ITEM
   ========================================================================== */

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
        <Icon className="shrink-0 text-sm" />

        <p className="text-[10px] font-black uppercase tracking-[0.08em]">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
        {displayValue(value)}
      </p>
    </div>
  );
}

/* ==========================================================================
   STAT CARD
   ========================================================================== */

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-950",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className={`mt-1 text-2xl font-black ${valueClass}`}>
            {value}
          </p>
        </div>

        <div
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          <Icon />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGINATION
   ========================================================================== */

function Pagination({
  currentPage,
  setCurrentPage,
  totalItems,
}) {
  if (totalItems === 0) {
    return null;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / PAGE_SIZE)
  );

  const start =
    (currentPage - 1) * PAGE_SIZE + 1;

  const end = Math.min(
    currentPage * PAGE_SIZE,
    totalItems
  );

  return (
    <div
      className="
        flex flex-col gap-3
        border-t border-slate-200
        bg-slate-50/50 px-4 py-3
        sm:flex-row sm:items-center
        sm:justify-between sm:px-5
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
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) =>
              Math.max(1, page - 1)
            )
          }
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg border border-slate-200
            bg-white text-slate-600
            transition hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-35
          "
        >
          <FiChevronLeft />
        </button>

        <div
          className="
            flex h-9 min-w-[86px]
            items-center justify-center
            rounded-lg border border-slate-200
            bg-white px-3 text-xs
            font-black text-slate-700
          "
        >
          {currentPage} / {totalPages}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(
                totalPages,
                page + 1
              )
            )
          }
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg border border-slate-200
            bg-white text-slate-600
            transition hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-35
          "
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   ACTION BUTTONS
   ========================================================================== */

function ProcessorActions({
  processor,
  status,
  statusUpdating,
  onView,
  onApprove,
  onRevoke,
  mobile = false,
}) {
  const isUpdating = Boolean(
    statusUpdating?.[processor.id]
  );

  const isApproved =
    status === "approved";

  const commonSize = mobile
    ? "h-10 flex-1 px-3 text-xs"
    : "h-9 px-3 text-[11px]";

  return (
    <div
      className={`
        flex items-center gap-2
        ${mobile ? "w-full" : "justify-end"}
      `}
    >
      {/* View */}
      <button
        type="button"
        onClick={() => onView(processor)}
        className={`
          inline-flex items-center justify-center gap-1.5
          whitespace-nowrap rounded-lg
          border border-slate-200 bg-white
          font-bold text-slate-600
          transition
          hover:border-slate-300
          hover:bg-slate-50
          hover:text-slate-900
          ${commonSize}
        `}
      >
        <FiEye className="shrink-0" />

        View
      </button>

      {/* Pending -> Approve */}
      {!isApproved && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            onApprove(processor)
          }
          className={`
            inline-flex items-center justify-center gap-1.5
            whitespace-nowrap rounded-lg
            bg-emerald-600
            font-bold text-white
            transition
            hover:bg-emerald-700
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${commonSize}
          `}
        >
          <FiCheckCircle className="shrink-0" />

          {isUpdating
            ? "Saving..."
            : "Approve"}
        </button>
      )}

      {/* Approved -> Revoke */}
      {isApproved && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            onRevoke(processor)
          }
          className={`
            inline-flex items-center justify-center gap-1.5
            whitespace-nowrap rounded-lg
            border border-amber-200
            bg-amber-50
            font-bold text-amber-700
            transition
            hover:border-amber-300
            hover:bg-amber-100
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${commonSize}
          `}
        >
          <FiRefreshCw className="shrink-0" />

          {isUpdating
            ? "Saving..."
            : "Revoke"}
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   MOBILE CARD
   ========================================================================== */

function ProcessorMobileCard({
  processor,
  statusUpdating,
  onView,
  onApprove,
  onRevoke,
}) {
  const status =
    getProcessorStatus(processor);

  return (
    <div className="border-b border-slate-100 p-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <ProcessorAvatar
          processor={processor}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {getProcessorName(
                  processor
                )}
              </p>

              <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                #
                {processor.processor_code ||
                  "-"}
              </p>
            </div>

            <StatusBadge
              status={status}
            />
          </div>

          <div className="mt-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Contact
            </p>

            <p className="mt-1 truncate text-xs font-bold text-slate-700">
              {processor.mobile || "-"}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
              {processor.email || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ProcessorActions
          processor={processor}
          status={status}
          statusUpdating={statusUpdating}
          onView={onView}
          onApprove={onApprove}
          onRevoke={onRevoke}
          mobile
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   PROCESSOR TABLE
   ========================================================================== */

function ProcessorTable({
  title,
  description,
  processors,
  type,
  loading,
  statusUpdating,
  currentPage,
  setCurrentPage,
  onView,
  onApprove,
  onRevoke,
}) {
  const paginatedProcessors =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return processors.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      processors,
      currentPage,
    ]);

  const isApprovedTable =
    type === "approved";

  return (
    <section
      className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white shadow-sm
      "
    >
      {/* Table Header */}
      <div
        className="
          flex items-center justify-between
          gap-4 border-b border-slate-200
          px-4 py-4 sm:px-5
        "
      >
        <div className="min-w-0">
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
                text-[10px] font-black
                text-slate-600
              "
            >
              {processors.length}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`
            hidden h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl sm:flex

            ${
              isApprovedTable
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }
          `}
        >
          {isApprovedTable ? (
            <FiCheckCircle />
          ) : (
            <FiClock />
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* DESKTOP TABLE                                                      */}
      {/* ================================================================== */}

      <div className="hidden lg:block">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th
                className="
                  w-[31%] px-5 py-3
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Processor
              </th>

              <th
                className="
                  w-[31%] px-5 py-3
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Contact
              </th>

              <th
                className="
                  w-[14%] px-5 py-3
                  text-[10px] font-black
                  uppercase tracking-[0.1em]
                  text-slate-400
                "
              >
                Status
              </th>

              <th
                className="
                  w-[24%] px-5 py-3
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
                  colSpan="4"
                  className="px-5 py-12 text-center"
                >
                  <FiRefreshCw className="mx-auto animate-spin text-xl text-cyan-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Loading processors...
                  </p>
                </td>
              </tr>
            ) : paginatedProcessors.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-5 py-12 text-center"
                >
                  <div
                    className="
                      mx-auto flex h-11 w-11
                      items-center justify-center
                      rounded-xl bg-slate-100
                      text-slate-400
                    "
                  >
                    <FiUsers />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No processors found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No records are available in this section.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedProcessors.map(
                (processor) => {
                  const status =
                    getProcessorStatus(
                      processor
                    );

                  return (
                    <tr
                      key={processor.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Processor */}
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <ProcessorAvatar
                            processor={
                              processor
                            }
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {getProcessorName(
                                processor
                              )}
                            </p>

                            <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                              #
                              {processor.processor_code ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-700">
                            {processor.mobile ||
                              "-"}
                          </p>

                          <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
                            {processor.email ||
                              "-"}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={status}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <ProcessorActions
                          processor={
                            processor
                          }
                          status={status}
                          statusUpdating={
                            statusUpdating
                          }
                          onView={onView}
                          onApprove={
                            onApprove
                          }
                          onRevoke={
                            onRevoke
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* MOBILE / TABLET                                                    */}
      {/* ================================================================== */}

      <div className="lg:hidden">
        {loading ? (
          <div className="px-5 py-12 text-center">
            <FiRefreshCw className="mx-auto animate-spin text-xl text-cyan-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading processors...
            </p>
          </div>
        ) : paginatedProcessors.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div
              className="
                mx-auto flex h-11 w-11
                items-center justify-center
                rounded-xl bg-slate-100
                text-slate-400
              "
            >
              <FiUsers />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              No processors found
            </p>
          </div>
        ) : (
          paginatedProcessors.map(
            (processor) => (
              <ProcessorMobileCard
                key={processor.id}
                processor={processor}
                statusUpdating={
                  statusUpdating
                }
                onView={onView}
                onApprove={onApprove}
                onRevoke={onRevoke}
              />
            )
          )
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={processors.length}
      />
    </section>
  );
}

/* ==========================================================================
   PROCESSOR DETAILS DRAWER
   ========================================================================== */

function ProcessorDetails({
  processor,
  onClose,
  onApprove,
  onRevoke,
  statusUpdating,
}) {
  if (!processor) {
    return null;
  }

  const status =
    getProcessorStatus(processor);

  const isApproved =
    status === "approved";

  const isUpdating = Boolean(
    statusUpdating?.[processor.id]
  );

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close processor details"
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
            px-4 py-4 sm:px-6
          "
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600">
              Processor Profile
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">
              Registration Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl border border-slate-200
              text-slate-500 transition
              hover:bg-slate-50
              hover:text-slate-950
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
                <ProcessorAvatar
                  processor={processor}
                  large
                />

                <div className="min-w-0 flex-1">
                  <StatusBadge
                    status={status}
                  />

                  <h3 className="mt-2 break-words text-xl font-black leading-tight text-slate-950">
                    {getProcessorName(
                      processor
                    )}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Processor Code{" "}
                    <span className="text-slate-700">
                      {processor.processor_code ||
                        "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* CONTACT                                                    */}
            {/* ========================================================== */}

            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Contact Information
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={FiUser}
                  label="Contact Person"
                  value={
                    processor.contact_name
                  }
                />

                <DetailItem
                  icon={FiPhone}
                  label="Mobile"
                  value={
                    processor.mobile
                  }
                />

                <DetailItem
                  icon={FiMail}
                  label="Email"
                  value={
                    processor.email
                  }
                  className="sm:col-span-2"
                />
              </div>
            </div>

            {/* ========================================================== */}
            {/* REGISTRATION                                               */}
            {/* ========================================================== */}

            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Registration Information
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* License only shown here */}
                <DetailItem
                  icon={FiFileText}
                  label="License Number"
                  value={
                    processor.license_no
                  }
                />

                <DetailItem
                  icon={FiCalendar}
                  label="Registered Date"
                  value={formatDate(
                    processor.created_at
                  )}
                />

                <DetailItem
                  icon={FiUser}
                  label="Processor ID"
                  value={
                    processor.id
                  }
                />

                <DetailItem
                  icon={FiRefreshCw}
                  label="Last Updated"
                  value={formatDate(
                    processor.updated_at
                  )}
                />
              </div>
            </div>

            {/* ========================================================== */}
            {/* LOCATION                                                   */}
            {/* ========================================================== */}

            <div className="mt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Location
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={FiMapPin}
                  label="State"
                  value={
                    processor.state
                  }
                />

                <DetailItem
                  icon={FiMapPin}
                  label="District"
                  value={
                    processor.district
                  }
                />

                <DetailItem
                  icon={FiNavigation}
                  label="Latitude"
                  value={
                    processor.gps_latitude
                  }
                />

                <DetailItem
                  icon={FiNavigation}
                  label="Longitude"
                  value={
                    processor.gps_longitude
                  }
                />

                <DetailItem
                  icon={FiMapPin}
                  label="Address"
                  value={
                    processor.address
                  }
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-slate-200
            bg-white p-4 sm:px-6
          "
        >
          {!isApproved ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-11 rounded-xl
                  border border-slate-200
                  bg-white text-sm
                  font-bold text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Close
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onApprove(processor)
                }
                className="
                  inline-flex h-11
                  items-center justify-center gap-2
                  rounded-xl bg-emerald-600
                  px-4 text-sm font-bold
                  text-white transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiCheckCircle />

                {isUpdating
                  ? "Saving..."
                  : "Approve Processor"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-11 rounded-xl
                  border border-slate-200
                  bg-white text-sm
                  font-bold text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Close
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onRevoke(processor)
                }
                className="
                  inline-flex h-11
                  items-center justify-center gap-2
                  rounded-xl
                  border border-amber-200
                  bg-amber-50 px-4
                  text-sm font-bold
                  text-amber-700
                  transition
                  hover:bg-amber-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiRefreshCw />

                {isUpdating
                  ? "Saving..."
                  : "Revoke Approval"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function ProcessorApproval() {
  const dispatch = useDispatch();

  const [
    pendingPage,
    setPendingPage,
  ] = useState(1);

  const [
    approvedPage,
    setApprovedPage,
  ] = useState(1);

  const [
    selectedProcessorId,
    setSelectedProcessorId,
  ] = useState(null);

  const {
    loading,
    error,
    statusError,
    statusUpdating,
    search,
  } = useSelector(
    selectAdminProcessorState
  );

  const processors =
    useSelector(
      selectFilteredProcessors
    );

  /* ==========================================================================
     LOAD
     ========================================================================== */

  useEffect(() => {
    /*
      No status dropdown anymore.
      Both tables are created locally.
    */

    dispatch(
      setProcessorStatusFilter(
        "all"
      )
    );

    dispatch(
      fetchAdminProcessors()
    );
  }, [dispatch]);

  /* ==========================================================================
     TWO TABLES
     ========================================================================== */

  const pendingProcessors =
    useMemo(() => {
      return processors.filter(
        (processor) =>
          getProcessorStatus(
            processor
          ) === "pending"
      );
    }, [processors]);

  const approvedProcessors =
    useMemo(() => {
      return processors.filter(
        (processor) =>
          getProcessorStatus(
            processor
          ) === "approved"
      );
    }, [processors]);

  /* ==========================================================================
     SELECTED PROCESSOR
     ========================================================================== */

  const selectedProcessor =
    processors.find(
      (processor) =>
        processor.id ===
        selectedProcessorId
    ) || null;

  /* ==========================================================================
     RESET PAGES ON SEARCH
     ========================================================================== */

  useEffect(() => {
    setPendingPage(1);
    setApprovedPage(1);
  }, [search]);

  /* ==========================================================================
     PAGE GUARDS
     ========================================================================== */

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        pendingProcessors.length /
          PAGE_SIZE
      )
    );

    if (
      pendingPage > totalPages
    ) {
      setPendingPage(
        totalPages
      );
    }
  }, [
    pendingProcessors.length,
    pendingPage,
  ]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        approvedProcessors.length /
          PAGE_SIZE
      )
    );

    if (
      approvedPage > totalPages
    ) {
      setApprovedPage(
        totalPages
      );
    }
  }, [
    approvedProcessors.length,
    approvedPage,
  ]);

  /* ==========================================================================
     ACTIONS
     ========================================================================== */

  const handleView = (
    processor
  ) => {
    setSelectedProcessorId(
      processor.id
    );
  };

  const handleApprove = (
    processor
  ) => {
    dispatch(
      updateAdminProcessorStatus({
        processorId:
          processor.id,
        status: "approved",
      })
    );
  };

  const handleRevoke = (
    processor
  ) => {
    const name =
      getProcessorName(
        processor
      );

    const confirmed =
      window.confirm(
        `Are you sure you want to revoke approval for ${name}?`
      );

    if (!confirmed) {
      return;
    }

    /*
      TEMPORARY:
      Revoke sends approved processor
      back to pending.
    */

    dispatch(
      updateAdminProcessorStatus({
        processorId:
          processor.id,
        status: "pending",
      })
    );
  };

  /* ==========================================================================
     UI
     ========================================================================== */

  return (
    <div className="min-h-full">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div
        className="
          mb-4 flex flex-col gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px] font-black
              uppercase tracking-[0.16em]
              text-cyan-600
            "
          >
            Processor Management
          </p>

          <h1
            className="
              mt-1 text-2xl
              font-black tracking-tight
              text-slate-950
              sm:text-3xl
            "
          >
            Processor Approval
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Review processor registrations and manage approved processors.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            dispatch(
              fetchAdminProcessors()
            )
          }
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
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-40
            sm:self-auto
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

      {/* ================================================================== */}
      {/* SUMMARY                                                            */}
      {/* ================================================================== */}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Processors"
          value={processors.length}
          icon={FiUsers}
          iconClass="bg-slate-100 text-slate-600"
        />

        <StatCard
          label="Pending"
          value={
            pendingProcessors.length
          }
          icon={FiClock}
          iconClass="bg-amber-50 text-amber-600"
          valueClass="text-amber-600"
        />

        <StatCard
          label="Approved"
          value={
            approvedProcessors.length
          }
          icon={FiCheckCircle}
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-600"
        />
      </div>

      {/* ================================================================== */}
      {/* SEARCH                                                             */}
      {/* ================================================================== */}

      <div
        className="
          mb-4 rounded-2xl
          border border-slate-200
          bg-white p-3
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
                setProcessorSearch(
                  event.target.value
                )
              )
            }
            placeholder="Search processor, code, mobile, email, district..."
            className="
              h-10 w-full
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

      {/* ================================================================== */}
      {/* ERRORS                                                             */}
      {/* ================================================================== */}

      {(error ||
        statusError) && (
        <div className="mb-4 space-y-2">
          {error && (
            <div
              className="
                rounded-xl
                border border-rose-200
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
                rounded-xl
                border border-rose-200
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

      {/* ================================================================== */}
      {/* TABLES                                                             */}
      {/* ================================================================== */}

      <div className="space-y-4">
        {/* Pending */}
        <ProcessorTable
          title="Pending Processors"
          description="Processor registrations waiting for approval."
          processors={
            pendingProcessors
          }
          type="pending"
          loading={loading}
          statusUpdating={
            statusUpdating
          }
          currentPage={
            pendingPage
          }
          setCurrentPage={
            setPendingPage
          }
          onView={handleView}
          onApprove={
            handleApprove
          }
          onRevoke={
            handleRevoke
          }
        />

        {/* Approved */}
        <ProcessorTable
          title="Approved Processors"
          description="Processors that are currently approved and active."
          processors={
            approvedProcessors
          }
          type="approved"
          loading={loading}
          statusUpdating={
            statusUpdating
          }
          currentPage={
            approvedPage
          }
          setCurrentPage={
            setApprovedPage
          }
          onView={handleView}
          onApprove={
            handleApprove
          }
          onRevoke={
            handleRevoke
          }
        />
      </div>

      {/* ================================================================== */}
      {/* DETAILS DRAWER                                                     */}
      {/* ================================================================== */}

      <ProcessorDetails
        processor={
          selectedProcessor
        }
        onClose={() =>
          setSelectedProcessorId(
            null
          )
        }
        onApprove={
          handleApprove
        }
        onRevoke={
          handleRevoke
        }
        statusUpdating={
          statusUpdating
        }
      />
    </div>
  );
}