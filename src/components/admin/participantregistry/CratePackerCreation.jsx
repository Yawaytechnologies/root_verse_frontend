// src/components/admin/cratePacker/CratePackerCreate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCratePacker,
  fetchCratePackers,
  fetchLocations,
} from "../../../redux/action/cratepackerCreateActions";
import {
  clearCratePackerCreateState,
  selectCratePackerCreateError,
  selectCratePackerCreateLoading,
  selectCratePackerListLoading,
  selectCratePackerListError,
  selectCratePackers,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from "../../../redux/reducer/cratepackerCreateSlice";

const toDDMMYYYY = (input) => {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }
  return input;
};

export default function CratePackerCreate() {
  const dispatch = useDispatch();

  const items = useSelector(selectCratePackers);
  const listLoading = useSelector(selectCratePackerListLoading);
  const listError = useSelector(selectCratePackerListError);

  const createLoading = useSelector(selectCratePackerCreateLoading);
  const createError = useSelector(selectCratePackerCreateError);

  const locations = useSelector(selectLocations);
  const locationsLoading = useSelector(selectLocationsLoading);
  const locationsError = useSelector(selectLocationsError);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: "",
    location_id: "", // ✅ selected id here
  });

  useEffect(() => {
    dispatch(fetchCratePackers());
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCratePackerCreateState());
    };
  }, [dispatch]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!/^\d{7,15}$/.test(form.phone.trim()))
      return "Phone must be 7 to 15 digits";
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Invalid email";
    if (!form.address.trim()) return "Address is required";
    if (!form.date_of_birth.trim()) return "Date of birth is required";

    const dob = toDDMMYYYY(form.date_of_birth.trim());
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) return "DOB format must be DD-MM-YYYY";

    if (!form.location_id) return "Location is required";
    if (Number.isNaN(Number(form.location_id))) return "Invalid location";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearCratePackerCreateState());

    const err = validate();
    if (err) return alert(err);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      date_of_birth: toDDMMYYYY(form.date_of_birth.trim()),
      // ✅ submit selected id
      location_id: Number(form.location_id),
    };

    const res = await dispatch(createCratePacker(payload));
    if (res.meta.requestStatus === "fulfilled") {
      alert(`Crate packer created (location_id: ${payload.location_id})`);
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        date_of_birth: "",
        location_id: "",
      });
      dispatch(fetchCratePackers());
    }
  };

  const recent = useMemo(
    () => (Array.isArray(items) ? items.slice(0, 5) : []),
    [items]
  );

  const locationOptions = useMemo(() => {
    const arr = Array.isArray(locations) ? locations : [];
    // try best label: name / location_name / code
    return arr.map((l) => ({
      id: l.id,
      label: l.location_name || l.name || l.location_code || `Location #${l.id}`,
      code: l.location_code || l.code || "",
    }));
  }, [locations]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-50/60 border-b border-emerald-100 px-5 py-4">
          <div className="text-lg font-extrabold text-slate-900">
            Create Crate Packer
          </div>
          <div className="text-sm text-slate-500">
            POST <span className="font-semibold">/api/crate-packer</span> • GET{" "}
            <span className="font-semibold">/api/locations</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {(createError || listError || locationsError) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {createError || listError || locationsError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(v) => setField("name", v)} />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setField("phone", v)}
              placeholder="9047782360"
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setField("email", v)}
              placeholder="abc@gmail.com"
            />

            {/* ✅ Location dropdown */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-900/60">
                Location
              </label>

              <select
                value={form.location_id}
                onChange={(e) => setField("location_id", e.target.value)}
                disabled={locationsLoading}
                className="mt-2 h-11 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <option value="">
                  {locationsLoading ? "Loading locations..." : "Select location"}
                </option>
                {locationOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}{o.code ? ` (${o.code})` : ""} — ID: {o.id}
                  </option>
                ))}
              </select>

              {/* show chosen id */}
              <div className="mt-1 text-[12px] text-slate-500">
                Selected Location ID:{" "}
                <span className="font-semibold text-slate-900">
                  {form.location_id || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Date of Birth (DD-MM-YYYY)"
              value={form.date_of_birth}
              onChange={(v) => setField("date_of_birth", v)}
              placeholder="21-02-2001"
            />
            <Field
              label="Address"
              value={form.address}
              onChange={(v) => setField("address", v)}
              placeholder="testing"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-2">
            <button
              type="submit"
              disabled={createLoading}
              className={[
                "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white",
                createLoading
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800",
              ].join(" ")}
            >
              {createLoading ? "Creating..." : "Create"}
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(fetchCratePackers());
                dispatch(fetchLocations());
              }}
              className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
            >
              {listLoading || locationsLoading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          <div className="pt-2">
            <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Recent Records
            </div>
            <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3">
              {recent.length === 0 ? (
                <div className="text-sm text-slate-500">No data</div>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li
                      key={r.id || r.email || Math.random()}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {r.name || "—"}
                        </div>
                        <div className="truncate text-[12px] text-slate-500">
                          {r.phone || "—"} • {r.email || "—"}
                        </div>
                      </div>
                      <div className="text-[12px] font-semibold text-slate-600">
                        Loc ID: {r.location_id ?? "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-900/60">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}