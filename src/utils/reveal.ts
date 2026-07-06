/**
 * Scroll-reveal for [data-reveal] elements (replaces AOS).
 * Reduced-motion users get everything visible immediately.
 */

export function initReveals(root: ParentNode = document): void {
    const elements = [...root.querySelectorAll('[data-reveal]')];
    if (elements.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('in'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    elements.forEach((el) => observer.observe(el));
}
