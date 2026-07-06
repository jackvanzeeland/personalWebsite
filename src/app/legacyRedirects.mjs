/**
 * Old-site URLs → new SPA paths. THE single source of truth:
 *  - src/app/router.ts consumes it for client-side redirects
 *  - scripts/generate-redirects.mjs bakes it into the CloudFront function
 *  - tests/redirects-sync.test.ts keeps the two in lockstep
 * Keys are normalized: no .html suffix, no trailing slash.
 */

export const LEGACY_MAP = {
    '/index': '/',
    '/pages/about': '/journey',
    '/pages/journey': '/journey',
    '/pages/projects': '/work',
    '/pages/artifacts': '/work',
    '/pages/beyond-the-code': '/beyond',
    '/pages/projects/wordle-solver': '/work/wordle-solver',
    '/pages/projects/secret-santa': '/work/secret-santa',
    '/pages/projects/lyric-animator': '/work/lyric-animator',
    '/pages/projects/budgeting-automation': '/work/budgeting-automation',
    '/pages/projects/basketball-optimization': '/work/basketball-optimization',
    '/pages/artifacts/qr-code-generator': '/work/qr-code-generator',
    '/pages/artifacts/uipath-queue-processor': '/work/uipath-queue-processor',
    '/pages/artifacts/html-gems': '/work/html-gems'
};
