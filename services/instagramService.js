const axios = require('axios');

const COBALT_API = 'https://api.cobalt.tools';

/**
 * Fetch Instagram post/reel info.
 */
async function getInfo(url) {
  let meta = {};
  try {
    const res = await axios.get(
      `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`,
      { timeout: 8000 }
    );
    meta = {
      title: res.data.title || 'Instagram Post',
      author: res.data.author_name || 'Instagram User',
      thumbnail: res.data.thumbnail_url || '',
    };
  } catch (_) {
    meta = { title: 'Instagram Post', author: 'Instagram User', thumbnail: '' };
  }

  return {
    platform: 'instagram',
    url,
    title: meta.title,
    author: meta.author,
    thumbnail: meta.thumbnail,
    duration: null,
  };
}

/**
 * Request a download URL from Cobalt for Instagram.
 * @param {string} url - Instagram URL (post, reel, or stories)
 * @param {string} format - 'mp4' or 'mp3'
 * @param {string} quality - not used for Instagram
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
      filename: data.filename || 'instagram_download.mp4',
    };
  }
  if (data.status === 'picker') {
    // Instagram posts with multiple images/videos
    return {
      success: true,
      picker: data.picker,
      filename: data.filename || 'instagram_download',
    };
  }
  return {
    success: false,
    error: data.error || 'Could not download this Instagram post.',
  };
}

module.exports = { getInfo, getDownload };
