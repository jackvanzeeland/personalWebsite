import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { LEGACY_MAP } from '../src/app/legacyRedirects.mjs';
import { legacyRedirect } from '../src/app/router';

const FN_PATH = resolve(__dirname, '../infrastructure/spa-router-function.js');

describe('redirect map sync', () => {
    it('client router honors every legacy entry', () => {
        for (const [from, to] of Object.entries(LEGACY_MAP)) {
            expect(legacyRedirect(from)).toBe(to);
        }
    });

    it('generated CloudFront function contains every legacy entry', () => {
        expect(existsSync(FN_PATH)).toBe(true);
        const fn = readFileSync(FN_PATH, 'utf8');
        for (const [from, to] of Object.entries(LEGACY_MAP)) {
            expect(fn).toContain(`"${from}"`);
            expect(fn).toContain(`"${to}"`);
        }
    });

    it('infrastructure.yaml embeds the same map', () => {
        const yaml = readFileSync(resolve(__dirname, '../infrastructure.yaml'), 'utf8');
        for (const from of Object.keys(LEGACY_MAP)) {
            expect(yaml).toContain(`"${from}"`);
        }
    });
});
