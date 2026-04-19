export interface Project {
    title: string;
    description: string;
    technologies: string[];
    tags: string[];
    is_interactive: boolean;
    github_link: string;
    youtube_link: string;
    tiktok_link: string;
    page: string;
    image: string;
    status?: string;
    live_demo?: string;
    webpage_link?: string;
}

export interface JourneyData {
    home?: boolean;
    about?: boolean;
    beyondTheCode?: boolean;
    journey?: boolean;
    projects_page?: boolean;
    projects?: string[];
    achievements?: string[];
    lastVisited?: string;
    progress?: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
}



export interface Theme {
    name: 'light' | 'dark';
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
    };
}

export type FilterTag = {
    name: string;
    count: number;
    active: boolean;
};

export interface Artifact {
    title: string;
    description: string;
    technologies: string[];
    page: string;
    image: string;
}