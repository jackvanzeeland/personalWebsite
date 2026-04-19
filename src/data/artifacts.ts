import type { Artifact } from "../types";

export const ARTIFACTS: Artifact[] = [
  {
    title: "QR Code Generator",
    description:
      "A bilingual (EN/ES) QR code generator supporting URLs, plain text, and contact vCards. Generate, download, and copy QR codes instantly.",
    technologies: ["HTML5", "JavaScript", "QRious"],
    page: "qr-code-generator",
    image: "professional-qr-code-contact.png",
  },
  {
    title: "UiPath Queue Processor",
    description:
      "Upload UiPath Orchestrator queue CSV exports, flatten DynamicProperties JSON columns, select desired fields, and download a clean CSV.",
    technologies: ["HTML5", "JavaScript", "Papa Parse"],
    page: "uipath-queue-processor",
    image: "uipath_logo.jpeg",
  },
  {
    title: "HTML Gems Uncovered",
    description:
      "An interactive showcase of 18 underused HTML features and attributes that reduce JavaScript bloat and improve accessibility. Explore native browser capabilities from <details> to <dialog>, complete with live examples.",
    technologies: ["HTML5", "CSS3", "Web Standards"],
    page: "html-gems",
    image: "ai_generated_html.png",
  },
];
