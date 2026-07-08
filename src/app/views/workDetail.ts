/**
 * /work/:slug — detail view for projects, artifacts, and interactive tools.
 *
 * Static items render a hero + description + links panel.
 * Tool items additionally mount their interactive demo: the original DOM
 * contracts (element ids) are reproduced here so the untouched component
 * classes (WordleSolver, SecretSanta) keep working. The lyric animator
 * pauses the ambient scene while open (it has its own canvas show).
 */

import type { View } from "./types";
import { requestFormation, pauseScene, resumeScene } from "../../scene/stage";
import { latticeBuilder } from "../../scene/formations/lattice";
import { getWorkItem, WorkItem } from "../../data/workItems";
import {
  createOptimizedPicture,
  resolveImageSrc,
} from "../../utils/optimizedImage";
import "../../styles/redesign/work-detail.css";
import "../../styles/components/wordle.css";
import "../../styles/components/secret-santa.css";
import "../../styles/redesign/lyric-animator.css";
import "../../styles/components/qr-generator.css";
import "../../styles/components/uipath-processor.css";
import "../../styles/components/html-gems.css";

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

/* ── Tool demo markup (ids are the components' DOM contracts) ─────────── */

const WORDLE_DEMO = `
  <h2 class="detail-demo-heading">Try it yourself</h2>
  <p class="detail-demo-desc">Enter any 5-letter word and watch the algorithm solve it step by step.</p>
  <div class="wordle-input-row">
    <input type="text" id="wordle-lookup" class="wordle-input" placeholder="type a word" maxlength="5" autocomplete="off" spellcheck="false">
    <button id="wordle-search" class="wordle-solve-btn">Solve</button>
  </div>
  <div id="wordle-error" class="wordle-error" style="display:none;"></div>
  <div id="wordle-results"></div>
`;

const SANTA_DEMO = `
  <h2 class="detail-demo-heading">Try it yourself</h2>
  <p class="detail-demo-desc">Add participants, generate a derangement, and reveal matches one at a time.</p>
  <div class="santa-demo-container">
    <div class="santa-input-row">
      <input type="text" id="name-input" class="santa-input" placeholder="Enter a name..." autocomplete="off">
      <button class="santa-add-btn" id="add-name">Add</button>
    </div>
    <div id="name-list" class="santa-name-list"></div>
    <div class="santa-actions">
      <button class="santa-generate-btn" id="generate-matches" disabled>Generate Matches</button>
      <button class="santa-clear-btn" id="clear-all">Clear All</button>
    </div>
    <div id="santa-results"></div>
  </div>
`;

let cleanupTool: (() => void) | null = null;

async function mountTool(item: WorkItem, host: HTMLElement): Promise<void> {
  if (item.tool === "wordle-solver") {
    const demo = el("div", "panel detail-demo");
    demo.innerHTML = WORDLE_DEMO;
    host.appendChild(demo);
    const { WordleSolver } = await import("../../components/WordleSolver");
    new WordleSolver();
    return;
  }

  if (item.tool === "secret-santa") {
    const demo = el("div", "panel detail-demo");
    demo.innerHTML = SANTA_DEMO;
    host.appendChild(demo);
    const { SecretSanta } = await import("../../components/SecretSanta");
    new SecretSanta();
    return;
  }

  if (item.tool === "lyric-animator") {
    pauseScene();
    const [{ LYRIC_MARKUP }, { initLyricAnimatorCore }] = await Promise.all([
      import("./tools/lyricMarkup"),
      import("./tools/lyricAnimatorCore"),
    ]);
    const wrap = el("div", "detail-lyric");
    wrap.innerHTML = LYRIC_MARKUP;
    host.appendChild(wrap);
    const controller = new AbortController();
    initLyricAnimatorCore(controller.signal);
    cleanupTool = () => {
      controller.abort();
      resumeScene();
    };
    return;
  }

  if (item.tool === "qr-code-generator") {
    const [{ QR_MARKUP }, { initQrGenerator }] = await Promise.all([
      import("./tools/qrMarkup"),
      import("./tools/qrCore"),
    ]);
    const wrap = el("div", "panel detail-demo qr-tool");
    wrap.innerHTML = QR_MARKUP;
    host.appendChild(wrap);
    const controller = new AbortController();
    initQrGenerator(wrap, controller.signal);
    cleanupTool = () => controller.abort();
    return;
  }

  if (item.tool === "uipath-queue-processor") {
    const [{ UIPATH_MARKUP }, { initUipathProcessor }] = await Promise.all([
      import("./tools/uipathMarkup"),
      import("./tools/uipathCore"),
    ]);
    const wrap = el("div", "panel detail-demo uip-tool");
    wrap.innerHTML = UIPATH_MARKUP;
    host.appendChild(wrap);
    const controller = new AbortController();
    initUipathProcessor(wrap, controller.signal);
    cleanupTool = () => controller.abort();
    return;
  }

  if (item.tool === "html-gems") {
    const [{ GEMS_LAYOUT }, { GEMS_CARDS }, { initHtmlGems }] =
      await Promise.all([
        import("./tools/htmlGemsLayout"),
        import("./tools/htmlGemsCards"),
        import("./tools/htmlGemsCore"),
      ]);
    const wrap = el("div", "detail-gems");
    wrap.innerHTML = GEMS_LAYOUT;
    const content = wrap.querySelector<HTMLElement>(".html-gems-content");
    if (content) content.innerHTML = GEMS_CARDS;
    host.appendChild(wrap);
    const controller = new AbortController();
    initHtmlGems(wrap, controller.signal);
    cleanupTool = () => controller.abort();
  }
}

