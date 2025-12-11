// src/pages/wildPage/TripsPage.jsx
import React, { useState } from "react";
import AppLayout from "../../components/wildLayout/AppLayout";
import Modal from "../../components/wildCommon/Modal";
import TripForm from "../../components/wildCapture/TripForm";
import TripOverview from "../../components/wildCapture/TripOverview";
import { trips as initialTrips } from "../../data/wildCaptureMock";

export default function TripsPage() {
  const [tripList, setTripList] = useState(initialTrips);
  const [open, setOpen] = useState(false);

  // NEW: when vessel lands
  const handleMarkLanded = (trip) => {
    setTripList((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              status: "Landed",
              landingAt: new Date().toISOString(), // or your own formatted date
            }
          : t
      )
    );
  };

  const handleAddTrip = (newTrip) => {
    // enforce business rule: new trip starts "At sea"
    const tripWithDefaults = {
      status: "At sea",
      landingAt: null,
      ...newTrip,
    };

    setTripList((prev) => [tripWithDefaults, ...prev]);
    setOpen(false);
  };

  return (
    <AppLayout>
      <TripOverview
        trips={tripList}
        onAddClick={() => setOpen(true)}
        onMarkLanded={handleMarkLanded}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register New Trip"
      >
        <TripForm
          onSubmit={handleAddTrip}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </AppLayout>
  );
}
