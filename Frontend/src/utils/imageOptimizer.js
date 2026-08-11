/**
 * Optimizes image URLs for lightning-fast loading across all devices.
 * Automatically injects Cloudinary's automatic WebP/AVIF format ('f_auto')
 * and perceptual auto-compression ('q_auto') if not already present.
 *
 * @param {string|object} url - The image URL or imported image asset
 * @param {object} options - Optional width, height, or quality overrides
 * @returns {string} The optimized image URL
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url) return '';

  // If Next.js static import object
  const rawUrl = typeof url === 'object' && url !== null ? (url.src || '') : String(url).trim();
  if (!rawUrl) return '';

  // Cloudinary image transformation
  if (rawUrl.includes('res.cloudinary.com') && rawUrl.includes('/upload/')) {
    // If it already contains f_auto or q_auto, don't duplicate
    if (rawUrl.includes('/upload/f_auto') || rawUrl.includes('/upload/q_auto')) {
      return rawUrl;
    }

    const { width, quality = 'auto' } = options;
    const transformParts = ['f_auto', `q_${quality}`];
    if (width) transformParts.push(`w_${width}`);

    const transformString = transformParts.join(',');
    return rawUrl.replace('/upload/', `/upload/${transformString}/`);
  }

  return rawUrl;
}

export default optimizeImageUrl;
