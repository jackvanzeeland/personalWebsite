// Resume data integration
export interface ResumeData {
    personalInfo: {
        name: string;
        title: string;
        contact: {
            email: string;
            phone: string;
            location: string;
            linkedin: string;
        };
    };
    summary: string;
    education: EducationItem[];
    experience: ExperienceItem[];
    skills: {
        programming: string[];
        automation: string[];
        data: string[];
        cloud: string[];
        tools: string[];
    };
    certifications: CertificationItem[];
    projects: any;
}

export interface EducationItem {
    degree: string;
    institution: string;
    year: string;
    details: string;
}

export interface ExperienceItem {
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
    technologies?: string[];
}

export interface SkillItem {
    category: string;
    items: string[];
}

export interface CertificationItem {
    name: string;
    issuer: string;
    date: string;
    description?: string;
}

export class ResumeManager {
    private resumeData: ResumeData | null = null;

    constructor() {
        this.loadResumeData();
        this.setupEventListeners();
    }

    private async loadResumeData(): Promise<void> {
        try {
            const response = await fetch('/assets/files/resume.json');
            if (response.ok) {
                this.resumeData = await response.json();
            } else {
                this.resumeData = this.getFallbackData();
            }
        } catch (error) {
            console.warn('Resume data not found, using fallback data:', error);
            this.resumeData = this.getFallbackData();
        }
    }

