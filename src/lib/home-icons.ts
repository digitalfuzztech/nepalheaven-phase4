import {
  Bike,
  Binoculars,
  Camera,
  Compass,
  Footprints,
  Headphones,
  HeartPulse,
  Mountain,
  ShieldCheck,
  Tent,
  Waves,
  type LucideIcon,
} from "lucide-react";
export const HOME_ICON_KEYS = [
  "mountain",
  "compass",
  "footprints",
  "binoculars",
  "camera",
  "waves",
  "bike",
  "tent",
  "heart-pulse",
  "headphones",
  "shield-check",
] as const;
export const HOME_ICON_MAP: Record<
  (typeof HOME_ICON_KEYS)[number],
  LucideIcon
> = {
  mountain: Mountain,
  compass: Compass,
  footprints: Footprints,
  binoculars: Binoculars,
  camera: Camera,
  waves: Waves,
  bike: Bike,
  tent: Tent,
  "heart-pulse": HeartPulse,
  headphones: Headphones,
  "shield-check": ShieldCheck,
};
export function homeIcon(key: string, fallback: LucideIcon = Mountain) {
  return HOME_ICON_MAP[key as keyof typeof HOME_ICON_MAP] ?? fallback;
}
