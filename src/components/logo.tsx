import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight" aria-label="GrowX home">
      <Image src="/logo.svg" alt="" width={32} height={32} priority className="rounded-lg" />
      <span className="text-lg">GrowX</span>
    </Link>
  );
}
