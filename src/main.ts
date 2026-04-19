import './styles/color-scheme.css';
import './styles/main.css';
import './styles/components/header.css';
import './styles/components/footer.css';
import './styles/components/ux-enhancements.css';

import { initializeLayout } from './components/Layout';

// Clean up analytics localStorage data
function cleanupAnalyticsData(): void {
    localStorage.removeItem('analyticsEvents');
    localStorage.removeItem('sessionId');
    console.log('🧹 Analytics data cleaned up');
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portfolio application initializing...');
    
    // Clean up old analytics data
    cleanupAnalyticsData();
    
    // Initialize layout (header, footer, AOS, theme)
    initializeLayout();
    
    console.log('🎉 Portfolio initialization complete!');
});

// Scroll Progress Indicator
function initScrollProgress(): void {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Smart Loading States for Images
function initLazyLoading(): void {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Professional Analytics Tracking (no alerts)
function initEnhancedAnalytics(): void {
    // Track button interactions with haptic feedback simulation
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('btn')) {
            // Add visual feedback
            target.classList.add('btn-feedback');
            setTimeout(() => {
                target.classList.remove('btn-feedback');
            }, 600);

            // Button feedback animation (no analytics tracking)
            // Visual feedback for user interactions
        }
    });

    // Track scroll depth (silently, no notifications)
    const scrollMilestones = [25, 50, 75, 90];
    const achievedMilestones = new Set();
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !achievedMilestones.has(milestone)) {
                achievedMilestones.add(milestone);
                // Scroll milestone reached (no analytics tracking)
                console.log(`📜 Scroll milestone: ${milestone}% on ${window.location.pathname}`);
            }
        });
    });
}

// Performance monitoring (silent, no notifications)
window.addEventListener('load', () => {
    if ('performance' in window) {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
            const loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
            console.log(`📊 Page load time: ${loadTime}ms`);

            // Only log performance metrics, no notifications
            if (loadTime > 3000) {
                console.warn('⚠️ Slow page load detected:', loadTime + 'ms');
            }
        }
    }
    
    // Initialize professional features
    initScrollProgress();
    initLazyLoading();
    initEnhancedAnalytics();
});