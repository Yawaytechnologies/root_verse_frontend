// src/data/wildCaptureMock.js

export const kpiStats = [
  {
    id: "totalTrips",
    label: "Total Trips Logged",
    value: "128",
    delta: "+4.2%",
    deltaType: "up",
    helper: "This season",
  },
  {
    id: "totalCatch",
    label: "Total Catch Weight",
    value: "56,321 kg",
    delta: "+1.8%",
    deltaType: "up",
    helper: "Verified landings",
  },
  {
    id: "crates",
    label: "Crates Generated",
    value: "2,932",
    delta: "+0.9%",
    deltaType: "up",
    helper: "QR-linked crates",
  },
  {
    id: "activeVessels",
    label: "Active Vessels",
    value: "87",
    delta: "-0.4%",
    deltaType: "down",
    helper: "RV-VES registry",
  },
];

export const catchTrendData = [
  { month: "Jan", weight: 3200 },
  { month: "Feb", weight: 5400 },
  { month: "Mar", weight: 6800 },
  { month: "Apr", weight: 9000 },
  { month: "May", weight: 11200 },
  { month: "Jun", weight: 10400 },
];

export const tripGoal = {
  goalTrips: 150,
  completedTrips: 128,
  weeklySeries: [
    { day: "Mon", trips: 14 },
    { day: "Tue", trips: 18 },
    { day: "Wed", trips: 22 },
    { day: "Thu", trips: 19 },
    { day: "Fri", trips: 21 },
    { day: "Sat", trips: 16 },
    { day: "Sun", trips: 18 },
  ],
};

export const complianceScore = {
  score: 92,
  label: "Log completeness, zone validity, QC data",
};

export const landingRecords = [
  {
    id: 1,
    captain: "Jane Cooper",
    vesselId: "RV-VES-0234",
    species: "Yellowfin Tuna",
    weight: "1,260 kg",
    landingCenter: "Rameswaram",
    method: "Longline",
    date: "Dec 09, 2025",
  },
  {
    id: 2,
    captain: "Arjun Kumar",
    vesselId: "RV-VES-0122",
    species: "Seer Fish",
    weight: "820 kg",
    landingCenter: "Mandapam",
    method: "Gillnet",
    date: "Dec 08, 2025",
  },
  {
    id: 3,
    captain: "Brooklyn Simmons",
    vesselId: "RV-VES-0351",
    species: "Snapper",
    weight: "412 kg",
    landingCenter: "Thoothukudi",
    method: "Handline",
    date: "Dec 08, 2025",
  },
];

export const faoZones = ["57", "58", "71"];

export const gearBreakdown = [
  { name: "Longline", value: 62 },
  { name: "Gillnet", value: 29 },
  { name: "Handline", value: 9 },
];

export const tempQC = {
  avgTemp: 4.6,
  delta: "+0.6°C vs last week",
  status: "Within threshold (≤ 5°C)",
};

/* ---------- NEW: Trips + Catch Logs for TripOverview & CatchLogTable ---------- */

