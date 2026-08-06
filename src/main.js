import defaultData from './default_data.json';
import { parseExcelWorkbook } from './parser.js';
import {
  renderSlideClinker,
  renderSlideCement,
  renderSlideShipment,
  renderSlideSafety
} from './slides.js';

// Application State
let appData = defaultData;
let currentDay = '30';
let currentSlideIndex = 0;
let isPlaying = true;
let slideIntervalMs = 8000; // 8 seconds per slide
let timerProgressInterval = null;
let timerStart = Date.now();

// Multi-screen BroadcastChannel
const broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('akkermann_dashboard_sync') : null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initURLParams();
  populateDaySelect();
  renderCurrentSlide();
  setupEventListeners();
  startAutoPlayTimer();
});

// Check URL parameters for multi-screen popouts (e.g. ?slide=1&day=30)
function initURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('slide')) {
    const s = parseInt(params.get('slide'), 10);
    if (!isNaN(s) && s >= 0 && s <= 3) {
      currentSlideIndex = s;
      isPlaying = false; // pause auto-play on fixed screen mode
      document.getElementById('screenModeBanner').style.display = 'flex';
    }
  }
  if (params.has('day')) {
    currentDay = params.get('day');
  }
}

// Populate Day selector dropdown
function populateDaySelect() {
  const select = document.getElementById('daySelect');
  if (!select) return;

  const days = Object.keys(appData).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  select.innerHTML = days.map(d => `<option value="${d}" ${d === currentDay ? 'selected' : ''}>День ${d}</option>`).join('');
  
  if (!days.includes(currentDay) && days.length > 0) {
    currentDay = days[days.length - 1];
    select.value = currentDay;
  }

  // Update date header
  const dateBadge = document.getElementById('currentDateBadge');
  if (dateBadge) {
    dateBadge.textContent = `${currentDay} Июля 2026 г.`;
  }
}

// Render Active Slide
function renderCurrentSlide() {
  const dayData = appData[currentDay] || Object.values(appData)[0];
  if (!dayData) return;

  // Activate slide section
  document.querySelectorAll('.slide-container').forEach((el, idx) => {
    if (idx === currentSlideIndex) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Activate pill button
  document.querySelectorAll('#slidePills .pill').forEach((pill, idx) => {
    if (idx === currentSlideIndex) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Render specific slide contents
  switch (currentSlideIndex) {
    case 0:
      renderSlideClinker(dayData);
      break;
    case 1:
      renderSlideCement(dayData);
      break;
    case 2:
      renderSlideShipment(dayData);
      break;
    case 3:
      renderSlideSafety(dayData);
      break;
  }
}

// Auto-Play Timer Loop
function startAutoPlayTimer() {
  stopAutoPlayTimer();
  if (!isPlaying) {
    document.getElementById('timerProgress').style.width = '0%';
    return;
  }

  timerStart = Date.now();
  timerProgressInterval = setInterval(() => {
    const elapsed = Date.now() - timerStart;
    const pct = Math.min(100, (elapsed / slideIntervalMs) * 100);
    document.getElementById('timerProgress').style.width = `${pct}%`;

    if (elapsed >= slideIntervalMs) {
      nextSlide();
      timerStart = Date.now();
    }
  }, 100);
}

function stopAutoPlayTimer() {
  if (timerProgressInterval) {
    clearInterval(timerProgressInterval);
    timerProgressInterval = null;
  }
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % 4;
  renderCurrentSlide();
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + 4) % 4;
  renderCurrentSlide();
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  const playText = document.getElementById('playStateText');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');

  if (isPlaying) {
    playText.textContent = 'Автопоказ';
    iconPlay.style.display = 'inline';
    iconPause.style.display = 'none';
    startAutoPlayTimer();
  } else {
    playText.textContent = 'Пауза';
    iconPlay.style.display = 'none';
    iconPause.style.display = 'inline';
    stopAutoPlayTimer();
    document.getElementById('timerProgress').style.width = '0%';
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Day Selector Change
  document.getElementById('daySelect')?.addEventListener('change', (e) => {
    currentDay = e.target.value;
    const dateBadge = document.getElementById('currentDateBadge');
    if (dateBadge) dateBadge.textContent = `${currentDay} Июля 2026 г.`;
    renderCurrentSlide();
    broadcastSync();
  });

  // Slide Pills
  document.querySelectorAll('#slidePills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      currentSlideIndex = parseInt(pill.getAttribute('data-slide'), 10);
      renderCurrentSlide();
      timerStart = Date.now(); // reset timer on manual slide click
    });
  });

  // Slide Nav Buttons
  document.getElementById('btnPrevSlide')?.addEventListener('click', () => {
    prevSlide();
    timerStart = Date.now();
  });

  document.getElementById('btnNextSlide')?.addEventListener('click', () => {
    nextSlide();
    timerStart = Date.now();
  });

  // Play / Pause Button
  document.getElementById('btnPlayPause')?.addEventListener('click', togglePlayPause);

  // Fullscreen Button
  document.getElementById('btnFullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  });

  // Multi-Screen Popout Button
  document.getElementById('btnMultiScreen')?.addEventListener('click', () => {
    const url = `${window.location.origin}${window.location.pathname}?slide=${currentSlideIndex}&day=${currentDay}`;
    window.open(url, '_blank', 'width=1400,height=900');
  });

  // Exit Screen Mode Banner
  document.getElementById('btnExitScreenMode')?.addEventListener('click', () => {
    window.close();
  });

  // Modal Open / Close
  const modal = document.getElementById('uploadModal');
  document.getElementById('btnUploadModal')?.addEventListener('click', () => modal?.classList.add('active'));
  document.getElementById('btnCloseModal')?.addEventListener('click', () => modal?.classList.remove('active'));
  document.getElementById('btnCancelModal')?.addEventListener('click', () => modal?.classList.remove('active'));

  // Load Demo Data
  document.getElementById('btnDemoData')?.addEventListener('click', () => {
    appData = defaultData;
    populateDaySelect();
    renderCurrentSlide();
    modal?.classList.remove('active');
    broadcastSync();
  });

  // Drag and Drop File Upload
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone?.addEventListener('click', () => fileInput?.click());

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // Listen for multi-screen BroadcastChannel messages
  if (broadcast) {
    broadcast.onmessage = (event) => {
      if (event.data && event.data.type === 'DATA_UPDATE') {
        appData = event.data.appData;
        currentDay = event.data.currentDay;
        populateDaySelect();
        renderCurrentSlide();
      }
    };
  }
}

// Parse and Handle Uploaded File
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const buffer = e.target.result;
      const parsed = parseExcelWorkbook(buffer);
      if (Object.keys(parsed).length > 0) {
        appData = parsed;
        const days = Object.keys(appData).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        currentDay = days[days.length - 1]; // select last day sheet
        populateDaySelect();
        renderCurrentSlide();
        document.getElementById('uploadModal')?.classList.remove('active');
        broadcastSync();
      } else {
        alert('Не удалось извлечь данные из файла Excel. Убедитесь, что листы названы по дням (01..30).');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Ошибка при чтении Excel файла: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// Broadcast sync across browser windows / screens
function broadcastSync() {
  if (broadcast) {
    broadcast.postMessage({
      type: 'DATA_UPDATE',
      appData,
      currentDay
    });
  }
}
