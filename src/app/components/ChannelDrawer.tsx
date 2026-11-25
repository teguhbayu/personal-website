"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { RiNextjsFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import {
  SiAmazonaws,
  SiPrisma,
  SiTypescript,
  SiMysql,
  SiMongodb,
  SiExpress,
  SiExpo,
} from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import {
  CERTIFICATES,
  CertificateItem,
  ChannelId,
  OWNER,
  PROJECTS,
  ProjectItem,
  SKILL_GROUPS,
  SOCIALS,
  VERIFIED_LEDGER,
} from "@/data/portfolio";
import SplitRollText from "./SplitRollText";

interface ChannelDrawerProps {
  channel: Exclude<ChannelId, "home"> | null;
  onClose: () => void;
  onSpinConsole: () => void;
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
  nextjs: <RiNextjsFill aria-hidden="true" />,
  typescript: <SiTypescript aria-hidden="true" />,
  expo: <SiExpo aria-hidden="true" />,
  go: <FaGolang aria-hidden="true" />,
  express: <SiExpress aria-hidden="true" />,
  prisma: <SiPrisma aria-hidden="true" />,
  aws: <SiAmazonaws aria-hidden="true" />,
  postgresql: <BiLogoPostgresql aria-hidden="true" />,
  mysql: <SiMysql aria-hidden="true" />,
  mongodb: <SiMongodb aria-hidden="true" />,
};

