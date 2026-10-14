"use client";

import { useEffect } from "react";

/**
 * Shown on the login page after this browser's session was replaced by a newer login. It removes the stale
 * cookies of THIS browser only (the server revokes this one session; it never touches the account's other session).
 */
export function ClearStaleSession() {
  useEffect(() => {
    void fetch("/api/session?stale=1", { method: "DELETE", cache: "no-store" }).catch(() => undefined);
  }, []);
  return null;
}
