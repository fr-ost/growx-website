import { Notice } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { DB_ISSUE_HELP, type DbIssue } from "@/lib/db/errors";

/**
 * Visible, actionable error for a failed data load. Shows a short reference
 * (query + error code) that the site owner can match against /api/health and
 * the Vercel logs. Contains no user data.
 */
export function DataIssue({ title, issues }: { title: string; issues: DbIssue[] }) {
  if (!issues.length) return null;
  const kinds = [...new Set(issues.map((i) => i.kind))];
  return (
    <Notice tone="error" title={title}>
      <p>{kinds.map((k) => DB_ISSUE_HELP[k]).join(" ")}</p>
      <p className="mt-1.5 text-xs opacity-80">
        Reference: {issues.map((i) => `${i.source}/${i.kind}${i.code ? ` (${i.code})` : ""}`).join(", ")}. If this persists, contact{" "}
        {site.supportEmail}.
      </p>
    </Notice>
  );
}
