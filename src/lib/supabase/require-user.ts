import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./user";

/** Server-side gate for protected pages/actions. Does not trust the proxy alone. */
export async function requireUser(returnTo = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
