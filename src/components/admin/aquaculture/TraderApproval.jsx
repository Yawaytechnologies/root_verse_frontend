// src/components/admin/aquaculture/TraderApproval.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiX,
} from "react-icons/fi";
import {
  getTraderOrganizationsService,
  updateTraderStatusService,
} from "../../../redux/services/traderServices";

function extractTraderList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.traders)) return response.traders;
  if (Array.isArray(response?.data?.traders)) return response.data.traders;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function safe(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function normalizeStatus(item) {
  const raw = String(
    item?.status ||
      item?.approval_status ||
      item?.verification_status ||
      item?.trader_status ||
      ""
  ).toLowerCase();

  if (raw === "approved") return "approved";
  if (raw === "active") return "approved";
  if (raw.includes("approve")) return "approved";

  if (raw === "rejected") return "rejected";
  if (raw === "inactive") return "rejected";
  if (raw.includes("reject")) return "rejected";

  if (raw.includes("pending")) return "pending";

  if (item?.is_active === true) return "approved";
  if (item?.is_active === false) return "rejected";

  return "pending";
}

function normalizeTrader(item) {
  const id = item?.id || item?.trader_id || item?.traderId || item?._id;

  return {
    id,
    traderCode: item?.trader_code || item?.traderCode || "-",
    name:
      item?.trader_name ||
      item?.traderName ||
      item?.company_name ||
      item?.companyName ||
      item?.name ||
      `Trader ${id || ""}`,
    traderName: item?.trader_name || item?.traderName || "-",
    companyName: item?.company_name || item?.companyName || "-",
    profileImage: item?.profile_image_url || item?.profileImageUrl || "",
    companyLogo: item?.company_logo_url || item?.companyLogoUrl || "",
    mobile: item?.mobile || item?.phone || item?.phone_no || "-",
    email: item?.email || "-",
    address: item?.address || "-",
    traderType: item?.trader_type || item?.traderType || "-",
    type: item?.type || "-",
    operationalDistricts: Array.isArray(item?.operational_districts)
      ? item.operational_districts
      : Array.isArray(item?.operationalDistricts)
      ? item.operationalDistricts
      : [],
    yearsOfExperience:
      item?.years_of_experience ?? item?.yearsOfExperience ?? "-",
    markets: item?.markets || "-",
    status: normalizeStatus(item),
    isActive: item?.is_active,
    createdAt: item?.created_at || item?.createdAt,
    updatedAt: item?.updated_at || item?.updatedAt,
    raw: item,
  };
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

function StatusBadge({ status }) {
  const styles = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
  };

  const labels = {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || "Pending"}
    </span>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {safe(value)}
      </p>
    </div>
  );
}

export default function TraderApproval() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrader, setSelectedTrader] = useState(null);

  const loadTraders = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getTraderOrganizationsService();
      const list = extractTraderList(response);
      const normalized = list.map(normalizeTrader).filter((item) => item.id);

      setTraders(normalized);
    } catch (err) {
      setError(err?.message || "Failed to load traders");
      setTraders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraders();
  }, []);

  const stats = useMemo(() => {
    return {
      total: traders.length,
      pending: traders.filter((item) => item.status === "pending").length,
      approved: traders.filter((item) => item.status === "approved").length,
      rejected: traders.filter((item) => item.status === "rejected").length,
    };
  }, [traders]);

  const filteredTraders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return traders.filter((item) => {
      const searchText = [
        item.name,
        item.traderCode,
        item.mobile,
        item.email,
        item.traderType,
        item.type,
        item.markets,
        item.operationalDistricts.join(" "),
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchText.includes(q);
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [traders, search, statusFilter]);

  const handleApproval = async (item, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status === "approved" ? "approve" : "reject"} ${
        item.name
      }?`
    );

    if (!confirmed) return;

    try {
      setActionId(item.id);
      setError("");
      setSuccess("");

      await updateTraderStatusService(item.id, {
        status,
        is_active: status === "approved",
      });

      setSuccess(`Trader ${status} successfully`);
      await loadTraders();

      if (selectedTrader?.id === item.id) {
        setSelectedTrader(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to update trader status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Total Traders
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              {stats.total}
            </h2>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Pending
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-600">
              {stats.pending}
            </h2>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Approved
            </p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">
              {stats.approved}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Rejected
            </p>
            <h2 className="mt-2 text-3xl font-black text-red-600">
              {stats.rejected}
            </h2>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, mobile, code, district..."
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  type="button"
                  onClick={loadTraders}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                {success}
              </div>
            ) : null}
          </div>

          <div className="p-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Trader
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Contact
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Type
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        District
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Registered
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-sm font-black text-slate-500"
                        >
                          Loading traders...
                        </td>
                      </tr>
                    ) : filteredTraders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-sm font-black text-slate-500"
                        >
                          No traders found.
                        </td>
                      </tr>
                    ) : (
                      filteredTraders.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              {item.companyLogo || item.profileImage ? (
                                <img
                                  src={item.companyLogo || item.profileImage}
                                  alt={item.name}
                                  className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-sm font-black text-cyan-700">
                                  {String(item.name || "T").charAt(0)}
                                </div>
                              )}

                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  Code: {item.traderCode}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <p className="text-sm font-bold text-slate-800">
                              {item.mobile}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {item.email}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-700">
                            {item.traderType}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-700">
                            {item.operationalDistricts.length
                              ? item.operationalDistricts.join(", ")
                              : "-"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-700">
                            {formatDate(item.createdAt)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedTrader(item)}
                                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproval(item, "approved")}
                                disabled={
                                  item.status === "approved" ||
                                  actionId === item.id
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                <FiUserCheck />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproval(item, "rejected")}
                                disabled={
                                  item.status === "rejected" ||
                                  actionId === item.id
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                <FiUserX />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedTrader ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-cyan-700">
                  Trader Details
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  {selectedTrader.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {selectedTrader.traderCode}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrader(null)}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <DetailBox label="Trader Name" value={selectedTrader.traderName} />
              <DetailBox label="Company Name" value={selectedTrader.companyName} />
              <DetailBox label="Trader Code" value={selectedTrader.traderCode} />
              <DetailBox label="Mobile Number" value={selectedTrader.mobile} />
              <DetailBox label="Email" value={selectedTrader.email} />
              <DetailBox label="Trader Type" value={selectedTrader.traderType} />
              <DetailBox label="Account Type" value={selectedTrader.type} />
              <DetailBox
                label="Operational Districts"
                value={
                  selectedTrader.operationalDistricts.length
                    ? selectedTrader.operationalDistricts.join(", ")
                    : "-"
                }
              />
              <DetailBox label="Markets" value={selectedTrader.markets} />
              <DetailBox
                label="Years Of Experience"
                value={selectedTrader.yearsOfExperience}
              />
              <DetailBox label="Status" value={selectedTrader.status} />
              <DetailBox
                label="Registered Date"
                value={formatDate(selectedTrader.createdAt)}
              />
              <DetailBox
                label="Updated Date"
                value={formatDate(selectedTrader.updatedAt)}
              />

              <div className="sm:col-span-2">
                <DetailBox label="Address" value={selectedTrader.address} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedTrader(null)}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleApproval(selectedTrader, "approved")}
                disabled={
                  selectedTrader.status === "approved" ||
                  actionId === selectedTrader.id
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiCheckCircle />
                Approve Trader
              </button>

              <button
                type="button"
                onClick={() => handleApproval(selectedTrader, "rejected")}
                disabled={
                  selectedTrader.status === "rejected" ||
                  actionId === selectedTrader.id
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiUserX />
                Reject Trader
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}