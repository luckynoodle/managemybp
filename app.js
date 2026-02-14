// Blood Pressure Tracker - Main Page (New Reading)
// Shared data functions are in storage.js (BPStorage)

const MAX_READINGS_PER_SESSION = 10;

// Current session state
let currentReadings = [];

// DOM Elements
const readingForm = document.getElementById('reading-form');
const systolicInput = document.getElementById('systolic');
const diastolicInput = document.getElementById('diastolic');
const pulseInput = document.getElementById('pulse');
const currentReadingsSection = document.getElementById('current-readings-section');
const currentReadingsList = document.getElementById('current-readings-list');
const readingCountSpan = document.getElementById('reading-count');
const sessionNotesTextarea = document.getElementById('session-notes');
const notesCharCount = document.getElementById('notes-char-count');
const saveSessionBtn = document.getElementById('save-session-btn');
const clearSessionBtn = document.getElementById('clear-session-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    BPStorage.cleanOldSessions();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    readingForm.addEventListener('submit', handleAddReading);
    saveSessionBtn.addEventListener('click', handleSaveSession);
    clearSessionBtn.addEventListener('click', handleClearSession);
    sessionNotesTextarea.addEventListener('input', () => {
        updateCharCount();
        autoResizeTextarea();
    });
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

    if (!validateReading(systolic, diastolic, pulse)) {
        return;
    }

    const reading = { systolic, diastolic };
    if (pulse !== null) {
        reading.pulse = pulse;
    }

    currentReadings.push(reading);

    renderCurrentReadings();
    readingForm.reset();
    systolicInput.focus();
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

    const average = BPStorage.calculateAverage(currentReadings);
    const notes = sessionNotesTextarea.value.trim();

    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        readings: [...currentReadings],
        average: average
    };

    if (notes) {
        session.notes = notes;
    }

    const sessions = BPStorage.getSessions();
    sessions.unshift(session);
    BPStorage.saveSessions(sessions);

    // Reset current session
    currentReadings = [];
    currentReadingsSection.classList.add('hidden');
    readingForm.reset();
    sessionNotesTextarea.value = '';
    updateCharCount();
    autoResizeTextarea();

    const avgText = `${average.systolic}/${average.diastolic}${average.pulse ? ` • ${average.pulse} bpm` : ''}`;
    if (confirm(`Session saved! Average: ${avgText}\n\nView in history?`)) {
        window.location.href = 'history.html';
    }
}

// Handle clearing current session
function handleClearSession() {
    if (confirm('Are you sure you want to clear all readings in this session?')) {
        currentReadings = [];
        currentReadingsSection.classList.add('hidden');
        readingForm.reset();
        sessionNotesTextarea.value = '';
        updateCharCount();
        autoResizeTextarea();
    }
}

// Update character count for notes
function updateCharCount() {
    const count = sessionNotesTextarea.value.length;
    notesCharCount.textContent = count;
}

// Auto-resize textarea to fit content
function autoResizeTextarea() {
    sessionNotesTextarea.style.height = 'auto';
    sessionNotesTextarea.style.height = sessionNotesTextarea.scrollHeight + 'px';
}
