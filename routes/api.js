const express = require('express');
const router = express.Router();
const { getInfo, download } = require('../controllers/downloadController');

// POST /api/info — get media metadata (title, thumbnail, author)
router.post('/info', getInfo);

// GET /api/download — stream the downloaded file to the user
//   Query params: url, format (mp4|mp3), quality (360|480|720|1080)
router.get('/download', download);

module.exports = router;
