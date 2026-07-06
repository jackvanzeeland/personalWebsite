/**
 * Fixed minimal nav: JVZ mono wordmark + numbered mono links.
 * Re-rendered by the shell on each route change for active state.
 */

import type { RouteName } from "./router";

const LINKS: { label: string; href: string; matches: RouteName[] }[] = [
  { label: "01 HOME", href: "/", matches: ["home"] },
  { label: "02 PROJECTS", href: "/projects", matches: ["work", "workDetail"] },
  { label: "03 JOURNEY", href: "/journey", matches: ["journey"] },
  { label: "04 BEYOND", href: "/beyond", matches: ["beyond"] },
  { label: "05 CONTACT", href: "/contact", matches: ["contact"] },
];

export function renderNav(active: RouteName): HTMLElement {
  const nav = document.createElement("div");
  nav.className = "site-nav";

  const brand = document.createElement("a");
  brand.href = "/";
  brand.className = "site-nav-brand";
  brand.textContent = "JVZ";
  brand.setAttribute("aria-label", "Jack Van Zeeland — home");
  nav.appendChild(brand);

  const list = document.createElement("div");
  list.className = "site-nav-links";
  for (const link of LINKS) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (link.matches.includes(active)) {
      a.setAttribute("aria-current", "page");
    }
    list.appendChild(a);
  }
  nav.appendChild(list);

  const toggle = document.createElement("button");
  toggle.className = "site-nav-toggle";
  toggle.setAttribute("aria-label", "Toggle navigation");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = "<span></span><span></span>";
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.appendChild(toggle);

  return nav;
}
