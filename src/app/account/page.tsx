import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** The account page was merged into the dashboard. Old links (and ?checkout=return) keep working. */
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  redirect(checkout === "return" ? "/dashboard?checkout=return" : "/dashboard");
}
