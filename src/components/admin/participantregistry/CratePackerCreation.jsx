// src/components/admin/participantregistry/CratePackerCreation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSave, FiAlertTriangle,
  FiUser, FiPhone, FiMail, FiMapPin,
  FiCalendar, FiHome, FiChevronDown, FiBox,
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import {
  createCratePacker,
  fetchLocations,
} from "../../../redux/action/cratepackerCreateActions";
import {
  clearCratePackerCreateState,
  selectCratePackerCreateError,
  selectCratePackerCreateLoading,
  selectLocations,
  selectLocationsLoading,
  selectLocationsError,
} from "../../../redux/reducer/cratepackerCreateSlice";

/* ── Theme ── */
const A = "#D97706";

/* ── Helpers ── */
const autoFormatDOB = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

const toDDMMYYYY = (input) => {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-");
    return `${d}-${m}-${y}`;
  }
  return input;
};

const capWords = (v) => v.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

const EMPTY_FORM = {
  name: "", phone: "", email: "",
  address: "", date_of_birth: "", location_id: "",
};

/* ── Atoms ── */
function InputField({ label, value, onChange, placeholder, type = "text", required, icon: Icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required && <span style={{ color: A }}> *</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />}
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 rounded-xl bg-stone-50 text-sm font-medium text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${Icon ? "pl-10 pr-4" : "px-4"}`}
          style={{ "--tw-ring-color": A }}
        />
      </div>
    </div>
  );
}

function LocationSelect({ value, onChange, options, loading, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        Location <span style={{ color: A }}>*</span>
      </label>
      <div className="relative">
        <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-stone-50 pl-10 pr-9 text-sm font-medium text-stone-900 ring-1 ring-stone-200 appearance-none focus:bg-white focus:outline-none focus:ring-2 transition disabled:opacity-60"
          style={{ "--tw-ring-color": A }}
        >
          <option value="">{loading ? "Loading locations…" : "Select location…"}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}{o.code ? ` (${o.code})` : ""}
            </option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════
   Main Component — Create only
══════════════════════════════════════ */
export default function CratePackerCreate() {
  const dispatch = useDispatch();

  const createLoading = useSelector(selectCratePackerCreateLoading);
  const createError   = useSelector(selectCratePackerCreateError);
  const locations     = useSelector(selectLocations);
  const locLoading    = useSelector(selectLocationsLoading);
  const locError      = useSelector(selectLocationsError);

  const [form, setForm] = useState(EMPTY_FORM);
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    return () => { dispatch(clearCratePackerCreateState()); };
  }, [dispatch]);

  const locationOptions = useMemo(() =>
    (Array.isArray(locations) ? locations : []).map((l) => ({
      id:    l.id,
      label: l.location_name || l.name || l.location_code || `Location #${l.id}`,
      code:  l.location_code || l.code || "",
    })), [locations]);

  const validate = () => {
    const name = form.name.trim();
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!/^[A-Za-z\s.'-]+$/.test(name)) return "Name must contain only letters";

    const phone = form.phone.trim();
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";

    const email = form.email.trim();
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email address";

    if (!form.address.trim()) return "Address is required";

    if (!form.date_of_birth.trim()) return "Date of birth is required";
    if (!/^\d{2}-\d{2}-\d{4}$/.test(form.date_of_birth.trim())) return "DOB must be in DD-MM-YYYY format";

    if (!form.location_id) return "Location is required";
    if (Number.isNaN(Number(form.location_id))) return "Invalid location selected";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearCratePackerCreateState());
    const err = validate();
    if (err) return alert(err);
    const payload = {
      name:          form.name.trim(),
      phone:         form.phone.trim(),
      email:         form.email.trim(),
      address:       form.address.trim(),
      date_of_birth: toDDMMYYYY(form.date_of_birth.trim()),
      location_id:   Number(form.location_id),
    };
    const res = await dispatch(createCratePacker(payload));
    if (res.meta.requestStatus === "fulfilled") {
      setForm(EMPTY_FORM);
    }
  };

  return (
    <div className="pccCratePacker min-h-full" style={{ background: "#F7F5F2" }}>
      <style>{`
        .pccCratePacker * { box-sizing: border-box; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-5">

        {/* ── Page header ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineInventory2 className="h-4 w-4" style={{ color: A }} />
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">
              Participant Registry
            </p>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Create Crate Packer</h1>
          <p className="mt-1 text-sm text-stone-500">Register a new crate packer account</p>
        </div>

        {/* ── Error ── */}
        {createError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />{createError}
          </div>
        )}

        {/* ── Form ── */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                 style={{ background: A }}>
              <FiBox className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">Crate Packer Details</p>
              <p className="text-xs text-stone-500">Fields marked <span style={{ color: A }}>*</span> are required</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="Full Name"    required value={form.name}    onChange={v => setField("name", capWords(v))}    placeholder="e.g. S. Karthik"  icon={FiUser} />
              <InputField label="Phone"        required value={form.phone}   onChange={v => setField("phone", v.replace(/\D/g, "").slice(0, 10))}   placeholder="10-digit mobile"   icon={FiPhone} />
              <InputField label="Email"        required value={form.email}   onChange={v => setField("email", v)}   placeholder="packer@email.com"  icon={FiMail} />

              {/* DOB with auto-dash formatting */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Date of Birth <span style={{ color: A }}>*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={form.date_of_birth}
                    onChange={(e) => setField("date_of_birth", autoFormatDOB(e.target.value))}
                    placeholder="DD-MM-YYYY"
                    maxLength={10}
                    className="w-full h-10 rounded-xl bg-stone-50 pl-10 pr-4 text-sm font-medium text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition"
                    style={{ "--tw-ring-color": A }}
                  />
                </div>
              </div>

              <InputField label="Address" required value={form.address} onChange={v => setField("address", v)} placeholder="Street, City" icon={FiHome} />
              <LocationSelect
                value={form.location_id}
                onChange={v => setField("location_id", v)}
                options={locationOptions}
                loading={locLoading}
                error={locError}
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={createLoading}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                      style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}>
                {createLoading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FiSave className="h-4 w-4" />}
                {createLoading ? "Creating…" : "Create Packer"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
