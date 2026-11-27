import type { Metadata } from "next";
import { getOwner, getPaginatedBlogPosts } from "@/lib/data";
import { buildOgImageMeta } from "@/lib/og-image";
import { SITE_URL } from "@/lib/seo";
import BlogListClient from "./components/BlogListClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const owner = await getOwner();
  const title = "Blog";
  const description = `Articles and engineering notes by ${owner.fullName} on web development, AWS cloud architecture, and software systems.`;
  const url = `${SITE_URL}/blog`;
  const ogImageUrl = `${SITE_URL}/og/blog.jpg`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: owner.fullName,
      images: [buildOgImageMeta(ogImageUrl, `Blog - ${owner.fullName}`)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const parsedPage = Number(params.page);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const query = (params.q ?? "").trim();

  const data = await getPaginatedBlogPosts({
    page,
    pageSize: 6,
    query,
  });

  return <BlogListClient data={data} />;
}
