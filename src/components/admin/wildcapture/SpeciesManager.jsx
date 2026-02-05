import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiRefreshCcw,
  FiX,
  FiAlertTriangle,
  FiSave,
  FiImage,
} from "react-icons/fi";
import { fetchSpecies, addSpecies, editSpecies, removeSpecies } from "../../../redux/action/speciesActions";
import { clearSpeciesError } from "../../../redux/reducer/speciesSlice";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

function clean(v = "") {
  return String(v).trim();
}

function upper(v = "") {
  return clean(v).toUpperCase();
}

/**
 * ✅ render when backend returns:
 * - full URL
 * - relative path (/uploads/..)
 * - supabase public URL
 */
function imgSrc(v) {
  if (!v) return "";
  const s = String(v).trim();
  if (/^https?:\/\//i.test(s) || s.startsWith("blob:") || s.startsWith("data:")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return s;
}

export default function SpeciesManager() {
  const dispatch = useDispatch();
  const { list = [], loading, error, creating, updatingById = {}, deletingById = {} } =
    useSelector((s) => s.species);

  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [active, setActive] = useState(null);

  const [fishName, setFishName] = useState("");
  const [fishCode, setFishCode] = useState("");

  // ✅ upload File (sent as fish_type_image)
  const [fishImageFile, setFishImageFile] = useState(null);
  // ✅ preview (either blob for new file, or fish_type_url from backend)
  const [fishImagePreview, setFishImagePreview] = useState("");

  useEffect(() => {
    dispatch(fetchSpecies());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (fishImagePreview?.startsWith("blob:")) URL.revokeObjectURL(fishImagePreview);
    };
  }, [fishImagePreview]);

  const rows = useMemo(() => {
    const arr = Array.isArray(list) ? list : [];
    const query = q.trim().toLowerCase();
    if (!query) return arr;
    return arr.filter((x) => {
      const n = (x.fish_name || "").toLowerCase();
      const c = (x.fish_code || "").toLowerCase();
      return n.includes(query) || c.includes(query);
    });
  }, [list, q]);

  const startCreate = () => {
    dispatch(clearSpeciesError());
    setFishName("");
    setFishCode("");
    setFishImageFile(null);
    setFishImagePreview("");
    setOpenCreate(true);
  };

  const startEdit = (item) => {
    dispatch(clearSpeciesError());
    setActive(item);
    setFishName(item?.fish_name || "");
    setFishCode(item?.fish_code || "");

    // ✅ backend stored url is fish_type_url
    const existingUrl = item?.fish_type_url;
    setFishImageFile(null);
    setFishImagePreview(existingUrl ? imgSrc(existingUrl) : "");

    setOpenEdit(true);
  };

  const closeAll = () => {
    setOpenCreate(false);
    setOpenEdit(false);
    setActive(null);
    setFishName("");
    setFishCode("");

    if (fishImagePreview?.startsWith("blob:")) URL.revokeObjectURL(fishImagePreview);
    setFishImageFile(null);
    setFishImagePreview("");
  };

  const onPickImage = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return alert("Please select an image file.");

    if (fishImagePreview?.startsWith("blob:")) URL.revokeObjectURL(fishImagePreview);

    setFishImageFile(file);
    setFishImagePreview(URL.createObjectURL(file));
  };

  const removePickedImage = () => {
    // this removes only the picked/previewed image in UI
    if (fishImagePreview?.startsWith("blob:")) URL.revokeObjectURL(fishImagePreview);
    setFishImageFile(null);
    setFishImagePreview("");
  };

  const submitCreate = async () => {
    const fish_name = clean(fishName);
    const fish_code = upper(fishCode);

    if (!fish_name) return alert("Fish name required");
    if (!fish_code) return alert("Fish code required (Eg: TUN02)");

    // ✅ IMPORTANT:
    // send file as fish_type_image (FormData happens in service)
    await dispatch(
      addSpecies({
        fish_name,
        fish_code,
        fish_type_image: fishImageFile || null,
      })
    );

    await dispatch(fetchSpecies());
    closeAll();
  };

  const submitEdit = async () => {
    if (!active?.id) return;

    const fish_name = clean(fishName);
    const fish_code = upper(fishCode);

    if (!fish_name) return alert("Fish name required");
    if (!fish_code) return alert("Fish code required (Eg: TUN02)");

    // ✅ only send file if user picked a new one
    const payload = { id: active.id, fish_name, fish_code };
    if (fishImageFile) payload.fish_type_image = fishImageFile;

    await dispatch(editSpecies(payload));
    await dispatch(fetchSpecies());
    closeAll();
  };

  const doDelete = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm(`Delete species "${item.fish_name}" (${item.fish_code})?`);
    if (!ok) return;
    await dispatch(removeSpecies({ id: item.id }));
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200 shadow-sm">
                Master Data
              </div>
              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Species Registry
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Maintain fish species (name + code + image) used in Wild Capture.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(fetchSpecies())}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <FiRefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,23,42,0.22)] hover:bg-black"
              >
                <FiPlus className="h-4 w-4" />
                Add Species
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or code…"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </div>

            <div className="text-xs text-slate-500">
              Total: <span className="font-semibold text-slate-900">{rows.length}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <FiAlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* list */}
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* desktop */}
        <div className="hidden md:block">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[44%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Image</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Species Name</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    No species found.
                  </td>
                </tr>
              ) : (
                rows.map((x) => {
                  const updating = !!updatingById[x.id];
                  const deleting = !!deletingById[x.id];

                  // ✅ backend saved url
                  const raw = x?.fish_type_url;
                  const src = raw ? imgSrc(raw) : "";

                  return (
                    <tr key={x.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{x.id}</td>

                      <td className="px-5 py-4">
                        <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          {src ? (
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-slate-400">
                              <FiImage />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold tracking-wide text-amber-900">
                          {x.fish_code || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-extrabold text-slate-900 truncate">{x.fish_name}</div>
                        <div className="text-[11px] text-slate-500">
                          Registry entry used in grades, landings & sales.
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(x)}
                            disabled={updating}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => doDelete(x)}
                            disabled={deleting}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
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

        {/* mobile */}
        <div className="md:hidden divide-y divide-slate-200">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No species found.</div>
          ) : (
            rows.map((x) => {
              const updating = !!updatingById[x.id];
              const deleting = !!deletingById[x.id];

              const raw = x?.fish_type_url;
              const src = raw ? imgSrc(raw) : "";

              return (
                <div key={x.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          {src ? (
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-slate-400">
                              <FiImage />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            ID {x.id}
                          </div>

                          <div className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold tracking-wide text-amber-900">
                            {x.fish_code || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 truncate text-base font-extrabold text-slate-900">{x.fish_name}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(x)}
                        disabled={updating}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => doDelete(x)}
                        disabled={deleting}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-[11px] text-slate-500">
          Species code is used as immutable reference in logs. Don’t change codes casually.
        </div>
      </div>

      {/* CREATE MODAL */}
      {openCreate && (
        <Modal title="Add Species" onClose={closeAll}>
          <div className="space-y-4">
            <Field label="Fish Name" value={fishName} onChange={setFishName} placeholder="Eg: Tuna" />
            <Field label="Fish Code" value={fishCode} onChange={setFishCode} placeholder="Eg: TUN02" upper />

            <ImageField
              label="Fish Image"
              preview={fishImagePreview}
              onPick={onPickImage}
              onRemove={removePickedImage}
              hint="Uploads as fish_type_image. Backend saves as fish_type_url."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAll}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreate}
                disabled={creating}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  creating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                ].join(" ")}
              >
                <FiSave className="h-4 w-4" />
                {creating ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {openEdit && active && (
        <Modal title="Edit Species" onClose={closeAll} subtitle={`ID: ${active.id}`}>
          <div className="space-y-4">
            <Field label="Fish Name" value={fishName} onChange={setFishName} placeholder="Eg: Shark" />
            <Field label="Fish Code" value={fishCode} onChange={setFishCode} placeholder="Eg: TUN02" upper />

            <ImageField
              label="Fish Image"
              preview={fishImagePreview}
              onPick={onPickImage}
              onRemove={removePickedImage}
              hint="Pick a new file only if you want to replace fish_type_url."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAll}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEdit}
                disabled={!!updatingById[active.id]}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  updatingById[active.id] ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                ].join(" ")}
              >
                <FiSave className="h-4 w-4" />
                {updatingById[active.id] ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">{title}</div>
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, upper = false }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(upper ? e.target.value.toUpperCase() : e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
      />
      <div className="mt-1 text-[11px] text-slate-500">
        Use stable codes. Example format: <span className="font-semibold">TUN02</span>
      </div>
    </div>
  );
}

function ImageField({ label, preview, onPick, onRemove, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</label>

      <div className="mt-2 flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-400">
              <FiImage />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0])}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-black"
          />

          <div className="mt-1 text-[11px] text-slate-500">{hint}</div>

          {preview && (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
            >
              <FiX className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
