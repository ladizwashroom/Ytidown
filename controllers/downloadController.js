const { detectPlatform, normalizeUrl } = require('../utils/validator');
const youtubeService = require('../services/youtubeService');
const tiktokService = require('../services/tiktokService');
const instagramService = require('../services/instagramService');

const serviceMap = {
  youtube: youtubeService,
  tiktok: tiktokService,
  instagram: instagramService,
};

/**
 * Handle /api/info — detect platform, fetch metadata.
 */
async function getInfo(req, res) {
  const rawUrl = req.body?.url;
  const url = normalizeUrl(rawUrl);

  if (!url) {
    return res.status(400).json({ success: false, error: 'No URL provided.' });
  }

  const { platform } = detectPlatform(url);

  if (!platform) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported link. Please use YouTube, TikTok, or Instagram.',
    });
  }

  try {
    const info = await serviceMap[platform].getInfo(url);
    return res.json({ success: true, ...info });
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: 'Could not retrieve media info. The link may be private or invalid.',
    });
  }
}

/**
 * Handle /api/download — detect platform, get download URL, stream to user.
 */
async function download(req, res) {
  const url = normalizeUrl(req.query.url || req.body?.url);
  const format = (req.query.format || req.body?.format || 'mp4').toLowerCase();
  const quality = (req.query.quality || req.body?.quality || '720').toLowerCase();

  if (!url) {
    return res.status(400).json({ success: false, error: 'No URL provided.' });
  }

  const { platform } = detectPlatform(url);

  if (!platform) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported link. Please use YouTube, TikTok, or Instagram.',
    });
  }

  try {
    const result = await serviceMap[platform].getDownload(url, format, quality);

    if (!result.success) {
      return res.status(502).json({ success: false, error: result.error });
    }

    // If we got a picker (multiple media items), return them as JSON
    if (result.picker) {
      return res.json({
        success: true,
        picker: result.picker,
        filename: result.filename,
      });
    }

    // Stream the file through our server so the user gets a direct download
    const axios = require('axios');
    const fileRes = await axios.get(result.downloadUrl, {
      responseType: 'stream',
      timeout: 30000,
    });

    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const filename = sanitizeFilename(result.filename || `ytidown_download.${ext}`);
    const finalName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    res.setHeader('Content-Type', fileRes.headers['content-type'] || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${finalName}"`
    );
    if (fileRes.headers['content-length']) {
      res.setHeader('Content-Length', fileRes.headers['content-length']);
    }

    fileRes.data.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      return res.status(502).json({
        success: false,
        error: 'Download failed. The media may be unavailable or the source is rate-limited.',
      });
    }
  }
}

function sanitizeFilename(name) {
  return (name || 'download').replace(/[^\w.-]/g, '_').slice(0, 100);
}

module.exports = { getInfo, download };
