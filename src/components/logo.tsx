import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
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
      <span className={`font-display text-xl font-extrabold tracking-tight ${tone === "light" ? "text-white" : "text-text"}`}>
        Grow<span className={tone === "light" ? "text-[#ff5a68]" : "text-accent"}>X</span>
      </span>
    </Link>
  );
}
