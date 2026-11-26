import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiClock, FiEdit3 } from "react-icons/fi";
import type { BlogPostDetail } from "@/lib/data";

interface BlogArticleViewProps {
  post: BlogPostDetail;
  isOwnerPreview: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogArticleView({
  post,
  isOwnerPreview,
}: BlogArticleViewProps) {
  return (
    <article className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/blog"
          className="min-h-[44px] px-3.5 inline-flex items-center gap-2 border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm hover:border-accent-strong transition-colors"
        >
          <FiArrowLeft aria-hidden={true} className="w-3.5 h-3.5" />
          <span>Back to Blog</span>
        </Link>

        {isOwnerPreview && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-[11px] uppercase rounded-sm">
              Preview: {post.visibility}
            </span>
            <Link
              href="/dashboard/posts"
              className="min-h-[40px] px-3 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors"
            >
              <FiEdit3 aria-hidden={true} className="w-3.5 h-3.5" />
              <span>Edit in Dashboard</span>
            </Link>
          </div>
        )}
      </div>

      <header className="flex flex-col gap-4 pb-6 border-b border-rule">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-muted">
          <span className="text-accent font-medium">
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiClock aria-hidden={true} className="w-3.5 h-3.5" />
            {post.readingMinutes} min read
          </span>
          <span>By {post.authorName}</span>
          {post.editedAt && <span>Updated {formatDate(post.editedAt)}</span>}
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-ink leading-[1.12]">
          {post.title}
        </h1>
      </header>

      {post.headerImage && (
        <figure className="border border-rule bg-sheet-alt rounded-sm overflow-hidden">
          <img
            src={post.headerImage}
            alt={post.title}
            className="w-full h-auto max-h-[520px] object-cover block"
          />
        </figure>
      )}

      <div className="flex flex-col gap-4 text-base text-ink leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mt-6 mb-1">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-ink mt-6 mb-1 pb-2 border-b border-rule">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display font-bold text-lg sm:text-xl text-ink mt-5">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-ink-muted leading-7">{children}</p>
            ),
            a: ({ href, children }) => {
              const isExternal =
                typeof href === "string" && /^https?:\/\//i.test(href);
              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {children}
                </a>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc pl-6 flex flex-col gap-1.5 text-ink-muted">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 flex flex-col gap-1.5 text-ink-muted">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent-strong bg-sheet-alt px-4 py-3 text-ink-muted rounded-r-sm">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-rule my-4" />,
            pre: ({ children }) => (
              <pre className="overflow-x-auto border border-rule bg-sheet-alt p-4 rounded-sm font-mono text-xs sm:text-sm text-ink leading-relaxed">
                {children}
              </pre>
            ),
            code: ({ className, children }) => {
              const isBlock = Boolean(className);
              if (isBlock) {
                return (
                  <code className={`${className} font-mono`}>{children}</code>
                );
              }
              return (
                <code className="px-1.5 py-0.5 border border-rule bg-sheet-alt font-mono text-[0.86em] text-ink rounded-sm">
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt || ""}
                className="w-full h-auto border border-rule bg-sheet-alt rounded-sm my-2 block"
              />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto border border-rule rounded-sm">
                <table className="w-full border-collapse text-sm text-left">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-sheet-alt border-b border-rule font-mono text-xs uppercase text-ink">
                {children}
              </thead>
            ),
            th: ({ children }) => <th className="px-3.5 py-2.5">{children}</th>,
            td: ({ children }) => (
              <td className="px-3.5 py-2.5 border-t border-rule text-ink-muted">
                {children}
              </td>
            ),
          }}
        >
          {post.body}
        </ReactMarkdown>
      </div>
    </article>
  );
}
