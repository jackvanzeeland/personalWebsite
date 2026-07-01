/**
 * Homepage hero centerpiece: particles that drift in and assemble into a
 * giant "JVZ" monogram watermark behind the hero content, scattering away
 * from the cursor. Shares the three.js chunk with AmbientScene.
 *
 * Layering (see src/styles/main.css .hero-section): canvas sits at z-index 1,
 * above the ::before overlay, below the z-index-2 .container — hero text and
 * CTAs stay readable and clickable from first paint.
 */

import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    OrthographicCamera,
    Points,
    Scene,
    ShaderMaterial,
    WebGLRenderer
} from 'three';
import type { GraphicsTier } from '../../utils/capabilities';
import { readSceneTokens } from './themeTokens';

export interface HeroParticlesHandle {
    destroy(): void;
}

const VERTEX_SHADER = /* glsl */ `
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uPointer;
    uniform float uPointerStrength;
    uniform float uPixelRatio;

    attribute vec2 aStart;
    attribute vec2 aTarget;
    attribute float aSeed;
    attribute float aSize;

    varying float vSeed;
    varying float vFormed;

    void main() {
        // Per-particle staggered ease toward formation
        float p = clamp(uProgress * (1.35 + aSeed * 0.4) - aSeed * 0.4, 0.0, 1.0);
        p = p * p * (3.0 - 2.0 * p);
        vFormed = p;

        vec2 pos = mix(aStart, aTarget, p);

        // Breathing wobble once (mostly) formed
        pos.x += sin(uTime * 0.9 + aSeed * 40.0) * 2.4 * p;
        pos.y += cos(uTime * 1.1 + aSeed * 30.0) * 2.4 * p;

        // Cursor repulsion (pixel space)
        vec2 away = pos - uPointer;
        float dist = length(away);
        float force = smoothstep(130.0, 0.0, dist) * uPointerStrength;
        pos += normalize(away + vec2(0.0001)) * force * 55.0;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
        gl_PointSize = aSize * uPixelRatio;
        vSeed = aSeed;
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    precision mediump float;

    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uOpacity;

    varying float vSeed;
    varying float vFormed;

    void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.12, d) * uOpacity * (0.35 + 0.65 * vFormed);
        if (alpha < 0.004) discard;
        vec3 color = mix(uColorA, uColorB, vSeed);
        gl_FragColor = vec4(color, alpha);
    }
`;

/** Rasterize the monogram and sample it into particle target positions. */
function sampleMonogram(text: string, width: number, height: number, count: number): Float32Array | null {
    const canvas = document.createElement('canvas');
    // Sample at half resolution — plenty for particle targets
    const sw = Math.max(160, Math.floor(width / 2));
    const sh = Math.max(90, Math.floor(height / 2));
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Fit the text to ~82% of the width
    let fontSize = sh * 0.9;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    do {
        ctx.font = `900 ${fontSize}px -apple-system, "Segoe UI", Roboto, sans-serif`;
        if (ctx.measureText(text).width <= sw * 0.82) break;
        fontSize *= 0.94;
    } while (fontSize > 8);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, sw / 2, sh / 2);

    const pixels = ctx.getImageData(0, 0, sw, sh).data;
    const candidates: number[] = [];
    for (let y = 0; y < sh; y += 2) {
        for (let x = 0; x < sw; x += 2) {
            if (pixels[(y * sw + x) * 4 + 3] > 128) {
                candidates.push(x, y);
            }
        }
    }
    if (candidates.length < 40) return null;

    // Random sample `count` targets, mapped to centered pixel space
    const targets = new Float32Array(count * 2);
    const pairCount = candidates.length / 2;
    const scaleX = width / sw;
    const scaleY = height / sh;
    for (let i = 0; i < count; i++) {
        const pick = Math.floor(Math.random() * pairCount) * 2;
        targets[i * 2] = (candidates[pick] - sw / 2) * scaleX;
        targets[i * 2 + 1] = -(candidates[pick + 1] - sh / 2) * scaleY;
    }
    return targets;
}

