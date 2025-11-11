/**
 * Particles.js Configuration for Lyrics Animator V2
 */

// --- Particle.js instance reference ---
let particlesConfig = {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'star' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 3, direction: 'none', random: true }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
    }
};

// Initialize particles
particlesJS('particles-js', particlesConfig);

// Grab V2 controls (with v2- prefix)
const themeColorPicker = document.getElementById('v2-theme-color-picker');
const particleCount = document.getElementById('v2-particle-count');
const particleColor = document.getElementById('v2-particle-color');
const lineColor = document.getElementById('v2-line-color');
const particleSize = document.getElementById('v2-particle-size');
const particleSpeed = document.getElementById('v2-particle-speed');
const particleShape = document.getElementById('v2-particle-shape');

// Helper: reload particles with updated config
function reloadParticles() {
    // Ensure pJSDom is initialized as an array
    if (window.pJSDom === null || window.pJSDom === undefined) {
        window.pJSDom = [];
    }

    // Clear existing particle system
    if (window.pJSDom.length > 0) {
        const container = document.getElementById('particles-js');
        if (container) {
            container.innerHTML = '';
        } else {
            console.error('Particles container (#particles-js) not found.');
            return;
        }
        window.pJSDom = [];
    }

    // Reinitialize with the updated particlesConfig
    window.particlesJS('particles-js', particlesConfig);
}

// Color conversion helpers
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
}

function hexToHsl(hex) {
    let { r, g, b } = hexToRgb(hex);
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

// 🎨 V2 Theme color picker -> update theme variables
if (themeColorPicker) {
    themeColorPicker.addEventListener('input', e => {
        const baseHex = e.target.value;
        const baseHsl = hexToHsl(baseHex);
        const primaryRgb = hexToRgb(baseHex);

        // Compute accent (hue -20, l +5)
        let accentH = (baseHsl.h - 20 + 360) % 360;
        let accentL = Math.min(100, baseHsl.l + 5);
        const accentHex = hslToHex(accentH, baseHsl.s, accentL);
        const accentRgb = hexToRgb(accentHex);

        // Compute glow (hue +31, l -16)
        let glowH = (baseHsl.h + 31) % 360;
        let glowL = Math.max(0, baseHsl.l - 16);
        const glowHex = hslToHex(glowH, baseHsl.s, glowL);
        const glowRgb = hexToRgb(glowHex);

        // Compute dark (based on glow: same h, s*0.2, l*0.18)
        const darkH = glowH;
        const darkS = baseHsl.s * 0.2;
        const darkL = glowL * 0.18;
        const darkHex = hslToHex(darkH, darkS, darkL);
        const darkRgb = hexToRgb(darkHex);

        // Apply to root
        const root = document.documentElement;
        root.style.setProperty('--primary', baseHex);
        root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        root.style.setProperty('--accent', accentHex);
        root.style.setProperty('--accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
        root.style.setProperty('--glow', glowHex);
        root.style.setProperty('--glow-rgb', `${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}`);
        root.style.setProperty('--dark-rgb', `${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}`);
    });
}

// 🌌 V2 Particle count
if (particleCount) {
    particleCount.addEventListener('input', e => {
        particlesConfig.particles.number.value = Math.max(1, +e.target.value);
        reloadParticles();
    });
}

// 🌈 V2 Particle color
if (particleColor) {
    particleColor.addEventListener('input', e => {
        particlesConfig.particles.color.value = e.target.value;
        reloadParticles();
    });
}

// 🔗 V2 Line color
if (lineColor) {
    lineColor.addEventListener('input', e => {
        particlesConfig.particles.line_linked.color = e.target.value;
        reloadParticles();
    });
}

// ⚪ V2 Particle size
if (particleSize) {
    particleSize.addEventListener('input', e => {
        particlesConfig.particles.size.value = Math.max(0.1, +e.target.value);
        reloadParticles();
    });
}

// 🏃 V2 Particle speed
if (particleSpeed) {
    particleSpeed.addEventListener('input', e => {
        particlesConfig.particles.move.speed = Math.max(0.1, +e.target.value);
        reloadParticles();
    });
}

// 🔷 V2 Particle shape
if (particleShape) {
    particleShape.addEventListener('change', e => {
        const shapeType = e.target.value;
        if (shapeType === 'polygon') {
            particlesConfig.particles.shape = {
                type: 'polygon',
                polygon: { nb_sides: 5 }
            };
        } else {
            particlesConfig.particles.shape = { type: shapeType };
        }
        reloadParticles();
    });
}

console.log('lyric-animator-particles-v2.js loaded successfully!');
