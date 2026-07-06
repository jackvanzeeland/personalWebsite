/**
 * SPA shell entry point.
 * Boots the router, mounts views into #view-root, keeps nav in sync,
 * and schedules the persistent particle scene.
 */

import "../styles/redesign/tokens.css";
import "../styles/redesign/base.css";
import "../styles/redesign/nav.css";
import "../styles/redesign/scene.css";
import "../styles/redesign/footer.css";
import "../styles/redesign/reveal.css";

import { startRouter, RouteName, RouteMatch } from "./router";
import { renderNav } from "./nav";
import { renderFooter } from "./footer";
import { initAchievementTracker } from "./achievementTracker";
import type { View } from "./views/types";
import { markPageAsVisited } from "../utils/journey";
import { initReveals } from "../utils/reveal";
import { scheduleScene } from "../scene/stage";

const viewLoaders: Record<
  Exclude<RouteName, "notFound">,
  () => Promise<{ default: View }>
> = {
  home: () => import("./views/home"),
  work: () => import("./views/projects"),
  workDetail: () => import("./views/workDetail"),
  journey: () => import("./views/journey"),
  beyond: () => import("./views/beyond"),
  contact: () => import("./views/contact"),
};

let currentView: View | null = null;
let mountToken = 0;

async function showRoute(match: RouteMatch): Promise<void> {
  const token = ++mountToken;

  const navRoot = document.getElementById("nav-root");
  if (navRoot) {
    navRoot.replaceChildren(renderNav(match.name));
  }

  const viewRoot = document.getElementById("view-root");
  if (!viewRoot) return;

  currentView?.unmount();
  currentView = null;
  viewRoot.replaceChildren();

  if (match.name === "notFound") {
    const wrap = document.createElement("section");
    wrap.className = "container-x";
    wrap.style.paddingTop = "30vh";
    wrap.style.textAlign = "center";
    const h = document.createElement("h1");
    h.textContent = "Lost in space";
    const p = document.createElement("p");
    p.className = "eyebrow";
    p.textContent = "// 404 — NOTHING AT THESE COORDINATES";
    const back = document.createElement("a");
    back.href = "/";
    back.className = "btn-ghost";
    back.textContent = "Return home";
    wrap.append(p, h, back);
    viewRoot.appendChild(wrap);
    return;
  }

  try {
    const module = await viewLoaders[match.name]();
    // A newer navigation may have superseded this one while loading
    if (token !== mountToken) return;
    currentView = module.default;
    await currentView.mount(viewRoot, match.params);
    initReveals(viewRoot);
    markPageAsVisited();
  } catch (err) {
    console.error("View failed to load:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("footer-root")?.replaceChildren(renderFooter());
  startRouter((match) => {
    void showRoute(match);
  });
  scheduleScene();
  initAchievementTracker();
});
