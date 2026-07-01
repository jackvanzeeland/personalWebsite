/**
 * Cinematic scroll layer for the About-page career timeline.
 *
 * Only loaded (dynamic import, own async chunk) when the device is
 * 'high' tier and prefers-reduced-motion is off. The plain Timeline
 * rendering with AOS reveals *is* the fallback — this module only
 * augments what is already on the page:
 *
 *  - a glowing progress spine that draws itself as you scroll (scrubbed)
 *  - year headers that stick while their section scrolls
 *  - event cards that rise/settle in with parallax depth
 *  - timeline dots that pop as their month enters
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TimelineCinematicHandle {
    destroy(): void;
}

export function initializeTimelineCinematic(): TimelineCinematicHandle | null {
    const container = document.getElementById('timeline-container');
    if (!container) return null;

    container.classList.add('timeline-cinematic');

    // The static layout is the degradation path; make sure AOS attributes
    // inside the timeline area can't fight ScrollTrigger's transforms.
    container.querySelectorAll('[data-aos]').forEach((el) => {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
    });

    // Progress spine overlaying the container's left edge
    const spine = document.createElement('div');
    spine.className = 'timeline-spine';
    spine.setAttribute('aria-hidden', 'true');
    container.prepend(spine);

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    // Spine draws with scroll
    tweens.push(
        gsap.fromTo(
            spine,
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 70%',
                    end: 'bottom 75%',
                    scrub: 0.6
                }
            }
        )
    );

    // Cards rise in with a touch of parallax depth
    container.querySelectorAll<HTMLElement>('.timeline-event-card').forEach((card, i) => {
        tweens.push(
            gsap.fromTo(
                card,
                { autoAlpha: 0, y: 56, rotateX: 6, transformPerspective: 600 },
                {
                    autoAlpha: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    delay: (i % 3) * 0.06,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            )
        );
    });

    // Dots pop as their month scrolls in
    container.querySelectorAll<HTMLElement>('.timeline-dot').forEach((dot) => {
        tweens.push(
            gsap.fromTo(
                dot,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 0.5,
                    ease: 'back.out(2.5)',
                    scrollTrigger: {
                        trigger: dot,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            )
        );
    });

    // Year headers get a subtle emphasis as they take the stage
    container.querySelectorAll<HTMLElement>('.year-header').forEach((header) => {
        tweens.push(
            gsap.fromTo(
                header,
                { autoAlpha: 0, x: -32 },
                {
                    autoAlpha: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            )
        );
    });

    // Keep triggers accurate when filters change layout
    const onFiltered = (): void => {
        ScrollTrigger.refresh();
    };
    document.addEventListener('timeline:filtered', onFiltered);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (): void => {
        if (reducedMotion.matches) destroy();
    };
    reducedMotion.addEventListener('change', onMotionChange);

    function destroy(): void {
        document.removeEventListener('timeline:filtered', onFiltered);
        reducedMotion.removeEventListener('change', onMotionChange);
        tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
        });
        triggers.forEach((t) => t.kill());
        spine.remove();
        container?.classList.remove('timeline-cinematic');
        // Clear inline transforms so the static layout is intact
        container?.querySelectorAll<HTMLElement>('.timeline-event-card, .timeline-dot, .year-header')
            .forEach((el) => gsap.set(el, { clearProps: 'all' }));
    }

    return { destroy };
}
