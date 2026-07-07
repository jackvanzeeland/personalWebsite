/**
 * HTML Gems logic — ported from the retired standalone page. Category
 * filters + text search, Ctrl/Cmd+K search focus, copy-to-clipboard,
 * mobile TOC toggle, back-to-top, and TOC active-state highlighting via
 * IntersectionObserver. Everything tears down through the AbortSignal;
 * the observer and pending copy-revert timers are cleaned on abort.
 */

export function initHtmlGems(root: HTMLElement, signal: AbortSignal): void {
    const cards = root.querySelectorAll<HTMLElement>('.html-gem-card');
    const filterBtns = root.querySelectorAll<HTMLButtonElement>('.html-gems-filter-btn');
    const searchInput = root.querySelector<HTMLInputElement>('.html-gems-search');
    const clearBtn = root.querySelector<HTMLButtonElement>('.html-gems-clear-search');
    const resultsCount = root.querySelector<HTMLElement>('.html-gems-results-count');
    const tocToggle = root.querySelector<HTMLButtonElement>('.html-gems-toc-toggle');
    const tocSidebar = root.querySelector<HTMLElement>('#html-gems-toc');
    const tocLinks = root.querySelectorAll<HTMLAnchorElement>('.html-gems-toc-link');
    const backToTop = root.querySelector<HTMLButtonElement>('.html-gems-back-to-top');

    if (!searchInput || !clearBtn || !resultsCount || !tocToggle || !tocSidebar || !backToTop) return;

    let activeCategory = 'all';
    let searchTerm = '';

    function applyFilters(): void {
        let visibleCount = 0;
        cards.forEach((card) => {
            const cat = card.getAttribute('data-category');
            const text = (card.textContent ?? '').toLowerCase();
            const matchesCategory = activeCategory === 'all' || cat === activeCategory;
            const matchesSearch = !searchTerm || text.includes(searchTerm);
            card.classList.toggle('hidden', !(matchesCategory && matchesSearch));
            if (matchesCategory && matchesSearch) visibleCount++;
        });

        if (searchTerm || activeCategory !== 'all') {
            resultsCount!.textContent = `${visibleCount} of ${cards.length} features shown`;
            resultsCount!.style.display = '';
        } else {
            resultsCount!.style.display = 'none';
        }
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener(
            'click',
            () => {
                filterBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category') ?? 'all';
                applyFilters();
            },
            { signal }
        );
    });

    searchInput.addEventListener(
        'input',
        () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            clearBtn.classList.toggle('visible', searchTerm.length > 0);
            applyFilters();
        },
        { signal }
    );

    clearBtn.addEventListener(
        'click',
        () => {
            searchInput.value = '';
            searchTerm = '';
            clearBtn.classList.remove('visible');
            applyFilters();
            searchInput.focus();
        },
        { signal }
    );

    document.addEventListener(
        'keydown',
        (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        },
        { signal }
    );

    /* Copy-to-clipboard with 1.5 s revert */
    const copyTimers = new Set<ReturnType<typeof setTimeout>>();
    signal.addEventListener('abort', () => copyTimers.forEach(clearTimeout));

    root.querySelectorAll<HTMLButtonElement>('.html-gem-copy-btn').forEach((btn) => {
        btn.addEventListener(
            'click',
            () => {
                const code = btn.closest('.html-gem-code-wrapper')?.querySelector('pre code');
                if (!code) return;
                navigator.clipboard.writeText(code.textContent ?? '').then(() => {
                    const original = btn.textContent;
                    btn.textContent = '✅ Copied!';
                    btn.classList.add('copied');
                    const timer = setTimeout(() => {
                        btn.textContent = original;
                        btn.classList.remove('copied');
                        copyTimers.delete(timer);
                    }, 1500);
                    copyTimers.add(timer);
                });
            },
            { signal }
        );
    });

    /* Dialog demo (inline onclick from the old page moved here) */
    const dialog = root.querySelector<HTMLDialogElement>('#dlg');
    root.querySelector('#dialog-open-btn')?.addEventListener('click', () => dialog?.showModal(), { signal });
    root.querySelector('#dialog-close-btn')?.addEventListener('click', () => dialog?.close(), { signal });

    /* Inert demo — scoped to its demo box, never the whole app */
    const inertBox = root.querySelector<HTMLElement>('#inert-demo-box');
    const inertStatus = root.querySelector<HTMLElement>('#inert-status');
    root.querySelector('#inert-toggle-btn')?.addEventListener(
        'click',
        () => {
            if (!inertBox) return;
            inertBox.inert = !inertBox.inert;
            inertBox.classList.toggle('is-inert', inertBox.inert);
            if (inertStatus) inertStatus.textContent = `Box inert: ${inertBox.inert}`;
        },
        { signal }
    );

    /* Mobile TOC toggle */
    tocToggle.addEventListener(
        'click',
        () => {
            const expanded = tocToggle.getAttribute('aria-expanded') === 'true';
            tocToggle.setAttribute('aria-expanded', String(!expanded));
            tocSidebar.classList.toggle('open');
        },
        { signal }
    );

    /* Back to top */
    window.addEventListener(
        'scroll',
        () => backToTop.classList.toggle('visible', window.scrollY > 400),
        { signal, passive: true }
    );
    backToTop.addEventListener(
        'click',
        () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        { signal }
    );

    /* TOC active state (guarded — happy-dom has no IntersectionObserver) */
    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    tocLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                });
            },
            { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
        );
        cards.forEach((card) => {
            if (card.id) observer.observe(card);
        });
        signal.addEventListener('abort', () => observer.disconnect());
    }
}
