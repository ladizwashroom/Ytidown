require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  maxDownloadSizeMB: parseInt(process.env.MAX_DOWNLOAD_SIZE_MB || '500', 10),
  rapidapiKey: process.env.RAPIDAPI_KEY || '',

  supportedPlatforms: ['youtube', 'tiktok', 'instagram'],

  formats: {
    video: ['mp4'],
    audio: ['mp3'],
  },

  qualities: {
    mp4: ['360', '480', '720', '1080'],
    mp3: ['128', '320'],
  },
};
