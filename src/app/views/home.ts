/**
 * Home view — the 3-second impression.
 * Layout follows the approved mockup:
 * docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { monogramBuilder } from "../../scene/formations/monogram";
import { WORK_ITEMS, workItemHref } from "../../data/workItems";
import { createOptimizedPicture } from "../../utils/optimizedImage";
import "../../styles/redesign/home.css";

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

const STATS: [string, string][] = [
  ["22", "AUTOMATIONS"],
  ["48K+", "HOURS SAVED"],
  ["87%", "WORDLE WIN RATE"],
];

const view: View = {
  mount(root) {
    requestFormation(monogramBuilder);

    const hero = el("section", "home-hero container-x");

    const eyebrow = el("p", "eyebrow", "// SOFTWARE ENGINEER — CHICAGO");
    const h1 = el("h1", "home-name");
    h1.append("Jack ", el("br"), "Van Zeeland");
    const sub = el(
      "p",
      "home-sub",
      "I automate the repetitive — at work, at home, and everywhere in between. This site is where the useful ones live.",
    );

    const ctas = el("div", "home-ctas");
    const work = el("a", "btn-glow", "Explore the work →");
    work.href = "/projects";
    const journey = el("a", "btn-ghost", "The journey");
    journey.href = "/journey";
    ctas.append(work, journey);

    const stats = el("div", "home-stats");
    for (const [num, label] of STATS) {
      const stat = el("div", "home-stat");
      stat.append(
        el("div", "home-stat-num", num),
        el("div", "home-stat-label", label),
      );
      stats.appendChild(stat);
    }

    hero.append(eyebrow, h1, sub, ctas, stats);

    // Selected work panel
    const panelWrap = el("section", "home-featured container-x");
    const panel = el("div", "panel home-featured-panel");
    panel.appendChild(el("div", "home-featured-label", "SELECTED WORK"));
    const grid = el("div", "home-featured-grid");

    const featured = WORK_ITEMS.filter((p) => p.featured).slice(0, 3);
    for (const project of featured) {
      const card = el("a", "home-featured-card");
      const dest = workItemHref(project);
      card.href = dest.href;
      if (dest.external) card.setAttribute("data-external", "");
      const imgWrap = el("div", "home-featured-img");
      imgWrap.appendChild(
        createOptimizedPicture(`/assets/images/${project.image}`, {
          alt: project.title,
          sizes: "(min-width: 900px) 340px, 100vw",
        }),
      );
      const body = el("div", "home-featured-body");
      body.append(
        el("h3", "home-featured-title", project.title),
        el("p", "home-featured-desc", project.description),
      );
      const tags = el("div", "home-featured-tags");
      project.technologies
        .slice(0, 3)
        .forEach((t) => tags.appendChild(el("span", "home-tag", t)));
      body.appendChild(tags);
      card.append(imgWrap, body);
      grid.appendChild(card);
    }
    panel.appendChild(grid);
    panelWrap.appendChild(panel);

    root.append(hero, panelWrap);
  },

  unmount() {
    /* DOM is cleared by the shell; no listeners to remove */
  },
};

export default view;
