/**
 * Per-route title, meta description, and accent color.
 * Kept free of imports so the router, seo.ts, and the build-time prerender
 * (scripts/prerender.ts) can all share it without a dependency cycle.
 *
 * Descriptions are what Google shows under the link — keep each one
 * specific to its page and at most 160 characters (tests/seo.test.ts).
 */

export type RouteName =
    | 'home'
    | 'work'
    | 'workDetail'
    | 'journey'
    | 'beyond'
    | 'contact'
    | 'notFound';

export interface RouteMeta {
    title: string;
    description: string;
    accent: string;
}

export const routeMeta: Record<RouteName, RouteMeta> = {
    home: {
        title: 'Jack Van Zeeland — Software Engineer',
        description:
            'Jack Van Zeeland is a Chicago software engineer building automation, AI tooling, and side projects — 22 automations shipped, 48K+ hours saved.',
        accent: '#38bdf8'
    },
    work: {
        title: 'Projects — Jack Van Zeeland',
        description:
            'Side projects by Jack Van Zeeland: finance and journaling apps, a Wordle solver, a Secret Santa matcher, and browser tools you can try on the page.',
        accent: '#818cf8'
    },
    workDetail: {
        // Placeholder until the project resolves; seo.projectSeo() replaces it
        title: 'Projects — Jack Van Zeeland',
        description: 'A side project by Chicago software engineer Jack Van Zeeland.',
        accent: '#818cf8'
    },
    journey: {
        title: 'Journey — Jack Van Zeeland',
        description:
            'Career timeline of software engineer Jack Van Zeeland: UW–Madison data science and finance, business automation at Echo Global Logistics, and certifications.',
        accent: '#34d399'
    },
    beyond: {
        title: 'Beyond the Code — Jack Van Zeeland',
        description:
            'Life outside the terminal for Jack Van Zeeland: running, intramural sports, golf, favorite podcasts and audiobooks, and photos.',
        accent: '#fbbf24'
    },
    contact: {
        title: 'Contact — Jack Van Zeeland',
        description:
            'Get in touch with Jack Van Zeeland, a Chicago software engineer — email, LinkedIn, GitHub, or download the resume.',
        accent: '#38bdf8'
    },
    notFound: {
        title: 'Not found — Jack Van Zeeland',
        description: 'Page not found.',
        accent: '#38bdf8'
    }
};
