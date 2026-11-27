import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { FiArrowLeft, FiClock, FiEdit3 } from "react-icons/fi";
import type { BlogPostDetail } from "@/lib/data";

interface BlogArticleViewProps {
  post: BlogPostDetail;
  isOwnerPreview: boolean;
}

interface MdastNode {
  type?: string;
  name?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

function remarkCenterDirective() {
  return (tree: MdastNode) => {
    const walk = (node: MdastNode) => {
      if (node.type === "containerDirective" && node.name === "center") {
        node.data = {
          ...(node.data ?? {}),
          hName: "div",
          hProperties: {
            ...(node.data?.hProperties ?? {}),
            "data-align": "center",
          },
        };
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}

const blogSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "center",
    "figure",
    "figcaption",
    "u",
    "mark",
    "kbd",
    "details",
    "summary",
    "section",
    "sup",
    "sub",
  ],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "align",
      "dataAlign",
      "dataFootnotes",
      "dataFootnoteRef",
      "dataFootnoteBackref",
    ],
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function alignmentClass(align?: string, dataAlign?: string): string {
  const mode = (dataAlign || align || "").toLowerCase();
  if (mode === "center") return "text-center";
  if (mode === "right") return "text-right";
  if (mode === "left") return "text-left";
  return "";
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-strong text-white font-mono text-[11px] uppercase rounded-sm">
              Preview: {post.visibility}
            </span>
            <Link
              href={`/dashboard/posts/${post.id}`}
              className="min-h-[40px] px-3 inline-flex items-center gap-1.5 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors"
            >
              <FiEdit3 aria-hidden={true} className="w-3.5 h-3.5" />
              <span>Edit Post</span>
            </Link>
            <a
              href={`/api/admin/draft/disable?slug=${encodeURIComponent(post.slug)}`}
              className="min-h-[40px] px-3 inline-flex items-center border border-rule bg-sheet text-ink-muted font-mono text-xs uppercase rounded-sm hover:border-accent-strong hover:text-ink transition-colors"
            >
              Exit Preview
            </a>
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
          remarkPlugins={[remarkGfm, remarkDirective, remarkCenterDirective]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, blogSanitizeSchema]]}
          components={{
            h1: ({ children, ...props }) => {
              const align = alignmentClass(
                (props as { align?: string }).align,
                (props as { "data-align"?: string })["data-align"],
              );
              return (
                <h2
                  className={`font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mt-6 mb-1 ${align}`}
                >
                  {children}
                </h2>
              );
            },
            h2: ({ children, ...props }) => {
              const align = alignmentClass(
                (props as { align?: string }).align,
                (props as { "data-align"?: string })["data-align"],
              );
              return (
                <h2
                  className={`font-display font-bold text-xl sm:text-2xl tracking-tight text-ink mt-6 mb-1 pb-2 border-b border-rule ${align}`}
                >
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const align = alignmentClass(
                (props as { align?: string }).align,
                (props as { "data-align"?: string })["data-align"],
              );
              return (
                <h3
                  className={`font-display font-bold text-lg sm:text-xl text-ink mt-5 ${align}`}
                >
                  {children}
                </h3>
              );
            },
            p: ({ node, children, ...props }) => {
              const rawChildren = (
                node as {
                  children?: Array<{ type?: string; tagName?: string }>;
                }
              )?.children;
              const isStandaloneImage =
                Array.isArray(rawChildren) &&
                rawChildren.length === 1 &&
                rawChildren[0]?.type === "element" &&
                rawChildren[0]?.tagName === "img";
              if (isStandaloneImage) {
                return <>{children}</>;
              }
              const align = alignmentClass(
                (props as { align?: string }).align,
                (props as { "data-align"?: string })["data-align"],
              );
              return (
                <p className={`text-ink-muted leading-7 ${align}`}>
                  {children}
                </p>
              );
            },
            div: ({ children, ...props }) => {
              const align = alignmentClass(
                (props as { align?: string }).align,
                (props as { "data-align"?: string })["data-align"],
              );
              return (
                <div className={`flex flex-col gap-3 ${align}`}>{children}</div>
              );
            },
            center: ({ children }) => (
              <div className="flex flex-col items-center text-center gap-2">
                {children}
              </div>
            ),
            figure: ({ children }) => (
              <figure className="my-5 flex flex-col items-center gap-2.5">
                {children}
              </figure>
            ),
            figcaption: ({ children }) => (
              <figcaption className="text-center font-mono text-xs text-ink-muted max-w-2xl px-2">
                {children}
              </figcaption>
            ),
            a: ({ href, children, ...props }) => {
              const isExternal =
                typeof href === "string" && /^https?:\/\//i.test(href);
              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  id={props.id}
                  className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {children}
                </a>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc pl-6 flex flex-col gap-1.5 text-ink-muted text-left">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 flex flex-col gap-1.5 text-ink-muted text-left">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent-strong bg-sheet-alt px-4 py-3 text-ink-muted rounded-r-sm text-left">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-rule my-4" />,
            pre: ({ children }) => (
              <pre className="overflow-x-auto border border-rule bg-sheet-alt p-4 rounded-sm font-mono text-xs sm:text-sm text-ink leading-relaxed text-left">
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
            img: ({ src, alt, title }) => {
              const imageEl = (
                <img
                  src={src}
                  alt={alt || ""}
                  className="w-full h-auto border border-rule bg-sheet-alt rounded-sm block"
                />
              );
              if (!title) {
                return <div className="my-4">{imageEl}</div>;
              }
              return (
                <figure className="my-5 flex flex-col items-center gap-2.5">
                  {imageEl}
                  <figcaption className="text-center font-mono text-xs text-ink-muted max-w-2xl px-2">
                    {title}
                  </figcaption>
                </figure>
              );
            },
            mark: ({ children }) => (
              <mark className="px-1 bg-accent-strong/15 text-ink rounded-sm">
                {children}
              </mark>
            ),
            kbd: ({ children }) => (
              <kbd className="px-1.5 py-0.5 border border-rule bg-sheet-alt font-mono text-xs text-ink rounded-sm">
                {children}
              </kbd>
            ),
            details: ({ children }) => (
              <details className="border border-rule bg-sheet-alt rounded-sm px-4 py-3 text-left">
                {children}
              </details>
            ),
            summary: ({ children }) => (
              <summary className="cursor-pointer font-display font-bold text-sm text-ink">
                {children}
              </summary>
            ),
            section: ({ children, ...props }) => {
              const isFootnotes =
                "data-footnotes" in props ||
                (props as { className?: string }).className?.includes(
                  "footnotes",
                );
              if (isFootnotes) {
                return (
                  <section className="mt-8 pt-6 border-t border-rule text-xs font-mono text-ink-muted flex flex-col gap-2">
                    {children}
                  </section>
                );
              }
              return <section>{children}</section>;
            },
            table: ({ children }) => (
              <div className="overflow-x-auto border border-rule rounded-sm text-left">
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
