import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data";
import { getAdminSession } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/seo";
import BlogArticleView from "./components/BlogArticleView";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  if (post.visibility === "DRAFT" || post.visibility === "PRIVATE") {
    const auth = await getAdminSession();
    if (auth.status !== "authenticated") {
      return { title: "Article Not Found" };
    }
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const isIndexable = post.visibility === "PUBLISHED";

  return {
    title: post.title,
    description: post.excerpt,
    alternates: isIndexable ? { canonical: url } : undefined,
    robots: isIndexable
      ? undefined
      : {
          index: false,
          follow: false,
        },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.editedAt ?? post.publishedAt,
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  let isOwnerPreview = false;
  if (post.visibility === "DRAFT" || post.visibility === "PRIVATE") {
    const auth = await getAdminSession();
    if (auth.status !== "authenticated") {
      notFound();
    }
    isOwnerPreview = true;
  }

  const jsonLd =
    post.visibility === "PUBLISHED"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.editedAt ?? post.publishedAt,
          url: `${SITE_URL}/blog/${post.slug}`,
          image: post.headerImage || undefined,
          author: {
            "@type": "Person",
            name: post.authorName,
          },
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogArticleView post={post} isOwnerPreview={isOwnerPreview} />
    </>
  );
}
