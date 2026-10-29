import { IconCalendar, IconChart, IconMessage, IconTarget, IconUsers, IconUserX, IconWand } from "@/components/icons";
import type { FeatureIcon as Name } from "@/content/feature-types";

const map = { target: IconTarget, calendar: IconCalendar, wand: IconWand, chart: IconChart, users: IconUsers, userX: IconUserX, message: IconMessage } as const;

export function FeatureIcon({ name, size = 20, className = "" }: { name: Name; size?: number; className?: string }) {
  const Icon = map[name];
  return <Icon size={size} className={className} />;
}
