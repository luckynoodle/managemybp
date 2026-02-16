// Blood Pressure Tracker - History Page
// Filtering, trend graph, and session history display

// Filter state
let currentFilter = '7';
let customStartDate = null;
let customEndDate = null;

// DOM Elements
const historyList = document.getElementById('history-list');
const sessionCount = document.getElementById('session-count');
const exportDataBtn = document.getElementById('export-data-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const graphSection = document.getElementById('graph-section');
const filterButtons = document.querySelectorAll('.filter-btn');
const customDateRange = document.getElementById('custom-date-range');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    BPStorage.cleanOldSessions();
    setupFilterDefaults();
    setupEventListeners();
    updateDisplay();
});

// Event Listeners
function setupEventListeners() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;

            if (currentFilter === 'custom') {
                customDateRange.classList.remove('hidden');
                if (customStartDate && customEndDate) {
                    updateDisplay();
                }
            } else {
                customDateRange.classList.add('hidden');
                updateDisplay();
            }
        });
    });

    startDateInput.addEventListener('change', (e) => {
        customStartDate = e.target.value;
        if (customStartDate && customEndDate) {
            updateDisplay();
        }
    });

    endDateInput.addEventListener('change', (e) => {
        customEndDate = e.target.value;
        if (customStartDate && customEndDate) {
            updateDisplay();
        }
    });

    exportDataBtn.addEventListener('click', handleExportData);
    clearAllBtn.addEventListener('click', handleClearAllData);

    // Redraw graph on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateDisplay(), 250);
    });
}

// Set default dates for custom range
function setupFilterDefaults() {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    endDateInput.value = today;
    endDateInput.max = today;
    startDateInput.value = thirtyDaysAgo;
    customStartDate = thirtyDaysAgo;
    customEndDate = today;
}

// Get sessions filtered by current date range
function getFilteredSessions() {
    const allSessions = BPStorage.getSessions();

    if (currentFilter === 'custom') {
        if (!customStartDate || !customEndDate) return allSessions;
        const startTime = new Date(customStartDate).setHours(0, 0, 0, 0);
        const endTime = new Date(customEndDate).setHours(23, 59, 59, 999);
        return allSessions.filter(session => {
            const t = new Date(session.date).getTime();
            return t >= startTime && t <= endTime;
        });
    }

    const days = parseInt(currentFilter);
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return allSessions.filter(session => session.id >= cutoff);
}

// Update both graph and history list
function updateDisplay() {
    const sessions = getFilteredSessions();
    renderHistory(sessions);
    renderGraph(sessions);
}

// ─── History Rendering ───────────────────────────────────────

function renderHistory(sessions) {
    sessionCount.textContent = sessions.length;

    if (sessions.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No readings in selected date range.</p>';
        return;
    }

    historyList.innerHTML = '';
    sessions.forEach(session => {
        historyList.appendChild(createHistoryItem(session));
    });
}

