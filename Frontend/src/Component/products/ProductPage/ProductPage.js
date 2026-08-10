"use client";

import { useEffect, useState, Suspense } from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ProductPage.module.css";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import { useSearchParams } from "next/navigation";
import { getData } from "../../../services/FetchNodeServices";
import categoryStyles from "../../Home/HomeProducts/HomeProducts.module.css";
import Link from "next/link";
import Image from "next/image";
import dummyImage from "../../../../Images/landing_doctors.png";

// Helper to convert names to URL-safe slugs without %20
const toSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

function CardImage({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src || dummyImage);

  useEffect(() => {
    setImgSrc(src || dummyImage);
  }, [src]);

  return (
    <Image
      width={400}
      height={300}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(dummyImage)}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
}

// ─── Category strip (filtered by parentCategory) ─────────────────────────────
function CategoryStrip({ parentCategoryId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentCategoryId) return;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await getData(`category/by-parent/${encodeURIComponent(parentCategoryId)}`);
        if (res?.success) {
          setCategories(
            res.data.map((item) => ({
              _id: item._id,
              image: item.image || item.imageUrl || item.category_image || '',
              name: item.name || item.title || '',
              desc: item.description || item.desc || '',
            }))
          );
        }
      } catch (e) {
        console.error('CategoryStrip fetch failed:', e?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [parentCategoryId]);

  if (!parentCategoryId || categories.length === 0) return null;

  if (loading) {
    return (
      <div className="row mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-lg-3 col-md-6 col-6 mb-3">
            <div style={{ height: 160, borderRadius: 12, background: '#f0f0f0', animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={categoryStyles.productSection} style={{ padding: 15, marginBottom: 15 }}>
      <div className="row">
        {categories.map((item) => (
          <div className="col-lg-2 col-md-3 col-6 mb-3" key={item._id}>
            <Link 
              href={{ pathname: '/products', query: { category: toSlug(item.name) || item._id } }}
              className={`${styles.productCard} ${styles.categoryCard}`}
            >
              <div className={styles.categoryImage}>
                <Image
                  width={120}
                  height={90}
                  src={item.image || dummyImage}
                  alt={item.name}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{item.name}</h3>
                <span>Explore</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SubCategory strip (filtered by category) ────────────────────────────────
function SubCategoryStrip({ categoryId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await getData(`sub-category/by-category/${encodeURIComponent(categoryId)}`);
        if (res?.success) {
          setCategories(
            res.data.map((item) => ({
              _id: item._id,
              image: item.image || item.imageUrl || item.category_image || '',
              name: item.name || item.title || '',
              desc: item.description || item.desc || '',
            }))
          );
        }
      } catch (e) {
        console.error('SubCategoryStrip fetch failed:', e?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryId]);

  if (!categoryId || categories.length === 0) return null;

  if (loading) {
    return (
      <div className="row mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-lg-3 col-md-6 col-6 mb-3">
            <div style={{ height: 160, borderRadius: 12, background: '#f0f0f0', animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={categoryStyles.productSection} style={{ padding: 15, marginBottom: 15 }}>
      <div className="row">
        {categories.map((item) => (
          <div className="col-lg-2 col-md-3 col-6 mb-3" key={item._id}>
            <Link
              href={{ pathname: '/products', query: { sub: toSlug(item.name) || item.name } }}
              className={`${styles.productCard} ${styles.categoryCard}`}
            >
              <div className={styles.categoryImage}>
                <Image
                  src={item.image || dummyImage}
                  alt={item.name}
                  width={120}
                  height={90}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{item.name}</h3>
                <span>Explore Products</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Skeleton loader for products ────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="col-lg-4 col-md-6 col-6 mb-4">
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <div style={{ height: 200, background: '#f0f0f0', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ padding: 16 }}>
              <div style={{ height: 16, background: '#f0f0f0', borderRadius: 6, marginBottom: 8, width: '75%' }} />
              <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, width: '50%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page content (uses useSearchParams — must be inside Suspense) ──────
function ProductPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const subCategoryId = searchParams.get('sub');
  const parentCategoryId = searchParams.get('parentCategory');
  const subCategoryByBanner = searchParams.get('subCategory');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // ── Determine page heading ────────────────────────────────────────────────
  let headingName = '';
  if (parentCategoryId) {
    const formattedName = decodeURIComponent(parentCategoryId)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    headingName = products[0]?.parentCategoryId?.name || formattedName || 'Dental Equipment';
  } else if (categoryId) {
    const formattedName = decodeURIComponent(categoryId)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    headingName = products[0]?.category?.name || formattedName || 'Dental Equipment';
  } else if (subCategoryId || subCategoryByBanner) {
    const formattedName = decodeURIComponent(subCategoryId || subCategoryByBanner)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    headingName = products[0]?.subCategory?.name || formattedName || 'Dental Equipment';
  } else {
    headingName = 'Dental Equipment';
  }

  console.log("subCategoryId", subCategoryId)
  // ── Fetch products based on active filter ─────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]); // clear previous results
      try {
        let endpoint;
        if (subCategoryId || subCategoryByBanner) {
          endpoint = `product/by-subcategory/${encodeURIComponent(subCategoryId || subCategoryByBanner)}`;
        } else if (categoryId) {
          endpoint = `product/by-category/${encodeURIComponent(categoryId)}`;
        } else if (parentCategoryId) {
          endpoint = `product/by-parent/${encodeURIComponent(parentCategoryId)}`;
        } else {
          endpoint = 'product/';
        }

        const res = await getData(endpoint);
        if (res?.success) {
          setProducts(res.data || []);
        }
      } catch (e) {
        console.error('fetchProducts error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subCategoryId, subCategoryByBanner, parentCategoryId]);

  // ── Enhanced search filter by product name, model, sku, category, description ──
  const filteredProducts = products.filter((item) => {
    if (!search || !search.trim()) return true;
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const searchTarget = [
      item.name,
      item.sku,
      item.model,
      item.category?.name,
      item.subCategory?.name,
      item.parentCategoryId?.name,
      item.description,
      ...(Array.isArray(item.features) ? item.features : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => searchTarget.includes(term));
  });

  return (
    <section className={styles.productPage}>
      <div className="container">

        {/* BREADCRUMB */}
        <Breadcrumb pageName="Products" />

        {/* HEADING */}
        <div className={styles.heading}>
          <h1>Explore Our Medical & {headingName}</h1>
          <p>
            From advanced medical devices to cutting-edge dental equipment,
            discover innovative solutions trusted by hospitals, clinics,
            and healthcare professionals across India.
          </p>
        </div>

        {/* CATEGORY STRIP — only when parentCategory is set */}
        {parentCategoryId && (
          <CategoryStrip parentCategoryId={parentCategoryId} />
        )}
        {categoryId && (
          <SubCategoryStrip categoryId={categoryId} />
        )}

        {/* SEARCH */}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search dental products by name, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <ProductSkeleton />
        ) : (
          <div className={`row ${styles.productGrid}`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <div className="col-lg-3 col-md-6 col-6 mb-4" key={item._id}>
                  <ProductCard item={item} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className={styles.emptyBox}>
                  <i className="ri-search-line" style={{ fontSize: 40, color: '#9ca3af', display: 'block', marginBottom: 12 }}></i>
                  <h3 style={{ fontSize: '28px', margin: '0' }}>No Products Found</h3>
                  <p>Try searching another dental product.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

// ─── Default export — wraps in Suspense (required for useSearchParams) ────────
export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <ProductSkeleton />
          </div>
        </section>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}