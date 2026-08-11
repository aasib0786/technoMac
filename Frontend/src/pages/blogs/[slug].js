import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "../../Component/layout/Layout";
import BlogDetails from "../../Component/blogs/BlogDetails/BlogDetails";
import SkeletonLoader from "../../Component/common/Loader/SkeletonLoader";
import { getData } from "../../services/FetchNodeServices";
import { blogs as fallbackBlogs } from "../../../Data/blogs";

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await getData(`blog/slug/${slug}`);
        if (response?.success && response?.data) {
          if (response.data.isActive === false) {
            setNotFound(true);
          } else {
            setBlog(response.data);
          }
        } else {
          // Fallback to static data
          const found = fallbackBlogs.find(
            (item) => item.slug === slug && item.isActive !== false
          );
          if (found) setBlog(found);
          else setNotFound(true);
        }
      } catch (error) {
        console.error("Fetch blog detail error:", error);
        const found = fallbackBlogs.find(
          (item) => item.slug === slug && item.isActive !== false
        );
        if (found) setBlog(found);
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  // ── SEO Meta Calculations ────────────────────────────────────────────────
  const pageTitle = blog?.metaTitle
    ? blog.metaTitle
    : blog?.title
    ? `${blog.title} | TECHNOMAC`
    : "Blog Article | TECHNOMAC";

  const pageDescription = blog?.metaDescription
    ? blog.metaDescription
    : blog?.description
    ? blog.description.slice(0, 160)
    : "Read the latest dental and medical equipment insights from TECHNOMAC Medical Systems.";

  const pageKeywords = blog?.metaKeywords
    ? blog.metaKeywords
    : [
        blog?.title,
        blog?.category,
        "TECHNOMAC",
        "dental equipment",
        "healthcare news",
      ]
        .filter(Boolean)
        .join(", ");

  const imageUrl =
    typeof blog?.image === "string" && blog.image.trim() !== ""
      ? blog.image
      : "https://www.technomac.in/logo.png";

  const canonicalUrl = blog?.canonicalUrl
    ? blog.canonicalUrl
    : `https://www.technomac.in/blogs/${slug}`;

  // ── JSON-LD Structured Data Schema.org ────────────────────────────────────
  const jsonLdSchema = blog
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: pageDescription,
        image: [imageUrl],
        author: {
          "@type": "Organization",
          name: blog.author || "TECHNOMAC",
        },
        publisher: {
          "@type": "Organization",
          name: "TECHNOMAC Medical Systems",
          logo: {
            "@type": "ImageObject",
            url: "https://www.technomac.in/logo.png",
          },
        },
        datePublished: blog.createdAt || new Date().toISOString(),
        dateModified: blog.updatedAt || new Date().toISOString(),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      }
    : null;

  // ── Loading ──
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Article... | TECHNOMAC</title>
        </Head>
        <Layout>
          <div style={{ padding: "60px 0" }}>
            <SkeletonLoader type="detail" />
          </div>
        </Layout>
      </>
    );
  }

  // ── Not Found ──
  if (notFound || !blog) {
    return (
      <>
        <Head>
          <title>Blog Not Found | TECHNOMAC</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Layout>
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h2>Blog post not found</h2>
            <p style={{ color: "#666", marginTop: 8 }}>
              The article &ldquo;{slug}&rdquo; does not exist or has been removed.
            </p>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        {/* ── Primary Meta ── */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content={blog.author || "TECHNOMAC"} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* ── Open Graph ── */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="TECHNOMAC" />

        {/* ── Twitter Cards ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />

        {/* ── Article Specific Metadata ── */}
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:modified_time" content={blog.updatedAt} />
        <meta property="article:section" content={blog.category} />

        {/* ── JSON-LD Structured Data Script ── */}
        {jsonLdSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLdSchema),
            }}
          />
        )}
      </Head>

      <Layout>
        <BlogDetails blog={blog} />
      </Layout>
    </>
  );
}