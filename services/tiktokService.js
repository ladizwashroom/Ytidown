const axios = require('axios');

const COBALT_API = 'https://api.cobalt.tools';

/**
 * Fetch TikTok video info.
 * Uses oEmbed-like endpoint + Cobalt for metadata.
 */
async function getInfo(url) {
  let meta = {};
  try {
    // TikTok oEmbed
    const res = await axios.get(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { timeout: 8000 }
    );
    meta = {
      title: res.data.title || 'TikTok Video',
      author: res.data.author_name || 'TikTok User',
      thumbnail: res.data.thumbnail_url || '',
    };
  } catch (_) {
    meta = { title: 'TikTok Video', author: 'TikTok User', thumbnail: '' };
  }

  return {
    platform: 'tiktok',
    url,
    title: meta.title,
    author: meta.author,
    thumbnail: meta.thumbnail,
    duration: null,
  };
}

/**
 * Request a no-watermark download URL from Cobalt.
 * @param {string} url - TikTok URL
 * @param {string} format - 'mp4' or 'mp3'
 * @param {string} quality - not used for TikTok (fixed quality)
 */
async function getDownload(url, format, quality) {
  const body = {
    url,
    isAudioOnly: format === 'mp3',
  };

  const res = await axios.post(COBALT_API + '/', body, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 15000,
  });

  return parseCobaltResponse(res.data);
}

function parseCobaltResponse(data) {
  if (data.status === 'stream' || data.status === 'redirect') {
    return {
      success: true,
      downloadUrl: data.url,
      filename: data.filename || 'tiktok_download.mp4',
    };
  }
  if (data.status === 'picker') {
    return {
      success: true,
      picker: data.picker,
      filename: data.filename || 'tiktok_download.mp4',
    };
  }
  return {
    success: false,
    error: data.error || 'Could not download this TikTok video.',
  };
}

module.exports = { getInfo, getDownload };
