/**
 * App icons / logos look broken when cropped to 16:9 with object-fit: cover,
 * so cards (and the generated share images) give them a contained, centered
 * treatment instead of a full-bleed photo.
 */
export function isIconImage(src: string): boolean {
    return /(apple-touch-icon|icon-\d+|[/_-]logo)/i.test(src);
}
