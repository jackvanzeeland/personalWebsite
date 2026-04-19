/**
 * MediaAccordion Component
 * Modern accordion with smooth animations and accessibility
 * Replaces the old <details> tags with a more polished UX
 */

class MediaAccordion {
    constructor() {
        this.accordionItems = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAccordion());
        } else {
            this.setupAccordion();
        }
    }

    setupAccordion() {
        // Find all accordion items
        const accordions = document.querySelectorAll('.media-accordion');

        if (accordions.length === 0) {
            console.error('MediaAccordion: No .media-accordion elements found');
            return;
        }

        accordions.forEach((accordion, accordionIndex) => {
            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach((item, index) => {
                this.setupAccordionItem(item, index);
                this.accordionItems.push(item);
            });
        });
    }

    setupAccordionItem(item, index) {
        const header = item.querySelector('.accordion-header');
        const panel = item.querySelector('.accordion-panel');
        const chevron = header.querySelector('.accordion-chevron i');

        if (!header || !panel) {
            console.error(`MediaAccordion: Missing elements for item ${index}`, { header, panel, chevron });
            return;
        }

        // Set initial ARIA attributes
        const panelId = panel.id || `panel-${index}`;
        panel.id = panelId;
        header.setAttribute('aria-controls', panelId);
        header.setAttribute('aria-expanded', 'false');

        // Add click handler
        header.addEventListener('click', (e) => {
            this.toggleItem(item, panel, chevron, header);
        });

        // Add keyboard support
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleItem(item, panel, chevron, header);
            }
        });
    }

    toggleItem(item, panel, chevron, header) {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const allHeaders = document.querySelectorAll('.accordion-header');
        const allPanels = document.querySelectorAll('.accordion-panel');
        const allChevrons = document.querySelectorAll('.accordion-chevron i');

        if (isExpanded) {
            // Close current panel
            this.closePanel(panel, chevron, header);
        } else {
            // Close all other panels (one-at-a-time behavior)
            allHeaders.forEach((otherHeader, index) => {
                if (otherHeader !== header) {
                    const otherPanel = allPanels[index];
                    const otherChevron = allChevrons[index];
                    this.closePanel(otherPanel, otherChevron, otherHeader);
                }
            });

            // Open current panel
            this.openPanel(panel, chevron, header);
        }
    }

    openPanel(panel, chevron, header) {
        // Update ARIA
        header.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.hidden = false;

        // Calculate max height for smooth animation
        panel.style.maxHeight = 'none';
        const height = panel.scrollHeight;
        panel.style.maxHeight = '0px';

        // Animate open
        requestAnimationFrame(() => {
            panel.style.transition = 'max-height 0.3s ease-out';
            panel.style.maxHeight = height + 'px';

            // Rotate chevron (if exists)
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
                chevron.style.transition = 'transform 0.3s ease';
            }
        });

        // Clean up after animation
        setTimeout(() => {
            panel.style.maxHeight = 'none';
            panel.style.transition = '';
        }, 300);

        // Add active class for styling
        const item = panel.closest('.accordion-item');
        if (item) item.classList.add('active');
    }

    closePanel(panel, chevron, header) {
        // Update ARIA
        header.setAttribute('aria-expanded', 'false');

        // Animate close
        const height = panel.scrollHeight;
        panel.style.maxHeight = height + 'px';
        panel.style.transition = 'max-height 0.3s ease-in';

        requestAnimationFrame(() => {
            panel.style.maxHeight = '0px';

            // Rotate chevron back (if exists)
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        });

        // Clean up after animation
        setTimeout(() => {
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            panel.style.maxHeight = '';
            panel.style.transition = '';
        }, 300);

        // Remove active class
        const item = panel.closest('.accordion-item');
        if (item) item.classList.remove('active');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MediaAccordion();
    });
} else {
    new MediaAccordion();
}