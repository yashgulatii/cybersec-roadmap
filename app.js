var EDIT_PASSWORD = process.env.PASSWORD;
var isEditMode = false;

// ─── Phase metadata ───
var PHASES = ['p0', 'p1', 'p2', 'p2b', 'p3', 'p4', 'p5'];
var PHASE_META = [
  { id: 'p0', label: 'Prerequisites', short: 'Prereqs', color: '#888888' },
  { id: 'p1', label: 'Security+', short: 'Sec+', color: '#4e8ef7' },
  { id: 'p2', label: 'SOC Core', short: 'SOC', color: '#3ecf8e' },
  { id: 'p2b', label: 'SIEM & Tools', short: 'SIEM', color: '#2dd4bf' },
  { id: 'p3', label: 'Web Hacking', short: 'WebHack', color: '#a78bfa' },
  { id: 'p4', label: 'Bug Bounty', short: 'Bounty', color: '#f05252' },
  { id: 'p5', label: 'Advanced', short: 'Adv', color: '#f5a623' }
];

// ─── Data storage ───
var data = {};
PHASES.forEach(function (id) {
  data[id] = JSON.parse(localStorage.getItem('roadmap_' + id) || '{}');
});

// Restore edit session
if (sessionStorage.getItem('roadmap_edit') === '1') {
  isEditMode = true;
}

function saveData(phaseId) {
  localStorage.setItem('roadmap_' + phaseId, JSON.stringify(data[phaseId]));
}

// ─── Get global index for a topic item across all grids of its phase ───
function getGlobalIndex(el) {
  var grid = el.closest('[data-phase]');
  var phase = grid.dataset.phase;
  var allGrids = document.querySelectorAll('[data-phase="' + phase + '"]');
  var globalIdx = 0;
  for (var g = 0; g < allGrids.length; g++) {
    var items = allGrids[g].querySelectorAll('.topic-item');
    if (allGrids[g] === grid) {
      globalIdx += Array.from(items).indexOf(el);
      break;
    }
    globalIdx += items.length;
  }
  return { phase: phase, idx: globalIdx };
}

// ─── Toggle topic (fixed: uses global index) ───
function toggleTopic(el) {
  if (!isEditMode) {
    showAuthModal();
    return;
  }
  // Prevent link clicks from toggling
  if (window._linkClicked) { window._linkClicked = false; return; }

  var ref = getGlobalIndex(el);
  var key = ref.phase + '_' + ref.idx;
  if (!data[ref.phase]) data[ref.phase] = {};
  data[ref.phase][key] = !data[ref.phase][key];
  el.classList.toggle('done', !!data[ref.phase][key]);
  saveData(ref.phase);
  updateAllProgress();
}

// Prevent topic-link clicks from toggling the task
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('topic-link')) {
    window._linkClicked = true;
  }
});

// ─── Update all progress bars & percentages ───
var _phaseStats = {};

function updateAllProgress() {
  var totalAll = 0, doneAll = 0;
  PHASES.forEach(function (phaseId) {
    var grids = document.querySelectorAll('[data-phase="' + phaseId + '"]');
    var total = 0, done = 0;
    var globalIdx = 0;
    grids.forEach(function (grid) {
      grid.querySelectorAll('.topic-item').forEach(function (item) {
        var key = phaseId + '_' + globalIdx;
        total++;
        var isDone = !!(data[phaseId] && data[phaseId][key]);
        item.classList.toggle('done', isDone);
        if (isDone) done++;
        globalIdx++;
      });
    });
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    _phaseStats[phaseId] = { total: total, done: done, pct: pct };
    var bar = document.getElementById('bar-' + phaseId);
    var lbl = document.getElementById('lbl-' + phaseId);
    var nav = document.getElementById('nav-' + phaseId);
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '%';
    if (nav) nav.textContent = pct + '%';
    totalAll += total; doneAll += done;
  });
  var overallPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;
  var op = document.getElementById('overall-pct');
  if (op) op.textContent = overallPct + '%';
  window._totalAll = totalAll;
  window._doneAll = doneAll;
  window._overallPct = overallPct;
}

// ─── Sidebar active state ───
function setActive(el) {
  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  el.classList.add('active');
}

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
function showAuthModal() {
  document.getElementById('auth-modal').classList.add('visible');
  setTimeout(function () { document.getElementById('auth-password').focus(); }, 80);
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.remove('visible');
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-error').textContent = '';
}

function submitAuth() {
  var val = document.getElementById('auth-password').value;
  var errEl = document.getElementById('auth-error');
  var btn = document.querySelector('#auth-modal .btn-primary');

  if (!val) { errEl.textContent = 'Please enter a password.'; return; }

  btn.textContent = 'Checking...';
  btn.disabled = true;
  errEl.textContent = '';

  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: val })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.success) {
      isEditMode = true;
      sessionStorage.setItem('roadmap_edit', '1');
      hideAuthModal();
      applyEditMode();
    } else {
      errEl.textContent = 'Incorrect password. Try again.';
      document.getElementById('auth-password').value = '';
      document.getElementById('auth-password').focus();
    }
  })
  .catch(function() {
    errEl.textContent = 'Could not reach auth server. Try again.';
  })
  .finally(function() {
    btn.textContent = 'Unlock';
    btn.disabled = false;
  });
}

