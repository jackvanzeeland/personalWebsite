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
    '/pages/projects': '/projects',
    '/pages/artifacts': '/projects',
    '/pages/beyond-the-code': '/beyond',
    '/pages/projects/wordle-solver': '/projects/wordle-solver',
    '/pages/projects/secret-santa': '/projects/secret-santa',
    '/pages/projects/lyric-animator': '/projects/lyric-animator',
    '/pages/projects/budgeting-automation': '/projects/budgeting-automation',
    '/pages/projects/basketball-optimization': '/projects/basketball-optimization',
    '/pages/artifacts/qr-code-generator': '/projects/qr-code-generator',
    '/pages/artifacts/uipath-queue-processor': '/projects/uipath-queue-processor',
    '/pages/artifacts/html-gems': '/projects/html-gems',
    '/assets/images/JVZLogo.png': '/images/JVZLogo.png',
    '/assets/files/resume.pdf': '/files/resume.pdf'
};
