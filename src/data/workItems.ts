/**
 * Unified work catalog: PROJECTS + ARTIFACTS normalized into one list
 * for the /work lattice and /work/:slug detail views.
 * Projects.ts / artifacts.ts stay the untouched sources of truth.
 */

import { PROJECTS } from './projects';
import { ARTIFACTS } from './artifacts';
import type { Project } from '../types';

export type WorkTool = 'wordle-solver' | 'secret-santa' | 'lyric-animator';

export interface WorkItem {
    slug: string;
    kind: 'project' | 'artifact';
    title: string;
    description: string;
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
    'lyric-animator': 'lyric-animator'
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
        kind: 'project',
        title: project.title,
        description: project.description,
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

function buildWorkItems(): WorkItem[] {
    const items = PROJECTS.map(fromProject);

    for (const artifact of ARTIFACTS) {
        // Some artifacts are double-listed in PROJECTS — collapse into one
        // item, keep the richer project entry, adopt the artifact slug/kind.
        const existing = items.find(
            (item) => item.title === artifact.title || item.slug === artifact.page
        );
        if (existing) {
            existing.kind = 'artifact';
            existing.slug = artifact.page;
            if (!existing.tags.includes('Artifact')) existing.tags = [...existing.tags, 'Artifact'];
            continue;
        }
        items.push({
            slug: artifact.page,
            kind: 'artifact',
            title: artifact.title,
            description: artifact.description,
            technologies: artifact.technologies,
            tags: ['Artifact'],
            image: artifact.image || undefined,
            featured: false,
            links: {}
        });
    }
    return items;
}

export const WORK_ITEMS: WorkItem[] = buildWorkItems();

export function getWorkItem(slug: string): WorkItem | undefined {
    return WORK_ITEMS.find((item) => item.slug === slug);
}

export function allWorkTags(): string[] {
    return [...new Set(WORK_ITEMS.flatMap((item) => item.tags))].sort();
}