export function createHeroParticles(
    section: HTMLElement,
    tier: Exclude<GraphicsTier, 'none'>
): HeroParticlesHandle | null {
    const width = section.clientWidth;
    const height = section.clientHeight;
    if (width < 200 || height < 200) return null;

    const count = tier === 'high' ? 3200 : 1500;
    const targets = sampleMonogram('JVZ', width, height, count);
    if (!targets) return null;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    let renderer: WebGLRenderer;
    try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
        return null;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);

    const scene = new Scene();
    const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10);
    camera.position.z = 1;

    const starts = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        starts[i * 2] = (Math.random() - 0.5) * width * 1.4;
        starts[i * 2 + 1] = (Math.random() - 0.5) * height * 1.4;
        seeds[i] = Math.random();
        sizes[i] = 2.2 + Math.random() * 3.4;
    }

    const geometry = new BufferGeometry();
    // Points needs a `position` attribute even though the shader derives
    // its own; give it zeroed 3D positions to keep three happy.
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aStart', new BufferAttribute(starts, 2));
    geometry.setAttribute('aTarget', new BufferAttribute(targets, 2));
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));

    const tokens = readSceneTokens();
    const material = new ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uPointer: { value: { x: -9999, y: -9999 } },
            uPointerStrength: { value: tier === 'high' ? 1 : 0 },
            uPixelRatio: { value: pixelRatio },
            // Over the hero gradient both themes read best in light tones
            uColorA: { value: new Color('#ffffff') },
            uColorB: { value: new Color().copy(tokens.colorC) },
            uOpacity: { value: 0.8 }
        }
    });

    const points = new Points(geometry, material);
    scene.add(points);
    section.appendChild(canvas);

    // ── Loop ──────────────────────────────────────────────────────────────
    let raf = 0;
    let running = false;
    let destroyed = false;
    let visible = true;
    const start = performance.now();
    const FORM_DELAY = 350; // ms before assembly starts
    const FORM_DURATION = 2400;
    const pointerTarget = { x: -9999, y: -9999 };

    function tick(now: number): void {
        if (!running) return;
        raf = requestAnimationFrame(tick);

        const elapsed = now - start;
        material.uniforms.uTime.value = elapsed / 1000;
        material.uniforms.uProgress.value = Math.min(Math.max((elapsed - FORM_DELAY) / FORM_DURATION, 0), 1);

        const p = material.uniforms.uPointer.value as { x: number; y: number };
        p.x += (pointerTarget.x - p.x) * 0.12;
        p.y += (pointerTarget.y - p.y) * 0.12;

        renderer.render(scene, camera);

        // Low tier: once formed, settle into a static frame to save battery
        if (tier === 'low' && material.uniforms.uProgress.value >= 1 && elapsed > FORM_DELAY + FORM_DURATION + 1200) {
            pause();
        }
    }

    function play(): void {
        if (running || destroyed || !visible) return;
        running = true;
        raf = requestAnimationFrame(tick);
    }

    function pause(): void {
        running = false;
        cancelAnimationFrame(raf);
    }

    // ── Events ────────────────────────────────────────────────────────────
    const onPointer = (e: PointerEvent): void => {
        const rect = section.getBoundingClientRect();
        pointerTarget.x = e.clientX - rect.left - rect.width / 2;
        pointerTarget.y = -(e.clientY - rect.top - rect.height / 2);
    };
    const onPointerLeave = (): void => {
        pointerTarget.x = -9999;
        pointerTarget.y = -9999;
    };
    const onVisibility = (): void => {
        if (document.hidden) pause();
        else play();
    };
    const onPageHide = (): void => destroy();
    const onContextLost = (e: Event): void => {
        e.preventDefault();
        destroy();
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (): void => {
        if (reducedMotion.matches) destroy();
    };

    // Stop rendering when the hero scrolls out of view
    const observer = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (!visible) pause();
        else if (tier === 'high') play();
    }, { threshold: 0.02 });
    observer.observe(section);

    if (tier === 'high') {
        section.addEventListener('pointermove', onPointer, { passive: true });
        section.addEventListener('pointerleave', onPointerLeave, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    canvas.addEventListener('webglcontextlost', onContextLost);
    reducedMotion.addEventListener('change', onMotionChange);

    function destroy(): void {
        if (destroyed) return;
        destroyed = true;
        pause();
        observer.disconnect();
        section.removeEventListener('pointermove', onPointer);
        section.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        reducedMotion.removeEventListener('change', onMotionChange);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
    }

    play();

    return { destroy };
}
