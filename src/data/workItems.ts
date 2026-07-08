/**
 * Unified work catalog: PROJECTS normalized into WorkItems for the
 * /work lattice and /work/:slug detail views. Projects tagged
 * "Artifact" are treated as artifact-kind work items.
 */

import { PROJECTS } from './projects';
import type { Project } from '../types';

export type WorkTool =
    | 'wordle-solver'
    | 'secret-santa'
    | 'lyric-animator'
    | 'qr-code-generator'
    | 'uipath-queue-processor'
    | 'html-gems';

export interface WorkItem {
    slug: string;
    kind: 'project' | 'artifact';
    title: string;
    description: string;
    originStory?: string;
    technologies: string[];
    tags: string[];
    image?: string;
    featured: boolean;
    links: {
        github?: string;
        youtube?: string;
        tiktok?: string;
        demo?: string;
        external?: string;
    };
    /** Set when the detail view mounts an interactive tool. */
    tool?: WorkTool;
}

const TOOLS: Record<string, WorkTool> = {
    'wordle-solver': 'wordle-solver',
    'secret-santa': 'secret-santa',
    'lyric-animator': 'lyric-animator',
    'qr-code-generator': 'qr-code-generator',
    'uipath-queue-processor': 'uipath-queue-processor',
    'html-gems': 'html-gems'
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function projectSlug(project: Project): string {
    return project.page || slugify(project.title);
}

function fromProject(project: Project): WorkItem {
    const slug = projectSlug(project);
    return {
        slug,
        kind: project.tags.includes('Artifact') ? 'artifact' : 'project',
        title: project.title,
        description: project.description,
        originStory: project.originStory || undefined,
        technologies: project.technologies,
        tags: project.tags,
        image: project.image || undefined,
        featured: Boolean(project.featured),
        links: {
            github: project.github_link || undefined,
            youtube: project.youtube_link || undefined,
            tiktok: project.tiktok_link || undefined,
            demo: project.live_demo || undefined,
            external: project.webpage_link || undefined
        },
        tool: TOOLS[slug]
    };
}

export const WORK_ITEMS: WorkItem[] = PROJECTS.map(fromProject);

/**
 * Card destination for an item. Items whose app lives under a dedicated
 * CloudFront behavior (/projects/woku etc.) link straight to the app —
 * the SPA route /projects/:slug must not shadow those paths.
 */
export function workItemHref(item: WorkItem): { href: string; external: boolean } {
    const external = item.links.external;
    if (external && external.startsWith('/projects/')) {
        return { href: external, external: true };
    }
    return { href: `/projects/${item.slug}`, external: false };
}

export function getWorkItem(slug: string): WorkItem | undefined {
    return WORK_ITEMS.find((item) => item.slug === slug);
}

export function allWorkTags(): string[] {
    return [...new Set(WORK_ITEMS.flatMap((item) => item.tags))].sort();
}
