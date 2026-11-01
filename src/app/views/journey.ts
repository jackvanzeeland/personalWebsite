/**
 * /journey — bio, skills, resume, the work/education timeline, and a
 * compact certifications index.
 * The particle constellation is built from the same timeline.json the
 * timeline renders, so the scene literally is the career data.
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { constellationBuilder } from "../../scene/formations/constellation";
import { initializeTimeline } from "../../components/Timeline";
import { ResumeManager } from "../../components/ResumeManager";
import type { TimelineItem } from "../../types";
import "../../styles/redesign/journey.css";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const SKILL_SECTIONS: [string, string][] = [
  ["programming-skills", "Programming"],
  ["automation-skills", "Automation & Tools"],
  ["data-skills", "Data & Cloud"],
];

function sectionHead(
  title: string,
  meta: string,
  metaId?: string,
): HTMLElement {
  const head = el("div", "journey-section-head");
  const metaEl = el("p", "journey-section-meta", meta);
  if (metaId) metaEl.id = metaId;
  head.append(el("h2", "journey-section-title", title), metaEl);
  return head;
}

let resumeManager: ResumeManager | null = null;

async function loadSkills(): Promise<void> {
  resumeManager ??= new ResumeManager();
  await resumeManager.ensureLoaded();
  const skills = resumeManager.getSkills();
  const populate = (id: string, items?: string[]): void => {
    const list = document.getElementById(id);
    if (list && items?.length) {
      list.replaceChildren(...items.map((skill) => el("li", undefined, skill)));
    }
  };
  populate("programming-skills", skills.programming);
  populate("automation-skills", skills.automation);
  populate("data-skills", [...(skills.data ?? []), ...(skills.cloud ?? [])]);
}

const view: View = {
  async mount(root) {
    const section = el("section", "journey container-x");

    section.append(
      el("p", "eyebrow", "// THE JOURNEY"),
      el("h1", undefined, "How I got here"),
    );

    // Bio with the resume button sitting to its right
    const intro = el("div", "journey-intro");
    intro.appendChild(
      el(
        "p",
        "journey-bio",
        "I’ve always thought analytically, which is why I studied finance and data science at UW–Madison. While still in school, I heard about an RPA role at Echo Global Logistics, applied, and got it. I’ve grown alongside the team ever since, and my role has grown with me. Away from work, I sharpen my craft by building projects that aren’t about automation at all.",
      ),
    );
    const resume = el("a", "btn-ghost journey-resume", "Download resume ↓");
    resume.href = "/files/resume.pdf";
    resume.setAttribute("download", "jack-van-zeeland-resume.pdf");
    intro.appendChild(resume);
    section.appendChild(intro);

    // Skills
    const skillsPanel = el("div", "panel journey-skills");
    skillsPanel.setAttribute("data-reveal", "");
    for (const [id, label] of SKILL_SECTIONS) {
      const block = el("div", "journey-skill-block");
      block.appendChild(el("div", "journey-skill-label", label.toUpperCase()));
      const ul = el("ul", "journey-skill-list");
      ul.id = id;
      block.appendChild(ul);
      skillsPanel.appendChild(block);
    }
    section.appendChild(skillsPanel);

    // The path: work + education timeline (ids are Timeline.ts's DOM contract)
    const timelineWrap = el("div", "journey-timeline");
    timelineWrap.appendChild(sectionHead("The path", "WORK · EDUCATION"));
    const container = el("div");
    container.id = "timeline-container";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Work and education timeline");
    timelineWrap.appendChild(container);
    section.appendChild(timelineWrap);

    // Certifications: compact index, filled by Timeline.ts
    const certs = el("div", "journey-certs");
    const certHead = sectionHead("Certifications", "", "cert-count");
    const certList = el("ul", "cert-index");
    certList.id = "cert-index";
    certs.append(certHead, certList);
    section.appendChild(certs);

    root.appendChild(section);

    // Data-dependent pieces after the skeleton is attached
    void loadSkills();
    await initializeTimeline();

    try {
      const response = await fetch("/data/timeline.json");
      const data = await response.json();
      const items = (data.timelineItems ?? []) as TimelineItem[];
      requestFormation(constellationBuilder(items));
    } catch {
      /* constellation is decoration; timeline already rendered */
    }
  },

  unmount() {
    /* nothing to tear down: the page holds no listeners */
  },
};

export default view;
