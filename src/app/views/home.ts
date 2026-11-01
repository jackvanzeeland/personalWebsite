/**
 * Home view — the 3-second impression.
 * Layout follows the approved mockup:
 * docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html
 * Terminal + odometer hero: docs/superpowers/specs/2026-11-01-home-terminal-hero-design.md
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { monogramBuilder } from "../../scene/formations/monogram";
import { createOptimizedPicture } from "../../utils/optimizedImage";
import { prefersReducedMotion } from "../../utils/capabilities";
import { createTerminal } from "./homeTerminalView";
import { createOdometer } from "./homeOdometer";
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

let terminal: { destroy(): void } | null = null;
let odometer: { destroy(): void } | null = null;

const view: View = {
  mount(root) {
    requestFormation(monogramBuilder);

    const hero = el("section", "home-hero container-x");
    const heroText = el("div", "home-hero-text");

    const eyebrow = el("p", "eyebrow", "// SOFTWARE ENGINEER — CHICAGO");
    const h1 = el("h1", "home-name");
    h1.append("Jack ", el("br"), "Van Zeeland");
    const reducedMotion = prefersReducedMotion();
    const term = createTerminal({ animate: !reducedMotion });
    const odo = createOdometer({ reducedMotion });
    terminal = term;
    odometer = odo;

    heroText.append(eyebrow, h1, term.el, odo.el);

    const avatarWrap = el("div", "home-avatar");
    avatarWrap.appendChild(
      createOptimizedPicture("/images/profile.jpg", {
        alt: "Jack Van Zeeland",
        sizes: "(min-width: 900px) 320px, 160px",
        loading: "eager",
      }),
    );

    hero.append(avatarWrap, heroText);

    root.append(hero);
  },

  unmount() {
    // DOM is cleared by the shell; only timers need stopping
    terminal?.destroy();
    odometer?.destroy();
    terminal = null;
    odometer = null;
  },
};

export default view;