const view: View = {
  async mount(root, params) {
    requestFormation(latticeBuilder);

    const section = el("section", "detail container-x");
    const back = el("a", "detail-back", "← All projects");
    back.href = "/projects";
    section.appendChild(back);

    const item = getWorkItem(params.slug ?? "");
    if (!item) {
      section.append(
        el("p", "eyebrow", "// 404"),
        el("h1", undefined, "No such project"),
        el(
          "p",
          "detail-desc",
          "Nothing lives at this address. The lattice has everything that does.",
        ),
      );
      root.appendChild(section);
      return;
    }

    document.title = `${item.title} — Jack Van Zeeland`;

    const kindRow = el("div", "work-card-kind");
    kindRow.appendChild(
      el("span", `work-kind work-kind-${item.kind}`, item.kind.toUpperCase()),
    );
    if (item.tool)
      kindRow.appendChild(
        el("span", "work-kind work-kind-live", "● INTERACTIVE"),
      );

    const main = el("div", "detail-main");
    main.append(
      kindRow,
      el("h1", undefined, item.title),
      el("p", "detail-desc", item.description),
    );

    if (item.originStory) {
      const story = el("details", "panel detail-story");
      const summary = el("summary", "detail-story-summary");
      summary.appendChild(el("span", "detail-story-label", "The origin story"));
      summary.appendChild(el("span", "detail-story-chevron", "›"));
      story.append(summary, el("p", "detail-story-text", item.originStory));
      main.appendChild(story);
    }

    const tech = el("div", "detail-tech");
    item.technologies.forEach((t) =>
      tech.appendChild(el("span", "work-tag", t)),
    );
    main.appendChild(tech);

    const links = el("div", "detail-links");
    const addLink = (
      href: string | undefined,
      label: string,
      glow = false,
    ): void => {
      if (!href) return;
      const a = el("a", glow ? "btn-glow" : "btn-ghost", label);
      a.href = href;
      a.setAttribute("data-external", "");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      links.appendChild(a);
    };
    addLink(item.links.external ?? item.links.demo, "Open the app ↗", true);
    addLink(item.links.github, "GitHub ↗");
    addLink(item.links.youtube, "YouTube ↗");
    addLink(item.links.tiktok, "TikTok ↗");
    if (links.childElementCount > 0) main.appendChild(links);

    const layout = el("div", "detail-layout");
    layout.appendChild(main);

    if (item.image) {
      const shot = el("div", "panel detail-shot");
      shot.appendChild(
        createOptimizedPicture(resolveImageSrc(item.image), {
          alt: item.title,
          sizes: "220px",
        }),
      );
      layout.appendChild(shot);
    }

    section.appendChild(layout);

    if (item.tool) {
      const toolHost = el("div", "detail-tool-host");
      section.appendChild(toolHost);
      // Attach to the document BEFORE the tool constructors run —
      // they locate their controls via document.getElementById.
      root.appendChild(section);
      await mountTool(item, toolHost);
      return;
    }

    root.appendChild(section);
  },

  unmount() {
    cleanupTool?.();
    cleanupTool = null;
  },
};

export default view;
