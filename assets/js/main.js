/* ===========================================
   YtiDown — Frontend Logic
   Handles link input, fetch to backend, result display
   =========================================== */

const API_BASE = window.location.origin;

// DOM elements
const linkInput = document.getElementById('linkInput');
const fetchBtn = document.getElementById('fetchBtn');
const downloadCard = document.getElementById('downloadCard');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const errorResetBtn = document.getElementById('errorResetBtn');
const resetBtn = document.getElementById('resetBtn');
const resultThumbnail = document.getElementById('resultThumbnail');
const resultTitle = document.getElementById('resultTitle');
const resultAuthor = document.getElementById('resultAuthor');
const resultDuration = document.getElementById('resultDuration');
const formatButtons = document.querySelectorAll('.format-btn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

let currentMedia = null;

// === Helpers ===
function showSection(section) {
  loadingSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  errorSection.classList.add('hidden');
  if (section) section.classList.remove('hidden');
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  showSection(errorSection);
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'YouTube';
  if (/tiktok\.com/i.test(url)) return 'TikTok';
  if (/instagram\.com/i.test(url)) return 'Instagram';
  return null;
}

// === Fetch media info ===
async function fetchMediaInfo() {
  const url = linkInput.value.trim();
  if (!url) {
    showError('Please paste a link first.');
    return;
  }

  const platform = detectPlatform(url);
  if (!platform) {
    showError('Unsupported link. Please use a YouTube, TikTok, or Instagram URL.');
    return;
  }

  fetchBtn.disabled = true;
  showSection(loadingSection);

  try {
    const res = await fetch(`${API_BASE}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showError(data.error || 'Could not retrieve media info. Check the link and try again.');
      fetchBtn.disabled = false;
      return;
    }

    currentMedia = data;
    renderResult(data);
    showSection(resultSection);
  } catch (err) {
    showError('Network error. Make sure the server is running.');
  } finally {
    fetchBtn.disabled = false;
  }
}

// === Render result ===
function renderResult(data) {
  resultThumbnail.src = data.thumbnail || '';
  resultTitle.textContent = data.title || 'Untitled';
  resultAuthor.textContent = data.author || 'Unknown';
  resultDuration.textContent = data.duration ? formatDuration(data.duration) : '';

  // Show/hide quality buttons depending on platform
  formatButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove('downloading');
  });

  progressSection.classList.add('hidden');
  progressFill.style.width = '0%';
}

// === Download file ===
async function downloadFile(format, quality) {
  if (!currentMedia) return;

  formatButtons.forEach((b) => (b.disabled = true));
  progressSection.classList.remove('hidden');
  progressFill.style.width = '10%';
  progressText.textContent = 'Preparing your download...';

  try {
    const params = new URLSearchParams({
      url: currentMedia.url,
      format: format,
      quality: quality,
    });

    progressFill.style.width = '50%';
    progressText.textContent = 'Processing on server...';

    // Trigger download via browser navigation
    const downloadUrl = `${API_BASE}/api/download?${params.toString()}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    progressFill.style.width = '100%';
    progressText.textContent = 'Download started! Check your browser downloads.';

    setTimeout(() => {
      formatButtons.forEach((b) => (b.disabled = false));
    }, 2000);
  } catch (err) {
    progressText.textContent = 'Download failed. Please try again.';
    formatButtons.forEach((b) => (b.disabled = false));
  }
}

// === Reset ===
function resetView() {
  linkInput.value = '';
  currentMedia = null;
  showSection(null);
  downloadCard.classList.remove('hidden');
  linkInput.focus();
}

// === Event listeners ===
fetchBtn.addEventListener('click', fetchMediaInfo);

linkInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchMediaInfo();
});

formatButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const format = btn.dataset.format;
    const quality = btn.dataset.quality;
    downloadFile(format, quality);
  });
});

resetBtn.addEventListener('click', resetView);
errorResetBtn.addEventListener('click', resetView);
