import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMapPin, FiPhone, FiMail, FiCheck, FiX, FiAlertCircle,
  FiChevronDown, FiInfo, FiLoader, FiRefreshCw,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { BsSnow2 } from "react-icons/bs";

import { fetchStates, fetchDistricts, createCollectionCenter } from "../../../redux/action/collectionCenterActions";
import { resetSubmit, clearDistricts } from "../../../redux/reducer/collectionCenterSlice";
import {
  selectStates,
  selectDistricts,
  selectStatesLoading,
  selectDistLoading,
  selectStatesError,
  selectSubmitLoading,
  selectSubmitSuccess,
  selectSubmitError,
  selectCreatedCenter,
} from "../../../redux/reducer/collectionCenterSlice";

/* ─── Theme ─────────────────────────────────────────────── */
const T = {
  accent:        "#D97706",
  accentLight:   "#FEF3C7",
  accentRing:    "#FCD34D",
  pageBg:        "#FAFAF9",
  cardBg:        "#FFFFFF",
  border:        "#E7E5E4",
  textPrimary:   "#1C1917",
  textSecondary: "#57534E",
  textMuted:     "#A8A29E",
  errorBg:       "#FFF1F2",
  errorBorder:   "#FECDD3",
  errorText:     "#BE123C",
  successBg:     "#F0FDF4",
  successText:   "#15803D",
};

/* ─── Validation rules ───────────────────────────────────── */
const RULES = {
  centre_id:                v => (v ?? "").trim() ? null : "Centre ID is required",
  centre_name:              v => (v ?? "").trim() ? null : "Centre name is required",
  state:                    v => (v ?? "").trim() ? null : "State is required",
  district:                 v => (v ?? "").trim() ? null : "District is required",
  address_line_1:           v => (v ?? "").trim() ? null : "Address is required",
  contact_name:             v => (v ?? "").trim() ? null : "Contact person name is required",
  contact_mobile:           v => /^[6-9]\d{9}$/.test((v ?? "").trim()) ? null : "Enter a valid 10-digit mobile number",
  email:                    v => !(v ?? "").trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address",
  gps_lat:                  v => !(v ?? "").trim() || /^-?\d{1,2}(\.\d+)?$/.test(v) ? null : "Enter a valid latitude (e.g. 10.7672)",
  gps_lng:                  v => !(v ?? "").trim() || /^-?\d{1,3}(\.\d+)?$/.test(v) ? null : "Enter a valid longitude (e.g. 79.8449)",
  cold_storage_capacity_kg: v => !(v ?? "").trim() || /^\d+$/.test(v) ? null : "Capacity must be a whole number",
};

/* ─── Friendly API error mapper ──────────────────────────── */
const FRIENDLY = {
  "centre_id already exists": "This Centre ID is already taken. Please choose a different ID.",
  "duplicate":                "A centre with this ID already exists.",
  "unauthorized":             "Your session has expired. Please log in again.",
  "forbidden":                "You don't have permission to perform this action.",
  "default":                  "Something went wrong. Please try again or contact support.",
};

function friendlyError(raw = "", status) {
  if (status === 409) return "This Centre ID is already in use. Please choose a unique one.";
  const lower = (raw ?? "").toLowerCase();
  if (!lower || lower.includes("failed to fetch")) return "Unable to reach the server. Check your internet connection.";
  for (const [key, msg] of Object.entries(FRIENDLY)) {
    if (lower.includes(key)) return msg;
  }
  return FRIENDLY.default;
}

/* ─── Shared input class ─────────────────────────────────── */
function inputCls(hasError) {
  return [
    "w-full h-10 rounded-xl text-sm transition-all outline-none border",
    hasError
      ? "bg-rose-50 border-rose-300 text-rose-900 placeholder:text-rose-300"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
  ].join(" ");
}

