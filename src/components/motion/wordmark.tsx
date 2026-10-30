/** The giant footer "GrowX" wordmark. Decorative; never a heading. The footer must be overflow-clip. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`wordmark ${className}`} aria-hidden="true" data-decor="">
      GrowX
    </div>
  );
}
