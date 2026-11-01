/**
 * Home view — the 3-second impression.
 * Layout follows the approved mockup:
 * docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html
 * Terminal + odometer hero: docs/superpowers/specs/2026-11-01-home-terminal-hero-design.md
 */

import type { View } from "./types";
import { loadSceneNow, requestFormation, sceneReady } from "../../scene/stage";
import { monogramBuilder } from "../../scene/formations/monogram";
import { createOptimizedPicture } from "../../utils/optimizedImage";
import { prefersReducedMotion } from "../../utils/capabilities";
import { createTerminal, hasBooted, isCompact } from "./homeTerminalView";
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

/** On <html> while the phone monogram is dimmed behind the hero. */
export const SCENE_DIM_CLASS = "home-scene-dim";
/** Particle morph (1600ms in SceneDirector) plus a beat to read it. */
const MONOGRAM_FORM_MS = 1900;
/** Never hold the terminal back longer than this. */
const INTRO_CAP_MS = 2500;

let terminal: { destroy(): void } | null = null;
let odometer: { destroy(): void } | null = null;
let introTimers: ReturnType<typeof setTimeout>[] = [];
let mounted = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    introTimers.push(setTimeout(resolve, ms));
  });
}

function dimScene(): void {
  if (mounted) document.documentElement.classList.add(SCENE_DIM_CLASS);
}

/**
 * Phones stack the hero over the monogram, so there's no empty zone for it.
 * Load the particles right away (skipping the low tier's first-tap wait),
 * let "JVZ" form in the open on the first visit, then dim it to a backdrop
 * and start the terminal. Returns the gate the terminal boot waits on.
 */
function phoneIntro(firstVisit: boolean): Promise<void> | undefined {
  loadSceneNow();
  if (!firstVisit) {
    dimScene();
    return undefined;
  }
  const formed = sceneReady().then((ok) => (ok ? sleep(MONOGRAM_FORM_MS) : undefined));
  return Promise.race([formed, sleep(INTRO_CAP_MS)]).then(dimScene);
}

const view: View = {
  mount(root) {
    requestFormation(monogramBuilder);

    const hero = el("section", "home-hero container-x");
    const heroText = el("div", "home-hero-text");

    const eyebrow = el("p", "eyebrow", "// SOFTWARE ENGINEER — CHICAGO");
    const h1 = el("h1", "home-name");
    h1.append("Jack ", el("br"), "Van Zeeland");
    mounted = true;
    const reducedMotion = prefersReducedMotion();
    const animate = !reducedMotion;
    const startAfter = isCompact() ? phoneIntro(animate && !hasBooted()) : undefined;
    const term = createTerminal({ animate, startAfter });
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
    mounted = false;
    introTimers.forEach(clearTimeout);
    introTimers = [];
    document.documentElement.classList.remove(SCENE_DIM_CLASS);
    terminal?.destroy();
    odometer?.destroy();
    terminal = null;
    odometer = null;
  },
};

export default view;
