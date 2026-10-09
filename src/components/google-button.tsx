import { Button } from "@/components/ui/button";
import { googleAction } from "@/app/login/actions";
import { googleAuthEnabled } from "@/lib/env";

/** Rendered only when Google OAuth has been explicitly enabled by configuration. */
export function GoogleButton({ next }: { next?: string }) {
  if (!googleAuthEnabled()) return null;
  return (
    <>
      <form action={googleAction}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Button type="submit" variant="secondary" className="w-full">
          Continue with Google
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
