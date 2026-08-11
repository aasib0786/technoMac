import { useEffect, useState } from "react";
import BlogCard from "../BlogCard/BlogCard";
import styles from "./BlogListing.module.css";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import { getData } from "../../../services/FetchNodeServices";
import { blogs as fallbackBlogs } from "../../../../Data/blogs";

import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function BlogListing() {
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const response = await getData("blog?isActive=true");
      let list = [];
      if (response?.success && Array.isArray(response?.data) && response.data.length > 0) {
        list = response.data;
      } else {
        list = fallbackBlogs;
      }

      // Filter only active blogs & sort featured first
      const activeBlogs = list.filter((item) => item.isActive !== false);
      activeBlogs.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setBlogsList(activeBlogs);
    } catch (error) {
      console.error("Fetch blogs error:", error);
      const activeBlogs = fallbackBlogs.filter((item) => item.isActive !== false);
      setBlogsList(activeBlogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <section className={styles.blogSection}>
      <div className="container">
        <Breadcrumb pageName="Blogs" />
        <div className={styles.heading}>
          <h2>Latest Dental Insights & News</h2>
          <p className={styles.subHeading}>
            Discover professional advice, medical innovations, and clinic equipment guides from Technomac Medical.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader type="blog" count={8} />
        ) : blogsList.length === 0 ? (
          <div className="text-center py-5">
            <p>No blogs published at the moment.</p>
          </div>
        ) : (
          <div className="row g-4">
            {blogsList.map((item) => (
              <div
                className="col-xl-3 col-lg-4 col-md-6 col-12 d-flex align-items-stretch"
                key={item._id || item.id || item.slug}
              >
                <BlogCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}