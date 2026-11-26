"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ProjectItem } from "@/data/portfolio";
import SplitRollText from "@/app/components/SplitRollText";

interface ProjectsClientProps {
  projects: ProjectItem[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );
  const [projImgState, setProjImgState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    if (selectedProject) setProjImgState("loading");
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject]);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">
            Shipped Production Platforms
          </h2>
          <p className="text-sm text-ink-muted">
            Production web platforms built and deployed for organizations,
            competitions, and freelance clients.
          </p>
        </div>

        {projects.length === 0 ? (
          <div
            role="status"
            className="p-6 border border-rule bg-sheet-alt rounded-sm"
          >
            <p className="font-display font-bold text-lg text-ink">
              No projects published yet
            </p>
            <p className="text-sm text-ink-muted mt-1">
              Projects added to the data source will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {projects.map((project) => (
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
        )}
      </div>

      {selectedProject &&
        createPortal(
          <div
            data-lightbox-modal="true"
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
          </div>,
          document.body,
        )}
    </>
  );
}
