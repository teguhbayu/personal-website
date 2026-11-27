import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getPublicBlogSlugs } from "@/lib/data";
import { getAdminSession } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/seo";
import BlogArticleView from "./components/BlogArticleView";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublicBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: isDraftMode } = await draftMode();
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  if (post.visibility === "DRAFT" || post.visibility === "PRIVATE") {
    if (!isDraftMode) {
      return { title: "Article Not Found" };
    }
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
  const { isEnabled: isDraftMode } = await draftMode();
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  let isOwnerPreview = false;
  if (post.visibility === "DRAFT" || post.visibility === "PRIVATE") {
    if (!isDraftMode) {
      notFound();
    }
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
