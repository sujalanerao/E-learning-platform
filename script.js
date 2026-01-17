// ===== COURSE DATA =====
const courseData = [
    {
        id: 1,
        title: "Introduction to Web Development",
        video: "dQw4w9WgXcQ",
        description: "Learn the fundamentals of web development, including HTML, CSS, and JavaScript basics. This comprehensive introduction covers the core technologies that power the modern web."
    },
    {
        id: 2,
        title: "HTML Essentials",
        video: "UB1O30fR-EE",
        description: "Master HTML5 tags, semantic elements, and best practices for structuring web pages. Understand document structure, accessibility, and modern HTML features."
    },
    {
        id: 3,
        title: "CSS Styling & Layout",
        video: "1Rs2ND1ryYc",
        description: "Dive into CSS styling, flexbox, grid, and responsive design techniques. Learn how to create beautiful, modern layouts that work on any device."
    },
    {
        id: 4,
        title: "JavaScript Fundamentals",
        video: "W6NZfCO5SIk",
        description: "Understand JavaScript variables, functions, loops, and DOM manipulation. Build interactive features and learn the programming concepts that bring websites to life."
    },
    {
        id: 5,
        title: "Building Your First Project",
        video: "G3e-cpL7ofc",
        description: "Apply everything you've learned to build a complete interactive website. This capstone project brings together HTML, CSS, and JavaScript in a real-world application."
    }
];

// ===== STATE MANAGEMENT =====
let state = {
    currentLesson: 0,
    completed: [],
    notes: {},
    streak: 7,
    xp: 2450,
    lastVisit: new Date().toISOString()
};

// ===== LOCAL STORAGE FUNCTIONS =====
function loadState() {
    try {
        const saved = localStorage.getItem('lumina_learning_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
            
            // Update streak based on last visit
            updateStreak();
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

function saveState() {
    try {
        state.lastVisit = new Date().toISOString();
        localStorage.setItem('lumina_learning_state', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function updateStreak() {
    const lastVisit = new Date(state.lastVisit);
    const now = new Date();
    const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        // Same day, keep streak
        return;
    } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        state.streak += 1;
    } else if (daysDiff > 1) {
        // Missed days, reset streak
        state.streak = 1;
    }
}

// ===== UTILITY FUNCTIONS =====
function calculateProgress() {
    return Math.round((state.completed.length / courseData.length) * 100);
}

function isLessonCompleted(lessonIndex) {
    return state.completed.includes(lessonIndex);
}

function getNextIncompleteLesson() {
    for (let i = 0; i < courseData.length; i++) {
        if (!isLessonCompleted(i)) {
            return i;
        }
    }
    return 0; // All complete, return first
}

// ===== SMOOTH SCROLL =====
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// ===== DEBOUNCE FUNCTION =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10001;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        style.textContent += `
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 400);
    }, 3000);
}

// ===== XP CALCULATION =====
function calculateXPForLesson(lessonIndex) {
    return 100; // Base XP per lesson
}

function addXP(amount) {
    state.xp += amount;
    saveState();
    
    // Show XP gain notification
    showNotification(`+${amount} XP earned! 🎉`, 'success');
}

function removeXP(amount) {
    state.xp = Math.max(0, state.xp - amount);
    saveState();
}

// ===== ACHIEVEMENT SYSTEM =====
function checkAchievements() {
    const percent = calculateProgress();
    
    if (percent === 100) {
        return 'course_complete';
    } else if (percent >= 75) {
        return 'three_quarters';
    } else if (percent >= 50) {
        return 'halfway';
    } else if (percent >= 25) {
        return 'quarter';
    } else if (state.completed.length === 1) {
        return 'first_lesson';
    }
    
    return null;
}

// ===== FORMAT TIME =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
}

// ===== EXPORT NOTES =====
function exportNotes() {
    let allNotes = "=== LUMINA LEARNING - MY NOTES ===\n\n";
    
    courseData.forEach((lesson, idx) => {
        if (state.notes[idx]) {
            allNotes += `\n--- ${lesson.title} ---\n`;
            allNotes += state.notes[idx];
            allNotes += "\n\n";
        }
    });
    
    const blob = new Blob([allNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumina-learning-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Notes exported successfully!', 'success');
}

// ===== RESET PROGRESS =====
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        state = {
            currentLesson: 0,
            completed: [],
            notes: {},
            streak: 1,
            xp: 0,
            lastVisit: new Date().toISOString()
        };
        saveState();
        location.reload();
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Only in classroom
    if (!window.location.pathname.includes('classroom')) return;
    
    // Space: Play/Pause video (if iframe supports it)
    if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        // Note: Can't control YouTube iframe due to cross-origin restrictions
    }
    
    // N: Switch to notes tab
    if (e.code === 'KeyN' && e.ctrlKey) {
        e.preventDefault();
        switchTab('notes');
    }
    
    // Arrow keys: Navigate lessons
    if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        const next = Math.min(state.currentLesson + 1, courseData.length - 1);
        loadLesson(next);
    }
    
    if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        const prev = Math.max(state.currentLesson - 1, 0);
        loadLesson(prev);
    }
});

// ===== PERFORMANCE MONITORING =====
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
}

// Initialize performance logging
window.addEventListener('load', () => {
    setTimeout(logPerformance, 0);
});

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    // Auto-navigate to next incomplete lesson if needed
    if (state.currentLesson >= courseData.length) {
        state.currentLesson = getNextIncompleteLesson();
        saveState();
    }
});

// ===== VISIBILITY CHANGE (Save on tab close) =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveState();
    }
});

// ===== BEFORE UNLOAD (Save before leaving) =====
window.addEventListener('beforeunload', () => {
    saveState();
});

// ===== CONSOLE EASTER EGG =====
console.log(`
%c🎓 Lumina Learning 

%cWelcome to the console! 

Current Progress: ${calculateProgress()}%
XP Points: ${state.xp}
Streak: ${state.streak} days

Keep learning! 🚀
`, 
'font-size: 24px; font-weight: bold; color: #7c3aed;',
'font-size: 14px; color: #a78bfa;'
);

// ===== EXPORT FOR GLOBAL USE =====
window.LuminaAPI = {
    getProgress: calculateProgress,
    exportNotes: exportNotes,
    resetProgress: resetProgress,
    getState: () => ({ ...state }),
    courseData: courseData
};