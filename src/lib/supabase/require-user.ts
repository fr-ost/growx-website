import "server-only";
import { redirect } from "next/navigation";
import { getAuthState } from "./user";

/** Server-side gate for protected pages/actions. Does not trust the proxy alone. */
export async function requireUser(returnTo = "/dashboard") {
  const state = await getAuthState();
  if (state.status === "active") return state.user;
  // Signed in elsewhere: send this browser to the login page, which explains why and clears its stale cookies.
  if (state.status === "revoked") redirect(`/login?error=session_replaced&next=${encodeURIComponent(returnTo)}`);
  // Could not verify the session (database/network): fail closed with an error page, not a misleading login prompt.
  if (state.status === "error") throw new Error("session_check_failed");
  redirect(`/login?next=${encodeURIComponent(returnTo)}`);
}
