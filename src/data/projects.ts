import type { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    title: "Budget Tracker",
    description:
      "Built a personal finance tracker with transaction history, budget categories, and data visualizations. Tracks spending across categories with monthly trend charts, donut breakdowns, and vendor analysis.",
    originStory:
      "Growing up, I was raised to be financially responsible and learned the importance of budgeting early on. I started my journey in college.  I made an excel sheet to track my spending and categorize expenses. However, as my financial life became more complex and the tools available evolved, I wanted a more robust tool to manage my budget and visualize my spending patterns. I built this budget tracker to provide a comprehensive view of my finances, allowing me to see where my money was going and make informed decisions about my spending. By categorizing transactions and creating visualizations, I could easily identify trends and adjust my budget accordingly. This project has been instrumental in helping me maintain financial discipline and achieve my savings goals.  Once I completed, I know some other friends and family that have asked about budget tracking, so I've made accounts for them to use the tool as well. It's been rewarding to see how this project has not only helped me but also others in my circle become more financially aware and responsible.",
    technologies: ["React", "TypeScript", "Supabase"],
    tags: ["Finance", "Interactive", "Data", "Tools"],
    github_link: "",
    image: "https://budget.jackvanzeeland.com/logo.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "https://budget.jackvanzeeland.com/",
  },
  {
    title: "Journal",
    description:
      "Built a private journaling app with mood tracking, live weather, and location check-ins. Includes a history timeline with on-this-day memories, a reflect view that surfaces patterns over time, and templates and auto-tags for daily entries — all stored in the user's own Turso database.",
    originStory:
      "I started trying to journal in the summery of 2025 after I graduated from college and was adjusting to a new life.  I would walk to the lake front with a journal and write about my day and how I was feeling.  However this because a long process and I would have to plan out time to do it.  I wanted to build a journaling tool that would make it easy and seamless to capture my thoughts and feelings in the moment, without needing to set aside dedicated time for it. I built this journaling app to automatically capture contextual metadata like location, weather, and mood with each entry, creating a richer record of daily life. As an introspective person, I found that having this additional context helped me reflect on patterns in my life and better understand myself over time.",
    technologies: ["Next.js", "TypeScript", "Turso"],
    tags: ["Tools", "Interactive"],
    github_link: "",
    image: "https://journal.jackvanzeeland.com/apple-touch-icon.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "https://journal.jackvanzeeland.com",
  },
  {
    title: "Lists",
    description:
      "Built a personal lists app for checklists and notes, with due dates, overdue alerts, drag-and-drop reordering, and full-text search across everything. Supports sorting by newest, oldest, alphabetical, or due date — all stored in the user's own Turso database.",
    originStory:
      "For years I bounced between different notes and checklist apps but never found one that did exactly what I wanted — something fast, minimal, and always in my pocket with no unnecessary friction. I decided to just build my own. I wanted it to handle both structured checklists and freeform notes in the same place, with tagging, due dates, and search that actually worked across content.",
    technologies: ["Next.js", "TypeScript", "Turso"],
    tags: ["Productivity", "Interactive", "Tools"],
    github_link: "",
    image: "https://lists.jackvanzeeland.com/icons/icon-192.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "https://lists.jackvanzeeland.com",
  },
  {
    title: "NameKeep",
    description:
      "Built a contact manager organized around venues instead of names — save the people met at restaurants, bars, and studios, tagged to the place. Includes a map view to browse venues and contacts geographically, per-contact notes with a running history, and CSV import/export.",
    originStory:
      "One of my good friends is a sales rep for the bar and entertainment industry, and he manages all the relationships in River North, Gold Coast, and Old Town.  Several times I've joined him on his rounds of building relationships with the bar owners, bartenders, and more.  He has a system of keeping track of all of his contacts in his notes app.  With that many contacts and venues it becomes impossible to find the one you need when you need it.  So I built namekeep to solve this problem.  Before he goes to a venue, all he has to do is open the app and it uses location based search to order the venues by distance and show the contacts for it.  He has now shared it with some of his colleagues and they have found it to be a really useful tool for managing their relationships and keeping track of all the important contacts in the industry.",
    technologies: ["Next.js", "TypeScript", "Turso"],
    tags: ["Networking", "Interactive", "Tools"],
    github_link: "",
    image: "https://namekeep.jackvanzeeland.com/icons/apple-touch-icon.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "https://namekeep.jackvanzeeland.com",
  },
  {
    title: "Woku",
    description:
      "Developed a game that is a hybrid of Sudoku and Wordle. A Sudoku-style board is built from a 9-letter word. Players must figure out the word — they win by guessing it correctly or by solving a row/column that spells it out.",
    originStory:
      "I noticed for myself if I am working out and I have my attention elsewhere other than the workout, I can get in a flow state and really enjoy it. I have recently been using Soduko on the stair stepper at the gym.  When I first started, I struggled around 1000 stairs, 10 minutes, and easy mode of Soduko. Since then I have become extremely familiar with the techniques of Sadoku and my go to workout is 2000 stairs, 20 minutes, and hard mode. The first 'game' related project that I built was wordle, so the obvious idea was to combine the two games that I enjoy into one. I built Woku to provide a fun and engaging way to challenge my mind while working out. By combining the logic and pattern recognition of Sudoku with the word-guessing mechanics of Wordle, I created a unique game that keeps me mentally stimulated during my workouts. The game has been a great way to make exercise more enjoyable and has helped me stay motivated to maintain a consistent fitness routine.",
    technologies: ["TypeScript", "Vite"],
    tags: ["Innovation", "Creative", "Interactive"],
    github_link: "",
    image: "https://woku.jackvanzeeland.com/icons/apple-touch-icon.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "https://woku.jackvanzeeland.com/",
  },
  {
    title: "Super Bowl Competition",
    description:
      "Created a system for a Super Bowl prop bet competition, where participants ranked their confidence in 20 prop outcomes. The tool validated confidence values compared predictions to real results and calculated each participant's score to determine winner.",
    originStory:
      "In my sophomore year of college, I was getting more comfortable with Python and wanted to apply it to something I enjoyed. My friends and I are big football fans, and some of them are big betters.  So when the superbowl came around in that year and our team (The Packers) weren't playing. I had an idea to create a prop bet competition to keep it interesting for us. In the first couple years, I ran into a lot of issues regarding input validation and calculating scores, but I iterated on the design and built a robust system that made the competition more engaging and fun for everyone involved. The tool allowed us to easily track our predictions and see how we were doing throughout the game, adding an extra layer of excitement to the Super Bowl experience.",
    technologies: ["Python", "Creative"],
    tags: ["Python", "Data", "Sports"],
    github_link: "",
    image: "superBowlMain.png",
    page: "",
    is_interactive: false,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/superbowl/",
  },
  {
    title: "Mortgage Simulator",
    description:
      "Built an interactive mortgage calculator that simulates loan payments, amortization schedules, and interest breakdowns. Users can adjust loan amount, interest rate, and term to visualize monthly payments and total cost over the life of the loan.",
    originStory:
      "After moving to Chicago and living in an apartment for a year, I wanted to understand the financial implications of buying a condo over renting. With my background in finance, I knew the value of gaining equity through homeownership. However, I needed to do a cost analysis of renting vs buying to make an informed decision. I built this mortgage simulator to model different scenarios and visualize the long-term costs and benefits of purchasing a home. By adjusting variables like loan amount, interest rate, and term, I could see how monthly payments and total costs would change. This project helped me feel confident in my decision to buy a condo and provided a tool I can use to evaluate future real estate investments.",
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
    title: "Wordle Algorithm Solver",
    description:
      "Built an algorithm that recommends optimal next guess in Wordle based on previous outcomes, competing against my manual attempts. The algorithm outperformed or tied with me in 87% of games (46/53), showcasing its strategic efficiency.",
    originStory:
      "The viral word-guessing game Wordle grabbed the world's attention my freshman year of college.  It was when I first started learning how to code in Python, and I am very competitive and curious.  I wanted to build an algorithm that could tell me the best word to guess next based on the feedback from my previous guesses. I built this Wordle solver to challenge myself and see if I could create a strategy that would outperform my own guessing abilities. By analyzing the patterns in the feedback and optimizing the algorithm, I was able to create a tool that consistently provided strong recommendations for my next guess and allow me to outperform my peers by learning from the algorithm's next move.",
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
    originStory:
      "For years growing up, my cousins and I would do a Secret Santa gift exchange during the holidays.  However, our original method was to pick a from a list of name out of a hat just hoping that no one would pick themselves.  During my sophomore year of college, I wanted to create a more reliable and private way to do our Secret Santa matching. I built this program to ensure that no one would accidentally pick themselves and to provide a private interface for users to view their match. By automating the matching process, I was able to make our holiday gift exchange more effective. Recently, I have upgraded the UI to be more user friendly and visually appealing, making it even easier for my family to use and enjoy the Secret Santa tradition.",
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
    originStory:
      "One of my good freinds from college is a content creator and social media manager for several music artists.  He explained the process of content creation for music promotion and how they often create lyric videos to engage fans.  I wanted to build a tool that could help with this process by animating song lyrics in sync with the music. I built this lyric animator to provide a creative way to enhance the listening experience and make it vizually engaging and if I made a little off the side hustle that would be a nice bonus.",
    technologies: ["HTML", "CSS", "JavaScript"],
    tags: ["JavaScript", "Creative", "Interactive", "Music"],
    github_link: "",
    image: "BangerBank.png",
    page: "lyric-animator",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "Budgeting Automation",
    description:
      "Developed an automation bot that scans an email account for bank statements, downloads statement, and parses data into an Excel sheet stored in Office 365. This tool streamlines budgeting across multiple bank accounts by tracking dates, purchase descriptions, and amounts in one central location.",
    originStory:
      "When I was hoping to get an internship my junior year of college, I had an interview scheduled a few weeks out for an rpa intern position.  So during the winter break, I took multiple courses on UiPath on LinkedIn Learning and UiPath Academy to prepare for the interview.  Once I completed those, I wanted to experiment with building some automations on my own.  During this time, I was filling out my budgetting excel spreadsheet weekly to keep up with my finance.  I thought it would be a good idea to automate this process and make it more efficient. I built this budgeting automation to save time and reduce the manual effort involved in tracking my finances. By automating the retrieval and parsing of bank statements, I was able to maintain an up-to-date budget without the hassle of manual data entry, allowing me to focus more on analyzing my spending patterns and making informed financial decisions.",
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
    originStory:
      "During my junior year of college, my roommate's best friend from high school was an assistant basketball coach at a Akron College.  He called my roommate one night asking if any of us could help him out.  He was tasked with analyzing which lineups were most effective for the team, he had all the data provided to him but he didn't know how to aggregate it programatically. I offered to help and built some code to the lineup optimization processing. After I built the tool, I sent him the code and run instructions and he was able to use it to analyze the game data and identify the most effective lineups for his team.",
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
    originStory:
      "During my senior year of college, tiktok and instagram reels were becoming increasingly popular.  Even really simple things like story telling videos layered over gameplay.  I wanted to experiment with building a content creation bot that could automate the process of creating and uploading videos.  I built this Reddit Stories bot to retrieve top daily Reddit stories, convert them to speech, and pair the audio with engaging Minecraft speed-run footage. By automating the entire pipeline from content retrieval to video creation and distribution, I was able to create a unique and entertaining social media presence that gained traction and provided a fun creative outlet for me.",
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
  {
    title: "QR Code Generator",
    description:
      "A bilingual (EN/ES) QR code generator supporting URLs, plain text, and contact vCards. Generate, download, and copy QR codes instantly.",
    originStory:
      "I don't carry business cards, and after seeing the NFC bracelets people use as digital contact cards online, I got curious how they actually worked. Researching them, I realized I could build something similar myself, but as a QR code instead of a physical bracelet — and I'd get to control exactly what information gets shared. I built this generator to create vCards on the fly, and made two for myself: one personal and one professional, so I can choose which one to hand off depending on who I'm meeting. It solved a problem I didn't realize I had until I stopped needing business cards altogether.",
    technologies: ["HTML5", "JavaScript", "QRious"],
    tags: ["Tools", "Interactive", "JavaScript", "Artifact"],
    github_link: "",
    image: "professional-qr-code-contact.png",
    page: "qr-code-generator",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "UiPath Queue Processor",
    description:
      "Upload UiPath Orchestrator queue CSV exports, flatten DynamicProperties JSON columns, select desired fields, and download a clean CSV.",
    originStory:
      "On my team, testing often means pulling production queue inputs and loading them into our QA queues. Our old process relied on custom Excel VBA functions to parse the export data and loop through every row — slow, fragile, and something only a couple of people on the team really understood. I built this tool to replace that entire workflow: a teammate just drops in the production export, and the app flattens the nested JSON fields and returns a clean file ready to upload straight into the QA queue. What used to take a custom script and manual looping now takes one drag-and-drop.",
    technologies: ["HTML5", "JavaScript", "Papa Parse"],
    tags: ["Automation", "Tools", "JavaScript", "Artifact"],
    github_link: "",
    image: "uipath_logo.jpeg",
    page: "uipath-queue-processor",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
  },
  {
    title: "HTML Gems Uncovered",
    description:
      "An interactive showcase of 18 underused HTML features and attributes that reduce JavaScript bloat and improve accessibility, with live examples.",
    originStory:
      "When I first started building my personal website, it was all plain HTML — I didn't know TypeScript or any frontend framework yet. Rather than reaching for a library to make it feel more interesting, I set myself a learning goal: find out what HTML itself was actually capable of. I built this tool specifically as a research project, digging up lesser-known HTML elements and attributes that could add interactivity and polish without a single line of JavaScript. It ended up teaching me more about the platform's built-in capabilities than any tutorial would have.",
    technologies: ["HTML5", "CSS3", "Web Standards"],
    tags: ["Creative", "Interactive", "JavaScript", "Artifact"],
    github_link: "",
    image: "ai_generated_html.png",
    page: "html-gems",
    is_interactive: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "",
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
