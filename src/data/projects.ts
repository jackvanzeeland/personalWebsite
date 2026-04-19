import type { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    title: "Mortgage Simulator",
    description:
      "Built an interactive mortgage calculator that simulates loan payments, amortization schedules, and interest breakdowns. Users can adjust loan amount, interest rate, and term to visualize monthly payments and total cost over the life of the loan.",
    technologies: ["React", "TypeScript", "Vite"],
    tags: ["Finance", "Interactive", "Tools"],
    github_link: "",
    image: "mortgageSimulator.jpg",
    page: "",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/mortgage-simulator/",
  },
  {
    title: "Budget Tracker",
    description:
      "Built a personal finance tracker with transaction history, budget categories, and data visualizations. Tracks spending across categories with monthly trend charts, donut breakdowns, and vendor analysis.",
    technologies: ["React", "TypeScript", "Supabase"],
    tags: ["Finance", "Interactive", "Data", "Tools"],
    github_link: "",
    image: "budgetTracker.png",
    page: "",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/budget-tracker/",
  },
  {
    title: "Woku",
    description:
      "Developed a game that is a hybrid of Sudoku and Wordle. A Sudoku-style board is built from a 9-letter word. Players must figure out the word — they win by guessing it correctly or by solving a row/column that spells it out.",
    technologies: ["TypeScript", "Vite"],
    tags: ["Innovation", "Creative", "Interactive"],
    github_link: "",
    image: "woku.png",
    page: "",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/woku/",
  },
  {
    title: "Super Bowl Competition",
    description:
      "Created a system for a Super Bowl prop bet competition, where participants ranked their confidence in 20 prop outcomes. The tool validated confidence values compared predictions to real results and calculated each participant's score to determine winner.",
    technologies: ["Python", "Creative"],
    tags: ["Python", "Data", "Sports"],
    github_link: "",
    image: "superBowlMain.jpeg",
    page: "",
    is_interactive: false,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/superbowl/",
  },
  {
    title: "Wordle Algorithm Solver",
    description:
      "Built an algorithm that recommends optimal next guess in Wordle based on previous outcomes, competing against my manual attempts. The algorithm outperformed or tied with me in 87% of games (46/53), showcasing its strategic efficiency.",
    technologies: ["Python", "Regex"],
    tags: ["Python", "Algorithm", "AI", "Interactive"],
    github_link: "",
    image: "wordleMain.png",
    page: "wordle-solver",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "Secret Santa Matching",
    description:
      "Developed a Secret Santa partner-matching program in Python that ensures no one selects themselves and provides a private interface for users to view their match. This streamlined process for holiday gift exchanges while maintaining confidentiality.",
    technologies: ["Python", "Problem Solving"],
    tags: ["Python", "Algorithm", "Interactive"],
    github_link: "",
    image: "partnerMatchingMain.jpeg",
    page: "secret-santa",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "Lyric Animator",
    description:
      "Developed a web application that displays & animates song lyrics in sync with music playback, enhancing listening experience.",
    technologies: ["HTML", "CSS", "JavaScript"],
    tags: ["JavaScript", "Creative", "Interactive", "Music"],
    github_link: "",
    image: "BangerBank.png",
    page: "lyric-animator",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/pages/projects/lyric-animator",
  },
  {
    title: "Budgeting Automation",
    description:
      "Developed an automation bot that scans an email account for bank statements, downloads statement, and parses data into an Excel sheet stored in Office 365. This tool streamlines budgeting across multiple bank accounts by tracking dates, purchase descriptions, and amounts in one central location.",
    technologies: ["UiPath", "Automation", "Data Manipulation"],
    tags: ["Automation", "Data", "Finance"],
    github_link: "",
    image: "budgetingMain.jpeg",
    page: "budgeting-automation",
    is_interactive: false,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "Basketball Lineup Optimization",
    description:
      "Developed a process for a friend that is a basketball coach that analyzes basketball game data by tracking points scored and allowed for each lineup throughout game. The tool then groups combinations of size 2, 3, 4, and 5 to identify most effective lineups, helping optimize team performance.",
    technologies: ["R Programming", "Problem Solving", "Data Manipulation"],
    tags: ["R", "Algorithm", "Data", "Sports"],
    github_link: "https://github.com/jackvanzeeland/basketballLineupAnalysis",
    image: "basketballMain.jpeg",
    page: "basketball-optimization",
    is_interactive: false,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },

  {
    title: "Reddit Stories",
    description:
      "Developed an automated social media bot in Python that retrieved top daily Reddit stories, converted them to speech, and paired audio with engaging Minecraft speed-run footage. The system generated subtitles from audio, compiled both full-length and short-form videos, and uploaded them automatically. The project gained over 20 subscribers and 50,000 views before decommissioning.",
    technologies: ["Python", "YouTube", "TikTok"],
    tags: ["Python", "Automation", "Video", "Social Media"],
    github_link: "",
    image: "redditStories.jpeg",
    page: "",
    is_interactive: false,
    youtube_link: "https://www.youtube.com/@redditStories_JVZ",
    tiktok_link: "https://www.tiktok.com/@redditstories_jvz",
    live_demo: "",
    webpage_link:
      "https://jackvanzeeland.github.io/redditStoriesApp/index.html",
  },
];

export const getAllTags = (): string[] => {
  const allTags = new Set<string>();
  PROJECTS.forEach((project) => {
    project.tags.forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

export const getProjectsByTag = (tag: string): Project[] => {
  return PROJECTS.filter((project) =>
    project.tags.some((projectTag) =>
      projectTag.toLowerCase().includes(tag.toLowerCase()),
    ),
  );
};

export const getProjectByPage = (page: string): Project | undefined => {
  return PROJECTS.find((project) => project.page === page);
};
