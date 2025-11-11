/**
 * BG5: Hybrid Gradient + Effects Background
 * Combines animated gradient with canvas overlay effects
 */

window.BackgroundBG5 = (function() {
    'use strict';

    let container = null;
    let gradientDiv = null;
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let currentThemeColor = '#ff8e53';
    let particles = [];
    let lightRays = [];

    // Customization parameters
    let blobCount = 8;
    let blobSize = 75;
    let rayCount = 12;
    let movementSpeed = 5;

    /**
     * Particle class
     */
    class Blob {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.baseRadius = radius;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
            if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

            // Pulsing effect
            this.pulse += 0.02;
            this.radius = this.baseRadius + Math.sin(this.pulse) * 10;
        }

        draw(ctx) {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, this.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Light Ray class
     */
    class LightRay {
        constructor(x, y, length, angle, color) {
            this.x = x;
            this.y = y;
            this.length = length;
            this.angle = angle;
            this.color = color;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
        }

        update() {
            this.opacity += this.fadeSpeed;
            if (this.opacity > 0.4 || this.opacity < 0.1) {
                this.fadeSpeed *= -1;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            const gradient = ctx.createLinearGradient(0, 0, this.length, 0);
            gradient.addColorStop(0, this.color.replace(')', `, ${this.opacity})`).replace('rgb', 'rgba'));
            gradient.addColorStop(0.5, this.color.replace(')', `, ${this.opacity * 0.5})`).replace('rgb', 'rgba'));
            gradient.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));

            ctx.fillStyle = gradient;
            ctx.fillRect(0, -2, this.length, 4);

            ctx.restore();
        }
    }

    /**
     * Initialize the hybrid background
     */
    function init(containerElement) {
        console.log('Initializing BG5: Hybrid Effects');

        container = containerElement;

        // Create gradient background
        gradientDiv = document.createElement('div');
        gradientDiv.id = 'bg5-gradient';
        gradientDiv.className = 'bg5-gradient-base';
        container.appendChild(gradientDiv);

        // Create canvas overlay
        canvas = document.createElement('canvas');
        canvas.id = 'bg5-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';

        ctx = canvas.getContext('2d');
        resize();

        container.appendChild(canvas);

        // Initialize effects
        createEffects();
        updateTheme(currentThemeColor);

        // Start animation
        animate();

        console.log('BG5: Hybrid Effects initialized successfully');
    }

    /**
     * Create particles and light rays
     */
    function createEffects() {
        const rgb = hexToRgb(currentThemeColor);
        const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Create blobs
        for (let i = 0; i < 8; i++) {
            const blob = new Blob(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                Math.random() * 100 + 50,
                color
            );
            particles.push(blob);
        }

        // Create light rays
        for (let i = 0; i < 12; i++) {
            const ray = new LightRay(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                Math.random() * 300 + 200,
                Math.random() * Math.PI * 2,
                color
            );
            lightRays.push(ray);
        }
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!ctx) return;

        // Clear canvas with slight fade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw and update light rays
        lightRays.forEach(ray => {
            ray.update();
            ray.draw(ctx);
        });

        // Draw and update blobs
        particles.forEach(blob => {
            blob.update();
            blob.draw(ctx);
        });

        animationId = requestAnimationFrame(animate);
    }

    /**
     * Update theme colors
     */
    function updateTheme(hexColor) {
        currentThemeColor = hexColor;

        const rgb = hexToRgb(hexColor);
        const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Update gradient
        if (gradientDiv) {
            const color1 = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            const color2 = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.max(0, rgb.g - 30)}, ${Math.min(255, rgb.b + 30)})`;
            const color3 = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.min(255, rgb.g + 50)}, ${Math.max(0, rgb.b - 20)})`;
            const color4 = `rgb(${Math.min(255, rgb.r + 20)}, ${Math.min(255, rgb.g + 20)}, ${Math.min(255, rgb.b + 60)})`;

            gradientDiv.style.setProperty('--bg5-color1', color1);
            gradientDiv.style.setProperty('--bg5-color2', color2);
            gradientDiv.style.setProperty('--bg5-color3', color3);
            gradientDiv.style.setProperty('--bg5-color4', color4);
        }

        // Update particle colors
        particles.forEach(blob => {
            blob.color = color;
        });

        lightRays.forEach(ray => {
            ray.color = color;
        });
    }

    /**
     * Convert hex to RGB
     */
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    /**
     * Handle window resize
     */
    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Pause animation
     */
    function pause() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (gradientDiv) {
            gradientDiv.style.animationPlayState = 'paused';
        }
    }

    /**
     * Resume animation
     */
    function play() {
        if (!animationId) {
            animate();
        }

        if (gradientDiv) {
            gradientDiv.style.animationPlayState = 'running';
        }
    }

    /**
     * Cleanup
     */
    function destroy() {
        pause();

        if (gradientDiv && gradientDiv.parentNode) {
            gradientDiv.parentNode.removeChild(gradientDiv);
        }

        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }

        particles = [];
        lightRays = [];
        gradientDiv = null;
        canvas = null;
        ctx = null;
        container = null;

        console.log('BG5: Hybrid Effects destroyed');
    }

    // Public API
    return {
        init,
        destroy,
        updateTheme,
        resize,
        pause,
        play,
        // Customization setters
        setBlobCount: (count) => {
            blobCount = count;
            // Recreate blobs with new count
            const rgb = hexToRgb(currentThemeColor);
            const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            particles = [];
            for (let i = 0; i < count; i++) {
                const blob = new Blob(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    blobSize,
                    color
                );
                particles.push(blob);
            }
            console.log('BG5: Blob count set to', count);
        },
        setBlobSize: (size) => {
            blobSize = size;
            particles.forEach(blob => {
                blob.baseRadius = size;
                blob.radius = size;
            });
            console.log('BG5: Blob size set to', size);
        },
        setRayCount: (count) => {
            rayCount = count;
            // Recreate rays with new count
            const rgb = hexToRgb(currentThemeColor);
            const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            lightRays = [];
            for (let i = 0; i < count; i++) {
                const ray = new LightRay(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    Math.random() * 300 + 200,
                    Math.random() * Math.PI * 2,
                    color
                );
                lightRays.push(ray);
            }
            console.log('BG5: Ray count set to', count);
        },
        setMovementSpeed: (speed) => {
            movementSpeed = speed;
            const factor = speed / 5;
            particles.forEach(blob => {
                blob.vx = (Math.random() - 0.5) * 0.5 * factor;
                blob.vy = (Math.random() - 0.5) * 0.5 * factor;
            });
            console.log('BG5: Movement speed set to', speed);
        }
    };
})();

console.log('bg5-hybrid.js loaded successfully!');
