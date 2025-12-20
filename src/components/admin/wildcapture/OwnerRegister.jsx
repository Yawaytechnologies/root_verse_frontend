// src/components/admin/wildcapture/OwnerRegistration.jsx
import React from "react";
import { FiUser, FiPhone, FiCalendar, FiMapPin, FiFileText, FiShield } from "react-icons/fi";

// ✅ Coastal Tamil Nadu focus (you can add more if needed)
const TN_COASTAL_DISTRICTS = [
  "",
  "Chennai",
  "Tiruvallur",
  "Chengalpattu",
  "Kancheepuram",
  "Villupuram",
  "Cuddalore",
  "Mayiladuthurai",
  "Nagapattinam",
  "Thanjavur",
  "Tiruvarur",
  "Pudukkottai",
  "Ramanathapuram",
  "Thoothukudi",
  "Tirunelveli",
  "Kanyakumari",
];

// ✅ Default safe form (prevents undefined crashes)
const SAFE_FORM = {
  // identity
  ownerId: "", // immutable (optional if you generate like vesselId)
  ownerType: "INDIVIDUAL", // INDIVIDUAL | COMPANY | COOPERATIVE
  ownerName: "",
  fatherSpouseName: "",
  dob: "",
  gender: "",

  // contact
  ownerContact: "", // primary phone (kept same key to match your existing code)
  altContact: "",
  email: "",

  // address
  addressLine1: "",
  addressLine2: "",
  village: "",
  taluk: "",
  district: "",
  state: "Tamil Nadu",
  pincode: "",

  // KYC / compliance
  kycType: "AADHAAR", // AADHAAR | PAN | VOTER_ID | DL | PASSPORT | OTHER
  kycNumber: "",
  panNumber: "",
  gstin: "",
  fisherId: "", // Fisher ID / Fisherfolk card / society id (if any)
  cooperativeName: "",

  // bank
  accountHolderName: "",
  bankName: "",
  branch: "",
  ifsc: "",
  accountNumber: "",

  // emergency + ops
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyRelation: "",
  regDate: "", // kept same key (already used)
  status: "ACTIVE", // ACTIVE | INACTIVE | SUSPENDED
  notes: "",
};

