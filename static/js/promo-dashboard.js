/**
 * TikTok Promo Manager Dashboard
 * Handles lead preview loading, form submission, and interactions
 */

class PromoDashboard {
    constructor() {
        this.leadCardsGrid = document.getElementById('leadCardsGrid');
        this.contactForm = document.getElementById('contactForm');
        this.remainingLeadCount = document.getElementById('remainingLeadCount');

        this.init();
    }

    async init() {
        await this.loadPreviewLeads();
        this.setupContactForm();
        this.setupScrollAnimations();
    }

    /**
     * Load 3 preview leads from API
     */
    async loadPreviewLeads() {
        try {
            const response = await fetch('/api/promo/leads/preview');
            const data = await response.json();

            if (data.success) {
                this.renderLeadCards(data.leads);
                this.updateRemainingCount(data.total_qualified);
            } else {
                this.showError('Failed to load leads');
            }
        } catch (error) {
            console.error('Error loading leads:', error);
            this.showError('Error connecting to server');
        }
    }

    /**
     * Render lead cards in the grid
     */
    renderLeadCards(leads) {
        this.leadCardsGrid.innerHTML = leads.map(lead => `
            <div class="lead-card" data-account="${lead.account}">
                <div class="lead-header">
                    <a href="${lead.url}" target="_blank" class="lead-account">
                        @${lead.account}
                    </a>
                </div>

                <div class="lead-stats">
                    <div class="stat-item">
                        <span class="stat-icon">👥</span>
                        <span class="stat-value">${this.formatNumber(lead.followers)}</span>
                        <span class="stat-label">Followers</span>
                    </div>

                    <div class="stat-item">
                        <span class="stat-icon">❤️</span>
                        <span class="stat-value">${this.formatNumber(lead.likes)}</span>
                        <span class="stat-label">Likes</span>
                    </div>
                </div>

                <!-- Bio snippet showing proof -->
                <div class="bio-snippet">
                    <div class="bio-icon">📧</div>
                    <div class="bio-text">"${this.escapeHtml(lead.bio_snippet)}"</div>
                </div>

                <!-- Keyword score -->
                <div class="keyword-score">
                    <span class="score-label">Keyword Score:</span>
                    <span class="score-value">${lead.keyword_score}/4</span>
                    ${lead.has_promo ? '<span class="keyword-badge">Promo</span>' : ''}
                    ${lead.has_contact ? '<span class="keyword-badge">Contact</span>' : ''}
                    ${lead.has_music ? '<span class="keyword-badge">Music</span>' : ''}
                    ${lead.has_dm ? '<span class="keyword-badge">DM</span>' : ''}
                </div>

                <a href="${lead.url}" target="_blank" class="btn btn-sm btn-outline-primary" style="margin-top: 1rem;">
                    View Profile →
                </a>
            </div>
        `).join('');
    }

    /**
     * Update remaining lead count in locked section
     */
    updateRemainingCount(totalQualified) {
        const remaining = totalQualified - 3;
        if (this.remainingLeadCount) {
            this.remainingLeadCount.textContent = remaining;
        }
    }

    /**
     * Format follower/like numbers (1M, 2.3M, etc.)
     */
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.leadCardsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #ff4444;">
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Setup contact form submission
     */
    setupContactForm() {
        if (!this.contactForm) return;

        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const button = this.contactForm.querySelector('button[type="submit"]');
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');

            // Show loading state
            button.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';

            try {
                const formData = new FormData(this.contactForm);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    music_link: formData.get('music_link'),
                    message: formData.get('message')
                };

                const response = await fetch('/api/promo/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    this.contactForm.reset();
                } else {
                    alert(result.error || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Error sending message. Please try again.');
            } finally {
                // Reset button state
                button.disabled = false;
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        });
    }

    /**
     * Setup scroll animations with Intersection Observer
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.feature-card, .process-step, .metric-card').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PromoDashboard();
});
