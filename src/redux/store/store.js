// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import qrReducer from "../reducer/qrSlice";
import ownerReducer from "../reducer/vesselownerSlice"; 
import tripReducer from "../reducer/tripapprovalSlice";
export const store = configureStore({
  reducer: {
    qr: qrReducer,
    owner: ownerReducer,
    trip: tripReducer,
  },
});