function lockEditMode() {
  isEditMode = false;
  sessionStorage.removeItem('roadmap_edit');
  applyEditMode();
}

function applyEditMode() {
  var btn = document.getElementById('edit-btn');
  var banner = document.getElementById('view-banner');
  if (isEditMode) {
    document.body.classList.remove('view-mode');
    btn.innerHTML = '🔓 <span>Lock</span>';
    btn.classList.add('unlocked');
    btn.onclick = lockEditMode;
    if (banner) banner.style.display = 'none';
  } else {
    document.body.classList.add('view-mode');
    btn.innerHTML = '🔒 <span>Edit</span>';
    btn.classList.remove('unlocked');
    btn.onclick = showAuthModal;
    if (banner) banner.style.display = 'flex';
  }
}

// ════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════
function showDashboard() {
  document.getElementById('dashboard-overlay').classList.add('visible');
  renderDashboard();
}

function hideDashboard() {
  document.getElementById('dashboard-overlay').classList.remove('visible');
}

// Draw a donut/ring chart on a canvas
function drawDonut(canvas, pct, color) {
  var dpr = window.devicePixelRatio || 1;
  var size = canvas.clientWidth || 90;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  var cx = size / 2, cy = size / 2, r = size / 2 - 9;
  ctx.clearRect(0, 0, size, size);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Arc
  if (pct > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct / 100));
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = '#e8e8f0';
  ctx.font = 'bold ' + Math.round(size * 0.18) + 'px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pct + '%', cx, cy);
}

// Draw a vertical bar chart on a canvas
function drawBarChart(canvas, phases) {
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.clientWidth || 400;
  var H = canvas.clientHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  var padL = 8, padR = 8, padT = 12, padB = 48;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;
  var n = phases.length;
  var slotW = chartW / n;
  var barW = Math.min(slotW * 0.55, 36);

  // Horizontal grid lines
  [0, 25, 50, 75, 100].forEach(function (pct) {
    var y = padT + chartH - (chartH * pct / 100);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  phases.forEach(function (p, i) {
    var x = padL + slotW * i + (slotW - barW) / 2;
    var barH = chartH * (p.pct / 100);
    var y = padT + chartH - barH;

    // Background bar
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, padT, barW, chartH, 4) : ctx.rect(x, padT, barW, chartH);
    ctx.fill();

    // Coloured bar
    if (barH > 0) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barW, barH, 4) : ctx.rect(x, y, barW, barH);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Short label
    ctx.fillStyle = '#55556a';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.short, x + barW / 2, H - padB + 14);

    // Pct label
    ctx.fillStyle = '#8888aa';
    ctx.fillText(p.pct + '%', x + barW / 2, H - padB + 26);
  });
}

// Render all dashboard widgets
function renderDashboard() {
  var totalAll = window._totalAll || 0;
  var doneAll = window._doneAll || 0;
  var overallPct = window._overallPct || 0;

  // Stats cards
  document.getElementById('dash-total').textContent = totalAll;
  document.getElementById('dash-done').textContent = doneAll;
  document.getElementById('dash-remaining').textContent = totalAll - doneAll;
  document.getElementById('dash-pct-val').textContent = overallPct + '%';

  // Overall bar
  var ob = document.getElementById('dash-overall-bar');
  if (ob) { ob.style.width = '0%'; requestAnimationFrame(function () { ob.style.width = overallPct + '%'; }); }
  var op = document.getElementById('dash-overall-pct');
  if (op) op.textContent = overallPct + '%';

  // Phase donuts
  PHASE_META.forEach(function (pm) {
    var st = _phaseStats[pm.id] || { pct: 0, done: 0, total: 0 };
    var canvas = document.getElementById('donut-' + pm.id);
    if (canvas) drawDonut(canvas, st.pct, pm.color);
    var sub = document.getElementById('donut-sub-' + pm.id);
    if (sub) sub.textContent = st.done + ' / ' + st.total + ' tasks';
  });

  // Bar chart
  var barCanvas = document.getElementById('dash-barchart');
  if (barCanvas) {
    var phaseArr = PHASE_META.map(function (pm) {
      return { pct: (_phaseStats[pm.id] || {}).pct || 0, color: pm.color, short: pm.short };
    });
    drawBarChart(barCanvas, phaseArr);
  }
}

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
updateAllProgress();
applyEditMode();

// Auth modal keyboard events
document.getElementById('auth-password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') submitAuth();
  if (e.key === 'Escape') hideAuthModal();
});
// Click outside to close auth modal
document.getElementById('auth-modal').addEventListener('click', function (e) {
  if (e.target === this) hideAuthModal();
});
// Click outside to close dashboard
document.getElementById('dashboard-overlay').addEventListener('click', function (e) {
  if (e.target === this) hideDashboard();
});
// Esc to close dashboard
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (document.getElementById('dashboard-overlay').classList.contains('visible')) hideDashboard();
    if (document.getElementById('auth-modal').classList.contains('visible')) hideAuthModal();
  }
});
