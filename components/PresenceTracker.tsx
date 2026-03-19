"use client";

import { useEffect, useRef } from "react";

function getOrCreateSessionId(): string {
  const key = "presence_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function PresenceTracker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    const ping = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    };

    ping();
    intervalRef.current = setInterval(ping, 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
