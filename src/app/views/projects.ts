/**
 * /projects — an "Apps" shelf of the live, in-use apps, then a compact,
 * filterable index of everything else with a hover preview.
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { latticeBuilder } from "../../scene/formations/lattice";
import {
  APP_ITEMS,
  INDEX_ITEMS,
  indexWorkTags,
  WorkItem,
  workItemHref,
} from "../../data/workItems";
import {
  createOptimizedPicture,
  resolveImageSrc,
} from "../../utils/optimizedImage";
import "../../styles/redesign/work.css";

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

function sectionHead(title: string, meta: HTMLElement): HTMLElement {
  const head = el("div", "section-head");
  head.append(el("h2", "section-head-title", title), meta);
  return head;
}

/** Kind label for an index row: interactive tools first, then artifact/project. */
function kindLabel(item: WorkItem): string {
  if (item.tool) return "● INTERACTIVE";
  if (item.kind === "artifact") return "ARTIFACT";
  const topic = item.tags.find((t) => t !== "Artifact");
  return topic ? `PROJECT · ${topic.toUpperCase()}` : "PROJECT";
}

function renderAppTile(item: WorkItem): HTMLElement {
  const tile = el("article", "work-app panel");
  tile.setAttribute("data-reveal", "");

  const icon = el("div", "work-app-icon");
  if (item.image) {
    icon.appendChild(
      createOptimizedPicture(resolveImageSrc(item.image), {
        alt: "",
        sizes: "72px",
      }),
    );
  }

  const body = el("div", "work-app-body");
  body.append(
    el("h3", "work-app-name", item.title),
    el("p", "work-app-pitch", item.app?.pitch ?? item.description),
  );
  if (item.app?.proof)
    body.appendChild(el("p", "work-app-proof", item.app.proof));

  const links = el("div", "work-app-links");
  const openHref = item.links.external;
  if (openHref) {
    const open = el("a", "work-app-open", "Open app ↗");
    open.href = openHref;
    open.setAttribute("data-external", "");
    if (/^https?:\/\//.test(openHref)) {
      open.target = "_blank";
      open.rel = "noopener noreferrer";
    }
    open.setAttribute("aria-label", `Open ${item.title}`);
    links.appendChild(open);
  }
  // Apps mounted under their own CloudFront behavior (/projects/woku …) shadow
  // the SPA detail route, so there's no story page to link to.
  const dest = workItemHref(item);
  if (!dest.external) {
    const story = el("a", "work-app-story", "The story →");
    story.href = dest.href;
    story.setAttribute("aria-label", `The story behind ${item.title}`);
    links.appendChild(story);
  }
  body.appendChild(links);

  tile.append(icon, body);
  return tile;
}

function renderRow(item: WorkItem): HTMLAnchorElement {
  const row = el("a", "work-row");
  const dest = workItemHref(item);
  row.href = dest.href;
  if (dest.external) row.setAttribute("data-external", "");
  row.dataset.tags = item.tags.join("|");
  row.dataset.slug = item.slug;
  row.setAttribute("data-reveal", "");

  const kind = el("span", "work-row-kind", kindLabel(item));
  if (item.tool) kind.classList.add("work-row-kind-live");

  row.append(
    el("span", "work-row-title", item.title),
    el("span", "work-row-desc", item.description),
    kind,
  );
  const arrow = el("span", "work-row-arrow", "→");
  arrow.setAttribute("aria-hidden", "true");
  row.appendChild(arrow);
  return row;
}

/** Decorative preview panel; screen readers get the same info from the rows. */
function renderPreview(): {
  aside: HTMLElement;
  show: (item: WorkItem) => void;
} {
  const aside = el("aside", "work-preview panel");
  aside.setAttribute("aria-hidden", "true");
  const media = el("div", "work-preview-media");
  const meta = el("p", "work-preview-meta");
  const title = el("p", "work-preview-title");
  const desc = el("p", "work-preview-desc");
  aside.append(media, title, meta, desc);

  let current: string | undefined;
  const show = (item: WorkItem): void => {
    if (current === item.slug) return;
    current = item.slug;
    media.replaceChildren(
      item.image
        ? createOptimizedPicture(resolveImageSrc(item.image), {
            alt: "",
            sizes: "320px",
          })
        : el("span", "work-preview-glyph", "{ }"),
    );
    title.textContent = item.title;
    meta.textContent = item.technologies.slice(0, 4).join(" · ");
    desc.textContent = item.description;
  };
  return { aside, show };
}

