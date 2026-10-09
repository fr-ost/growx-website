import type { ComponentProps } from "react";

export function Field({
  label,
  id,
  error,
  hint,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string; id: string; error?: string; hint?: string }) {
  const describedBy = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-text">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-text shadow-sm transition placeholder:text-muted/70 focus:outline-none focus:ring-4 ${
          error ? "border-danger/60 focus:border-danger focus:ring-danger/15" : "border-border-strong focus:border-accent focus:ring-[var(--accent-ring)]"
        }`}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
