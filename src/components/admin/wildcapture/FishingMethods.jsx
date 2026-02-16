// src/pages/admin/wild-capture/FishingMethodsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFishingMethodsThunk,
  createFishingMethodThunk,
  updateFishingMethodThunk,
  deleteFishingMethodThunk,
} from "../../../redux/action/fishingMethodActions";
import { clearFishingMethodStatus } from "../../../redux/reducer/fishingMethodSlice";
import { FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiX } from "react-icons/fi";

function clampCode(v) {
  return String(v || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export default function FishingMethodsPage() {
  const dispatch = useDispatch();
  const { items, loading, creating, updating, deleting, error, success } =
    useSelector((s) => s.fishingMethods);

  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [methodName, setMethodName] = useState("");
  const [methodCode, setMethodCode] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const busy = creating || updating || deleting;

  useEffect(() => {
    dispatch(fetchFishingMethodsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => dispatch(clearFishingMethodStatus()), 1800);
    return () => clearTimeout(t);
  }, [success, dispatch]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((m) => {
      const n = String(m.method_name || "").toLowerCase();
      const c = String(m.method_code || "").toLowerCase();
      return n.includes(needle) || c.includes(needle);
    });
  }, [items, q]);

  function resetForm() {
    setMethodName("");
    setMethodCode("");
    setImageFile(null);
    setImagePreview("");
    setEditing(null);
  }

  function openCreate() {
    dispatch(clearFishingMethodStatus());
    resetForm();
    setOpen(true);
  }

  function openEdit(row) {
    dispatch(clearFishingMethodStatus());
    setEditing(row);
    setMethodName(row.method_name || "");
    setMethodCode(row.method_code || "");
    setImageFile(null);
    setImagePreview(row.image_url || "");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
    dispatch(clearFishingMethodStatus());
  }

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    dispatch(clearFishingMethodStatus());

    const name = methodName.trim();
    const code = clampCode(methodCode);

    if (!name) return alert("Method name is required");
    if (!code) return alert("Method code is required (example: HL, PL)");
    if (code.length < 2) return alert("Method code must be at least 2 chars");

    const payload = {
      method_name: name,
      method_code: code,
      imageFile,
    };

    try {
      if (editing?.id) {
        await dispatch(
          updateFishingMethodThunk({ id: editing.id, payload })
        ).unwrap();
      } else {
        await dispatch(createFishingMethodThunk(payload)).unwrap();
      }
      dispatch(fetchFishingMethodsThunk());
      closeModal();
    } catch (errMsg) {
      console.error(errMsg);
    }
  }

  async function onDelete(id) {
    const ok = confirm("Delete this fishing method?");
    if (!ok) return;

    try {
      await dispatch(deleteFishingMethodThunk(id)).unwrap();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="w-full">
      {/* Header Card */}
      <div className="rounded-3xl ring-1 ring-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-widest text-emerald-700 ring-1 ring-emerald-100">
              WILD CAPTURE • FISHING METHODS
            </div>

            <h1 className="mt-3 text-3xl font-extrabold text-zinc-900">
              Fishing Methods
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage allowed methods (name, code, image) used across vessels and
              trips.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Total: {items.length}
              </span>

              {success && (
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  {success}
                </span>
              )}

              {error && (
                <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  {error}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or code..."
              className="h-11 w-full sm:w-[320px] rounded-2xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-emerald-200"
            />

            <button
              onClick={() => dispatch(fetchFishingMethodsThunk())}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
              disabled={loading || busy}
              title="Refresh"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <button
              onClick={openCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              disabled={busy}
            >
              <FiPlus />
              Add Method
            </button>
          </div>
        </div>
      </div>

      {/* List Card */}
      <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold tracking-widest text-zinc-700">
            METHODS LIST
          </h2>
          {loading && (
            <span className="text-xs font-semibold text-zinc-500">
              Loading...
            </span>
          )}
        </div>

        {/* ✅ MOBILE (cards) */}
        <div className="mt-4 md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-200">
              No fishing methods found.
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200"
              >
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 shrink-0">
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt={row.method_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">
                          {row.method_name}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          ID: {row.id}
                        </div>
                      </div>

                      <span className="shrink-0 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                        {row.method_code}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
                      <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
                        <div className="text-zinc-500 font-semibold">
                          Created
                        </div>
                        <div className="mt-1">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
                        <div className="text-zinc-500 font-semibold">
                          Updated
                        </div>
                        <div className="mt-1">
                          {row.updated_at
                            ? new Date(row.updated_at).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
                        disabled={busy}
                      >
                        <FiEdit2 />
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(row.id)}
                        className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
                        disabled={busy}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ DESKTOP/TABLET (table) */}
        <div className="mt-4 hidden md:block overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs font-bold text-zinc-500">
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Method Name</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-2xl bg-zinc-50 px-3 py-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-200"
                  >
                    No fishing methods found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="rounded-2xl bg-white ring-1 ring-zinc-200 hover:ring-emerald-200"
                  >
                    <td className="px-3 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200">
                        {row.image_url ? (
                          <img
                            src={row.image_url}
                            alt={row.method_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-zinc-900">
                        {row.method_name}
                      </div>
                      <div className="text-xs text-zinc-500">ID: {row.id}</div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                        {row.method_code}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-xs text-zinc-600">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-3 py-3 text-xs text-zinc-600">
                      {row.updated_at
                        ? new Date(row.updated_at).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
                          disabled={busy}
                        >
                          <FiEdit2 />
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(row.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                          disabled={busy}
                        >
                          <FiTrash2 />
                          Delete
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

      {/* Modal */}
      {/* Modal */}
{open && (
  <div className="fixed inset-0 z-[999] bg-black/40 overflow-y-auto">
    {/* wrapper: bottom on mobile, center on desktop */}
    <div className="min-h-[100dvh] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* modal: full width on mobile, scroll inside */}
      <div className="w-full sm:max-w-2xl bg-white ring-1 ring-zinc-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[92dvh] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900">
              {editing ? "Edit Fishing Method" : "Create Fishing Method"}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Add method name + short code (HL, PL...) and optional image.
            </p>
          </div>

          <button
            onClick={closeModal}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 hover:bg-zinc-100"
            disabled={busy}
            title="Close"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-600">
                Method Name
              </label>
              <input
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="Hook & Line"
                className="h-11 w-full rounded-2xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-emerald-200"
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-600">
                Method Code
              </label>
              <input
                value={methodCode}
                onChange={(e) => setMethodCode(clampCode(e.target.value))}
                placeholder="HL"
                className="h-11 w-full rounded-2xl bg-white px-4 text-sm text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-emerald-200"
                disabled={busy}
              />
              <p className="mt-2 text-xs text-zinc-500">
                Uppercase only. Example: HL, PL, TRL...
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-600">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="block w-full max-w-full text-sm text-zinc-700 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                disabled={busy}
              />
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 shrink-0 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                    }}
                  />
                ) : (
                  <div className="text-[10px] font-semibold text-zinc-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-xs text-zinc-600">
                Preview
                <div className="mt-1 text-[11px] text-zinc-500">
                  Recommended: square image (512×512)
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700"
              disabled={busy}
            >
              {creating || updating
                ? "Saving..."
                : editing
                ? "Update Method"
                : "Create Method"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