const view: View = {
  mount(root) {
    requestFormation(latticeBuilder);

    const section = el("section", "work container-x");
    section.append(
      el("p", "eyebrow", "// PERSONAL PROJECTS"),
      el("h1", undefined, "Built for the fun of it"),
      el(
        "p",
        "work-sub",
        `Side projects, experiments, and tools from my free time — built because I wanted them to exist. ${APP_ITEMS.length} of them are real progressive web apps that I use weekly.`,
      ),
    );

    // Apps shelf
    const apps = el("section", "work-apps");
    apps.setAttribute("aria-labelledby", "work-apps-title");
    const liveMeta = el(
      "p",
      "section-head-meta work-section-meta-live",
      `● ${APP_ITEMS.length} LIVE · IN USE`,
    );
    const appsHead = sectionHead("Apps", liveMeta);
    appsHead.querySelector("h2")!.id = "work-apps-title";
    const shelf = el("div", "work-app-grid");
    APP_ITEMS.forEach((item) => shelf.appendChild(renderAppTile(item)));
    apps.append(appsHead, shelf);
    section.appendChild(apps);

    // Project index
    const index = el("section", "work-index");
    index.setAttribute("aria-labelledby", "work-index-title");
    const filters = el("div", "work-filters");
    filters.setAttribute("role", "group");
    filters.setAttribute("aria-label", "Filter projects by topic");
    const allChip = el("button", "work-chip active", "ALL");
    allChip.type = "button";
    allChip.setAttribute("aria-pressed", "true");
    filters.appendChild(allChip);
    const chips: HTMLButtonElement[] = [allChip];
    for (const tag of indexWorkTags()) {
      const chip = el("button", "work-chip", tag.toUpperCase());
      chip.type = "button";
      chip.dataset.tag = tag;
      chip.setAttribute("aria-pressed", "false");
      filters.appendChild(chip);
      chips.push(chip);
    }
    const indexHead = sectionHead("Projects & experiments", filters);
    indexHead.querySelector("h2")!.id = "work-index-title";

    const layout = el("div", "work-index-layout");
    const list = el("div", "work-rows");
    const rows = INDEX_ITEMS.map((item) => {
      const row = renderRow(item);
      list.appendChild(row);
      return row;
    });
    const bySlug = new Map(INDEX_ITEMS.map((item) => [item.slug, item]));
    const preview = renderPreview();
    if (INDEX_ITEMS[0]) preview.show(INDEX_ITEMS[0]);
    layout.append(list, preview.aside);

    const onRowEnter = (e: Event): void => {
      const row = (e.target as Element).closest(
        "a.work-row",
      ) as HTMLElement | null;
      const item = row?.dataset.slug ? bySlug.get(row.dataset.slug) : undefined;
      if (item) preview.show(item);
    };
    list.addEventListener("mouseover", onRowEnter);
    list.addEventListener("focusin", onRowEnter);

    const count = el("p", "work-count");
    count.setAttribute("aria-live", "polite");
    index.append(indexHead, layout, count);
    section.appendChild(index);

    const applyFilter = (tag: string | null): void => {
      let visible = 0;
      let first: WorkItem | undefined;
      for (const row of rows) {
        const show = !tag || (row.dataset.tags ?? "").split("|").includes(tag);
        row.classList.toggle("work-row-hidden", !show);
        if (show) {
          visible++;
          first ??= bySlug.get(row.dataset.slug ?? "");
        }
      }
      if (first) preview.show(first);
      count.textContent = `${visible} of ${rows.length} shown`;
    };
    applyFilter(null);

    filters.addEventListener("click", (e) => {
      const chip = (e.target as Element).closest(
        "button.work-chip",
      ) as HTMLButtonElement | null;
      if (!chip) return;
      chips.forEach((c) => {
        c.classList.toggle("active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      applyFilter(chip.dataset.tag ?? null);
    });

    root.appendChild(section);
  },

  unmount() {
    /* listeners live on removed nodes; nothing global to clean */
  },
};

export default view;
