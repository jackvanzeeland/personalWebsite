export type ImageStyle = 'icon' | 'cover';

export interface Project {
    title: string;
    description: string;
    /** Search-snippet copy (≤160 chars). Falls back to the description's first sentence(s). */
    seoDescription?: string;
    originStory?: string;
    technologies: string[];
    tags: string[];
    is_interactive: boolean;
    github_link: string;
    youtube_link: string;
    tiktok_link: string;
    page: string;
    image: string;
    /**
     * How the thumbnail is framed on cards and share images:
     * "icon"  — logo / app tile, shown contained and centered on the dark panel
     * "cover" — photo or artwork, cropped full-bleed
     */
    imageStyle: ImageStyle;
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