export default function OwnerRegistration({
  mode = "create",
  form = SAFE_FORM,
  setForm = () => {},
  // optional (if you want to show immutable owner id like vessels)
  nextOwnerId = "RV-OWN-TN-000001",
  showOwnerId = true,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...(prev || SAFE_FORM), [name]: value }));
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900">Owner Registration</h2>
      <p className="mt-1 text-xs text-slate-400">
        Capture owner identity, KYC, address, emergency contact, and bank details for traceability + payments.
      </p>

      {/* Owner Identity */}
      <SectionTitle icon={FiUser} title="Owner Identity" subtitle="Basic owner profile used across wild-capture registry." />

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {showOwnerId && (
          <div className="md:col-span-2">
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
              <FiFileText className="h-3 w-3" />
              Owner ID (immutable)
            </label>
            <input
              type="text"
              name="ownerId"
              value={form?.ownerId || (mode === "create" ? nextOwnerId : "")}
              disabled
              className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            {mode === "create" && (
              <p className="mt-1 text-[11px] text-slate-400">
                ID will be assigned when you register the owner.
              </p>
            )}
          </div>
        )}

        <SelectField
          label="Owner type"
          name="ownerType"
          value={form?.ownerType}
          onChange={handleInputChange}
          options={[
            { value: "INDIVIDUAL", label: "Individual" },
            { value: "COMPANY", label: "Company" },
            { value: "COOPERATIVE", label: "Cooperative / Society" },
          ]}
        />

        <TextField
          label="Owner full name"
          name="ownerName"
          value={form?.ownerName}
          onChange={handleInputChange}
          placeholder="Eg: Kumaravel S"
        />

        <TextField
          label="Father / Spouse name"
          name="fatherSpouseName"
          value={form?.fatherSpouseName}
          onChange={handleInputChange}
          placeholder="Optional"
        />

        <SelectField
          label="Gender"
          name="gender"
          value={form?.gender}
          onChange={handleInputChange}
          options={[
            { value: "", label: "Select…" },
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
            { value: "OTHER", label: "Other" },
          ]}
        />

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Date of birth</label>
          <input
            type="date"
            name="dob"
            value={form?.dob || ""}
            onChange={handleInputChange}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6">
        <SectionTitle icon={FiPhone} title="Contact" subtitle="Primary contact used for alerts, approvals, and coordination." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextField
            label="Primary phone"
            name="ownerContact"
            value={form?.ownerContact}
            onChange={handleInputChange}
            placeholder="+91 9XXXXXXXXX"
          />
          <TextField
            label="Alternate phone"
            name="altContact"
            value={form?.altContact}
            onChange={handleInputChange}
            placeholder="Optional"
          />
          <TextField
            label="Email"
            name="email"
            value={form?.email}
            onChange={handleInputChange}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Address */}
      <div className="mt-6">
        <SectionTitle icon={FiMapPin} title="Address (Tamil Nadu)" subtitle="Useful for compliance, audits, and regional reporting." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextField
            label="Address line 1"
            name="addressLine1"
            value={form?.addressLine1}
            onChange={handleInputChange}
            placeholder="Door no, street"
          />
          <TextField
            label="Address line 2"
            name="addressLine2"
            value={form?.addressLine2}
            onChange={handleInputChange}
            placeholder="Area / landmark (optional)"
          />
          <TextField
            label="Village / Town"
            name="village"
            value={form?.village}
            onChange={handleInputChange}
            placeholder="Eg: Tharuvaikulam"
          />
          <TextField
            label="Taluk"
            name="taluk"
            value={form?.taluk}
            onChange={handleInputChange}
            placeholder="Eg: Thoothukudi Taluk"
          />

          <SelectField
            label="District"
            name="district"
            value={form?.district}
            onChange={handleInputChange}
            options={TN_COASTAL_DISTRICTS.map((d) => ({ value: d, label: d || "Select…" }))}
          />

          <TextField
            label="Pincode"
            name="pincode"
            value={form?.pincode}
            onChange={handleInputChange}
            placeholder="6-digit"
          />

          <TextField
            label="State"
            name="state"
            value={form?.state}
            onChange={handleInputChange}
            placeholder="Tamil Nadu"
          />
        </div>
      </div>

      {/* KYC / Compliance */}
      <div className="mt-6">
        <SectionTitle icon={FiShield} title="KYC & Compliance" subtitle="Store responsibly (mask/encrypt in backend). Needed for audits & payouts." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SelectField
            label="KYC type"
            name="kycType"
            value={form?.kycType}
            onChange={handleInputChange}
            options={[
              { value: "AADHAAR", label: "Aadhaar" },
              { value: "PAN", label: "PAN" },
              { value: "VOTER_ID", label: "Voter ID" },
              { value: "DL", label: "Driving License" },
              { value: "PASSPORT", label: "Passport" },
              { value: "OTHER", label: "Other" },
            ]}
          />

          <TextField
            label="KYC number"
            name="kycNumber"
            value={form?.kycNumber}
            onChange={handleInputChange}
            placeholder="Masked storage recommended"
          />

          <TextField
            label="PAN number"
            name="panNumber"
            value={form?.panNumber}
            onChange={handleInputChange}
            placeholder="Optional (but useful)"
          />

          <TextField
            label="GSTIN"
            name="gstin"
            value={form?.gstin}
            onChange={handleInputChange}
            placeholder="Optional (for company/registered entities)"
          />

          <TextField
            label="Fisher ID / Society ID"
            name="fisherId"
            value={form?.fisherId}
            onChange={handleInputChange}
            placeholder="Optional"
          />

          <TextField
            label="Cooperative / Society name"
            name="cooperativeName"
            value={form?.cooperativeName}
            onChange={handleInputChange}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Bank Details */}
      <div className="mt-6">
        <SectionTitle icon={FiFileText} title="Bank Details" subtitle="For payments, settlements, and refunds." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextField
            label="Account holder name"
            name="accountHolderName"
            value={form?.accountHolderName}
            onChange={handleInputChange}
            placeholder="As per passbook"
          />
          <TextField
            label="Bank name"
            name="bankName"
            value={form?.bankName}
            onChange={handleInputChange}
            placeholder="Eg: SBI"
          />
          <TextField
            label="Branch"
            name="branch"
            value={form?.branch}
            onChange={handleInputChange}
            placeholder="Optional"
          />
          <TextField
            label="IFSC"
            name="ifsc"
            value={form?.ifsc}
            onChange={handleInputChange}
            placeholder="Eg: SBIN000XXXX"
          />
          <TextField
            label="Account number"
            name="accountNumber"
            value={form?.accountNumber}
            onChange={handleInputChange}
            placeholder="Store securely"
          />
        </div>
      </div>

      {/* Emergency + Registration */}
      <div className="mt-6">
        <SectionTitle icon={FiCalendar} title="Emergency & Registration" subtitle="Practical ops fields used on the ground." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TextField
            label="Emergency contact name"
            name="emergencyContactName"
            value={form?.emergencyContactName}
            onChange={handleInputChange}
            placeholder="Optional"
          />
          <TextField
            label="Emergency contact phone"
            name="emergencyContactPhone"
            value={form?.emergencyContactPhone}
            onChange={handleInputChange}
            placeholder="Optional"
          />
          <TextField
            label="Relation"
            name="emergencyRelation"
            value={form?.emergencyRelation}
            onChange={handleInputChange}
            placeholder="Eg: Brother"
          />

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
              <FiCalendar className="h-3 w-3" />
              Registration date
            </label>
            <input
              type="date"
              name="regDate"
              value={form?.regDate || ""}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <SelectField
            label="Status"
            name="status"
            value={form?.status}
            onChange={handleInputChange}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "SUSPENDED", label: "Suspended" },
            ]}
          />

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
            <textarea
              name="notes"
              value={form?.notes || ""}
              onChange={handleInputChange}
              rows={3}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Any remarks (optional)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mt-6">
      <div className="flex items-start gap-2">
        <span className="mt-[2px] inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-400">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  const normalized = Array.isArray(options)
    ? options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
    : [];

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      >
        {normalized.map((opt) => (
          <option key={opt.value || "blank"} value={opt.value}>
            {opt.label || "Select…"}
          </option>
        ))}
      </select>
    </div>
  );
}
