// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import qrReducer from "../reducer/qrSlice";
import ownerReducer from "../reducer/vesselownerSlice";
import tripReducer from "../reducer/tripapprovalSlice";
import speciesReducer from "../reducer/speciesSlice";
import vesselReducer from "../reducer/vesselSlice";
import qualityCheckerReducer from "../reducer/qualitycheckerSlice";
import dashboardReducer from "../reducer/dashboardSlice";
import locationcreationReducer from "../reducer/locationcreationSlice";
import fishingMethodsReducer from "../reducer/fishingMethodSlice";
import crateQrWildReducer from "../reducer/crateQrWildSlice";
import cratePackerReducer from "../reducer/cratepackerCreateSlice";
import qcInspectionReducer from "../reducer/qcInspectionSlice";
import farmReducer from "../reducer/farmapprovalSlice";            // ← new
import pondReducer from "../reducer/pondApprovalSlice"; 
import ownerApprovalReducer from "../reducer/aquaOwnerSlice";
import collectionCenterReducer from "../reducer/collectionCenterSlice";
import authReducer from "../reducer/adminLoginSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    qr: qrReducer,
    owner: ownerReducer,
    trip: tripReducer,
    species: speciesReducer,
    vessel: vesselReducer,
    qualityChecker: qualityCheckerReducer,
    wilddashboard: dashboardReducer,
    location: locationcreationReducer,
    fishingMethods: fishingMethodsReducer,
    crateQrWild: crateQrWildReducer,
    cratePacker: cratePackerReducer,
    qcInspection: qcInspectionReducer,
    farmApproval: farmReducer,  
    pondApproval: pondReducer,
    aquaOwnerApproval: ownerApprovalReducer,
    collectionCenter: collectionCenterReducer,
  },
});