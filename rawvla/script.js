const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const orbitBeam = document.querySelector('.scan-beam');
const orbitDatasetName = document.querySelector('#orbit-dataset-name');
const orbitStateNumber = document.querySelector('#orbit-state-number');
const orbitStateName = document.querySelector('#orbit-state-name');
const orbitStateLabels = [...document.querySelectorAll('[data-light-state]')];

if (orbitBeam && orbitDatasetName && orbitStateNumber && orbitStateName) {
  const orbitStateNames = ['Extreme Low', 'Low', 'Normal', 'Over', 'Extreme Over'];
  const orbitDatasets = [
    { label: 'PI-0 · LIBERO', values: ['40.70', '84.35', '90.30', '75.30', '58.25'] },
    { label: 'PI-0.5 · LIBERO', values: ['38.72', '89.20', '96.10', '81.50', '66.65'] },
    { label: 'PI-0 · ROBOTWIN 2.0', values: ['32.28', '59.06', '57.48', '58.73', '56.80'] },
    { label: 'PI-0.5 · ROBOTWIN 2.0', values: ['25.98', '63.78', '67.72', '65.08', '63.20'] }
  ];
  let activeOrbitKey = '';

  const setOrbitState = (stateIndex, datasetIndex) => {
    const activeKey = `${datasetIndex}-${stateIndex}`;
    if (activeKey === activeOrbitKey) return;
    activeOrbitKey = activeKey;
    const dataset = orbitDatasets[datasetIndex];
    orbitDatasetName.textContent = dataset.label;
    orbitStateNumber.textContent = dataset.values[stateIndex];
    orbitStateName.textContent = orbitStateNames[stateIndex];
    orbitStateLabels.forEach((label) => {
      label.classList.toggle('is-active', Number(label.dataset.lightState) === stateIndex);
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    orbitBeam.style.transform = 'rotate(12deg)';
    setOrbitState(2, 0);
  } else {
    const orbitStart = performance.now();
    const animateOrbit = (now) => {
      // A requestAnimationFrame timestamp can be a few milliseconds earlier
      // than a performance.now() value captured between frames. Clamp the
      // first delta so the dataset index never becomes -1 and stops the loop.
      const elapsed = Math.max(0, now - orbitStart);
      const cycleDuration = 18000;
      const cycleIndex = Math.floor(elapsed / cycleDuration);
      const cycleProgress = (elapsed % cycleDuration) / cycleDuration;
      const sweep = cycleProgress < 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2;
      const stateIndex = Math.round(sweep * (orbitStateNames.length - 1));
      orbitBeam.style.transform = `rotate(${156 - 288 * sweep}deg)`;
      setOrbitState(stateIndex, cycleIndex % orbitDatasets.length);
      requestAnimationFrame(animateOrbit);
    };
    requestAnimationFrame(animateOrbit);
  }
}

const radarData = {
  libero: {
    metric: '65.18%', note: 'RawVLA on LIBERO, averaged across PI-0, PI-0.5 and Qwen3-OFT.', scaleMax: 80, ticks: [20, 40, 60, 80],
    values: {
      'Default ISP': [3.80, 51.42, 95.42, 50.72, 14.07],
      DarkISP: [3.92, 32.03, 64.72, 26.67, 19.35],
      RAM: [0.88, 0.90, 42.72, 2.13, 0.85],
      RAWAdapter: [0.72, 0.70, 56.75, 26.98, 17.95],
      RAWild: [2.80, 47.42, 76.07, 48.03, 37.00],
      RawVLA: [31.16, 84.97, 94.45, 66.73, 48.58]
    }
  },
  robotwin: {
    metric: '54.98%', note: 'RawVLA on RoboTwin 2.0, averaged across PI-0 and PI-0.5.', scaleMax: 75, ticks: [15, 30, 45, 60, 75],
    values: {
      'Default ISP': [20.47, 46.06, 63.39, 52.38, 37.20],
      DarkISP: [3.15, 0.40, 35.04, 30.95, 39.60],
      RAM: [7.88, 6.30, 18.90, 11.91, 6.40],
      RAWAdapter: [0.79, 1.58, 49.21, 45.24, 17.60],
      RAWild: [7.09, 5.51, 34.65, 50.40, 50.80],
      RawVLA: [29.13, 61.42, 62.60, 61.91, 60.00]
    }
  }
};
const radarColors = { 'Default ISP': '#6e86a8', DarkISP: '#c18fa3', RAM: '#79a77d', RAWAdapter: '#9a82bd', RAWild: '#59abc3', RawVLA: '#1498c8' };
const radarMethodOrder = ['Default ISP', 'DarkISP', 'RAM', 'RAWAdapter', 'RAWild', 'RawVLA'];
const illuminationColors = ['#707ea8', '#91a8c4', '#b1cfbe', '#f4c297', '#fada7e'];
const illuminationLabels = ['Extreme Low', 'Low', 'Normal', 'Over', 'Extreme Over'];
const chart = document.querySelector('#radar-chart');
const tooltip = document.querySelector('#radar-tooltip');
const activeMethods = new Set(Object.keys(radarColors));
let activeBenchmark = 'libero';
const radarStartAngle = -Math.PI * 3 / 10;

const pointAt = (index, value, radius = 220, compressOverflow = true) => {
  const angle = radarStartAngle + index * Math.PI * 2 / 5;
  const scaleMax = radarData[activeBenchmark].scaleMax;
  const plottedValue = compressOverflow && value > scaleMax ? scaleMax + (value - scaleMax) * 0.35 : value;
  const distance = radius * plottedValue / scaleMax;
  return [320 + Math.cos(angle) * distance, 320 + Math.sin(angle) * distance];
};
const polygonPoints = (values) => values.map((value, i) => pointAt(i, value).join(',')).join(' ');
const svgElement = (tag, attrs = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};
function arcPath(index, radius = 254) {
  const gap = 0.06;
  const start = radarStartAngle + index * Math.PI * 2 / 5 - Math.PI / 5 + gap;
  const end = radarStartAngle + index * Math.PI * 2 / 5 + Math.PI / 5 - gap;
  const p1 = [320 + Math.cos(start) * radius, 320 + Math.sin(start) * radius];
  const p2 = [320 + Math.cos(end) * radius, 320 + Math.sin(end) * radius];
  return `M ${p1[0]} ${p1[1]} A ${radius} ${radius} 0 0 1 ${p2[0]} ${p2[1]}`;
}
function drawRadar() {
  chart.replaceChildren();
  const { scaleMax, ticks } = radarData[activeBenchmark];
  const definitions = svgElement('defs');
  const filter = svgElement('filter', { id: 'soft-shadow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  filter.append(svgElement('feDropShadow', { dx: '0', dy: '8', stdDeviation: '9', 'flood-color': '#135879', 'flood-opacity': '.16' }));
  definitions.append(filter); chart.append(definitions);
  illuminationLabels.forEach((_, index) => chart.append(svgElement('path', { d: arcPath(index), stroke: illuminationColors[index], class: 'radar-illumination' })));
  ticks.forEach((level) => {
    chart.append(svgElement('polygon', { points: polygonPoints([level, level, level, level, level]), class: 'radar-grid' }));
    const [scaleX, scaleY] = pointAt(0, level);
    const scale = svgElement('text', { x: scaleX + 7, y: scaleY + 4, class: 'radar-scale' }); scale.textContent = level; chart.append(scale);
  });
  illuminationLabels.forEach((label, index) => {
    const [x, y] = pointAt(index, scaleMax * 1.3, 220, false);
    const end = pointAt(index, scaleMax);
    chart.append(svgElement('line', { x1: 320, y1: 320, x2: end[0], y2: end[1], class: 'radar-axis' }));
    const text = svgElement('text', { x, y, class: 'radar-label', 'text-anchor': x < 300 ? 'end' : x > 340 ? 'start' : 'middle', 'dominant-baseline': 'middle' });
    text.textContent = label; chart.append(text);
  });
  radarMethodOrder.forEach((method) => {
    if (!activeMethods.has(method)) return;
    const values = radarData[activeBenchmark].values[method];
    const group = svgElement('g');
    group.append(svgElement('polygon', { points: polygonPoints(values), fill: radarColors[method], 'fill-opacity': method === 'RawVLA' ? '.24' : '.06', stroke: radarColors[method], class: method === 'RawVLA' ? 'radar-shape radar-shape-ours' : 'radar-shape', filter: method === 'RawVLA' ? 'url(#soft-shadow)' : '' }));
    values.forEach((value, index) => {
      const [x, y] = pointAt(index, value);
      const point = svgElement('circle', { cx: x, cy: y, r: method === 'RawVLA' ? 7.5 : 4.5, fill: radarColors[method], class: method === 'RawVLA' ? 'radar-point radar-point-ours' : 'radar-point', tabindex: '0' });
      const show = (event) => showTooltip(event, `${method} · ${illuminationLabels[index]} · ${value.toFixed(2)}%`);
      point.addEventListener('mouseenter', show); point.addEventListener('focus', show); point.addEventListener('mouseleave', hideTooltip); point.addEventListener('blur', hideTooltip); group.append(point);
    });
    chart.append(group);
  });
}
function showTooltip(event, text) {
  const stage = chart.closest('.radar-stage').getBoundingClientRect();
  const target = event.target.getBoundingClientRect();
  tooltip.textContent = text; tooltip.style.left = `${target.left - stage.left + target.width / 2}px`; tooltip.style.top = `${target.top - stage.top}px`; tooltip.classList.add('is-visible');
}
function hideTooltip() { tooltip.classList.remove('is-visible'); }
document.querySelectorAll('.benchmark-button').forEach((button) => button.addEventListener('click', () => {
  activeBenchmark = button.dataset.benchmark;
  document.querySelectorAll('.benchmark-button').forEach((item) => item.classList.toggle('is-active', item === button));
  document.querySelector('#metric-value').textContent = radarData[activeBenchmark].metric;
  document.querySelector('#metric-note').textContent = radarData[activeBenchmark].note;
  drawRadar();
}));
document.querySelectorAll('.method-toggle').forEach((button) => button.addEventListener('click', () => {
  const method = button.dataset.method;
  if (activeMethods.has(method) && activeMethods.size > 1) activeMethods.delete(method); else activeMethods.add(method);
  button.classList.toggle('is-active', activeMethods.has(method)); button.querySelector('b').textContent = activeMethods.has(method) ? 'on' : 'off'; drawRadar();
}));
document.querySelector('#copy-citation')?.addEventListener('click', async (event) => {
  await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent.trim());
  event.currentTarget.textContent = 'Copied'; window.setTimeout(() => { event.currentTarget.textContent = 'Copy BibTeX'; }, 1600);
});

const benchmarkGalleries = {
  libero: {
    low: { label: 'Low Light', speed: '2×', task: 'Task: Pick up the butter and place it in the basket', results: { defaultisp: false, ram: false, rawild: false, rawvla: true } },
    normal: { label: 'Normal Light', speed: '2×', task: 'Task: Put the wine bottle on the rack', results: { defaultisp: true, ram: false, rawild: true, rawvla: true } },
    over: { label: 'Overexposure', speed: '2×', task: 'Task: Pick up the ketchup and place it in the basket', results: { defaultisp: false, ram: false, rawild: false, rawvla: true } }
  },
  robotwin: {
    low: { label: 'Low Light', speed: '2×', task: 'Task: Lift the pot', results: { defaultisp: false, darkisp: false, raw_adapter: false, rawvla: true } },
    normal: { label: 'Normal Light', speed: '5×', task: 'Task: Put the bottles in the dustbin', results: { defaultisp: true, darkisp: false, raw_adapter: false, rawvla: true } },
    over: { label: 'Overexposure', speed: '2×', task: 'Task: Place both shoes in the box', results: { defaultisp: false, darkisp: true, raw_adapter: true, rawvla: true } }
  }
};

document.querySelectorAll('[data-benchmark-gallery]').forEach((gallery) => {
  const benchmark = gallery.dataset.benchmarkGallery;
  gallery.querySelectorAll('[data-condition]').forEach((button) => button.addEventListener('click', () => {
    const condition = button.dataset.condition;
    const state = benchmarkGalleries[benchmark][condition];
    gallery.querySelectorAll('[data-condition]').forEach((item) => item.classList.toggle('is-active', item === button));
    gallery.querySelector('[data-gallery-task]').textContent = state.task;
    gallery.querySelector('[data-gallery-speed]').innerHTML = `<strong>${state.speed}</strong> speed`;
    gallery.querySelectorAll('[data-method]').forEach((card) => {
      const method = card.dataset.method;
      const video = card.querySelector('video');
      video.pause();
      video.src = `assets/videos/benchmarks/${benchmark}/${condition}/${method}.mp4`;
      video.load();
      card.querySelector('.condition-chip').textContent = state.label;
      const badge = card.querySelector('.result-badge');
      const success = state.results[method];
      badge.className = `result-badge ${success ? 'success' : 'fail'}`;
      badge.textContent = success ? '✓ Success' : '× Fail';
    });
  }));
});

const formatVideoTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

const setupExperimentPlayer = (video) => {
  video.removeAttribute('controls');
  const frame = video.closest('.raw-video-frame');
  const controls = document.createElement('div');
  controls.className = 'video-controls';
  controls.innerHTML = `
    <button class="video-control-button video-play" type="button" aria-label="Play video">▶</button>
    <input class="video-progress" type="range" min="0" max="1000" value="0" aria-label="Video progress">
    <span class="video-time" aria-live="off">0:00</span>
    <button class="video-control-button video-fullscreen" type="button" aria-label="Enter fullscreen">Full</button>`;
  frame.insertAdjacentElement('afterend', controls);

  const playButton = controls.querySelector('.video-play');
  const progress = controls.querySelector('.video-progress');
  const time = controls.querySelector('.video-time');
  const fullscreenButton = controls.querySelector('.video-fullscreen');

  const syncPlayback = () => {
    const playing = !video.paused && !video.ended;
    playButton.textContent = playing ? 'Ⅱ' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
  };
  const syncProgress = () => {
    progress.value = video.duration ? Math.round(video.currentTime / video.duration * 1000) : 0;
    time.textContent = formatVideoTime(video.currentTime);
  };
  const togglePlayback = () => video.paused ? video.play() : video.pause();

  playButton.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  video.addEventListener('play', syncPlayback);
  video.addEventListener('pause', syncPlayback);
  video.addEventListener('ended', syncPlayback);
  video.addEventListener('timeupdate', syncProgress);
  video.addEventListener('loadedmetadata', syncProgress);
  video.addEventListener('emptied', syncProgress);
  progress.addEventListener('input', () => {
    if (video.duration) video.currentTime = Number(progress.value) / 1000 * video.duration;
  });
  fullscreenButton.addEventListener('click', () => {
    const fullscreenTarget = video.closest('.method-video-card') || frame;
    if (fullscreenTarget.requestFullscreen) fullscreenTarget.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });
};

document.querySelectorAll('.experiments video').forEach(setupExperimentPlayer);

const realWorldGallery = document.querySelector('[data-realworld-gallery]');
if (realWorldGallery) {
  realWorldGallery.querySelectorAll('[data-realworld-task]').forEach((button) => button.addEventListener('click', () => {
    const task = button.dataset.realworldTask;
    realWorldGallery.querySelectorAll('[data-realworld-task]').forEach((item) => item.classList.toggle('is-active', item === button));
    realWorldGallery.querySelectorAll('[data-realworld-method]').forEach((card) => {
      const method = card.dataset.realworldMethod;
      const video = card.querySelector('video');
      video.pause();
      video.src = `assets/videos/benchmarks/realworld/lowlight/${task}/${method}.mp4`;
      video.load();
    });
  }));
}

const figureLightbox = document.querySelector('#figure-lightbox');
if (figureLightbox) {
  const lightboxImage = figureLightbox.querySelector('img');
  const lightboxTitle = figureLightbox.querySelector('#figure-lightbox-title');
  const closeLightbox = () => figureLightbox.close();

  document.querySelectorAll('.benchmark-preview').forEach((preview) => preview.addEventListener('click', (event) => {
    event.preventDefault();
    const sourceImage = preview.querySelector('img');
    lightboxImage.src = preview.href;
    lightboxImage.alt = sourceImage.alt;
    lightboxTitle.textContent = preview.dataset.figureTitle || 'RawVLA-Bench';
    figureLightbox.showModal();
  }));
  figureLightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
  figureLightbox.addEventListener('click', (event) => {
    if (event.target === figureLightbox) closeLightbox();
  });
}
drawRadar();
