// Blood Pressure Tracker App
// Data is stored in localStorage with automatic 14-day cleanup

const STORAGE_KEY = 'bp_sessions';
const MAX_READINGS_PER_SESSION = 10;
const RETENTION_DAYS = 14;

// Current session state
let currentReadings = [];

// DOM Elements
const readingForm = document.getElementById('reading-form');
const systolicInput = document.getElementById('systolic');
const diastolicInput = document.getElementById('diastolic');
const pulseInput = document.getElementById('pulse');
const addReadingBtn = document.getElementById('add-reading-btn');
const currentReadingsSection = document.getElementById('current-readings-section');
const currentReadingsList = document.getElementById('current-readings-list');
const readingCountSpan = document.getElementById('reading-count');
const saveSessionBtn = document.getElementById('save-session-btn');
const clearSessionBtn = document.getElementById('clear-session-btn');
const historyList = document.getElementById('history-list');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    cleanOldSessions();
    renderHistory();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    readingForm.addEventListener('submit', handleAddReading);
    saveSessionBtn.addEventListener('click', handleSaveSession);
    clearSessionBtn.addEventListener('click', handleClearSession);
}

// Handle adding a reading to current session
function handleAddReading(e) {
    e.preventDefault();

    if (currentReadings.length >= MAX_READINGS_PER_SESSION) {
        alert(`Maximum ${MAX_READINGS_PER_SESSION} readings per session reached.`);
        return;
    }

    const systolic = parseInt(systolicInput.value);
    const diastolic = parseInt(diastolicInput.value);
    const pulse = pulseInput.value ? parseInt(pulseInput.value) : null;

    // Validation
    if (!validateReading(systolic, diastolic, pulse)) {
        return;
    }

    // Add reading to current session
    const reading = { systolic, diastolic };
    if (pulse !== null) {
        reading.pulse = pulse;
    }

    currentReadings.push(reading);

    // Update UI
    renderCurrentReadings();
    readingForm.reset();
    systolicInput.focus();

    // Show current readings section
    currentReadingsSection.classList.remove('hidden');
}

// Validate reading values
function validateReading(systolic, diastolic, pulse) {
    if (systolic < 70 || systolic > 200) {
        alert('Systolic value must be between 70 and 200 mmHg');
        return false;
    }
    if (diastolic < 40 || diastolic > 130) {
        alert('Diastolic value must be between 40 and 130 mmHg');
        return false;
    }
    if (pulse !== null && (pulse < 40 || pulse > 200)) {
        alert('Pulse value must be between 40 and 200 bpm');
        return false;
    }
    if (systolic <= diastolic) {
        alert('Systolic value must be greater than diastolic value');
        return false;
    }
    return true;
}

// Render current session readings
function renderCurrentReadings() {
    currentReadingsList.innerHTML = '';
    readingCountSpan.textContent = currentReadings.length;

    currentReadings.forEach((reading, index) => {
        const readingDiv = document.createElement('div');
        readingDiv.className = 'reading-item';

        const valuesSpan = document.createElement('span');
        valuesSpan.className = 'reading-values';
        valuesSpan.textContent = `${reading.systolic}/${reading.diastolic}${reading.pulse ? ` • ${reading.pulse} bpm` : ''}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-reading';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', 'Remove reading');
        removeBtn.addEventListener('click', () => removeReading(index));

        readingDiv.appendChild(valuesSpan);
        readingDiv.appendChild(removeBtn);
        currentReadingsList.appendChild(readingDiv);
    });
}

// Remove a reading from current session
function removeReading(index) {
    currentReadings.splice(index, 1);
    renderCurrentReadings();

    if (currentReadings.length === 0) {
        currentReadingsSection.classList.add('hidden');
    }
}

// Handle saving the session
function handleSaveSession() {
    if (currentReadings.length === 0) {
        alert('Please add at least one reading before saving.');
        return;
    }

    // Calculate averages
    const average = calculateAverage(currentReadings);

    // Create session object
    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        readings: [...currentReadings],
        average: average
    };

    // Save to localStorage
    const sessions = getSessions();
    sessions.unshift(session); // Add to beginning (newest first)
    saveSessions(sessions);

    // Reset current session
    currentReadings = [];
    currentReadingsSection.classList.add('hidden');
    readingForm.reset();

    // Update history display
    renderHistory();

    // Show confirmation
    alert(`Session saved! Average: ${average.systolic}/${average.diastolic}${average.pulse ? ` • ${average.pulse} bpm` : ''}`);
}

// Calculate average of readings
function calculateAverage(readings) {
    const sum = readings.reduce((acc, reading) => {
        acc.systolic += reading.systolic;
        acc.diastolic += reading.diastolic;
        if (reading.pulse !== undefined) {
            acc.pulse += reading.pulse;
            acc.pulseCount++;
        }
        return acc;
    }, { systolic: 0, diastolic: 0, pulse: 0, pulseCount: 0 });

    const count = readings.length;
    const average = {
        systolic: Math.round(sum.systolic / count),
        diastolic: Math.round(sum.diastolic / count)
    };

    if (sum.pulseCount > 0) {
        average.pulse = Math.round(sum.pulse / sum.pulseCount);
    }

    return average;
}

// Handle clearing current session
function handleClearSession() {
    if (confirm('Are you sure you want to clear all readings in this session?')) {
        currentReadings = [];
        currentReadingsSection.classList.add('hidden');
        readingForm.reset();
    }
}

// Render history
function renderHistory() {
    const sessions = getSessions();

    if (sessions.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No readings yet. Start by adding your first reading above.</p>';
        return;
    }

    historyList.innerHTML = '';

    sessions.forEach(session => {
        const historyItem = createHistoryItem(session);
        historyList.appendChild(historyItem);
    });
}

// Create a history item element
function createHistoryItem(session) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.dataset.sessionId = session.id;

    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    const avg = session.average;
    const avgText = `${avg.systolic}/${avg.diastolic}${avg.pulse ? ` • ${avg.pulse} bpm` : ''}`;

    div.innerHTML = `
        <div class="history-header">
            <span class="history-date">${dateStr} at ${timeStr}</span>
        </div>
        <div class="history-average">${avgText}</div>
        <div class="history-meta">${session.readings.length} reading${session.readings.length > 1 ? 's' : ''} • Click to expand</div>
        <div class="history-details hidden" id="details-${session.id}">
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

    // Toggle details on click
    div.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-session')) {
            e.stopPropagation();
            handleDeleteSession(session.id);
        } else if (!e.target.closest('.history-details')) {
            const details = div.querySelector('.history-details');
            details.classList.toggle('hidden');
        }
    });

    return div;
}

// Handle deleting a session
function handleDeleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
        let sessions = getSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        saveSessions(sessions);
        renderHistory();
    }
}

// LocalStorage functions
function getSessions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function saveSessions(sessions) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Failed to save data. Storage might be full.');
    }
}

// Clean sessions older than RETENTION_DAYS
function cleanOldSessions() {
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    let sessions = getSessions();
    const originalCount = sessions.length;

    sessions = sessions.filter(session => session.id >= cutoffDate);

    if (sessions.length < originalCount) {
        saveSessions(sessions);
        console.log(`Cleaned ${originalCount - sessions.length} old session(s)`);
    }
}
