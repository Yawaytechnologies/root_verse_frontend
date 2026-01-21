// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import qrReducer from "../reducer/qrSlice";
import ownerReducer from "../reducer/vesselownerSlice"; 
import tripReducer from "../reducer/tripapprovalSlice";
import speciesReducer from "../reducer/speciesSlice";
import vesselReducer from "../reducer/vesselSlice";
import qualityCheckerReducer from "../reducer/qualitycheckerSlice";
export const store = configureStore({
  reducer: {
    qr: qrReducer,
    owner: ownerReducer,
    trip: tripReducer,
    species: speciesReducer,
    vessel: vesselReducer,
    qualityChecker: qualityCheckerReducer,

  },
});
