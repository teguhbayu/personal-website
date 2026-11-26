"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import type { PaginatedBlogPosts } from "@/lib/data";
import SplitRollText from "@/app/components/SplitRollText";

interface BlogListClientProps {
  data: PaginatedBlogPosts;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildBlogHref(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

function getVisiblePages(current: number, total: number): (number | "dots")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "dots")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("dots");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("dots");
  pages.push(total);
  return pages;
}

export default function BlogListClient({ data }: BlogListClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(data.query);

  useEffect(() => {
    setSearchInput(data.query);
  }, [data.query]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === data.query) return;
    const timer = window.setTimeout(() => {
      router.push(buildBlogHref(1, trimmed));
    }, 320);
    return () => window.clearTimeout(timer);
  }, [searchInput, data.query, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildBlogHref(1, searchInput));
  };

  const { posts, totalCount, page, pageSize, totalPages, query } = data;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(totalCount, page * pageSize);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-rule">
        <div className="flex flex-col gap-2 max-w-2xl">
          <p className="font-mono text-xs uppercase text-accent font-medium">
            Writing &amp; Engineering Notes
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-ink leading-tight">
            Blog
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Notes on full-stack web engineering, cloud infrastructure, and
            production lessons learned.
          </p>
        </div>

        {(totalCount > 0 || query.length > 0) && (
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <label htmlFor="public-blog-search" className="sr-only">
              Search articles
            </label>
            <FiSearch
              aria-hidden={true}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted w-4 h-4 pointer-events-none"
            />
            <input
              id="public-blog-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="min-h-[44px] w-full pl-10 pr-3 bg-sheet-alt border border-rule text-sm text-ink placeholder:text-ink-muted rounded-sm"
            />
          </form>
        )}
      </section>

      {posts.length === 0 && !query ? (
        <div
          role="status"
          className="border border-rule bg-sheet-alt rounded-sm p-8 sm:p-10 flex flex-col items-start gap-3"
        >
          <p className="font-mono text-xs uppercase text-accent">
            Archive Empty
          </p>
          <h2 className="font-display font-bold text-2xl text-ink">
            No published posts yet
          </h2>
          <p className="text-sm text-ink-muted max-w-lg leading-relaxed">
            New articles will appear here as soon as they are published.
          </p>
          <Link
            href="/"
            className="min-h-[44px] mt-2 px-5 inline-flex items-center justify-center bg-accent-strong text-white text-xs font-mono uppercase rounded-sm hover:opacity-90 transition-opacity"
          >
            Return to Portfolio
          </Link>
        </div>
      ) : posts.length === 0 ? (
        <div
          role="status"
          className="border border-rule bg-sheet-alt rounded-sm p-8 flex flex-col items-start gap-3"
        >
          <p className="font-display font-bold text-xl text-ink">
            No matching articles found
          </p>
          <p className="text-sm text-ink-muted">
            No published article matches &quot;{query}&quot;.
          </p>
          <Link
            href="/blog"
            onClick={() => setSearchInput("")}
            className="min-h-[44px] px-4 inline-flex items-center bg-accent-strong text-white text-xs font-mono uppercase rounded-sm"
          >
            Reset Search
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, idx) => (
              <article
                key={post.id}
                className="group border border-rule bg-sheet-alt rounded-sm overflow-hidden flex flex-col justify-between hover:border-accent-strong transition-colors"
              >
                <div>
                  <div className="px-4 py-2.5 border-b border-rule bg-sheet flex items-center justify-between gap-2 font-mono text-[11px] text-ink-muted">
                    <span>
                      Article{" "}
                      {String((page - 1) * pageSize + idx + 1).padStart(2, "0")}{" "}
                      · {formatDate(post.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <FiClock aria-hidden={true} className="w-3 h-3" />
                      {post.readingMinutes} min read
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block">
                    {post.headerImage ? (
                      <div className="relative aspect-[16/9] w-full bg-sheet border-b border-rule overflow-hidden">
                        <img
                          src={post.headerImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}

                    <div className="p-5 flex flex-col gap-2.5">
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="px-5 py-3.5 border-t border-rule bg-sheet flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-ink-muted truncate">
                    By {post.authorName}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="min-h-[40px] px-3.5 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm hover:border-accent-strong transition-colors shrink-0"
                  >
                    <SplitRollText
                      text="Read"
                      baseClassName="text-ink"
                      rollClassName="text-accent"
                    />
                    <FiArrowUpRight aria-hidden={true} className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              className="pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <p className="font-mono text-xs text-ink-muted">
                Showing {rangeStart} to {rangeEnd} of {totalCount} articles
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {page > 1 ? (
                  <Link
                    href={buildBlogHref(page - 1, query)}
                    className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <FiChevronLeft aria-hidden={true} className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 border border-rule bg-sheet text-ink-muted/60 font-mono text-xs uppercase rounded-sm select-none"
                  >
                    <FiChevronLeft aria-hidden={true} className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </span>
                )}

                {visiblePages.map((entry, idx) =>
                  entry === "dots" ? (
                    <span
                      key={`dots-${idx}`}
                      aria-hidden="true"
                      className="min-h-[44px] px-2 inline-flex items-center font-mono text-xs text-ink-muted"
                    >
                      ...
                    </span>
                  ) : entry === page ? (
                    <span
                      key={entry}
                      aria-current="page"
                      className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center border border-accent-strong bg-accent-strong text-white font-mono text-xs font-medium rounded-sm"
                    >
                      {entry}
                    </span>
                  ) : (
                    <Link
                      key={entry}
                      href={buildBlogHref(entry, query)}
                      className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center border border-rule bg-sheet-alt text-ink font-mono text-xs rounded-sm hover:border-accent-strong transition-colors"
                    >
                      {entry}
                    </Link>
                  ),
                )}

                {page < totalPages ? (
                  <Link
                    href={buildBlogHref(page + 1, query)}
                    className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors"
                  >
                    <span>Next</span>
                    <FiChevronRight aria-hidden={true} className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 border border-rule bg-sheet text-ink-muted/60 font-mono text-xs uppercase rounded-sm select-none"
                  >
                    <span>Next</span>
                    <FiChevronRight aria-hidden={true} className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
