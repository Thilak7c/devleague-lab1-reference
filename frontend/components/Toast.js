"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, onDone, duration = 2800 }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), duration);
    const removeTimer = setTimeout(() => onDone?.(), duration + 220);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onDone]);

  return (
    <div className={`toast${leaving ? " leaving" : ""}`} role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">✓</span>
      {message}
    </div>
  );
}