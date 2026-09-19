const axios = require('axios');
const settings = require('../config/settings');

const COBALT_API = 'https://api.cobalt.tools';

/**
 * Fetch video info from YouTube using oEmbed (no API key needed).
 */
async function getInfo(url) {
  // Try oEmbed for metadata
  let meta = {};
  try {
    const videoId = extractVideoId(url);
    const oembedRes = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { timeout: 8000 }
    );
    meta = {
      title: oembedRes.data.title,
      author: oembedRes.data.author_name,
      thumbnail: oembedRes.data.thumbnail_url,
    };
  } catch (_) {
    // Fallback metadata
    meta = { title: 'YouTube Video', author: 'YouTube', thumbnail: '' };
  }

  return {
    platform: 'youtube',
    url,
    title: meta.title,
    author: meta.author,
    thumbnail: meta.thumbnail,
    duration: null,
  };
}

/**
 * Request a download URL from Cobalt API.
 * @param {string} url - YouTube URL
 * @param {string} format - 'mp4' or 'mp3'
 * @param {string} quality - '360' | '480' | '720' | '1080'
 */
async function getDownload(url, format, quality) {
  const body = {
    url,
    vQuality: quality || '720',
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

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? match[1] : '';
}

function parseCobaltResponse(data) {
  if (data.status === 'stream' || data.status === 'redirect') {
    return {
      success: true,
      downloadUrl: data.url,
      filename: data.filename || 'download',
    };
  }
  if (data.status === 'picker') {
    return {
      success: true,
      picker: data.picker,
      filename: data.filename || 'download',
    };
  }
  return {
    success: false,
    error: data.error || 'Unknown response from download service.',
  };
}

module.exports = { getInfo, getDownload };