/* ─── Atoms ──────────────────────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: T.errorText }}>
      <FiAlertCircle className="h-3 w-3 shrink-0" />{msg}
    </p>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSecondary }}>
      {children}{required && <span className="ml-0.5" style={{ color: T.accent }}>*</span>}
    </label>
  );
}

function TextInput({ label, name, placeholder, type = "text", icon: Icon, required, value, onChange, onBlur, error, span, hint }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <Label required={required}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: T.textMuted }} />
        )}
        <input
          type={type} name={name} value={value}
          onChange={onChange} onBlur={onBlur}
          placeholder={placeholder}
          className={`${inputCls(!!error)} ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
      {hint && !error && <p className="mt-1 text-[11px]" style={{ color: T.textMuted }}>{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

/* ─── Cold Storage Toggle ────────────────────────────────── */
function ColdToggle({ value, onChange }) {
  function handleRowClick() { onChange(!value); }
  function handlePillClick(e) { e.stopPropagation(); onChange(!value); }

  return (
    <div className="sm:col-span-2 lg:col-span-3 mt-1">
      <div
        onClick={handleRowClick}
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onKeyDown={e => (e.key === " " || e.key === "Enter") && onChange(!value)}
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "1rem",
          borderRadius:   "0.75rem",
          padding:        "0.875rem 1rem",
          border:         `1px solid ${value ? T.accentRing : T.border}`,
          background:     value ? T.accentLight : "#F5F5F4",
          cursor:         "pointer",
          userSelect:     "none",
          transition:     "background 0.2s, border-color 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              height:         "2.25rem",
              width:          "2.25rem",
              borderRadius:   "0.75rem",
              flexShrink:     0,
              background:     value ? T.accent : "#E7E5E4",
              transition:     "background 0.2s",
            }}
          >
            <BsSnow2 style={{ height: "1rem", width: "1rem", color: value ? "#fff" : T.textMuted, transition: "color 0.2s" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary, margin: 0 }}>
              Cold Storage Available
            </p>
            <p style={{ fontSize: "0.75rem", color: T.textMuted, margin: "2px 0 0" }}>
              Centre has active refrigeration / cold room facility
            </p>
          </div>
        </div>

        <div
          onClick={handlePillClick}
          style={{
            position:     "relative",
            flexShrink:   0,
            height:       "1.5rem",
            width:        "2.75rem",
            borderRadius: "9999px",
            background:   value ? T.accent : "#D6D3D1",
            transition:   "background 0.2s",
            cursor:       "pointer",
          }}
        >
          <span
            style={{
              position:     "absolute",
              top:          "2px",
              left:         value ? "22px" : "2px",
              height:       "20px",
              width:        "20px",
              borderRadius: "50%",
              background:   "#fff",
              boxShadow:    "0 1px 3px rgba(0,0,0,0.25)",
              transition:   "left 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-1 border-b" style={{ borderColor: T.border }}>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ background: T.accent }}
      >
        {step}
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{title}</p>
        <p className="text-xs" style={{ color: T.textMuted }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Initial form state ─────────────────────────────────── */
const INITIAL = {
  centre_id: "", centre_name: "", state: "", district: "",
  address_line_1: "", address_line_2: "", pincode: "",
  gps_lat: "", gps_lng: "",
  cold_storage_capacity_kg: "",
  contact_name: "", contact_mobile: "", email: "",
  status: "ACTIVE",
  cold_storage_available: false,
};

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
export default function CollectionCentreCreate({ onSuccess, onCancel }) {
  const dispatch = useDispatch();

  // Redux state
  const states        = useSelector(selectStates);
  const districts     = useSelector(selectDistricts);
  const statesLoading = useSelector(selectStatesLoading);
  const distLoading   = useSelector(selectDistLoading);
  const statesError   = useSelector(selectStatesError);
  const submitLoading = useSelector(selectSubmitLoading);
  const submitSuccess = useSelector(selectSubmitSuccess);
  const submitError   = useSelector(selectSubmitError);
  const createdCenter = useSelector(selectCreatedCenter);

  // Local form state
  const [form,    setForm]    = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [errors,  setErrors]  = useState({});

  // Fetch states on mount
  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  // Fetch districts whenever selected state changes
  useEffect(() => {
    if (!form.state) {
      dispatch(clearDistricts());
      return;
    }
    dispatch(fetchDistricts(form.state));
  }, [form.state, dispatch]);

  // Call onSuccess when submit succeeds
  useEffect(() => {
    if (submitSuccess) {
      onSuccess?.(createdCenter);
    }
  }, [submitSuccess, createdCenter, onSuccess]);

  /* ── Field helpers ── */
  function validateField(name, value) {
    return RULES[name] ? RULES[name](value ?? "") : null;
  }

  function validateAll() {
    const errs = {};
    Object.keys(RULES).forEach(k => {
      const msg = validateField(k, form[k] ?? "");
      if (msg) errs[k] = msg;
    });
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "state") {
      setForm(f => ({ ...f, state: value, district: "" }));
      if (touched.district) setErrors(er => ({ ...er, district: null }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    if (touched[name]) setErrors(er => ({ ...er, [name]: validateField(name, value) }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(er => ({ ...er, [name]: validateField(name, value) }));
  }

  /* ── Submit ── */
  function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.keys(RULES).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validateAll();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const payload = {
      centre_id:      form.centre_id.trim(),
      centre_name:    form.centre_name.trim(),
      district:       form.district,
      state:          form.state,
      address_line_1: form.address_line_1.trim(),
      ...(form.address_line_2.trim()           && { address_line_2:           form.address_line_2.trim() }),
      ...(form.pincode.trim()                  && { pincode:                  form.pincode.trim() }),
      ...(form.gps_lat.trim()                  && { gps_lat:                  parseFloat(form.gps_lat) }),
      ...(form.gps_lng.trim()                  && { gps_lng:                  parseFloat(form.gps_lng) }),
      ...(form.cold_storage_capacity_kg.trim() && { cold_storage_capacity_kg: parseInt(form.cold_storage_capacity_kg, 10) }),
      contact_name:   form.contact_name.trim(),
      contact_mobile: form.contact_mobile.trim(),
      ...(form.email.trim()                    && { email: form.email.trim() }),
      status: form.status,
      cold_storage_available: form.cold_storage_available,
    };

    dispatch(createCollectionCenter(payload));
  }

  function handleReset() {
    setForm(INITIAL);
    setTouched({});
    setErrors({});
    dispatch(resetSubmit());
  }

  function dismissError() {
    dispatch(resetSubmit());
  }

  /* ── Derived error message for display ── */
  const displayError = submitError
    ? friendlyError(submitError.message, submitError.status)
    : null;

  /* ── Success Screen ── */
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center" style={{ minHeight: "50vh" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: T.successBg }}>
          <FiCheck className="h-8 w-8" style={{ color: T.successText }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: T.textPrimary }}>Centre Registered Successfully</p>
          <p className="mt-1 text-sm" style={{ color: T.textSecondary }}>
            <strong>{form.centre_name}</strong> has been added to the system.
          </p>
        </div>
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          <button
            onClick={handleReset}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: T.accent }}
          >
            Register Another
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold border transition hover:bg-stone-50"
            style={{ color: T.textSecondary, borderColor: T.border }}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={{ background: T.pageBg }} className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdStorefront className="h-4 w-4" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textMuted }}>
              Participant Registry
            </p>
          </div>
          <h1 className="text-xl font-bold" style={{ color: T.textPrimary }}>Register Collection Centre</h1>
          <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
            Fill in the details below to register a new centre in the system
          </p>
        </div>

        {/* States load error */}
        {statesError && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 border"
            style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
          >
            <FiAlertCircle className="h-4 w-4 shrink-0" style={{ color: "#B45309" }} />
            <p className="text-sm" style={{ color: "#B45309" }}>{statesError}</p>
          </div>
        )}

        {/* Global submit error */}
        {displayError && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 border"
            style={{ background: T.errorBg, borderColor: T.errorBorder }}
          >
            <FiAlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: T.errorText }} />
            <p className="text-sm font-medium" style={{ color: T.errorText }}>{displayError}</p>
            <button className="ml-auto shrink-0" onClick={dismissError}>
              <FiX className="h-4 w-4" style={{ color: T.errorText }} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: T.cardBg, borderColor: T.border }}>

            {/* Card header */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b" style={{ borderColor: T.border }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: T.accent }}>
                <MdStorefront className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>Centre Details</p>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  Fields marked <span style={{ color: T.accent }}>*</span> are required
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 border" style={{ borderColor: T.border }}>
                <FiInfo className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: T.textMuted }}>
                  All required fields must be filled
                </span>
              </div>
            </div>

            <div className="px-5 py-5 space-y-7">

              {/* ── 1: Identity ── */}
              <div>
                <SectionHeader step="1" title="Centre Identity" subtitle="Basic identification and naming" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextInput
                    label="Centre ID" name="centre_id" required
                    placeholder="e.g. CC-004"
                    value={form.centre_id} onChange={handleChange} onBlur={handleBlur}
                    error={touched.centre_id ? errors.centre_id : null}
                    hint="Must be unique across all centres"
                  />
                  <TextInput
                    label="Centre Name" name="centre_name" required
                    placeholder="Display name"
                    value={form.centre_name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.centre_name ? errors.centre_name : null}
                  />
                  {/* Status select */}
                  <div>
                    <Label required>Status</Label>
                    <div className="relative">
                      <select
                        name="status" value={form.status}
                        onChange={handleChange} onBlur={handleBlur}
                        className={`${inputCls(false)} appearance-none px-4 pr-9 cursor-pointer`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2: Location ── */}
              <div>
                <SectionHeader step="2" title="Location" subtitle="Physical address and GPS coordinates" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {/* State dropdown */}
                  <div>
                    <Label required>State</Label>
                    <div className="relative">
                      <select
                        name="state" value={form.state}
                        onChange={handleChange} onBlur={handleBlur}
                        disabled={statesLoading}
                        className={[
                          inputCls(!!(touched.state && errors.state)),
                          "appearance-none px-4 pr-9",
                          statesLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <option value="">{statesLoading ? "Loading states…" : "Select state…"}</option>
                        {states.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      {statesLoading
                        ? <FiRefreshCw className="animate-spin pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
                        : <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
                      }
                    </div>
                    <FieldError msg={touched.state ? errors.state : null} />
                  </div>

                  {/* District dropdown — depends on state */}
                  <div>
                    <Label required>District</Label>
                    <div className="relative">
                      <select
                        name="district" value={form.district}
                        onChange={handleChange} onBlur={handleBlur}
                        disabled={!form.state || distLoading}
                        className={[
                          inputCls(!!(touched.district && errors.district)),
                          "appearance-none px-4 pr-9",
                          (!form.state || distLoading) ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <option value="">
                          {!form.state ? "Select state first" : distLoading ? "Loading districts…" : "Select district…"}
                        </option>
                        {districts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                      {distLoading
                        ? <FiRefreshCw className="animate-spin pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
                        : <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
                      }
                    </div>
                    {!form.state && !touched.district && (
                      <p className="mt-1 text-[11px]" style={{ color: T.textMuted }}>Choose a state to see districts</p>
                    )}
                    <FieldError msg={touched.district ? errors.district : null} />
                  </div>

                  <TextInput
                    label="Pincode" name="pincode"
                    placeholder="e.g. 611001"
                    value={form.pincode} onChange={handleChange} onBlur={handleBlur}
                    error={touched.pincode ? errors.pincode : null}
                  />
                  <TextInput
                    label="Address Line 1" name="address_line_1" required span={2}
                    placeholder="Street / Area / Building"
                    value={form.address_line_1} onChange={handleChange} onBlur={handleBlur}
                    error={touched.address_line_1 ? errors.address_line_1 : null}
                  />
                  <TextInput
                    label="Address Line 2 (optional)" name="address_line_2"
                    placeholder="Landmark / Near"
                    value={form.address_line_2} onChange={handleChange} onBlur={handleBlur}
                    error={null}
                  />
                  <TextInput
                    label="GPS Latitude" name="gps_lat" icon={FiMapPin}
                    placeholder="e.g. 10.7672"
                    value={form.gps_lat} onChange={handleChange} onBlur={handleBlur}
                    error={touched.gps_lat ? errors.gps_lat : null}
                  />
                  <TextInput
                    label="GPS Longitude" name="gps_lng" icon={FiMapPin}
                    placeholder="e.g. 79.8449"
                    value={form.gps_lng} onChange={handleChange} onBlur={handleBlur}
                    error={touched.gps_lng ? errors.gps_lng : null}
                  />
                </div>
              </div>

              {/* ── 3: Storage ── */}
              <div>
                <SectionHeader step="3" title="Storage Capacity" subtitle="Cold storage configuration" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextInput
                    label="Cold Storage Capacity (kg)" name="cold_storage_capacity_kg"
                    placeholder="e.g. 5000"
                    value={form.cold_storage_capacity_kg} onChange={handleChange} onBlur={handleBlur}
                    error={touched.cold_storage_capacity_kg ? errors.cold_storage_capacity_kg : null}
                    hint="Leave blank if not applicable"
                  />
                  <ColdToggle value={form.cold_storage_available} onChange={v => setForm(f => ({ ...f, cold_storage_available: v }))} />
                </div>
              </div>

              {/* ── 4: Contact ── */}
              <div>
                <SectionHeader step="4" title="Contact Information" subtitle="Primary point of contact for this centre" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextInput
                    label="Contact Person" name="contact_name" required
                    placeholder="Full name"
                    value={form.contact_name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.contact_name ? errors.contact_name : null}
                  />
                  <TextInput
                    label="Contact Mobile" name="contact_mobile" required
                    type="tel" icon={FiPhone}
                    placeholder="10-digit mobile"
                    value={form.contact_mobile} onChange={handleChange} onBlur={handleBlur}
                    error={touched.contact_mobile ? errors.contact_mobile : null}
                  />
                  <TextInput
                    label="Email (optional)" name="email"
                    type="email" icon={FiMail}
                    placeholder="centre@email.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    error={touched.email ? errors.email : null}
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-5 py-4"
              style={{ borderColor: T.border, background: "#FAFAF9" }}
            >
              <p className="text-xs" style={{ color: T.textMuted }}>
                <span style={{ color: T.accent }}>*</span> Required fields must be completed before submitting
              </p>
              <div className="flex gap-3">
                <button
                  type="button" onClick={onCancel}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition hover:bg-stone-50"
                  style={{ color: T.textSecondary, borderColor: T.border }}
                >
                  <FiX className="h-4 w-4" /> Cancel
                </button>
                <button
                  type="submit" disabled={submitLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: T.accent }}
                >
                  {submitLoading
                    ? <><FiLoader className="h-4 w-4 animate-spin" /> Saving…</>
                    : <><FiCheck className="h-4 w-4" /> Register Centre</>
                  }
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
