/**
 * Home view — the 3-second impression.
 * Layout follows the approved mockup:
 * docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { monogramBuilder } from "../../scene/formations/monogram";
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
  ["13", "PERSONAL PROJECTS"],
];

const view: View = {
  mount(root) {
    requestFormation(monogramBuilder);

    const hero = el("section", "home-hero container-x");
    const heroText = el("div", "home-hero-text");

    const eyebrow = el("p", "eyebrow", "// SOFTWARE ENGINEER — CHICAGO");
    const h1 = el("h1", "home-name");
    h1.append("Jack ", el("br"), "Van Zeeland");
    const sub = el(
      "p",
      "home-sub",
      "I automate the repetitive — at work, at home, and everywhere in between. This site is where the useful ones live.",
    );

    const ctas = el("div", "home-ctas");
    const work = el("a", "btn-glow", "Explore the projects →");
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

    heroText.append(eyebrow, h1, sub, ctas, stats);

    const avatarWrap = el("div", "home-avatar");
    avatarWrap.appendChild(
      createOptimizedPicture("/assets/images/profile.jpg", {
        alt: "Jack Van Zeeland",
        sizes: "(min-width: 900px) 320px, 160px",
        loading: "eager",
      }),
    );

    hero.append(avatarWrap, heroText);

    root.append(hero);
  },

  unmount() {
    /* DOM is cleared by the shell; no listeners to remove */
  },
};

export default view;
