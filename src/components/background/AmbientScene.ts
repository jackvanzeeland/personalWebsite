/**
 * Site-wide ambient WebGL background: a slowly drifting particle field
 * themed from the CSS design tokens. Lives in its own async chunk — only
 * ever loaded after first paint via Layout's idle scheduler.
 *
 * Owns its full lifecycle: canvas injection, theme changes, tab visibility,
 * reduced-motion changes, WebGL context loss, and MPA pagehide cleanup.
 */

import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    NormalBlending,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    WebGLRenderer
} from 'three';
import type { GraphicsTier } from '../../utils/capabilities';
import { readSceneTokens } from './themeTokens';

export type AmbientIntensity = 'subtle' | 'full';

export interface AmbientConfig {
    intensity: AmbientIntensity;
    tier: Exclude<GraphicsTier, 'none'>;
}

export interface BackgroundHandle {
    refreshTheme(): void;
    destroy(): void;
}

const VERTEX_SHADER = /* glsl */ `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uPointer;
    uniform float uPointerStrength;
    uniform float uPixelRatio;

    attribute float aSeed;
    attribute float aSize;
    attribute float aMix;

    varying float vMix;
    varying float vFade;

    void main() {
        vMix = aMix;

        vec3 pos = position;
        float t = uTime * 0.12;

        // Organic drift: layered sines per-particle
        pos.x += sin(t + aSeed * 12.56) * 2.2;
        pos.y += cos(t * 0.8 + aSeed * 9.42) * 1.8;
        pos.z += sin(t * 0.6 + aSeed * 6.28) * 2.0;

        // Scroll parallax: deeper particles move slower
        float depth = (pos.z + 60.0) / 60.0; // 0 (far) .. 1 (near)
        pos.y += uScroll * depth * 4.0;

        // Gentle pointer repulsion in NDC-ish space
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vec2 screen = mv.xy / -mv.z;
        vec2 away = screen - uPointer;
        float dist = length(away);
        float force = smoothstep(0.35, 0.0, dist) * uPointerStrength;
        mv.xy += normalize(away + 0.0001) * force * 6.0;

        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (42.0 / -mv.z);

        // Fade far particles for depth
        vFade = smoothstep(-70.0, -8.0, mv.z);
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    precision mediump float;

    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uOpacity;

    varying float vMix;
    varying float vFade;

    void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.05, d) * uOpacity * vFade;
        if (alpha < 0.003) discard;

        vec3 color = vMix < 0.5
            ? mix(uColorA, uColorB, vMix * 2.0)
            : mix(uColorB, uColorC, (vMix - 0.5) * 2.0);

        gl_FragColor = vec4(color, alpha);
    }
`;

function particleCount(cfg: AmbientConfig): number {
    if (cfg.tier === 'low') return 350;
    return cfg.intensity === 'full' ? 1300 : 750;
}

export function createAmbientScene(cfg: AmbientConfig): BackgroundHandle | null {
    const canvas = document.createElement('canvas');
    canvas.className = 'ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    let renderer: WebGLRenderer;
    try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
        return null;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, cfg.tier === 'low' ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 120);
    camera.position.z = 1;

    // Geometry: particles scattered in a slab behind the camera plane
    const count = particleCount(cfg);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const mixes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = -8 - Math.random() * 55;
        seeds[i] = Math.random();
        sizes[i] = 6 + Math.random() * 16;
        mixes[i] = Math.random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aMix', new BufferAttribute(mixes, 1));

    const material = new ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        uniforms: {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uPointer: { value: { x: 10, y: 10 } },
            uPointerStrength: { value: cfg.tier === 'high' ? 1 : 0 },
            uPixelRatio: { value: pixelRatio },
            uColorA: { value: new Color() },
            uColorB: { value: new Color() },
            uColorC: { value: new Color() },
            uOpacity: { value: 0.5 }
        }
    });

    const points = new Points(geometry, material);
    scene.add(points);

    function applyTheme(): void {
        const tokens = readSceneTokens();
        (material.uniforms.uColorA.value as Color).copy(tokens.colorA);
        (material.uniforms.uColorB.value as Color).copy(tokens.colorB);
        (material.uniforms.uColorC.value as Color).copy(tokens.colorC);
        // Additive glow reads beautifully on dark; normal blending with lower
        // opacity keeps light mode airy instead of washed out.
        material.blending = tokens.isDark ? AdditiveBlending : NormalBlending;
        material.uniforms.uOpacity.value = tokens.isDark
            ? (cfg.intensity === 'full' ? 0.55 : 0.4)
            : (cfg.intensity === 'full' ? 0.38 : 0.28);
        material.needsUpdate = true;
    }
    applyTheme();

    function resize(): void {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();

    document.body.prepend(canvas);
    document.documentElement.setAttribute('data-ambient-active', '');

    // ── Animation loop ────────────────────────────────────────────────────
    let raf = 0;
    let running = false;
    let destroyed = false;
    let lastFrame = 0;
    const frameInterval = cfg.tier === 'low' ? 1000 / 30 : 0;
    const start = performance.now();
    const pointerTarget = { x: 10, y: 10 };

    function tick(now: number): void {
        if (!running) return;
        raf = requestAnimationFrame(tick);
        if (frameInterval && now - lastFrame < frameInterval) return;
        lastFrame = now;

        material.uniforms.uTime.value = (now - start) / 1000;
        material.uniforms.uScroll.value = window.scrollY / Math.max(window.innerHeight, 1);
        const p = material.uniforms.uPointer.value as { x: number; y: number };
        p.x += (pointerTarget.x - p.x) * 0.06;
        p.y += (pointerTarget.y - p.y) * 0.06;

        renderer.render(scene, camera);
    }

    function play(): void {
        if (running || destroyed) return;
        running = true;
        raf = requestAnimationFrame(tick);
    }

    function pause(): void {
        running = false;
        cancelAnimationFrame(raf);
    }

    // ── Event wiring ──────────────────────────────────────────────────────
    const onVisibility = (): void => {
        if (document.hidden) pause();
        else play();
    };
    const onPointer = (e: PointerEvent): void => {
        // Convert to the same screen space used in the vertex shader
        const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
        const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
        const scale = Math.tan((camera.fov * Math.PI) / 360);
        pointerTarget.x = ndcX * scale * camera.aspect;
        pointerTarget.y = ndcY * scale;
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

    const onThemeChange = (): void => applyTheme();

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('themechange', onThemeChange);
    if (cfg.tier === 'high') window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pagehide', onPageHide);
    canvas.addEventListener('webglcontextlost', onContextLost);
    reducedMotion.addEventListener('change', onMotionChange);

    function destroy(): void {
        if (destroyed) return;
        destroyed = true;
        pause();
        document.removeEventListener('visibilitychange', onVisibility);
        document.removeEventListener('themechange', onThemeChange);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pagehide', onPageHide);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        reducedMotion.removeEventListener('change', onMotionChange);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
        document.documentElement.removeAttribute('data-ambient-active');
    }

    play();

    return { refreshTheme: applyTheme, destroy };
}
