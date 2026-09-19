/**
 * Validator — Detects and validates links from YouTube, TikTok, Instagram.
 */

const patterns = {
  youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/[\w.-]+\/video\/(\d+)|vm\.tiktok\.com\/([\w]+)/i,
  instagram: /instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/i,
};

/**
 * Detect which platform a URL belongs to.
 * @param {string} url
 * @returns {{ platform: string|null, id: string|null }}
 */
function detectPlatform(url) {
  if (!url || typeof url !== 'string') return { platform: null, id: null };

  for (const [platform, regex] of Object.entries(patterns)) {
    const match = url.match(regex);
    if (match) {
      const id = match[1] || match[2] || match[3] || null;
      return { platform, id };
    }
  }

  return { platform: null, id: null };
}

/**
 * Validate that a URL is a supported platform link.
 * @param {string} url
 * @returns {boolean}
 */
function isValidLink(url) {
  const { platform } = detectPlatform(url);
  return platform !== null;
}

/**
 * Normalize URL (trim whitespace, basic cleanup).
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  return (url || '').trim();
}

module.exports = { detectPlatform, isValidLink, normalizeUrl, patterns };
