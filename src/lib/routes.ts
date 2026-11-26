import type { ChannelId } from "@/data/portfolio";

export const CHANNEL_ROUTES: Record<ChannelId, string> = {
  home: "/",
  practice: "/practice",
  projects: "/projects",
  stack: "/stack",
  awards: "/awards",
  contact: "/contact",
};

export function pathnameToChannel(
  pathname: string | null,
): Exclude<ChannelId, "home"> | null {
  if (!pathname) return null;
  const clean = pathname.replace(/\/+$/, "") || "/";
  switch (clean) {
    case "/practice":
      return "practice";
    case "/projects":
      return "projects";
    case "/stack":
      return "stack";
    case "/awards":
      return "awards";
    case "/contact":
      return "contact";
    default:
      return null;
  }
}
