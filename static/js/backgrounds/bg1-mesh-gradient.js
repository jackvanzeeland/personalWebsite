/**
 * BG1: Animated Mesh Gradient Background
 * Stripe-style flowing gradient using WebGL for performance
 */

window.BackgroundBG1 = (function() {
    'use strict';

    let canvas = null;
    let gl = null;
    let program = null;
    let animationId = null;
    let startTime = null;
    let currentThemeColor = '#ff8e53';

    // Customization parameters
    let animationSpeed = 10;
    let noiseScale = 3;
    let colorCount = 4;

    // Vertex shader
    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // Fragment shader for animated gradient
    const fragmentShaderSource = `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;

        // Noise function for organic movement
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / resolution.xy;
            vec2 pos = st * 3.0;

            // Animate position
            pos.x += time * 0.1;
            pos.y += time * 0.08;

            // Create flowing noise
            float n1 = noise(pos);
            float n2 = noise(pos * 2.0 + time * 0.1);
            float n3 = noise(pos * 0.5 - time * 0.05);

            // Combine noise for mesh effect
            float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

            // Create color zones
            vec3 color;
            if (pattern < 0.33) {
                color = mix(color1, color2, pattern * 3.0);
            } else if (pattern < 0.66) {
                color = mix(color2, color3, (pattern - 0.33) * 3.0);
            } else {
                color = mix(color3, color4, (pattern - 0.66) * 3.0);
            }

            // Add subtle pulsing
            float pulse = sin(time * 0.5) * 0.1 + 0.9;
            color *= pulse;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    /**
     * Initialize the gradient background
     */
    function init(container) {
        console.log('Initializing BG1: Mesh Gradient');

        // Create canvas
        canvas = document.createElement('canvas');
        canvas.id = 'bg1-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';

        // Set size
        resize();

        // Get WebGL context
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error('WebGL not supported, falling back to CSS background');
            canvas.style.background = 'linear-gradient(45deg, #ff8e53, #fe6b8b, #ff8e53)';
            container.appendChild(canvas);
            return;
        }

        // Create shaders
        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Create geometry (full screen quad)
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Add canvas to container
        container.appendChild(canvas);

        // Set initial colors
        updateTheme(currentThemeColor);

        // Start animation
        startTime = Date.now();
        animate();

        console.log('BG1: Mesh Gradient initialized successfully');
    }

    /**
     * Create a shader
     */
    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!gl || !program) return;

        const time = ((Date.now() - startTime) / 1000) * (animationSpeed / 10);

        // Set uniforms
        const timeLocation = gl.getUniformLocation(program, 'time');
        const resolutionLocation = gl.getUniformLocation(program, 'resolution');

        gl.uniform1f(timeLocation, time);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        // Draw
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animationId = requestAnimationFrame(animate);
    }

    /**
     * Update theme colors
     */
    function updateTheme(hexColor) {
        currentThemeColor = hexColor;

        if (!gl || !program) return;

        // Convert hex to RGB
        const rgb = hexToRgb(hexColor);

        // Generate complementary colors
        const color1 = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
        const color2 = [(rgb.r + 50) / 255, (rgb.g - 30) / 255, (rgb.b + 30) / 255];
        const color3 = [(rgb.r - 30) / 255, (rgb.g + 50) / 255, (rgb.b - 20) / 255];
        const color4 = [(rgb.r + 20) / 255, (rgb.g + 20) / 255, (rgb.b + 60) / 255];

        // Set uniform colors
        gl.uniform3fv(gl.getUniformLocation(program, 'color1'), color1);
        gl.uniform3fv(gl.getUniformLocation(program, 'color2'), color2);
        gl.uniform3fv(gl.getUniformLocation(program, 'color3'), color3);
        gl.uniform3fv(gl.getUniformLocation(program, 'color4'), color4);
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
     * Cleanup
     */
    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }

        canvas = null;
        gl = null;
        program = null;

        console.log('BG1: Mesh Gradient destroyed');
    }

    // Public API
    return {
        init,
        destroy,
        updateTheme,
        resize,
        pause: () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        },
        play: () => {
            if (!animationId) {
                animate();
            }
        },
        // Customization setters
        setAnimationSpeed: (speed) => {
            animationSpeed = speed;
            console.log('BG1: Animation speed set to', speed);
        },
        setNoiseScale: (scale) => {
            noiseScale = scale;
            console.log('BG1: Noise scale set to', scale);
            // Note: This would require shader recompilation to take effect
            // For simplicity, we'll just store it for now
        },
        setColorCount: (count) => {
            colorCount = count;
            console.log('BG1: Color count set to', count);
            // Update theme to regenerate colors with new count
            updateTheme(currentThemeColor);
        }
    };
})();

console.log('bg1-mesh-gradient.js loaded successfully!');
