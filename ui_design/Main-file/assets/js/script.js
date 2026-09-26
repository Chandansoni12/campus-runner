// Screen Navigation
let currentScreen = 0;
const screens = [
    'splash-screen',
    'onboarding-1',
    'onboarding-2',
    'onboarding-3'
];

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    // Show splash screen for 2 seconds, then move to first onboarding
    // Only run if splash-screen exists (on index.html)
    if (document.getElementById('splash-screen')) {
        setTimeout(() => {
            nextScreen();
        }, 2000);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Add swipe gesture support
    addSwipeSupport();
});

// Navigate to next screen
function nextScreen() {
    if (currentScreen < screens.length - 1) {
        const currentEl = document.getElementById(screens[currentScreen]);
        const nextEl = document.getElementById(screens[currentScreen + 1]);

        if (currentEl && nextEl) {
            currentEl.classList.remove('active');
            currentScreen++;
            nextEl.classList.add('active');
        }
    }
}

// Navigate to previous screen
function prevScreen() {
    if (currentScreen > 0) {
        const currentEl = document.getElementById(screens[currentScreen]);
        const prevEl = document.getElementById(screens[currentScreen - 1]);

        if (currentEl && prevEl) {
            currentEl.classList.remove('active');
            currentScreen--;
            prevEl.classList.add('active');
        }
    }
}

// Get Started button action
function getStarted() {
    // Store that user has completed onboarding
    localStorage.setItem('onboardingCompleted', 'true');

    // Navigate to sign in page
    window.location.href = 'signin.html';
}

// Add swipe gesture support for mobile
function addSwipeSupport() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        // Skip if splash screen or elements don't exist
        if (currentScreen === 0 || !document.getElementById(screens[currentScreen])) return;

        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentScreen < screens.length - 1) {
                // Swipe left - next screen
                nextScreen();
            } else if (diff < 0 && currentScreen > 1) {
                // Swipe right - previous screen (don't go back to splash)
                prevScreen();
            }
        }
    }
}

// Check if user has already completed onboarding
function checkOnboardingStatus() {
    const completed = localStorage.getItem('onboardingCompleted');
    if (completed === 'true') {
        // Skip to main app
        // window.location.href = 'home.html';
    }
}

// Call on load to check onboarding status
// Uncomment if you want to skip onboarding for returning users
// checkOnboardingStatus();
