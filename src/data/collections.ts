import type { CollectionDef } from "@/components/case-cards/CollectionCard";

export const collections: CollectionDef[] = [
  {
    title: "Dermal Traction Method",
    subtitle: "Manual Technique",
    itemCount: 8,
    href: "/?tab=learn&category=DTM",
    gradient: "bg-gradient-to-br from-blue-600 to-blue-800",
  },
  {
    title: "FYOB Strength",
    subtitle: "Exercise Programming",
    itemCount: 6,
    href: "/?tab=learn&category=FYOB",
    gradient: "bg-gradient-to-br from-green-600 to-green-800",
  },
  {
    title: "NCA Foundations",
    subtitle: "Core Reading",
    itemCount: 12,
    href: "/?tab=learn&category=FOUNDATIONS",
    gradient: "bg-gradient-to-br from-purple-600 to-purple-800",
  },
  {
    title: "Clinical Case Studies",
    subtitle: "Applied Learning",
    itemCount: 5,
    href: "/case-studies",
    gradient: "bg-gradient-to-br from-amber-600 to-amber-800",
  },
];
