/**
 * The persistent particle stage. One renderer, one particle system, alive
 * for the whole SPA session. Views request formations; the director morphs
 * ~4000 particles between them with staggered easing and an accent recolor.
 *
 * Lifecycle guardrails carried over from the PR #1 AmbientScene:
 * tab-hidden pause, live reduced-motion opt-out, WebGL context loss,
 * pagehide cleanup, pixel-ratio clamp, low-tier 30fps cap.
 */

import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    WebGLRenderer
} from 'three';
import { getGraphicsTier, GraphicsTier } from '../utils/capabilities';
import { Formation, FormationBuilder, seededRandom } from './formationTypes';

export interface SceneDirector {
    morphTo(builder: FormationBuilder): void;
    pause(): void;
    resume(): void;
    destroy(): void;
}

const MORPH_MS = 1600;

const VERTEX_SHADER = /* glsl */ `
    uniform float uTime;
    uniform float uMorph;
    uniform vec2 uPointer;
    uniform float uPointerStrength;
    uniform float uPixelRatio;
    uniform float uScroll;

    attribute vec3 aStart;
    attribute vec3 aTarget;
    attribute float aSeed;
    attribute float aSize;
    attribute float aMix;

    varying float vMix;
    varying float vFade;

    void main() {
        float p = clamp(uMorph * (1.35 + aSeed * 0.4) - aSeed * 0.4, 0.0, 1.0);
        p = p * p * (3.0 - 2.0 * p);

        vec3 pos = mix(aStart, aTarget, p);

        // Idle drift
        pos.x += sin(uTime * 0.4 + aSeed * 40.0) * 0.5;
        pos.y += cos(uTime * 0.5 + aSeed * 30.0) * 0.5;

        // Scroll parallax: deeper particles trail
        float depth = clamp((pos.z + 30.0) / 60.0, 0.0, 1.0);
        pos.y += uScroll * depth * 6.0;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);

        // Pointer repulsion in view space
        vec2 screen = mv.xy / -mv.z;
        vec2 away = screen - uPointer;
        float dist = length(away);
        float force = smoothstep(0.30, 0.0, dist) * uPointerStrength;
        mv.xy += normalize(away + 0.0001) * force * 4.0;

        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (36.0 / -mv.z);
        vMix = aMix;
        vFade = smoothstep(-80.0, -10.0, mv.z);
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    precision mediump float;

    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uAccent;
    uniform float uOpacity;

    varying float vMix;
    varying float vFade;

    void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.08, d) * uOpacity * vFade;
        if (alpha < 0.004) discard;

        vec3 base = mix(uColorA, uColorB, vMix);
        vec3 color = mix(base, uAccent, 0.45);
        gl_FragColor = vec4(color, alpha);
    }
`;

class Director implements SceneDirector {
    private renderer: WebGLRenderer;
    private scene = new Scene();
    private camera: PerspectiveCamera;
    private geometry = new BufferGeometry();
    private material: ShaderMaterial;
    private count: number;
    private tier: Exclude<GraphicsTier, 'none'>;
    private canvas: HTMLCanvasElement;

    private raf = 0;
    private running = false;
    private destroyed = false;
    private lastFrame = 0;
    private frameInterval: number;
    private clockStart = performance.now();
    private morphStart = -1e9;

    private accentFrom = new Color('#38bdf8');
    private accentTo = new Color('#38bdf8');

    private pointerTarget = { x: 10, y: 10 };

    private cleanupFns: (() => void)[] = [];

