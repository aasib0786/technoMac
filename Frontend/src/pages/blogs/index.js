import Head from "next/head";
import Layout from "../../Component/layout/Layout";
import BlogListing from "../../Component/blogs/BlogListing/BlogListing";

export default function BlogsPage() {
  const pageTitle = "Latest Dental Insights, News & Equipment Guides | TECHNOMAC";
  const pageDescription =
    "Explore the latest blogs, news, and technical guides on dental equipment, clinic setup, autoclaves, dental chairs, and medical imaging from TECHNOMAC Medical Systems.";
  const pageKeywords =
    "TECHNOMAC blogs, dental equipment news, dental chair guide, autoclave sterilization, medical imaging solutions, clinic setup India";
  const pageUrl = "https://www.technomac.in/blogs";

  return (
    <>
      <Head>
        {/* ── Primary Meta Tags ── */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />

        {/* ── Open Graph / Facebook / WhatsApp ── */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="TECHNOMAC" />

        {/* ── Twitter Cards ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <Layout>
        <BlogListing />
      </Layout>
    </>
  );
}