export default function ChannelDrawer({
  channel,
  onClose,
  onSpinConsole,
}: ChannelDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );
  const [projImgState, setProjImgState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [stackLayer, setStackLayer] = useState<string>("all");
  const [focusedSkill, setFocusedSkill] = useState<string>("aws");

  const [certTab, setCertTab] = useState<"all" | "competition" | "language">(
    "all",
  );
  const [certQuery, setCertQuery] = useState("");
  const [activeCertId, setActiveCertId] = useState<string | null>(null);
  const [certImgState, setCertImgState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const filteredCerts = useMemo(() => {
    const q = certQuery.trim().toLowerCase();
    return CERTIFICATES.filter((c) => {
      const okTab = certTab === "all" || c.category === certTab;
      const okQuery =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.detail.toLowerCase().includes(q) ||
        c.issuerScope.toLowerCase().includes(q);
      return okTab && okQuery;
    });
  }, [certTab, certQuery]);

  const activeCertIndex = activeCertId
    ? filteredCerts.findIndex((c) => c.id === activeCertId)
    : -1;
  const activeCert: CertificateItem | null =
    activeCertIndex >= 0 ? filteredCerts[activeCertIndex] : null;

  useEffect(() => {
    if (!channel || !panelRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReduced) {
      gsap.fromTo(
        panelRef.current,
        { x: 48, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );
    }
    const timer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProject) {
          setSelectedProject(null);
        } else if (activeCertId) {
          setActiveCertId(null);
        } else {
          onClose();
        }
      } else if (activeCert && filteredCerts.length > 1) {
        if (e.key === "ArrowRight") {
          setActiveCertId(
            filteredCerts[(activeCertIndex + 1) % filteredCerts.length].id,
          );
        } else if (e.key === "ArrowLeft") {
          setActiveCertId(
            filteredCerts[
              (activeCertIndex - 1 + filteredCerts.length) %
                filteredCerts.length
            ].id,
          );
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    channel,
    selectedProject,
    activeCertId,
    activeCert,
    activeCertIndex,
    filteredCerts,
    onClose,
  ]);

  useEffect(() => {
    if (selectedProject) setProjImgState("loading");
  }, [selectedProject]);

  useEffect(() => {
    if (activeCertId) setCertImgState("loading");
  }, [activeCertId]);

  if (!channel) return null;

  const visibleSkillGroups =
    stackLayer === "all"
      ? SKILL_GROUPS
      : SKILL_GROUPS.filter((g) => g.id === stackLayer);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OWNER.email);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2600);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  return (
    <>
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={`${channel} section panel`}
        className="fixed z-30 inset-x-3 bottom-3 top-[74px] sm:inset-x-6 sm:top-[84px] sm:bottom-6 lg:left-auto lg:right-6 lg:w-[min(740px,56vw)] border border-rule bg-sheet text-ink rounded-md flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-rule bg-sheet shrink-0">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-accent font-medium uppercase">
              {channel}
            </span>
            <span className="font-mono text-xs text-ink-muted">
              / {OWNER.fullName}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-4 inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink text-xs sm:text-sm font-mono rounded-sm hover:border-accent-strong transition-colors"
          >
            <SplitRollText
              text="Close"
              baseClassName="text-ink"
              rollClassName="text-accent"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 sm:py-8">
          {channel === "practice" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 border-b border-rule">
                <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 border border-rule bg-sheet-alt rounded-sm overflow-hidden">
                  <Image
                    src={OWNER.portrait}
                    alt="Portrait of Teguh Bayu Pratama"
                    fill
                    sizes="120px"
                    className="object-contain object-bottom pt-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink leading-tight">
                    {OWNER.leadStatement}
                  </h2>
                  <p className="font-mono text-xs text-ink-muted">
                    {OWNER.role} · {OWNER.school} · {OWNER.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-sm sm:text-base text-ink-muted leading-relaxed">
                {OWNER.biography.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="pt-2">
                <p className="font-mono text-xs text-accent mb-3">
                  VERIFIED RECORD
                </p>
                <dl className="divide-y divide-rule border-t border-b border-rule">
                  {VERIFIED_LEDGER.map((row) => (
                    <div
                      key={row.label}
                      className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-ink">
                        {row.label}
                      </dt>
                      <div className="flex items-baseline gap-3">
                        <dd className="font-display font-bold text-lg text-accent">
                          {row.value}
                        </dd>
                        <dd className="font-mono text-xs text-ink-muted">
                          {row.scope}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {channel === "projects" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
                  Shipped Production Platforms
                </h2>
                <p className="text-sm text-ink-muted">
                  Two live web platforms built and deployed for SMK Telkom
                  Malang student organizations and competitions.
                </p>
              </div>

              <div className="flex flex-col gap-8">
                {PROJECTS.map((project) => (
                  <article
                    key={project.id}
                    className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      aria-label={`Inspect full screen screenshot of ${project.name}`}
                      className="group block w-full text-left border-b border-rule"
                    >
                      <div className="flex items-center justify-between px-4 py-2 font-mono text-[11px] text-ink-muted border-b border-rule bg-sheet">
                        <span>Project {project.index}</span>
                        <span className="truncate ml-3">{project.host}</span>
                      </div>
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-sheet">
                        <Image
                          src={project.image}
                          alt={`Screenshot of ${project.name}`}
                          fill
                          sizes="(max-width: 1024px) 92vw, 680px"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    </button>

                    <div className="p-5 flex flex-col gap-4">
                      <div>
                        <h3 className="font-display font-bold text-2xl text-ink">
                          {project.name}
                        </h3>
                        <p className="text-sm font-medium text-ink mt-0.5">
                          {project.subtitle}
                        </p>
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {project.description}
                      </p>
                      <ul
                        aria-label={`${project.name} stack`}
                        className="flex flex-wrap gap-2"
                      >
                        {project.stack.map((tech) => (
                          <li
                            key={tech}
                            className="px-2.5 py-1 border border-rule bg-sheet font-mono text-xs text-ink rounded-sm"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-5 inline-flex items-center justify-center bg-accent-strong text-white text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity"
                        >
                          <SplitRollText
                            text={`Visit ${project.name}`}
                            baseClassName="text-white"
                            rollClassName="text-white"
                          />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="min-h-[44px] px-5 inline-flex items-center justify-center border border-rule bg-sheet text-ink text-sm font-medium rounded-sm hover:border-accent-strong transition-colors"
                        >
                          <SplitRollText
                            text="Inspect Full Screen"
                            baseClassName="text-ink"
                            rollClassName="text-accent"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {channel === "stack" && (
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
                  Technical Stack
                </h2>
                <p className="text-sm text-ink-muted">
                  Ten core technologies used across frontend interfaces, backend
                  services, and AWS cloud deployments.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Filter stack by engineering layer"
                className="flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={stackLayer === "all"}
                  onClick={() => setStackLayer("all")}
                  className={`min-h-[44px] px-3.5 text-xs font-mono rounded-sm border transition-colors ${
                    stackLayer === "all"
                      ? "bg-accent-strong text-white border-accent-strong"
                      : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
                  }`}
                >
                  All (10)
                </button>
                {SKILL_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    aria-selected={stackLayer === g.id}
                    onClick={() => setStackLayer(g.id)}
                    className={`min-h-[44px] px-3.5 text-xs font-mono rounded-sm border transition-colors ${
                      stackLayer === g.id
                        ? "bg-accent-strong text-white border-accent-strong"
                        : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
                    }`}
                  >
                    {g.domain}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-6">
                {visibleSkillGroups.map((group) => (
                  <div
                    key={group.id}
                    className="stack-band flex flex-col gap-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display font-bold text-xl text-ink">
                        {group.domain}
                      </h3>
                      <span className="font-mono text-xs text-ink-muted">
                        LAYER {group.index}
                      </span>
                    </div>
                    <div className="divide-y divide-rule border border-rule rounded-sm overflow-hidden">
                      {group.items.map((item) => {
                        const active = focusedSkill === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setFocusedSkill(item.id);
                              onSpinConsole();
                            }}
                            className={`w-full text-left px-4 py-3.5 min-h-[56px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-colors ${
                              active
                                ? "bg-sheet-alt text-ink"
                                : "bg-sheet hover:bg-sheet-alt/70 text-ink"
                            }`}
                          >
                            <span className="inline-flex items-center gap-3.5">
                              <span
                                className={`text-xl ${
                                  active ? "text-accent" : "text-ink"
                                }`}
                              >
                                {SKILL_ICONS[item.id]}
                              </span>
                              <span className="font-display font-bold text-base sm:text-lg">
                                {item.name}
                              </span>
                            </span>
                            <span className="font-mono text-xs text-ink-muted">
                              {item.note}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {channel === "awards" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
                  Verified Certificates
                </h2>
                <p className="text-sm text-ink-muted">
                  Competition wins and language certifications, each backed by
                  an inspectable scan and Google Drive verification link.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div
                  role="tablist"
                  aria-label="Filter certificates by category"
                  className="flex flex-wrap gap-2"
                >
                  {(
                    [
                      { id: "all", label: "All (5)" },
                      { id: "competition", label: "Competition (3)" },
                      { id: "language", label: "Language (2)" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={certTab === t.id}
                      onClick={() => setCertTab(t.id)}
                      className={`min-h-[44px] px-3.5 text-xs font-mono rounded-sm border transition-colors ${
                        certTab === t.id
                          ? "bg-accent-strong text-white border-accent-strong"
                          : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="drawer-cert-search" className="sr-only">
                    Filter certificates
                  </label>
                  <input
                    id="drawer-cert-search"
                    type="search"
                    value={certQuery}
                    onChange={(e) => setCertQuery(e.target.value)}
                    placeholder="Filter certificates..."
                    className="min-h-[44px] w-full sm:w-48 px-3 bg-sheet border border-rule text-sm text-ink placeholder:text-ink-muted rounded-sm"
                  />
                </div>
              </div>

              {filteredCerts.length === 0 ? (
                <div
                  role="status"
                  className="p-6 border border-rule bg-sheet-alt rounded-sm flex flex-col items-start gap-3"
                >
                  <p className="font-display font-bold text-lg text-ink">
                    No matching certificates found
                  </p>
                  <p className="text-sm text-ink-muted">
                    No certificate matches &quot;{certQuery}&quot; under the{" "}
                    {certTab} filter. Reset filters to view all five records.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCertTab("all");
                      setCertQuery("");
                    }}
                    className="min-h-[44px] px-4 bg-accent-strong text-white text-sm font-semibold rounded-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCerts.map((cert) => (
                    <article
                      key={cert.id}
                      className="border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveCertId(cert.id)}
                        aria-label={`Inspect ${cert.name} certificate`}
                        className="group block w-full text-left"
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-rule font-mono text-[11px] text-ink-muted bg-sheet">
                          <span>{cert.issuerScope}</span>
                          <span className="text-accent font-medium">
                            {cert.detail}
                          </span>
                        </div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sheet">
                          <Image
                            src={cert.image}
                            alt={`Certificate scan for ${cert.name}`}
                            fill
                            sizes="(max-width: 640px) 90vw, 330px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      </button>

                      <div className="p-3.5 border-t border-rule flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-ink">
                          {cert.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveCertId(cert.id)}
                            className="min-h-[44px] px-3 border border-rule bg-sheet text-ink text-xs font-mono rounded-sm hover:border-accent-strong"
                          >
                            <SplitRollText
                              text="Inspect"
                              baseClassName="text-ink"
                              rollClassName="text-accent"
                            />
                          </button>
                          {cert.href && (
                            <a
                              href={cert.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[44px] px-3 inline-flex items-center border border-rule bg-sheet text-ink text-xs font-mono rounded-sm hover:border-accent-strong"
                            >
                              <SplitRollText
                                text="Open"
                                baseClassName="text-ink"
                                rollClassName="text-accent"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {channel === "contact" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-ink">
                  Start a Conversation
                </h2>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Available for freelance web development, AWS cloud
                  architecture, and software engineering collaborations.
                </p>
              </div>

              <div className="p-5 border border-rule bg-sheet-alt rounded-sm flex flex-col gap-4">
                <p className="font-mono text-xs text-accent">DIRECT EMAIL</p>
                <a
                  href={`mailto:${OWNER.email}`}
                  className="font-display font-bold text-xl sm:text-2xl text-ink break-all underline underline-offset-4 hover:text-accent transition-colors"
                >
                  {OWNER.email}
                </a>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="min-h-[48px] px-5 inline-flex items-center justify-center border border-rule bg-sheet text-ink text-sm font-medium rounded-sm hover:border-accent-strong transition-colors"
                  >
                    {copyState === "copied"
                      ? "Email Copied"
                      : copyState === "error"
                        ? "Copy Unavailable"
                        : "Copy Email Address"}
                  </button>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className="font-mono text-xs text-ink-muted min-h-[18px]"
                >
                  {copyState === "copied" &&
                    `${OWNER.email} copied to your clipboard.`}
                  {copyState === "error" &&
                    "Clipboard access was blocked by this browser. Use Open Email Client instead."}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs text-ink-muted">PROFILES</p>
                <ul className="flex flex-col gap-2">
                  {SOCIALS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[48px] px-4 border border-rule bg-sheet-alt rounded-sm flex items-center justify-between text-sm text-ink hover:border-accent-strong transition-colors"
                      >
                        <span className="font-semibold">
                          <SplitRollText
                            text={s.label}
                            baseClassName="text-ink"
                            rollClassName="text-accent"
                          />
                        </span>
                        <span className="font-mono text-xs text-ink-muted">
                          {s.handle}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>

      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="proj-lightbox-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "var(--scrim)" }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-rule bg-sheet text-ink rounded-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <h3
                id="proj-lightbox-title"
                className="font-display font-bold text-xl text-ink"
              >
                {selectedProject.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-sm font-mono rounded-sm"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="relative aspect-[16/9] w-full border border-rule bg-sheet-alt rounded-sm overflow-hidden">
                {projImgState === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-ink-muted">
                    Loading full preview of {selectedProject.name}...
                  </div>
                )}
                {projImgState === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-sm text-ink">
                      Could not display preview image inline.
                    </p>
                    <a
                      href={selectedProject.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 inline-flex items-center bg-accent-strong text-white text-sm rounded-sm"
                    >
                      Open {selectedProject.host}
                    </a>
                  </div>
                ) : (
                  <Image
                    src={selectedProject.image}
                    alt={`Full view of ${selectedProject.name}`}
                    fill
                    sizes="(max-width: 1024px) 95vw, 960px"
                    className="object-contain"
                    onLoad={() => setProjImgState("ready")}
                    onError={() => setProjImgState("error")}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <a
                  href={selectedProject.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 inline-flex items-center bg-accent-strong text-white text-sm font-semibold rounded-sm"
                >
                  Open Live Site
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-lightbox-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "var(--scrim)" }}
          onClick={() => setActiveCertId(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-rule bg-sheet text-ink rounded-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <div>
                <p className="font-mono text-xs text-accent">
                  {activeCert.issuerScope} / {activeCert.detail}
                </p>
                <h3
                  id="cert-lightbox-title"
                  className="font-display font-bold text-xl text-ink"
                >
                  {activeCert.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCertId(null)}
                className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-sm font-mono rounded-sm"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="relative aspect-[16/11] w-full border border-rule bg-sheet-alt rounded-sm overflow-hidden">
                {certImgState === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-ink-muted">
                    Loading certificate scan...
                  </div>
                )}
                {certImgState === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-sm text-ink">
                      Unable to display this scan inline.
                    </p>
                    <a
                      href={activeCert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 inline-flex items-center bg-accent-strong text-white text-sm rounded-sm"
                    >
                      Open Original on Google Drive
                    </a>
                  </div>
                ) : (
                  <Image
                    src={activeCert.image}
                    alt={`Full certificate scan for ${activeCert.name}`}
                    fill
                    sizes="(max-width: 1024px) 95vw, 860px"
                    className="object-contain"
                    onLoad={() => setCertImgState("ready")}
                    onError={() => setCertImgState("error")}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {filteredCerts.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCertId(
                            filteredCerts[
                              (activeCertIndex - 1 + filteredCerts.length) %
                                filteredCerts.length
                            ].id,
                          )
                        }
                        className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-sm font-mono rounded-sm"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCertId(
                            filteredCerts[
                              (activeCertIndex + 1) % filteredCerts.length
                            ].id,
                          )
                        }
                        className="min-h-[44px] px-4 border border-rule bg-sheet-alt text-ink text-sm font-mono rounded-sm"
                      >
                        Next
                      </button>
                    </>
                  )}
                </div>
                {activeCert.href && (
                  <a
                    href={activeCert.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-5 inline-flex items-center bg-accent-strong text-white text-sm font-semibold rounded-sm"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