// src/data/trips.js
// src/data/trips.js
export const trips = [
  {
    id: "TRIP-2025-011",
    vesselId: "RV-VES-0234",
    vesselName: "St. Mary III",
    captain: "Jane Cooper",
    departurePort: "Rameswaram",
    targetSpecies: "Yellowfin Tuna",
    method: "Longline",
    departureAt: "2025-12-06 04:30",
    landingAt: "2025-12-09 07:45",
    status: "Landed",
    totalCatchKg: 1260,
    faoZone: "57",

    // 🔹 Expense fields
    fuelLiters: 100,
    fuelPricePerQty: 100,
    fuelTotalCost: 100 * 100, // 10,000
    iceKg: 1000,
    icePricePerQty: 10,
    iceTotalCost: 1000 * 10, // 10,000
    foodExpenses: 5000,
    otherExpense: 1000,
    totalExpenses: 100 * 100 + 1000 * 10 + 5000 + 1000, // 26,000
  },
  {
    id: "TRIP-2025-010",
    vesselId: "RV-VES-0122",
    vesselName: "Sea Breeze",
    captain: "Arjun Kumar",
    departurePort: "Mandapam",
    targetSpecies: "Seer Fish",
    method: "Gillnet",
    departureAt: "2025-12-07 03:50",
    landingAt: "2025-12-08 06:15",
    status: "Landed",
    totalCatchKg: 820,
    faoZone: "57",

    fuelLiters: 80,
    fuelPricePerQty: 100,
    fuelTotalCost: 8000,
    iceKg: 700,
    icePricePerQty: 10,
    iceTotalCost: 7000,
    foodExpenses: 4000,
    otherExpense: 500,
    totalExpenses: 8000 + 7000 + 4000 + 500, // 19,500
  },
  {
    id: "TRIP-2025-009",
    vesselId: "RV-VES-0351",
    vesselName: "Blue Star",
    captain: "Brooklyn Simmons",
    departurePort: "Thoothukudi",
    targetSpecies: "Mixed Reef (Snapper)",
    method: "Handline",
    departureAt: "2025-12-06 05:20",
    landingAt: "2025-12-08 08:05",
    status: "Landed",
    totalCatchKg: 412,
    faoZone: "58",

    fuelLiters: 60,
    fuelPricePerQty: 100,
    fuelTotalCost: 6000,
    iceKg: 400,
    icePricePerQty: 10,
    iceTotalCost: 4000,
    foodExpenses: 3000,
    otherExpense: 800,
    totalExpenses: 6000 + 4000 + 3000 + 800, // 13,800
  },
  {
    id: "TRIP-2025-008",
    vesselId: "RV-VES-0401",
    vesselName: "Ocean Crest",
    captain: "S. Prakash",
    departurePort: "Nagapattinam",
    targetSpecies: "Skipjack Tuna",
    method: "Purse Seine",
    departureAt: "2025-12-09 02:40",
    landingAt: null,
    status: "At sea",
    totalCatchKg: null,
    faoZone: "71",

    fuelLiters: 120,
    fuelPricePerQty: 100,
    fuelTotalCost: 12000,
    iceKg: 900,
    icePricePerQty: 10,
    iceTotalCost: 9000,
    foodExpenses: 6000,
    otherExpense: 1500,
    totalExpenses: 12000 + 9000 + 6000 + 1500, // 28,500
  },
];



export const catchLogs = [
  {
    id: 1,
    tripId: "TRIP-2025-011",
    haulNo: 1,
    species: "Yellowfin Tuna",
    estWeightKg: 420,
    faoZone: "57",
    haulTime: "2025-12-07 13:15",
    gear: "Longline",
    cratesLinked: 11,
  },
  {
    id: 2,
    tripId: "TRIP-2025-011",
    haulNo: 2,
    species: "Yellowfin Tuna",
    estWeightKg: 510,
    faoZone: "57",
    haulTime: "2025-12-08 09:40",
    gear: "Longline",
    cratesLinked: 14,
  },
  {
    id: 3,
    tripId: "TRIP-2025-010",
    haulNo: 1,
    species: "Seer Fish",
    estWeightKg: 310,
    faoZone: "57",
    haulTime: "2025-12-07 18:20",
    gear: "Gillnet",
    cratesLinked: 9,
  },
  {
    id: 4,
    tripId: "TRIP-2025-009",
    haulNo: 1,
    species: "Mixed Reef (Snapper)",
    estWeightKg: 190,
    faoZone: "58",
    haulTime: "2025-12-07 11:05",
    gear: "Handline",
    cratesLinked: 6,
  },
  {
    id: 5,
    tripId: "TRIP-2025-008",
    haulNo: 1,
    species: "Skipjack Tuna",
    estWeightKg: 260,
    faoZone: "71",
    haulTime: "2025-12-09 10:10",
    gear: "Purse Seine",
    cratesLinked: 8,
  },
];

