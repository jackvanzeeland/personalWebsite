/**
 * Build-time prerender: turns the SPA shell into one real HTML file per page.
 *
 * Crawlers and link-preview bots (LinkedIn, Slack, iMessage, X) mostly don't
 * run JavaScript, so without this every URL served the same empty shell with
 * the home page's title and a canonical pointing at "/".
 *
 * For each route in src/site/routes.ts this mounts the real view module in
 * happy-dom (the same DOM environment the test suite uses), bakes in the head
 * from src/app/seo.ts, and writes dist/<route>/index.html. In the browser,
 * main.ts mounts over the prerendered markup as usual, so behavior is
 * unchanged for visitors. Also writes dist/sitemap.xml from the same list.
 *
 * Run after `vite build` (see package.json "build"):
 *   vite-node scripts/prerender.ts
 */

import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinEnvironments } from 'vitest/environments';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://jackvanzeeland.com';

const MIME: Record<string, string> = {
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.csv': 'text/csv'
};

/** Source files whose last commit date stands in for each page's lastmod. */
const SOURCES: Record<string, string[]> = {
    home: ['src/app/views/home.ts'],
    work: ['src/app/views/projects.ts', 'src/data/projects.ts'],
    workDetail: ['src/app/views/workDetail.ts', 'src/data/projects.ts'],
    journey: ['src/app/views/journey.ts', 'public/data/timeline.json'],
    beyond: ['src/app/views/beyondContent.ts', 'src/components/PhotoGallery.js'],
    contact: ['src/app/views/contact.ts']
};

function gitDate(files: string[]): string | undefined {
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], {
            cwd: ROOT,
            stdio: ['ignore', 'pipe', 'ignore']
        })
            .toString()
            .trim();
        return out || undefined;
    } catch {
        return undefined;
    }
}

function between(html: string, open: RegExp, close: string): string {
    const m = html.match(open);
    if (!m || m.index === undefined) throw new Error(`prerender: template is missing ${open}`);
    const start = m.index + m[0].length;
    const end = html.indexOf(close, start);
    if (end < 0) throw new Error(`prerender: template is missing ${close}`);
    return html.slice(start, end);
}

/** Let pending fetches/microtasks (timeline, wordle lists, gallery) finish. */
async function settle(): Promise<void> {
    for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 20));
}

async function main(): Promise<void> {
    const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
    const headHtml = between(template, /<head[^>]*>/, '</head>');
    const bodyHtml = between(template, /<body[^>]*>/, '</body>');
    const htmlTag = template.match(/<html([^>]*)>/)?.[1] ?? '';
    const htmlAttrs = [...htmlTag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]] as const);
    if (!htmlAttrs.some(([name]) => name === 'lang')) throw new Error('prerender: template <html> has no lang');

    // happy-dom reports each deliberately skipped iframe/bundle load; that's expected here
    const consoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
        if (/loading is disabled/.test(String(args[0]))) return;
        consoleError(...args);
    };

    // Node's Response, captured before happy-dom replaces the globals
    const NodeResponse = globalThis.Response;

    await builtinEnvironments['happy-dom'].setup(globalThis, {
        happyDOM: {
            url: `${SITE_URL}/`,
            settings: {
                disableJavaScriptEvaluation: true, // inline <script>s stay inert
                disableJavaScriptFileLoading: true,
                disableCSSFileLoading: true,
                disableIframePageLoading: true, // YouTube/Spotify embeds
                disableComputedStyleRendering: true,
                handleDisabledFileLoadingAsSuccess: true // don't error on the skipped bundle/CSS
            }
        }
    });

    // Views fetch site data (/data/timeline.json, /files/*.json): serve it from dist/
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const url = new URL(raw, SITE_URL);
        if (url.origin !== SITE_URL) throw new Error(`prerender: refusing external fetch ${url.href}`);
        const file = path.join(DIST, decodeURIComponent(url.pathname));
        const body = await fs.readFile(file);
        return new NodeResponse(body, {
            status: 200,
            headers: { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' }
        });
    }) as typeof fetch;

    const { routeMeta } = await import('../src/app/routeMeta');
    const { applySeo, routeSeo, projectSeo, absoluteUrl } = await import('../src/app/seo');
    const { renderNav } = await import('../src/app/nav');
    const { renderFooter } = await import('../src/app/footer');
    const { viewLoaders } = await import('../src/app/views/registry');
    const { WORK_ITEMS } = await import('../src/data/workItems');
    const { prerenderRoutes, cdnOwnedProjectPaths, outputFileFor } = await import('../src/site/routes');
    const { buildSitemap } = await import('../src/site/sitemap');

    const infra = await fs.readFile(path.join(ROOT, 'infrastructure.yaml'), 'utf8');
    const routes = prerenderRoutes(WORK_ITEMS, cdnOwnedProjectPaths(infra));
    const win = globalThis.window as unknown as { happyDOM: { setURL(url: string): void } };
    const titles = new Set<string>();

    for (const route of routes) {
        win.happyDOM.setURL(`${SITE_URL}${route.path}`);
        for (const attr of [...document.documentElement.attributes]) {
            document.documentElement.removeAttribute(attr.name);
        }
        htmlAttrs.forEach(([name, value]) => document.documentElement.setAttribute(name, value));
        document.head.innerHTML = headHtml;
        document.body.innerHTML = bodyHtml;

        document.getElementById('nav-root')?.replaceChildren(renderNav(route.name));
        document.getElementById('footer-root')?.replaceChildren(renderFooter());
        const viewRoot = document.getElementById('view-root');
        if (!viewRoot) throw new Error('prerender: template has no #view-root');

        const view = (await viewLoaders[route.name]()).default;
        await view.mount(viewRoot, route.params);
        await settle();

        const seo = route.item ? projectSeo(route.item) : routeSeo(route.name, route.path);
        applySeo(document, seo);
        document.documentElement.style.setProperty('--accent', routeMeta[route.name].accent);

        const html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}\n`;
        view.unmount();

        // Guard rails: a broken page should fail the build, not ship silently
        const canonical = `<link rel="canonical" href="${absoluteUrl(seo.path)}">`;
        if (!html.includes(canonical)) throw new Error(`prerender: ${route.path} has the wrong canonical`);
        if (!/<h1[\s>]/.test(html)) throw new Error(`prerender: ${route.path} rendered no <h1>`);
        if (titles.has(seo.title)) throw new Error(`prerender: duplicate <title> "${seo.title}"`);
        titles.add(seo.title);

        const out = path.join(DIST, outputFileFor(route.path));
        await fs.mkdir(path.dirname(out), { recursive: true });
        await fs.writeFile(out, html);
    }

    const sitemap = buildSitemap(
        routes.map((r) => ({ path: r.path, lastmod: gitDate(SOURCES[r.name] ?? []) }))
    );
    await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

    console.log(`prerender: ${routes.length} pages + sitemap.xml → dist/`);
}

// Top-level await: vite-node shuts its module server down once the script's
// top level settles, so main() must finish before that happens.
try {
    await main();
    process.exit(0); // views may leave timers running in happy-dom
} catch (err) {
    console.error(err);
    process.exit(1);
}
