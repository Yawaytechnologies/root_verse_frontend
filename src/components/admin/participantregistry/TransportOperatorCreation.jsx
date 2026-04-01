// src/modules/admin/pages/participant-registry/TransportOperatorCreation.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiUser, FiPhone, FiMail, FiCheck, FiX,
  FiAlertCircle, FiLoader, FiTruck,
} from "react-icons/fi";
import { MdLocalShipping } from "react-icons/md";

import { createTransportOperator } from "../../../redux/action/transportOperatorActions";
import {
  resetTransportSubmit,
  selectTransportSubmitLoading,
  selectTransportSubmitSuccess,
  selectTransportSubmitError,
  selectTransportCreatedOperator,
} from "../../../redux/reducer/transportOperatorSlice";

// ─── Theme ────────────────────────────────────────────────────────────────────

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

// ─── Validation ───────────────────────────────────────────────────────────────

const RULES = {
  operator_rv_id: v => (v ?? "").trim() ? null : "Operator RV ID is required",
  full_name:      v => (v ?? "").trim() ? null : "Full name is required",
  email:          v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v ?? "").trim()) ? null : "Enter a valid email address",
  mobile:         v => /^[6-9]\d{9}$/.test((v ?? "").trim()) ? null : "Enter a valid 10-digit mobile number",
  transport_id:   v => (v ?? "").trim() ? null : "Transport ID is required",
  vehicle_no:     v => (v ?? "").trim() ? null : "Vehicle number is required",
};

function friendlyError(raw = "", status) {
  if (status === 409) return "An operator with this ID already exists.";
  if (!raw || raw.toLowerCase().includes("failed to fetch")) return "Unable to reach the server. Check your connection.";
  return raw || "Something went wrong. Please try again.";
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function inputCls(hasError) {
  return [
    "w-full h-10 rounded-xl text-sm transition-all outline-none border",
    hasError
      ? "bg-rose-50 border-rose-300 text-rose-900 placeholder:text-rose-300"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
  ].join(" ");
}

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

function TextInput({ label, name, placeholder, type = "text", icon: Icon, required, value, onChange, onBlur, error, hint }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: T.textMuted }} />}
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

// ─── Initial form state ───────────────────────────────────────────────────────

