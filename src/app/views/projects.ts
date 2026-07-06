/**
 * /work — the unified lattice of projects, artifacts, and interactive tools.
 */

import type { View } from "./types";
import { requestFormation } from "../../scene/stage";
import { latticeBuilder } from "../../scene/formations/lattice";
import {
  WORK_ITEMS,
  allWorkTags,
  WorkItem,
  workItemHref,
} from "../../data/workItems";
import { createOptimizedPicture } from "../../utils/optimizedImage";
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

function renderCard(item: WorkItem): HTMLAnchorElement {
  const card = el("a", "work-card panel");
  const dest = workItemHref(item);
  card.href = dest.href;
  if (dest.external) card.setAttribute("data-external", "");
  card.dataset.tags = item.tags.join("|");
  card.setAttribute("data-reveal", "");

  const imgWrap = el("div", "work-card-img");
  if (item.image) {
    imgWrap.appendChild(
      createOptimizedPicture(`/assets/images/${item.image}`, {
        alt: item.title,
        sizes: "(min-width: 900px) 350px, 100vw",
      }),
    );
  } else {
    imgWrap.classList.add("work-card-img-empty");
    imgWrap.appendChild(el("span", "work-card-glyph", "{ }"));
  }

  const body = el("div", "work-card-body");
  const kindRow = el("div", "work-card-kind");
  kindRow.appendChild(
    el("span", `work-kind work-kind-${item.kind}`, item.kind.toUpperCase()),
  );
  if (item.tool) {
    kindRow.appendChild(
      el("span", "work-kind work-kind-live", "● INTERACTIVE"),
    );
  }
  body.append(
    kindRow,
    el("h3", "work-card-title", item.title),
    el("p", "work-card-desc", item.description),
  );
  const tech = el("div", "work-card-tech");
  item.technologies
    .slice(0, 4)
    .forEach((t) => tech.appendChild(el("span", "home-tag", t)));
  body.appendChild(tech);

  card.append(imgWrap, body);
  return card;
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
        "Side projects, experiments, and tools from my free time — built because I wanted them to exist. Some run right here in the page.",
      ),
    );

    // Filter chips
    const filters = el("div", "work-filters");
    const allChip = el("button", "work-chip active", "ALL");
    filters.appendChild(allChip);
    const chips: HTMLButtonElement[] = [allChip];
    for (const tag of allWorkTags()) {
      const chip = el("button", "work-chip", tag.toUpperCase());
      chip.dataset.tag = tag;
      filters.appendChild(chip);
      chips.push(chip);
    }
    section.appendChild(filters);

    const grid = el("div", "work-grid");
    const cards = WORK_ITEMS.map((item) => {
      const card = renderCard(item);
      grid.appendChild(card);
      return card;
    });
    section.appendChild(grid);

    const count = el("p", "work-count");
    section.appendChild(count);

    const applyFilter = (tag: string | null): void => {
      let visible = 0;
      for (const card of cards) {
        const show = !tag || (card.dataset.tags ?? "").split("|").includes(tag);
        card.classList.toggle("work-card-hidden", !show);
        if (show) visible++;
      }
      count.textContent = `${visible} of ${cards.length} shown`;
    };
    applyFilter(null);

    filters.addEventListener("click", (e) => {
      const chip = (e.target as Element).closest(
        "button.work-chip",
      ) as HTMLButtonElement | null;
      if (!chip) return;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      applyFilter(chip.dataset.tag ?? null);
    });

    root.appendChild(section);
  },

  unmount() {
    /* listeners live on removed nodes; nothing global to clean */
  },
};

export default view;