    private getFallbackData(): ResumeData {
        return {
            personalInfo: {
                name: "Jack Van Zeeland",
                title: "Software Engineer & Automation Specialist",
                contact: {
                    email: "jack.vanzeeland@outlook.com",
                    phone: "920.883.0243",
                    location: "Chicago, IL",
                    linkedin: "https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/"
                }
            },
            summary: "Results-driven automation engineer with 5+ years of experience developing solutions that save businesses thousands of hours and hundreds of thousands of dollars annually. Expert in Python, RPA, data analysis, and enterprise systems integration.",
            education: [
                {
                    degree: "BS in Data Science & Finance",
                    institution: "University of Wisconsin-Madison",
                    year: "2021 - 2025",
                    details: "Focus on Data Science Programming, Machine Learning, Business Analytics, Corporate Finance, and Investment Theory"
                }
            ],
            experience: [
                {
                    company: "Echo Global Logistics",
                    position: "Business Automation Engineer",
                    duration: "June 2025 - Present",
                    responsibilities: [
                        "Developed 8 automation solutions saving ~13,000 hours of work and $400,000 annually",
                        "Built Copilot agent reducing support ticket response time by 40%",
                        "Created defect discovery dashboard consolidating transaction data, job details, and logs into a single view",
                        "Mentored and trained two interns, fostering their growth and enhancing team capabilities"
                    ],
                    technologies: ["Python", "SQL", "JavaScript", "UiPath", "Power Automate", "AWS", "Azure DevOps"]
                },
                {
                    company: "Echo Global Logistics",
                    position: "RPA Developer Intern",
                    duration: "February 2024 - May 2025",
                    responsibilities: [
                        "Developed 14 automation solutions saving ~35,000 hours annually ($3,200,000 in value)",
                        "Audited and improved 5 existing automation solutions",
                        "Created data extraction and S3 integration processes",
                        "Trained in enterprise automation best practices"
                    ],
                    technologies: ["Python", "RPA", "UiPath", "Excel", "Tableau"]
                },
                {
                    company: "Orbis Corporation",
                    position: "Quality Intern",
                    duration: "May 2023 - August 2023",
                    responsibilities: [
                        "Conducted input analysis on industrial machines using R",
                        "Developed optimized production ranges enhancing machine efficiency",
                        "Analyzed sensor data to predict maintenance requirements"
                    ],
                    technologies: ["R", "SQL", "Python", "MATLAB"]
                }
            ],
            skills: {
                programming: ["Python", "JavaScript", "TypeScript", "SQL", "R", "VBA.NET"],
                automation: ["UiPath", "Power Automate", "Copilot Studio", "Python Automation", "Process Optimization"],
                data: ["Data Analysis", "Machine Learning", "Statistics", "Excel", "Tableau", "Pandas", "NumPy", "MATLAB"],
                cloud: ["AWS", "Azure", "S3", "Lambda", "CloudWatch", "DevOps"],
                tools: ["Git", "Docker", "JIRA", "Confluence", "Visual Studio Code"]
            },
            certifications: [
                {
                    name: "UiPath Certified RPA Associate",
                    issuer: "UiPath",
                    date: "2024",
                    description: "Robotic Process Automation certification"
                },
                {
                    name: "UiPath Certified Advanced RPA Developer",
                    issuer: "UiPath",
                    date: "2024",
                    description: "Advanced automation development certification"
                },
                {
                    name: "Microsoft Copilot for Productivity",
                    issuer: "Microsoft",
                    date: "2024",
                    description: "AI-powered productivity and development assistant certification"
                },
                {
                    name: "AWS Certified Cloud Practitioner",
                    issuer: "Amazon Web Services",
                    date: "2023",
                    description: "Foundational AWS cloud services certification"
                }
            ],
            projects: {
                redditStories: {
                    title: "Reddit Stories Automation",
                    description: "Built Python pipeline automating Reddit content to video with TTS and subtitles",
                    technologies: ["Python", "AWS Textract", "AWS Polly", "Video Processing", "YouTube API", "TikTok API"]
                },
                financeTracker: {
                    title: "Personal Finance Tracker",
                    description: "UiPath automation for organizing bank statements into centralized Excel database",
                    technologies: ["UiPath", "Excel", "VBA", "Data Extraction"]
                },
                basketballOptimization: {
                    title: "Basketball Lineup Optimization",
                    description: "R-based analysis of team performance data to identify optimal player combinations",
                    technologies: ["R", "Statistics", "Data Visualization", "Sports Analytics"]
                },
                wordleSolver: {
                    title: "Wordle Algorithm Solver",
                    description: "Python algorithm achieving 87% win rate against manual play",
                    technologies: ["Python", "Algorithm Design", "Information Theory", "Matplotlib"]
                },
                partnerMatching: {
                    title: "Secret Santa Matching App",
                    description: "JavaScript web application with privacy-protected matching algorithm",
                    technologies: ["JavaScript", "HTML", "CSS", "Algorithm Design"]
                },
                superbowlCompetition: {
                    title: "Super Bowl Prop Bet Scoring System",
                    description: "Python-based scoring system for confidence-based predictions",
                    technologies: ["Python", "Data Validation", "Web Development"]
                }
            }
        };
    }

    private setupEventListeners(): void {
        // Event listeners for future enhancements
    }

    public getPersonalInfo(): ResumeData['personalInfo'] {
        return this.resumeData?.personalInfo || {
            name: "",
            title: "",
            contact: {
                email: "",
                phone: "",
                location: "",
                linkedin: ""
            }
        };
    }

    public getSummary(): string {
        return this.resumeData?.summary || "";
    }

    public getEducation(): EducationItem[] {
        return this.resumeData?.education || [];
    }

    public getExperience(): ExperienceItem[] {
        return this.resumeData?.experience || [];
    }

    public getSkills(): ResumeData['skills'] {
        return this.resumeData?.skills || { programming: [], automation: [], data: [], cloud: [], tools: [] };
    }

    public getCertifications(): CertificationItem[] {
        return this.resumeData?.certifications || [];
    }

    public getProjects(): ResumeData['projects'] {
        return this.resumeData?.projects || {};
    }

    public updateEducation(education: EducationItem[]): void {
        if (this.resumeData) {
            this.resumeData.education = education;
        }
    }

    public updateExperience(experience: ExperienceItem[]): void {
        if (this.resumeData) {
            this.resumeData.experience = experience;
        }
    }
}