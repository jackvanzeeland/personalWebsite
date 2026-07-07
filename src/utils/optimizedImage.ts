/**
 * Runtime helpers for the build-time image pipeline (scripts/optimize-images.mjs).
 *
 * Images listed in the generated manifest have AVIF/WebP variants under
 * /assets/images/opt/. These helpers wrap an <img> in a <picture> with the
 * right srcsets; images without variants fall back to a plain <img>.
 */

import { imageManifest } from '../generated/imageManifest';

const OPT_BASE = '/assets/images/opt';

/**
 * Project images are usually a bare filename resolved under /assets/images/
 * and run through the build-time optimizer. A few entries point at a live
 * app's own hosted icon instead — those are already-absolute URLs and must
 * be used as-is (no local variants exist for them).
 */
export function resolveImageSrc(image: string): string {
    return /^https?:\/\//.test(image) ? image : `/assets/images/${image}`;
}

interface OptimizedImageOptions {
    alt: string;
    className?: string;
    sizes?: string;
    loading?: 'lazy' | 'eager';
    onError?: (img: HTMLImageElement) => void;
}

function variantStem(src: string): string {
    return src
        .replace('/assets/images/', '')
        .replace(/\.(png|jpe?g)$/i, '');
}

function srcset(src: string, ext: 'avif' | 'webp', widths: number[]): string {
    const stem = variantStem(src);
    return widths.map((w) => `${OPT_BASE}/${stem}-${w}.${ext} ${w}w`).join(', ');
}

/**
 * Create a <picture> (or plain <img> when no variants exist) for the given
 * original image path, e.g. "/assets/images/woku.png".
 */
export function createOptimizedPicture(src: string, options: OptimizedImageOptions): HTMLElement {
    const { alt, className, sizes = '100vw', loading = 'lazy', onError } = options;
    const entry = imageManifest[src];

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = loading;
    if (className) img.className = className;
    if (entry) {
        img.width = entry.width;
        img.height = entry.height;
    }
    if (onError) img.addEventListener('error', () => onError(img));

    if (!entry) return img;

    const picture = document.createElement('picture');
    for (const ext of ['avif', 'webp'] as const) {
        const source = document.createElement('source');
        source.type = `image/${ext}`;
        source.srcset = srcset(src, ext, entry.widths);
        source.sizes = sizes;
        picture.appendChild(source);
    }
    picture.appendChild(img);
    return picture;
}

/**
 * Same as createOptimizedPicture but returns an HTML string, for components
 * that build their DOM via template literals (e.g. PhotoGallery).
 */
export function optimizedPictureHTML(
    src: string,
    options: Omit<OptimizedImageOptions, 'onError'>
): string {
    const { alt, className = '', sizes = '100vw', loading = 'lazy' } = options;
    const entry = imageManifest[src];

    const dims = entry ? `width="${entry.width}" height="${entry.height}"` : '';
    const imgTag = `<img src="${src}" alt="${alt}" class="${className}" loading="${loading}" ${dims}>`;
    if (!entry) return imgTag;

    return `<picture>
        <source type="image/avif" srcset="${srcset(src, 'avif', entry.widths)}" sizes="${sizes}">
        <source type="image/webp" srcset="${srcset(src, 'webp', entry.widths)}" sizes="${sizes}">
        ${imgTag}
    </picture>`;
}
