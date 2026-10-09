import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="GrowX home">
      <Image
        src="/logo.svg"
        alt=""
        width={34}
        height={34}
        priority
        className="rounded-[10px] shadow-[var(--shadow-red)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
      />
      <span className="font-display text-xl font-extrabold tracking-tight">
        Grow<span className="text-accent">X</span>
      </span>
    </Link>
  );
}