const INITIAL = {
  operator_rv_id: "",
  full_name:      "",
  email:          "",
  mobile:         "",
  transport_id:   "",
  vehicle_no:     "",
  route_name:     "",
  vehicle_type:   "",
  is_active:      true,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TransportOperatorCreation({ onSuccess }) {
  const dispatch = useDispatch();

  const submitLoading   = useSelector(selectTransportSubmitLoading);
  const submitSuccess   = useSelector(selectTransportSubmitSuccess);
  const submitError     = useSelector(selectTransportSubmitError);
  const createdOperator = useSelector(selectTransportCreatedOperator);

  const [form,    setForm]    = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (submitSuccess) onSuccess?.(createdOperator);
  }, [submitSuccess, createdOperator, onSuccess]);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateField = (name, value) => RULES[name]?.(value ?? "") ?? null;

  const validateAll = () =>
    Object.keys(RULES).reduce((acc, k) => {
      const msg = validateField(k, form[k] ?? "");
      if (msg) acc[k] = msg;
      return acc;
    }, {});

  const handleChange = ({ target: { name, value } }) => {
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validateField(name, value) }));
  };

  const handleBlur = ({ target: { name, value } }) => {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validateField(name, value) }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(Object.keys(RULES).reduce((a, k) => ({ ...a, [k]: true }), {}));
    const errs = validateAll();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    dispatch(createTransportOperator({
      operator_rv_id: form.operator_rv_id.trim(),
      full_name:      form.full_name.trim(),
      email:          form.email.trim(),
      mobile:         form.mobile.trim(),
      transport_id:   form.transport_id.trim(),
      vehicle_no:     form.vehicle_no.trim(),
      ...(form.route_name.trim()   && { route_name:   form.route_name.trim() }),
      ...(form.vehicle_type.trim() && { vehicle_type: form.vehicle_type.trim() }),
      is_active: form.is_active,
    }));
  };

  const handleRegisterAnother = () => {
    setForm(INITIAL);
    setTouched({});
    setErrors({});
    dispatch(resetTransportSubmit());
  };

  const displayError = submitError
    ? friendlyError(submitError.message, submitError.status)
    : null;

  // ── Success screen ──────────────────────────────────────────────────────────

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center" style={{ minHeight: "50vh" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: T.successBg }}>
          <FiCheck className="h-8 w-8" style={{ color: T.successText }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: T.textPrimary }}>Transport Operator Registered</p>
          <p className="mt-1 text-sm" style={{ color: T.textSecondary }}>
            <strong>{form.full_name}</strong> has been added to the system.
          </p>
        </div>
        <button
          onClick={handleRegisterAnother}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: T.accent }}
        >
          Register Another
        </button>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: T.pageBg }} className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdLocalShipping className="h-4 w-4" style={{ color: T.accent }} />
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textMuted }}>
              Participant Registry
            </p>
          </div>
          <h1 className="text-xl font-bold" style={{ color: T.textPrimary }}>Register Transport Operator</h1>
          <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
            Add a new operator to handle fish transport
          </p>
        </div>

        {/* Submit error */}
        {displayError && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 border"
            style={{ background: T.errorBg, borderColor: T.errorBorder }}>
            <FiAlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: T.errorText }} />
            <p className="text-sm font-medium" style={{ color: T.errorText }}>{displayError}</p>
            <button className="ml-auto shrink-0" onClick={() => dispatch(resetTransportSubmit())}>
              <FiX className="h-4 w-4" style={{ color: T.errorText }} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: T.cardBg, borderColor: T.border }}>

            {/* Card header */}
            <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: T.border }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                style={{ background: T.accent }}>
                <FiTruck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>Operator Details</p>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  Fields marked <span style={{ color: T.accent }}>*</span> are required
                </p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-6">

              {/* Section 1 — Identity */}
              <div>
                <div className="flex items-center gap-3 pb-3 mb-1 border-b" style={{ borderColor: T.border }}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: T.accent }}>1</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Operator Identity</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>Basic identification and contact</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="Operator RV ID" name="operator_rv_id" required
                    placeholder="e.g. RV-TR-009" hint="Must be unique"
                    value={form.operator_rv_id} onChange={handleChange} onBlur={handleBlur}
                    error={touched.operator_rv_id ? errors.operator_rv_id : null} />
                  <TextInput label="Full Name" name="full_name" required icon={FiUser}
                    placeholder="Full legal name"
                    value={form.full_name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.full_name ? errors.full_name : null} />
                  <TextInput label="Mobile" name="mobile" required type="tel" icon={FiPhone}
                    placeholder="10-digit mobile" hint="Used for login — no password needed"
                    value={form.mobile} onChange={handleChange} onBlur={handleBlur}
                    error={touched.mobile ? errors.mobile : null} />
                  <TextInput label="Email" name="email" required type="email" icon={FiMail}
                    placeholder="operator@email.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    error={touched.email ? errors.email : null} />
                </div>
              </div>

              {/* Section 2 — Vehicle */}
              <div>
                <div className="flex items-center gap-3 pb-3 mb-1 border-b" style={{ borderColor: T.border }}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: T.accent }}>2</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Vehicle & Route</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>Transport assignment details</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="Transport ID" name="transport_id" required
                    placeholder="e.g. TR-009"
                    value={form.transport_id} onChange={handleChange} onBlur={handleBlur}
                    error={touched.transport_id ? errors.transport_id : null} />
                  <TextInput label="Vehicle Number" name="vehicle_no" required
                    placeholder="e.g. TN51AB4321"
                    value={form.vehicle_no} onChange={handleChange} onBlur={handleBlur}
                    error={touched.vehicle_no ? errors.vehicle_no : null} />
                  <TextInput label="Vehicle Type (optional)" name="vehicle_type"
                    placeholder="e.g. Refrigerated van"
                    value={form.vehicle_type} onChange={handleChange} onBlur={handleBlur}
                    error={null} />
                  <TextInput label="Route Name (optional)" name="route_name"
                    placeholder="e.g. Nagapattinam Harbour"
                    value={form.route_name} onChange={handleChange} onBlur={handleBlur}
                    error={null} />
                </div>
              </div>

              {/* Active toggle */}
              <div
                role="switch" aria-checked={form.is_active} tabIndex={0}
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                onKeyDown={e => (e.key === " " || e.key === "Enter") && setForm(f => ({ ...f, is_active: !f.is_active }))}
                className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 cursor-pointer select-none transition"
                style={{
                  border:     `1px solid ${form.is_active ? T.accentRing : T.border}`,
                  background: form.is_active ? T.accentLight : "#F5F5F4",
                }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>Active Status</p>
                  <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Operator can log in and perform transport actions</p>
                </div>
                <div style={{ position:"relative", flexShrink:0, height:"1.5rem", width:"2.75rem", borderRadius:"9999px", background: form.is_active ? T.accent : "#D6D3D1", transition:"background 0.2s" }}>
                  <span style={{ position:"absolute", top:"2px", left: form.is_active ? "22px" : "2px", height:"20px", width:"20px", borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.25)", transition:"left 0.2s" }} />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-5 py-4"
              style={{ borderColor: T.border, background: "#FAFAF9" }}>
              <p className="text-xs" style={{ color: T.textMuted }}>
                <span style={{ color: T.accent }}>*</span> Required fields must be completed
              </p>
              <button
                type="submit" disabled={submitLoading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: T.accent }}
              >
                {submitLoading
                  ? <><FiLoader className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><FiCheck  className="h-4 w-4" /> Register Operator</>
                }
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}