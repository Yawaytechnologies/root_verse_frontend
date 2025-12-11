// src/pages/wildPage/CatchLogsPage.jsx
import React, { useState } from "react";
import AppLayout from "../../components/wildLayout/AppLayout";
import Modal from "../../components/wildCommon/Modal";
import CatchLogForm from "../../components/wildCapture/CatchLogForm";
import CatchLogTable from "../../components/wildCapture/CatchLogTable";
import { catchLogs as initialLogs } from "../../data/wildCaptureMock";

export default function CatchLogsPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [open, setOpen] = useState(false);

  const handleAddLog = (newLog) => {
    setLogs((prev) => [newLog, ...prev]);
    setOpen(false);
  };

  return (
    <AppLayout>
      <CatchLogTable
        catchLogs={logs}
        onAddClick={() => setOpen(true)}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Catch Log (Haul / Set)"
      >
        <CatchLogForm
          onSubmit={handleAddLog}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </AppLayout>
  );
}
