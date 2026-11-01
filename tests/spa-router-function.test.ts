import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Runs the generated CloudFront Function the way CloudFront does: handler(event). */
const source = readFileSync(resolve(__dirname, '../infrastructure/spa-router-function.js'), 'utf8');
const handler = new Function(`${source}\nreturn handler;`)() as (event: unknown) => any;

function request(uri: string, querystring: Record<string, { value: string }> = {}) {
    return handler({ request: { uri, querystring } });
}

describe('CloudFront SPA router function', () => {
    it('serves each page its own prerendered file', () => {
        expect(request('/').uri).toBe('/index.html');
        expect(request('/projects').uri).toBe('/projects/index.html');
        expect(request('/projects/wordle-solver').uri).toBe('/projects/wordle-solver/index.html');
    });

    it('sends unknown paths to a missing object (→ S3 403 → real 404 page)', () => {
        expect(request('/no-such-page').uri).toBe('/no-such-page/index.html');
    });

    it('301s trailing slashes to the canonical URL, keeping the query', () => {
        const res = request('/projects/', { ref: { value: 'li' } });
        expect(res.statusCode).toBe(301);
        expect(res.headers.location.value).toBe('/projects?ref=li');
    });

    it('never redirects off-site via protocol-relative paths', () => {
        for (const uri of ['//evil/', '///evil/', '/\\evil/', '/\\/evil/']) {
            const res = request(uri);
            expect(res.statusCode, uri).toBe(301);
            const location: string = res.headers.location.value;
            expect(location, uri).toMatch(/^\/[^/\\]/);
            expect(location, uri).toBe('/evil');
        }
    });

    it('still 301s legacy URLs', () => {
        const res = request('/pages/about.html');
        expect(res.statusCode).toBe(301);
        expect(res.headers.location.value).toBe('/journey');
    });

    it('passes static assets through untouched', () => {
        expect(request('/bundle/js/main-abc.js').uri).toBe('/bundle/js/main-abc.js');
        expect(request('/sitemap.xml').uri).toBe('/sitemap.xml');
    });
});
