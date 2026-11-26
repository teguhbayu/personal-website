import Link from "next/link";
import { getOwner } from "@/lib/data";
import SplitRollText from "@/app/components/SplitRollText";

export default async function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const owner = await getOwner();

  return (
    <div className="min-h-[100dvh] w-full bg-sheet text-ink flex flex-col">
      <header className="sticky top-0 z-40 border-b border-rule bg-sheet/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] px-3 inline-flex items-center gap-2.5 rounded-sm bg-sheet-alt border border-rule text-ink hover:border-accent-strong transition-colors"
            >
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 bg-accent-strong"
              />
              <span className="font-display font-extrabold text-base sm:text-lg tracking-tight">
                {owner.shortName}
              </span>
            </Link>
            <span className="font-mono text-xs text-ink-muted">/</span>
            <Link
              href="/blog"
              className="min-h-[44px] inline-flex items-center font-mono text-xs uppercase text-accent font-medium hover:underline underline-offset-4"
            >
              Blog
            </Link>
          </div>

          <nav aria-label="Portfolio links" className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/projects"
              className="min-h-[44px] px-3 inline-flex items-center border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm hover:border-accent-strong transition-colors"
            >
              <SplitRollText
                text="Projects"
                baseClassName="text-ink"
                rollClassName="text-accent"
              />
            </Link>
            <Link
              href="/contact"
              className="min-h-[44px] px-3 inline-flex items-center border border-rule bg-sheet-alt text-ink text-xs font-mono uppercase rounded-sm hover:border-accent-strong transition-colors"
            >
              <SplitRollText
                text="Contact"
                baseClassName="text-ink"
                rollClassName="text-accent"
              />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-rule bg-sheet-alt">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-ink-muted">
          <p>{owner.fullName}</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <Link
              href="/practice"
              className="hover:text-accent transition-colors"
            >
              Practice
            </Link>
            <Link
              href="/awards"
              className="hover:text-accent transition-colors"
            >
              Awards
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
