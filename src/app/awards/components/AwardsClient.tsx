"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { CertificateItem } from "@/data/portfolio";
import SplitRollText from "@/app/components/SplitRollText";

interface AwardsClientProps {
  certificates: CertificateItem[];
}

export default function AwardsClient({ certificates }: AwardsClientProps) {
  const [certTab, setCertTab] = useState<"all" | "competition" | "language">(
    "all",
  );
  const [certQuery, setCertQuery] = useState("");
  const [activeCertId, setActiveCertId] = useState<string | null>(null);
  const [certImgState, setCertImgState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const competitionCount = useMemo(
    () => certificates.filter((c) => c.category === "competition").length,
    [certificates],
  );
  const languageCount = useMemo(
    () => certificates.filter((c) => c.category === "language").length,
    [certificates],
  );

  const filteredCerts = useMemo(() => {
    const q = certQuery.trim().toLowerCase();
    return certificates.filter((c) => {
      const okTab = certTab === "all" || c.category === certTab;
      const okQuery =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.detail.toLowerCase().includes(q) ||
        c.issuerScope.toLowerCase().includes(q);
      return okTab && okQuery;
    });
  }, [certificates, certTab, certQuery]);

  const activeCertIndex = activeCertId
    ? filteredCerts.findIndex((c) => c.id === activeCertId)
    : -1;
  const activeCert: CertificateItem | null =
    activeCertIndex >= 0 ? filteredCerts[activeCertIndex] : null;

  useEffect(() => {
    if (activeCertId) setCertImgState("loading");
  }, [activeCertId]);

  useEffect(() => {
    if (!activeCert) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCertId(null);
      } else if (filteredCerts.length > 1) {
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
  }, [activeCert, activeCertIndex, filteredCerts]);

  const tabs = [
    { id: "all" as const, label: `All (${certificates.length})` },
    { id: "competition" as const, label: `Competition (${competitionCount})` },
    { id: "language" as const, label: `Language (${languageCount})` },
  ];

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
            Verified Certificates
          </h2>
          <p className="text-sm text-ink-muted">
            Competition wins and language certifications, each backed by an
            inspectable scan and verification record.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter certificates by category"
            className="flex flex-wrap gap-2"
          >
            {tabs.map((t) => (
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
              No certificate matches &quot;{certQuery}&quot; under the {certTab}{" "}
              filter. Reset filters to view all {certificates.length} records.
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

      {activeCert &&
        createPortal(
          <div
            data-lightbox-modal="true"
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
                      {activeCert.href && (
                        <a
                          href={activeCert.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-4 inline-flex items-center bg-accent-strong text-white text-sm rounded-sm"
                        >
                          Open Original on Google Drive
                        </a>
                      )}
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
          </div>,
          document.body,
        )}
    </>
  );
}
