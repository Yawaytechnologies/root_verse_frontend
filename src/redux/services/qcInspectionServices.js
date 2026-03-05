import axios from "axios";

const RAW_BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

if (!RAW_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is missing in .env");
}

const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, "");

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeInspection(item) {
  return {
    id: item?.id ?? null,
    qrCode: item?.code ?? "-",
    qrType: item?.type ?? "-",
    qrStatus: item?.status ?? "-",

    rvVesselId: item?.rv_vessel_id ?? null,
    fishId: item?.fish_id ?? null,
    ownerId: item?.owner_id ?? null,
    tripId: item?.trip_id ?? null,

    weight: item?.weight ?? "0.00",
    weightValue: toNumber(item?.weight, 0),

    date: item?.date ?? null,
    time: item?.time ?? null,

    latitude: item?.latitude ?? null,
    longitude: item?.longitude ?? null,

    imageUrl: item?.image_url ?? null,
    imageKey: item?.image_key ?? null,

    qcStatus: item?.qc_status ?? "-",
    qcResult: item?.qc_result ?? "-",
    qualityGrade: item?.quality_grade ?? "-",
    qcScore: item?.qc_score ?? null,
    temperatureC: item?.temperature_c ?? null,
    size: item?.size ?? "-",
    damage: item?.damage ?? "-",
    waterTemperature: item?.water_temperature ?? null,
    phLevel: item?.ph_level ?? null,
    grade: item?.grade ?? null,
    odorScore: item?.odor_score ?? null,
    firmnessScore: item?.firmness_score ?? null,
    isDamaged: Boolean(item?.is_damaged),
    rejectReason: item?.reject_reason ?? null,

    fishImageUrl: item?.fish_image_url ?? null,
    pondConditionUrl: item?.pond_condition_url ?? null,

    qualityCheckerCode: item?.quality_checker_code ?? null,
    qualityCheckerId: item?.quality_checker_id ?? null,
    qualityCheckerName: item?.quality_checker_name ?? "-",

    checkedAt: item?.checked_at ?? null,
    filledAt: item?.filled_at ?? null,
    createdAt: item?.created_at ?? null,
    updatedAt: item?.updated_at ?? null,

    vesselName: item?.vessel_name || item?.vessel?.vessel_name || "-",
    fishName: item?.fish_name || item?.fish?.fish_name || "-",
    ownerName: item?.owner_name || item?.owner?.username || "-",

    tripValue: item?.trip_value ?? "-",

    vessel: item?.vessel
      ? {
          id: item.vessel.id ?? null,
          rvVesselId: item.vessel.rv_vessel_id ?? "-",
          govtRegistrationNumber: item.vessel.govt_registration_number ?? "-",
          localIdentifier: item.vessel.local_identifier ?? "-",
          vesselName: item.vessel.vessel_name ?? "-",
          homePort: item.vessel.home_port ?? "-",
          vesselType: item.vessel.vessel_type ?? "-",
          ownerId: item.vessel.owner_id ?? null,
          fishingLicenseNo: item.vessel.fishing_license_no ?? null,
          crewCapacityMax: item.vessel.crew_capacity_max ?? null,
          storageCapacityKg: item.vessel.storage_capacity_kg ?? null,
          enginePowerHp: item.vessel.engine_power_hp ?? null,
          fuelType: item.vessel.fuel_type ?? null,
          approvalStatus: item.vessel.approval_status ?? "-",
        }
      : null,

    fish: item?.fish
      ? {
          id: item.fish.id ?? null,
          fishName: item.fish.fish_name ?? "-",
          fishCode: item.fish.fish_code ?? "-",
          fishTypeUrl: item.fish.fish_type_url ?? null,
          fishTypeKey: item.fish.fish_type_key ?? null,
        }
      : null,

    owner: item?.owner
      ? {
          id: item.owner.id ?? null,
          username: item.owner.username ?? "-",
          phoneNo: item.owner.phone_no ?? "-",
          address: item.owner.address ?? "-",
          rootverseType: item.owner.rootverse_type ?? "-",
          verificationStatus: item.owner.verification_status ?? "-",
          profilePictureUrl: item.owner.profile_picture_url ?? null,
          profilePictureKey: item.owner.profile_picture_key ?? null,
          stateId: item.owner.state_id ?? null,
          districtId: item.owner.district_id ?? null,
          ownerCode: item.owner.owner_id ?? "-",
          ownerRegisterProgress: item.owner.owner_register_progress ?? "-",
          locationId: item.owner.location_id ?? null,
        }
      : null,

    trip: item?.trip
      ? {
          id: item.trip.id ?? null,
          tripCode: item.trip.trip_id ?? "-",
          nearStation: item.trip.near_station ?? "-",
          plannedAt: item.trip.planned_at ?? null,
          arrivalAt: item.trip.arrival_at ?? null,
          diesel: item.trip.diesel ?? null,
          ice: item.trip.ice ?? null,
          qrCount: item.trip.qr_count ?? null,
          total: item.trip.total ?? null,
          approvalStatus: item.trip.approval_status ?? "-",
          count: item.trip.count ?? null,
          ownerCode: item.trip.owner_code ?? "-",
          locationId: item.trip.location_id ?? null,
          vesselId: item.trip.vessel_id ?? null,
          fishingMethodId: item.trip.fishing_method_id ?? null,
          fishSpecies: item.trip.fish_species ?? null,
          completedAt: item.trip.comleted_at ?? null,
        }
      : null,

    raw: item,
  };
}

export async function fetchFilledQrInspectionsPage({ page = 1, limit = 200 } = {}) {
  const safePage = clampNumber(page, 1, Number.MAX_SAFE_INTEGER, 1);
  const safeLimit = clampNumber(limit, 1, 200, 50);

  const response = await client.get("/api/qrs/filled", {
    params: {
      page: safePage,
      limit: safeLimit,
    },
  });

  const payload = response?.data || {};
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];

  return {
    success: Boolean(payload?.success),
    page: Number(payload?.page ?? safePage),
    limit: Number(payload?.limit ?? safeLimit),
    total: Number(payload?.total ?? 0),
    items: rawItems.map(normalizeInspection),
  };
}

/**
 * Uses backend pagination internally until all filled QRS are fetched.
 * Needed because quality_checker_id filtering is being done on frontend.
 */
export async function fetchAllFilledQrInspections({ chunkSize = 200 } = {}) {
  const safeChunkSize = clampNumber(chunkSize, 1, 200, 200);

  let page = 1;
  let total = 0;
  let hasMore = true;
  const merged = [];

  while (hasMore) {
    const res = await fetchFilledQrInspectionsPage({
      page,
      limit: safeChunkSize,
    });

    if (page === 1) {
      total = res.total || 0;
    }

    merged.push(...res.items);

    const fetchedCount = merged.length;
    const currentBatchCount = res.items.length;
    const expectedCount = res.total || total;

    if (currentBatchCount === 0 || fetchedCount >= expectedCount) {
      hasMore = false;
    } else {
      page += 1;
    }
  }

  return {
    success: true,
    total,
    pagesFetched: page,
    items: merged,
  };
}