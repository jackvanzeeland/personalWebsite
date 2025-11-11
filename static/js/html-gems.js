/**
 * HTML GEMS - INTERACTIVE FEATURES
 * Professional educational resource for underused HTML features
 */

(function() {
  'use strict';

  // ====== CONFIGURATION ======
  const CONFIG = {
    searchDebounceMs: 300,
    scrollThrottleMs: 100,
    backToTopThreshold: 300,
    staggerAnimationDelay: 50,
    copyFeedbackDuration: 2000
  };

  // ====== STATE ======
  const state = {
    currentFilter: 'all',
    searchQuery: '',
    gems: [],
    isSearching: false
  };

  // ====== INITIALIZATION ======
  document.addEventListener('DOMContentLoaded', function() {
    initializeGems();
    initializeSearch();
    initializeFilters();
    initializeTOC();
    initializeBackToTop();
    initializeCopyButtons();
    initializeSyntaxHighlighting();
    initializeFadeInAnimation();
    initializeMobileTOC();
  });

  // ====== GEM DATA INITIALIZATION ======
  function initializeGems() {
    const gemCards = document.querySelectorAll('.html-gem-card');
    state.gems = Array.from(gemCards).map(card => {
      const category = card.dataset.category || 'uncategorized';
      const title = card.querySelector('.html-gem-title')?.textContent || '';
      const description = card.querySelector('.desc')?.textContent || '';

      return {
        element: card,
        category: category,
        title: title.toLowerCase(),
        description: description.toLowerCase(),
        id: card.id || ''
      };
    });
  }

  // ====== SEARCH FUNCTIONALITY ======
  function initializeSearch() {
    const searchInput = document.querySelector('.html-gems-search');
    const clearBtn = document.querySelector('.html-gems-clear-search');
    const searchWrapper = document.querySelector('.html-gems-search-wrapper');

    if (!searchInput) return;

    let debounceTimer;

    // Search input handler
    searchInput.addEventListener('input', function() {
      const value = this.value.trim();

      // Toggle clear button visibility
      if (value) {
        searchWrapper.classList.add('has-value');
      } else {
        searchWrapper.classList.remove('has-value');
      }

      // Debounce search
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(value);
      }, CONFIG.searchDebounceMs);
    });

    // Clear button handler
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchWrapper.classList.remove('has-value');
        performSearch('');
        searchInput.focus();
      });
    }

    // Clear search on Escape key
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchWrapper.classList.remove('has-value');
        performSearch('');
      }
    });
  }

  function performSearch(query) {
    state.searchQuery = query.toLowerCase();
    filterGems();
    updateResultsCount();
  }

  function updateResultsCount() {
    const resultsCount = document.querySelector('.html-gems-results-count');
    if (!resultsCount) return;

    const visibleGems = state.gems.filter(gem => !gem.element.classList.contains('hidden'));
    const totalGems = state.gems.length;

    if (state.searchQuery || state.currentFilter !== 'all') {
      resultsCount.textContent = `Showing ${visibleGems.length} of ${totalGems} features`;
      resultsCount.style.display = 'block';
    } else {
      resultsCount.style.display = 'none';
    }
  }

  // ====== CATEGORY FILTERS ======
  function initializeFilters() {
    const filterBtns = document.querySelectorAll('.html-gems-filter-btn');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const category = this.dataset.category;

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Update filter state
        state.currentFilter = category;
        filterGems();
        updateResultsCount();

        // Announce to screen readers
        announceToScreenReader(`Filtering by ${category === 'all' ? 'all categories' : category}`);
      });
    });
  }

  function filterGems() {
    state.gems.forEach(gem => {
      const matchesCategory = state.currentFilter === 'all' || gem.category === state.currentFilter;
      const matchesSearch = !state.searchQuery ||
        gem.title.includes(state.searchQuery) ||
        gem.description.includes(state.searchQuery);

      if (matchesCategory && matchesSearch) {
        gem.element.classList.remove('hidden');
      } else {
        gem.element.classList.add('hidden');
      }
    });

    // Update TOC visibility
    updateTOCVisibility();
  }

  // ====== TABLE OF CONTENTS ======
  function initializeTOC() {
    const tocLinks = document.querySelectorAll('.html-gems-toc-link');

    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          // Smooth scroll to target
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update active state
          updateActiveTOCLink(this);

          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, null, '#' + targetId);
          }
        }
      });
    });

    // Scroll tracking
    initializeScrollTracking();
  }

  function initializeScrollTracking() {
    let throttleTimer;
    const tocLinks = document.querySelectorAll('.html-gems-toc-link');
    const gemCards = document.querySelectorAll('.html-gem-card');

    window.addEventListener('scroll', function() {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        throttleTimer = null;

        // Find the current section in viewport
        let currentGem = null;
        const scrollPosition = window.scrollY + 100; // Offset for header

        gemCards.forEach(card => {
          if (!card.classList.contains('hidden')) {
            const cardTop = card.offsetTop;
            const cardBottom = cardTop + card.offsetHeight;

            if (scrollPosition >= cardTop && scrollPosition < cardBottom) {
              currentGem = card;
            }
          }
        });

        // Update active TOC link
        if (currentGem) {
          const activeLink = document.querySelector(`.html-gems-toc-link[href="#${currentGem.id}"]`);
          if (activeLink) {
            updateActiveTOCLink(activeLink);
          }
        }
      }, CONFIG.scrollThrottleMs);
    });
  }

  function updateActiveTOCLink(activeLink) {
    document.querySelectorAll('.html-gems-toc-link').forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  function updateTOCVisibility() {
    const tocLinks = document.querySelectorAll('.html-gems-toc-link');

    tocLinks.forEach(link => {
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);

      if (target && target.classList.contains('hidden')) {
        link.style.display = 'none';
      } else {
        link.style.display = 'block';
      }
    });

    // Hide empty categories
    const tocCategories = document.querySelectorAll('.html-gems-toc-category');
    tocCategories.forEach(category => {
      const visibleLinks = category.querySelectorAll('.html-gems-toc-link[style*="display: block"], .html-gems-toc-link:not([style*="display: none"])');

      if (visibleLinks.length === 0) {
        category.style.display = 'none';
      } else {
        category.style.display = 'block';
      }
    });
  }

  function initializeMobileTOC() {
    const tocToggle = document.querySelector('.html-gems-toc-toggle');
    const toc = document.querySelector('.html-gems-toc');

    if (!tocToggle || !toc) return;

    tocToggle.addEventListener('click', function() {
      const isOpen = toc.classList.contains('mobile-open');

      if (isOpen) {
        toc.classList.remove('mobile-open');
        tocToggle.classList.remove('active');
        tocToggle.setAttribute('aria-expanded', 'false');
      } else {
        toc.classList.add('mobile-open');
        tocToggle.classList.add('active');
        tocToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ====== BACK TO TOP BUTTON ======
  function initializeBackToTop() {
    const backToTopBtn = document.querySelector('.html-gems-back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > CONFIG.backToTopThreshold) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ====== COPY TO CLIPBOARD ======
  function initializeCopyButtons() {
    const copyButtons = document.querySelectorAll('.html-gem-copy-btn');

    copyButtons.forEach(btn => {
      btn.addEventListener('click', async function() {
        const codeBlock = this.closest('.html-gem-code-wrapper').querySelector('code');
        if (!codeBlock) return;

        const code = codeBlock.textContent;

        try {
          await navigator.clipboard.writeText(code);

          // Track achievement - user copied HTML code
          if (window.AchievementSystem) {
            window.AchievementSystem.trackAction('interactive_used');
          }

          showCopyFeedback(this, true);
          announceToScreenReader('Code copied to clipboard');
        } catch (err) {
          console.error('Failed to copy code:', err);
          showCopyFeedback(this, false);
          announceToScreenReader('Failed to copy code');
        }
      });
    });
  }

  function showCopyFeedback(button, success) {
    const originalHTML = button.innerHTML;

    if (success) {
      button.classList.add('copied');
      button.innerHTML = '<span class="copy-icon">✓</span> Copied!';
    } else {
      button.innerHTML = '<span class="copy-icon">✗</span> Failed';
    }

    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalHTML;
    }, CONFIG.copyFeedbackDuration);
  }

  // ====== SYNTAX HIGHLIGHTING ======
  function initializeSyntaxHighlighting() {
    // Check if Prism.js is loaded
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  // ====== FADE-IN ANIMATION ======
  function initializeFadeInAnimation() {
    const gemCards = document.querySelectorAll('.html-gem-card');

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return; // Skip animations
    }

    // Intersection Observer for fade-in on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('fade-in');
          }, index * CONFIG.staggerAnimationDelay);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    gemCards.forEach(card => {
      observer.observe(card);
    });
  }

  // ====== ACCESSIBILITY HELPERS ======
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // ====== KEYBOARD SHORTCUTS ======
  document.addEventListener('keydown', function(e) {
    // Focus search with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.html-gems-search');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Clear filters with Escape (when not in input)
    if (e.key === 'Escape' && document.activeElement.tagName !== 'INPUT') {
      const allFilterBtn = document.querySelector('.html-gems-filter-btn[data-category="all"]');
      if (allFilterBtn && !allFilterBtn.classList.contains('active')) {
        allFilterBtn.click();
      }
    }
  });

  // ====== QUICK REFERENCE CHIPS ======
  const quickChips = document.querySelectorAll('.html-gems-quick-chip');
  quickChips.forEach(chip => {
    chip.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ====== URL HASH HANDLING ======
  window.addEventListener('load', function() {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  });

  // ====== EXPOSE PUBLIC API (for debugging) ======
  window.HTMLGems = {
    state,
    performSearch,
    filterGems,
    updateResultsCount
  };

})();
