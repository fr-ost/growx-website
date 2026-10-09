export default function Loading() {
  return (
    <div className="flex-1 bg-surface-2" role="status" aria-live="polite">
      <span className="sr-only">Loading your dashboard</span>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="skeleton h-44 rounded-3xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton h-56 rounded-2xl" />
          <div className="skeleton h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
