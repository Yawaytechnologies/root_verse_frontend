import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import {
  selectAdminTraderState,
  selectTraderStats,
} from "../../../redux/reducer/adminTrader.slice";

import {
  fetchAdminTraders,
} from "../../../redux/action/adminTrader.actions";

const BASE = "/admin/trader";

/* ========================================================================== */
/* TEMP PROCESSOR DATA                                                        */
/* Replace this with processor Redux/API later                                */
/* ========================================================================== */

const processorList = [
  { id: "proc-001", status: "pending" },
  { id: "proc-002", status: "approved" },
  { id: "proc-003", status: "rejected" },
  { id: "proc-004", status: "pending" },
];

/* ========================================================================== */
/* SUMMARY CARD                                                               */
/* ========================================================================== */

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-950",
}) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl border border-slate-200
        bg-white p-4 shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>

          <p
            className={`
              mt-2 text-2xl font-black
              tracking-tight sm:text-3xl
              ${valueClass}
            `}
          >
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-xl text-lg
            ${iconClass}
          `}
        >
          <Icon />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* MINI STAT                                                                  */
/* ========================================================================== */

function MiniStat({
  label,
  value,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className={`mt-1 text-lg font-black ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* PROGRESS BAR                                                               */
/* ========================================================================== */

function ProgressBar({
  value,
  total,
  className = "bg-emerald-500",
}) {
  const percentage =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round((value / total) * 100)
        );

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className}`}
        style={{
          width: `${percentage}%`,
        }}
      />
    </div>
  );
}

/* ========================================================================== */
/* REGISTRATION PANEL                                                         */
/* ========================================================================== */

function RegistrationPanel({
  title,
  description,
  icon: Icon,
  total,
  pending,
  approved,
  rejected,
  approvalLink,
  buttonLabel,
}) {
  const approvalRate =
    total === 0
      ? 0
      : Math.round((approved / total) * 100);

  return (
    <section
      className="
        rounded-2xl border
        border-slate-200
        bg-white p-4
        shadow-sm
        sm:p-5
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex h-10 w-10
              shrink-0 items-center
              justify-center rounded-xl
              bg-cyan-50 text-cyan-600
            "
          >
            <Icon />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <span
          className="
            shrink-0 rounded-full
            bg-slate-100 px-2.5 py-1
            text-[10px] font-black
            text-slate-600
          "
        >
          {total}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          label="Total"
          value={total}
        />

        <MiniStat
          label="Pending"
          value={pending}
          valueClass="text-amber-600"
        />

        <MiniStat
          label="Approved"
          value={approved}
          valueClass="text-emerald-600"
        />

        <MiniStat
          label="Rejected"
          value={rejected}
          valueClass="text-rose-600"
        />
      </div>

      {/* Approval rate */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
              Approval Rate
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {approved} of {total} registrations approved
            </p>
          </div>

          <span className="text-xl font-black text-emerald-600">
            {approvalRate}%
          </span>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={approved}
            total={total}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        to={approvalLink}
        className="
          mt-4 inline-flex h-10
          items-center justify-center
          gap-2 rounded-xl
          border border-slate-200
          bg-white px-4
          text-xs font-bold
          text-slate-700
          transition
          hover:border-cyan-200
          hover:bg-cyan-50
          hover:text-cyan-700
        "
      >
        {buttonLabel}

        <FiArrowRight />
      </Link>
    </section>
  );
}

/* ========================================================================== */
/* DASHBOARD                                                                  */
/* ========================================================================== */

export default function TradeprocessDashboard() {
  const dispatch = useDispatch();

  const {
    items: traders = [],
    loading,
  } = useSelector(selectAdminTraderState);

  const stats = useSelector(selectTraderStats);

  /* ====================================================================== */
  /* LOAD TRADER DATA                                                       */
  /* ====================================================================== */

  useEffect(() => {
    dispatch(fetchAdminTraders());
  }, [dispatch]);

  /* ====================================================================== */
  /* PROCESSOR STATS                                                        */
  /* ====================================================================== */

  const processorStats = useMemo(() => {
    return {
      total: processorList.length,

      pending: processorList.filter(
        (item) =>
          item.status === "pending"
      ).length,

      approved: processorList.filter(
        (item) =>
          item.status === "approved"
      ).length,

      rejected: processorList.filter(
        (item) =>
          item.status === "rejected"
      ).length,
    };
  }, []);

  /* ====================================================================== */
  /* COMBINED STATS                                                         */
  /* ====================================================================== */

  const combinedStats = useMemo(() => {
    return {
      total:
        stats.total +
        processorStats.total,

      pending:
        stats.pending +
        processorStats.pending,

      approved:
        stats.approved +
        processorStats.approved,

      rejected:
        stats.rejected +
        processorStats.rejected,
    };
  }, [stats, processorStats]);

  const overallApprovalRate =
    combinedStats.total === 0
      ? 0
      : Math.round(
          (combinedStats.approved /
            combinedStats.total) *
            100
        );

  const totalNeedsReview =
    combinedStats.pending;

  /* ====================================================================== */
  /* UI                                                                     */
  /* ====================================================================== */

  return (
    <div className="min-h-full">
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}

      <div
        className="
          mb-5 flex flex-col
          gap-4 sm:flex-row
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
            Registry Overview
          </p>

          <h1
            className="
              mt-1 text-2xl
              font-black tracking-tight
              text-slate-950
              sm:text-3xl
            "
          >
            Trader & Processor Dashboard
          </h1>

          <p
            className="
              mt-1.5 max-w-xl
              text-sm font-medium
              leading-6 text-slate-500
            "
          >
            Monitor registrations, review pending applications
            and track approval performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            dispatch(fetchAdminTraders())
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

      {/* ================================================================= */}
      {/* TOP SUMMARY                                                       */}
      {/* ================================================================= */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          title="Total Registrations"
          value={combinedStats.total}
          subtitle="Trader + processor"
          icon={FiUsers}
          iconClass="bg-slate-100 text-slate-600"
        />

        <SummaryCard
          title="Awaiting Review"
          value={combinedStats.pending}
          subtitle="Requires admin action"
          icon={FiClock}
          iconClass="bg-amber-50 text-amber-600"
          valueClass="text-amber-600"
        />

        <SummaryCard
          title="Approved"
          value={combinedStats.approved}
          subtitle={`${overallApprovalRate}% approval rate`}
          icon={FiCheckCircle}
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-600"
        />

        <SummaryCard
          title="Rejected"
          value={combinedStats.rejected}
          subtitle="Not currently approved"
          icon={FiXCircle}
          iconClass="bg-rose-50 text-rose-600"
          valueClass="text-rose-600"
        />
      </div>

      {/* ================================================================= */}
      {/* ATTENTION                                                         */}
      {/* ================================================================= */}

      <section
        className="
          mt-5 overflow-hidden
          rounded-2xl border
          border-amber-200
          bg-gradient-to-r
          from-amber-50
          via-white
          to-white
          p-4 shadow-sm
          sm:p-5
        "
      >
        <div
          className="
            flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex h-10 w-10
                shrink-0 items-center
                justify-center rounded-xl
                bg-amber-100
                text-amber-600
              "
            >
              <FiClock />
            </div>

            <div>
              <p
                className="
                  text-[10px] font-black
                  uppercase tracking-[0.12em]
                  text-amber-600
                "
              >
                Needs Attention
              </p>

              <h2 className="mt-1 text-base font-black text-slate-950">
                {totalNeedsReview === 0
                  ? "No registrations are waiting for review"
                  : `${totalNeedsReview} registration${
                      totalNeedsReview === 1 ? "" : "s"
                    } waiting for review`}
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {stats.pending} trader
                {stats.pending === 1 ? "" : "s"} and{" "}
                {processorStats.pending} processor
                {processorStats.pending === 1 ? "" : "s"} currently pending.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`${BASE}/approval`}
              className="
                inline-flex h-10
                items-center justify-center
                gap-2 rounded-xl
                bg-slate-950 px-4
                text-xs font-bold
                text-white transition
                hover:bg-slate-800
              "
            >
              <FiUserCheck />

              Review Traders
            </Link>

            <Link
              to={`${BASE}/processor-approval`}
              className="
                inline-flex h-10
                items-center justify-center
                gap-2 rounded-xl
                border border-slate-200
                bg-white px-4
                text-xs font-bold
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              <FiBriefcase />

              Review Processors
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* REGISTRATION PANELS                                               */}
      {/* ================================================================= */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RegistrationPanel
          title="Trader Registrations"
          description="Current trader registration and approval performance."
          icon={FiUserCheck}
          total={stats.total}
          pending={stats.pending}
          approved={stats.approved}
          rejected={stats.rejected}
          approvalLink={`${BASE}/approval`}
          buttonLabel="Manage Trader Approvals"
        />

        <RegistrationPanel
          title="Processor Registrations"
          description="Current processor registration and approval performance."
          icon={FiBriefcase}
          total={processorStats.total}
          pending={processorStats.pending}
          approved={processorStats.approved}
          rejected={processorStats.rejected}
          approvalLink={`${BASE}/processor-approval`}
          buttonLabel="Manage Processor Approvals"
        />
      </div>

      {/* ================================================================= */}
      {/* PERFORMANCE                                                       */}
      {/* ================================================================= */}

      <section
        className="
          mt-5 rounded-2xl
          border border-slate-200
          bg-white p-4
          shadow-sm
          sm:p-5
        "
      >
        <div
          className="
            flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <FiTrendingUp />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-950">
                  Registry Performance
                </h2>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Overall approval progress across the registry.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
              Overall Approval Rate
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-600">
              {overallApprovalRate}%
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar
            value={combinedStats.approved}
            total={combinedStats.total}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat
            label="Registrations"
            value={combinedStats.total}
          />

          <MiniStat
            label="Approved"
            value={combinedStats.approved}
            valueClass="text-emerald-600"
          />

          <MiniStat
            label="Awaiting Review"
            value={combinedStats.pending}
            valueClass="text-amber-600"
          />

          <MiniStat
            label="Rejected"
            value={combinedStats.rejected}
            valueClass="text-rose-600"
          />
        </div>
      </section>
    </div>
  );
}