// src/data/vesselRegistry.js

// Owner dummy
export const vesselOwner = {
  ownerId: "NA026829",
  ownerName: "Gowtham Sakthivel",
  contactNumber: "6374484558",
  email: "sgowtham2k1@gmail.com",
  address:
    "1/198 Main Road Kuthalam, Gopurajapuram (Post), Kuthalam - 609703, Nagapattinam, Tamilnadu, India.",
  kycStatus: "Default (Verified)",
  linkedVessels: ["NAD00345"], // system-generated list
};

// Vessel dummy
export const vessel = {
  vesselId: "NAD00345",
  name: "Nagai Kadal Arasan",
  registrationNo: "TN02T2756",
  typeCode: "D",
  typeLabel: "Deep Sea",
  homePortCode: "NA",
  homePortLabel: "Akkaraipettai",
  fishingLicenseNo: "126783",
  crewCapacityMax: 16,
  storageCapacityKg: 1500,
  enginePowerHp: 15,
  fuelType: "Diesel",
};

// Code legends (for reference at bottom of page)
export const legends = {
  vesselType: [
    { code: "M", en: "Mechanised", ta: "இயந்திரமயமான கப்பல்" },
    { code: "O", en: "Motorised", ta: "மோட்டார் இயக்கக் கப்பல்" },
    { code: "D", en: "Deep Sea", ta: "ஆழ்கடல் கப்பல்" },
  ],
  homePort: [
    { code: "N", en: "Nagapattinam", ta: "நாகப்பட்டினம்" },
    { code: "NA", en: "Akkaraipettai", ta: "அக்கரைப்பேட்டை" },
    { code: "T", en: "Thoothukudi", ta: "தூத்துக்குடி" },
    { code: "R", en: "Ramanathapuram", ta: "ராமநாதபுரம்" },
    { code: "K", en: "Kaniyakumari", ta: "கன்னியாகுமரி" },
  ],
  species: [
    { code: "RSN", en: "Red Snapper" },
    { code: "SQU", en: "Squid" },
    { code: "WPF", en: "White Pomfret" },
    { code: "SCK", en: "Seer Fish" },
  ],
  method: [
    { code: "L", en: "Longline" },
    { code: "T", en: "Trawling" },
    { code: "G", en: "Gillnet" },
    { code: "P", en: "Pole & Line" },
  ],
};

// --- existing exports (trips, catchLogs, vesselOwner, vessel, legends, etc.) ---

export const crates = [
  {
    crateId: "CR-0001",
    label: "Blue Crate 01",
    qrCode: "RV-CR-0001",
    sizeCode: "M",
    sizeLabel: "Medium",
    capacityKg: 50,
    status: "Available", // Available | In use | Damaged | Cleaning
    currentTripId: null,
    lastUsedTripId: "TRIP-2025-011",
    lastUsedSpecies: "Yellowfin Tuna",
    lastUsedPort: "Rameswaram",
    lastUsedAt: "2025-12-09 07:45",
  },
  {
    crateId: "CR-0002",
    label: "Blue Crate 02",
    qrCode: "RV-CR-0002",
    sizeCode: "M",
    sizeLabel: "Medium",
    capacityKg: 50,
    status: "In use",
    currentTripId: "TRIP-2025-008",
    lastUsedTripId: "TRIP-2025-008",
    lastUsedSpecies: "Skipjack Tuna",
    lastUsedPort: "Nagapattinam",
    lastUsedAt: "2025-12-09 02:40",
  },
  {
    crateId: "CR-0003",
    label: "Yellow Crate 01",
    qrCode: "RV-CR-0003",
    sizeCode: "L",
    sizeLabel: "Large",
    capacityKg: 80,
    status: "Cleaning",
    currentTripId: null,
    lastUsedTripId: "TRIP-2025-010",
    lastUsedSpecies: "Seer Fish",
    lastUsedPort: "Mandapam",
    lastUsedAt: "2025-12-08 06:15",
  },
];

