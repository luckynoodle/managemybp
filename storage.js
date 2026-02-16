// Shared Storage Module for Blood Pressure Tracker
// Used by both index.html (app.js) and history.html (history.js)

const BPStorage = (function () {
    const STORAGE_KEY = 'bp_sessions';
    const RETENTION_DAYS = 30;

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

    function cleanOldSessions() {
        const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const sessions = getSessions();
        const originalCount = sessions.length;
        const filtered = sessions.filter(session => session.id >= cutoffDate);

        if (filtered.length < originalCount) {
            saveSessions(filtered);
            console.log(`Cleaned ${originalCount - filtered.length} old session(s)`);
        }
    }

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

    function deleteSession(sessionId) {
        let sessions = getSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        saveSessions(sessions);
    }

    function clearAllSessions() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        STORAGE_KEY,
        RETENTION_DAYS,
        getSessions,
        saveSessions,
        cleanOldSessions,
        calculateAverage,
        deleteSession,
        clearAllSessions
    };
})();

// Help Modal (shared across pages)
document.addEventListener('DOMContentLoaded', () => {
    const helpBtn = document.getElementById('help-btn');
    const modal = document.getElementById('guide-modal');
    const closeBtn = document.getElementById('guide-close');

    if (!helpBtn || !modal) return;

    helpBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});