function createHistoryItem(session) {
    const div = document.createElement('div');
    div.className = 'history-item';

    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
    });

    const avg = session.average;
    const avgText = `${avg.systolic}/${avg.diastolic}${avg.pulse ? ` • ${avg.pulse} bpm` : ''}`;

    div.innerHTML = `
        <div class="history-header">
            <span class="history-date">${dateStr} at ${timeStr}</span>
        </div>
        <div class="history-average">${avgText}</div>
        <div class="history-meta">${session.readings.length} reading${session.readings.length > 1 ? 's' : ''}${session.notes ? ' • Has notes' : ''} • Click to expand</div>
        <div class="history-details hidden" id="details-${session.id}">
            ${session.notes ? `
                <div class="session-notes">
                    <strong>Notes:</strong>
                    ${session.notes}
                </div>
            ` : ''}
            <div class="history-details-grid">
                ${session.readings.map((reading, idx) => `
                    <div class="detail-reading">
                        <strong>#${idx + 1}</strong><br>
                        ${reading.systolic}/${reading.diastolic}${reading.pulse ? `<br>${reading.pulse} bpm` : ''}
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-danger delete-session" data-session-id="${session.id}">
                Delete Session
            </button>
        </div>
    `;

    div.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-session')) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this session?')) {
                BPStorage.deleteSession(session.id);
                updateDisplay();
            }
        } else if (!e.target.closest('.history-details')) {
            div.querySelector('.history-details').classList.toggle('hidden');
        }
    });

    return div;
}

// ─── Trend Graph (Canvas) ────────────────────────────────────

function renderGraph(sessions) {
    const canvas = document.getElementById('trend-canvas');
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Read CSS variable colors for dark mode support
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text-secondary').trim();
    const gridColor = style.getPropertyValue('--border-color').trim();
    const font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    if (sessions.length === 0) {
        graphSection.style.display = 'none';
        return;
    }

    graphSection.style.display = '';

    // Sort oldest first for plotting
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const points = sorted.map(s => ({
        date: new Date(s.date),
        sys: s.average.systolic,
        dia: s.average.diastolic,
        pulse: s.average.pulse || null
    }));

    // Graph area
    const pad = { top: 20, right: 15, bottom: 40, left: 40 };
    const gw = w - pad.left - pad.right;
    const gh = h - pad.top - pad.bottom;

    // BP classification thresholds
    const BP_LOW = 90;       // Below = hypotension
    const BP_NORMAL = 120;   // Below = normal
    const BP_ELEVATED = 140; // Below = elevated, above = high

    // Y-axis range (ensure key zones are visible)
    const allVals = points.flatMap(p => [p.sys, p.dia, p.pulse].filter(v => v !== null));
    const minY = Math.floor(Math.min(Math.min(...allVals), BP_LOW - 10) / 10) * 10 - 10;
    const maxY = Math.ceil(Math.max(Math.max(...allVals), BP_ELEVATED + 10) / 10) * 10 + 10;
    const yRange = maxY - minY;

    const toY = v => pad.top + gh - ((v - minY) / yRange) * gh;
    const toX = i => pad.left + (i / Math.max(points.length - 1, 1)) * gw;

    // Grid lines + Y labels
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.lineWidth = 1;

    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
        const val = minY + (yRange / gridCount) * i;
        const y = toY(val);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(val).toString(), pad.left - 6, y + 4);
    }

    // BP classification zones (subtle background bands)
    const zones = [
        { from: minY, to: BP_LOW, color: 'rgba(59, 130, 246, 0.07)' },   // Low - blue
        { from: BP_LOW, to: BP_NORMAL, color: 'rgba(16, 185, 129, 0.07)' }, // Normal - green
        { from: BP_NORMAL, to: BP_ELEVATED, color: 'rgba(245, 158, 11, 0.07)' }, // Elevated - amber
        { from: BP_ELEVATED, to: maxY, color: 'rgba(239, 68, 68, 0.07)' }  // High - red
    ];

    zones.forEach(zone => {
        const top = toY(Math.min(zone.to, maxY));
        const bottom = toY(Math.max(zone.from, minY));
        ctx.fillStyle = zone.color;
        ctx.fillRect(pad.left, top, gw, bottom - top);
    });

    // Dashed boundary lines between zones
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1;
    ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';

    const boundaries = [
        { val: BP_LOW, color: 'rgba(59, 130, 246, 0.4)', label: '90' },
        { val: BP_NORMAL, color: 'rgba(245, 158, 11, 0.4)', label: '120' },
        { val: BP_ELEVATED, color: 'rgba(239, 68, 68, 0.4)', label: '140' }
    ];

    boundaries.forEach(b => {
        if (b.val > minY && b.val < maxY) {
            const y = toY(b.val);
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();
            ctx.fillStyle = b.color.replace('0.4', '0.7');
            ctx.fillText(b.label, w - pad.right + 3, y + 3);
        }
    });
    ctx.restore();

    // Draw a data line
    function drawLine(key, color, lineW) {
        const pts = points.map((p, i) => ({ x: toX(i), y: toY(p[key]), v: p[key] }))
            .filter(p => p.v !== null);
        if (pts.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();

        // Dots
        ctx.fillStyle = color;
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawLine('sys', '#ef4444', 2.5);
    drawLine('dia', '#3b82f6', 2.5);
    drawLine('pulse', '#10b981', 2);

    // X-axis date labels
    ctx.fillStyle = textColor;
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';

    const maxLabels = 5;
    const labelIndices = points.length <= maxLabels
        ? points.map((_, i) => i)
        : Array.from({ length: maxLabels }, (_, i) =>
            Math.round(i * (points.length - 1) / (maxLabels - 1)));

    labelIndices.forEach(i => {
        ctx.fillText(
            points[i].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            toX(i),
            h - pad.bottom + 18
        );
    });
}

// ─── Export & Clear ──────────────────────────────────────────

function handleExportData() {
    const sessions = BPStorage.getSessions(); // Export ALL data
    if (sessions.length === 0) {
        alert('No data to export.');
        return;
    }

    let text = 'Blood Pressure Reading History\n';
    text += '================================\n\n';

    sessions.forEach((session, index) => {
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const timeStr = date.toLocaleTimeString(undefined, {
            hour: '2-digit', minute: '2-digit'
        });

        text += `Session ${sessions.length - index} - ${dateStr} at ${timeStr}\n`;
        text += '-'.repeat(50) + '\n';
        text += `Average: ${session.average.systolic}/${session.average.diastolic}`;
        if (session.average.pulse) text += ` • ${session.average.pulse} bpm`;
        text += '\n';
        text += `Number of readings: ${session.readings.length}\n\n`;

        text += 'Individual Readings:\n';
        session.readings.forEach((reading, idx) => {
            text += `  ${idx + 1}. ${reading.systolic}/${reading.diastolic}`;
            if (reading.pulse) text += ` • ${reading.pulse} bpm`;
            text += '\n';
        });

        if (session.notes) {
            text += `\nNotes: ${session.notes}\n`;
        }

        text += '\n\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bp-readings-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleClearAllData() {
    const sessions = BPStorage.getSessions();
    if (sessions.length === 0) {
        alert('No data to clear.');
        return;
    }

    if (confirm(`Are you sure you want to delete ALL ${sessions.length} session(s)? This action cannot be undone.`)) {
        BPStorage.clearAllSessions();
        updateDisplay();
        alert('All session data has been cleared.');
    }
}
