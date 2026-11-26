import type { IconType } from "react-icons";
import * as SiIcons from "react-icons/si";
import type { ResolvedIcon } from "@/lib/icon-data";

const LEGACY_ICON_ALIASES: Record<string, string> = {
  nextjs: "SiNextdotjs",
  typescript: "SiTypescript",
  expo: "SiExpo",
  go: "SiGo",
  express: "SiExpress",
  prisma: "SiPrisma",
  aws: "SiAmazonaws",
  postgresql: "SiPostgresql",
  mysql: "SiMysql",
  mongodb: "SiMongodb",
};

const POPULAR_ICON_KEYS = [
  "SiNextdotjs",
  "SiTypescript",
  "SiReact",
  "SiTailwindcss",
  "SiNodedotjs",
  "SiExpress",
  "SiGo",
  "SiPython",
  "SiRust",
  "SiPrisma",
  "SiPostgresql",
  "SiMysql",
  "SiMongodb",
  "SiRedis",
  "SiAmazonaws",
  "SiDocker",
  "SiKubernetes",
  "SiLinux",
  "SiNginx",
  "SiGit",
  "SiExpo",
  "SiCloudflare",
  "SiVercel",
  "SiTrpc",
];

const iconRecord = SiIcons as unknown as Record<string, IconType | undefined>;

let cachedIndex: { key: string; label: string; lower: string }[] | null = null;

function formatLabel(key: string): string {
  const stripped = key.startsWith("Si") ? key.slice(2) : key;
  return stripped.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function getIndex() {
  if (cachedIndex) return cachedIndex;
  cachedIndex = Object.keys(iconRecord)
    .filter((k) => k.startsWith("Si") && typeof iconRecord[k] === "function")
    .map((key) => {
      const label = formatLabel(key);
      return {
        key,
        label,
        lower: `${key.toLowerCase()} ${label.toLowerCase()}`,
      };
    });
  return cachedIndex;
}

function extractResolvedIcon(key: string): ResolvedIcon | null {
  const IconComp = iconRecord[key];
  if (typeof IconComp !== "function") return null;

  const element = IconComp({}) as {
    props?: {
      attr?: { viewBox?: string };
      children?:
        | { props?: { d?: string } }
        | Array<{ props?: { d?: string } }>;
    };
  } | null;

  if (!element?.props) return null;

  const viewBox = element.props.attr?.viewBox || "0 0 24 24";
  const rawChildren = element.props.children;
  const childList = Array.isArray(rawChildren)
    ? rawChildren
    : rawChildren
      ? [rawChildren]
      : [];

  const paths = childList
    .map((child) => child?.props?.d)
    .filter((d): d is string => typeof d === "string" && d.length > 0);

  if (paths.length === 0) return null;

  return {
    key,
    label: formatLabel(key),
    viewBox,
    paths,
  };
}

export function getTotalSkillIconCount(): number {
  return getIndex().length;
}

export function resolveSkillIcon(
  rawKey?: string | null,
): ResolvedIcon | null {
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const aliased = LEGACY_ICON_ALIASES[lower];
  if (aliased) {
    return extractResolvedIcon(aliased);
  }

  if (iconRecord[trimmed]) {
    return extractResolvedIcon(trimmed);
  }

  const index = getIndex();
  const exact = index.find(
    (entry) =>
      entry.key.toLowerCase() === lower ||
      entry.key.toLowerCase() === `si${lower}`,
  );
  if (exact) {
    return extractResolvedIcon(exact.key);
  }

  return null;
}

export function searchSkillIcons(query: string, limit = 24): ResolvedIcon[] {
  const safeLimit = Math.min(40, Math.max(1, limit));
  const clean = query.trim().toLowerCase();

  if (!clean) {
    return POPULAR_ICON_KEYS.slice(0, safeLimit)
      .map((k) => extractResolvedIcon(k))
      .filter((item): item is ResolvedIcon => item !== null);
  }

  const index = getIndex();
  const siPrefixed = clean.startsWith("si") ? clean : `si${clean}`;
  const exactMatches: string[] = [];
  const prefixMatches: string[] = [];
  const containsMatches: string[] = [];

  for (const entry of index) {
    const keyLower = entry.key.toLowerCase();
    const strippedLower = keyLower.slice(2);
    if (keyLower === clean || keyLower === siPrefixed || strippedLower === clean) {
      exactMatches.push(entry.key);
    } else if (
      strippedLower.startsWith(clean) ||
      keyLower.startsWith(clean) ||
      entry.label.toLowerCase().startsWith(clean)
    ) {
      prefixMatches.push(entry.key);
    } else if (entry.lower.includes(clean)) {
      containsMatches.push(entry.key);
    }
  }

  const ordered = [
    ...exactMatches,
    ...prefixMatches,
    ...containsMatches,
  ].slice(0, safeLimit);

  return ordered
    .map((k) => extractResolvedIcon(k))
    .filter((item): item is ResolvedIcon => item !== null);
}
