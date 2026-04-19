/**
 * InstagramGallery Component
 * Modern Instagram feed integration with lazy loading and smooth animations
 * Based on research into modern Instagram embed best practices
 */

class InstagramGallery {
    constructor() {
        this.instagramFeed = null;
        this.isLoading = false;
        this.posts = [];
        this.init();
    }

    init() {
        this.instagramFeed = document.getElementById('instagram-feed');
        if (!this.instagramFeed) return;

        // Only load profile embed, no recent posts
        this.loadInstagramEmbed();
    }

    loadInstagramEmbed() {
        // Instagram embed script should be loaded lazily
        this.loadInstagramScript(() => {
            this.setupInstagramEmbed();
        });
    }

    loadInstagramScript(callback) {
        // Check if Instagram script is already loaded
        if (window.instgrm) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = callback;
        script.onerror = () => {
            console.error('Failed to load Instagram embed script');
            this.showError('Failed to load Instagram content');
        };
        document.head.appendChild(script);
    }

    setupInstagramEmbed() {
        // Process Instagram embeds when script is loaded
        if (window.instgrm) {
            // Use Intersection Observer for lazy loading
            const instagramEmbed = document.querySelector('.instagram-media');
            
            if (instagramEmbed) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Process the embed when it comes into view
                            window.instgrm.Embeds.process();
                            observer.unobserve(instagramEmbed);
                        }
                    });
                }, {
                    rootMargin: '200px' // Start loading 200px before visible
                });

                observer.observe(instagramEmbed);
            }
        }
    }

    

    
}

// Add custom styles for Instagram integration
const instagramStyles = document.createElement('style');
instagramStyles.textContent = `
    .instagram-section h3 {
        color: var(--text-primary);
        margin-bottom: 1.5rem;
    }

    .instagram-embed-container {
        margin-top: 1rem;
    }

    /* Dark mode support */
    [data-theme="dark"] .instagram-embed-container {
        /* Profile embed handles dark mode automatically */
    }
`;

document.head.appendChild(instagramStyles);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InstagramGallery();
});

export { InstagramGallery };