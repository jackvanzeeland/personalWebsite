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
    featured?: boolean;
    live_demo?: string;
    webpage_link?: string;
}

export interface TimelineItem {
    id: string;
    title: string;
    organization: string;
    type: 'education' | 'work' | 'certification';
    startDate: string;
    endDate: string;
    isPresent: boolean;
    description: string;
    badgeColor?: string;
}

export interface JourneyData {
    home?: boolean;
    beyondTheCode?: boolean;
    journey?: boolean;
    projects_page?: boolean;
    contact?: boolean;
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

export interface Artifact {
    title: string;
    description: string;
    technologies: string[];
    page: string;
    image: string;
}