    constructor(container: HTMLElement, tier: Exclude<GraphicsTier, 'none'>) {
        this.tier = tier;
        this.count = tier === 'high' ? 4000 : 1200;
        this.frameInterval = tier === 'low' ? 1000 / 30 : 0;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'scene-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'low-power'
        });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
        this.renderer.setPixelRatio(pixelRatio);

        this.camera = new PerspectiveCamera(55, 1, 0.1, 200);
        this.camera.position.z = 55;

        const rand = seededRandom(20260703);
        const positions = new Float32Array(this.count * 3);
        const starts = new Float32Array(this.count * 3);
        const targets = new Float32Array(this.count * 3);
        const seeds = new Float32Array(this.count);
        const sizes = new Float32Array(this.count);
        const mixes = new Float32Array(this.count);
        for (let i = 0; i < this.count; i++) {
            const x = (rand() - 0.5) * 110;
            const y = (rand() - 0.5) * 70;
            const z = (rand() - 0.5) * 60 - 10;
            starts[i * 3] = targets[i * 3] = x;
            starts[i * 3 + 1] = targets[i * 3 + 1] = y;
            starts[i * 3 + 2] = targets[i * 3 + 2] = z;
            seeds[i] = rand();
            sizes[i] = 4 + rand() * 12;
            mixes[i] = rand();
        }
        this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
        this.geometry.setAttribute('aStart', new BufferAttribute(starts, 3));
        this.geometry.setAttribute('aTarget', new BufferAttribute(targets, 3));
        this.geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
        this.geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
        this.geometry.setAttribute('aMix', new BufferAttribute(mixes, 1));

        this.material = new ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uMorph: { value: 1 },
                uPointer: { value: this.pointerTarget },
                uPointerStrength: { value: tier === 'high' ? 1 : 0 },
                uPixelRatio: { value: pixelRatio },
                uScroll: { value: 0 },
                uColorA: { value: new Color('#7dd3fc') },
                uColorB: { value: new Color('#a5b4fc') },
                uAccent: { value: new Color('#38bdf8') },
                uOpacity: { value: 0.55 }
            }
        });

        this.scene.add(new Points(this.geometry, this.material));
        container.appendChild(this.canvas);

        this.resize();
        this.wireEvents();
        this.play();
    }

    private wireEvents(): void {
        const on = (
            target: Window | Document | HTMLCanvasElement | MediaQueryList,
            type: string,
            fn: EventListenerOrEventListenerObject,
            opts?: AddEventListenerOptions
        ): void => {
            (target as EventTarget).addEventListener(type, fn, opts);
            this.cleanupFns.push(() => (target as EventTarget).removeEventListener(type, fn));
        };

        on(window, 'resize', () => this.resize());
        on(document, 'visibilitychange', () => {
            if (document.hidden) this.pause();
            else this.resume();
        });
        on(window, 'pagehide', () => this.destroy());
        on(this.canvas, 'webglcontextlost', (e) => {
            e.preventDefault();
            this.destroy();
        });

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        on(reducedMotion, 'change', () => {
            if (reducedMotion.matches) this.destroy();
        });

        if (this.tier === 'high') {
            on(window, 'pointermove', ((e: PointerEvent) => {
                const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
                const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
                const scale = Math.tan((this.camera.fov * Math.PI) / 360);
                this.pointerTarget.x = ndcX * scale * this.camera.aspect;
                this.pointerTarget.y = ndcY * scale;
            }) as EventListener, { passive: true });
        }
    }

    private resize(): void {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    /** Same easing as the vertex shader — used to snapshot mid-morph positions. */
    private easedProgress(seed: number, morph: number): number {
        const p = Math.min(Math.max(morph * (1.35 + seed * 0.4) - seed * 0.4, 0), 1);
        return p * p * (3 - 2 * p);
    }

    morphTo(builder: FormationBuilder): void {
        if (this.destroyed) return;
        const formation: Formation = builder(this.count, this.camera.aspect);

        const starts = this.geometry.getAttribute('aStart') as BufferAttribute;
        const targets = this.geometry.getAttribute('aTarget') as BufferAttribute;
        const seeds = this.geometry.getAttribute('aSeed') as BufferAttribute;
        const morph = this.material.uniforms.uMorph.value as number;

        // Freeze current interpolated positions as the new starting point
        for (let i = 0; i < this.count; i++) {
            const p = this.easedProgress(seeds.getX(i), morph);
            for (let axis = 0; axis < 3; axis++) {
                const s = starts.array[i * 3 + axis] as number;
                const t = targets.array[i * 3 + axis] as number;
                (starts.array as Float32Array)[i * 3 + axis] = s + (t - s) * p;
                (targets.array as Float32Array)[i * 3 + axis] = formation.targets[i * 3 + axis];
            }
        }
        starts.needsUpdate = true;
        targets.needsUpdate = true;

        this.accentFrom.copy(this.material.uniforms.uAccent.value as Color);
        this.accentTo.set(formation.accent);

        this.material.uniforms.uMorph.value = 0;
        this.morphStart = performance.now();
        this.resume();
    }

    private tick = (now: number): void => {
        if (!this.running) return;
        this.raf = requestAnimationFrame(this.tick);
        if (this.frameInterval && now - this.lastFrame < this.frameInterval) return;
        this.lastFrame = now;

        this.material.uniforms.uTime.value = (now - this.clockStart) / 1000;
        this.material.uniforms.uScroll.value = window.scrollY / Math.max(window.innerHeight, 1);

        const morphT = Math.min((now - this.morphStart) / MORPH_MS, 1);
        this.material.uniforms.uMorph.value = morphT;
        (this.material.uniforms.uAccent.value as Color)
            .copy(this.accentFrom)
            .lerp(this.accentTo, Math.min(morphT * 1.4, 1));

        this.renderer.render(this.scene, this.camera);
    };

    pause(): void {
        this.running = false;
        cancelAnimationFrame(this.raf);
    }

    resume(): void {
        if (this.running || this.destroyed || document.hidden) return;
        this.running = true;
        this.raf = requestAnimationFrame(this.tick);
    }

    private play(): void {
        this.resume();
    }

    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.pause();
        this.cleanupFns.forEach((fn) => fn());
        this.cleanupFns = [];
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        this.canvas.remove();
        if (director === this) director = null;
    }
}

let director: Director | null = null;
let pendingBuilder: FormationBuilder | null = null;

export function getDirector(): SceneDirector | null {
    return director;
}

/** Latest request wins; applied immediately if the director is alive. */
export function requestFormation(builder: FormationBuilder): void {
    pendingBuilder = builder;
    director?.morphTo(builder);
}

/** Called by scene/stage.ts once three.js is loaded. Tier is re-checked here. */
export function createDirector(): void {
    if (director) return;
    const tier = getGraphicsTier();
    if (tier === 'none') return;
    const root = document.getElementById('scene-root');
    if (!root) return;
    try {
        director = new Director(root, tier);
    } catch {
        director = null;
        return;
    }
    if (pendingBuilder) director.morphTo(pendingBuilder);
}
