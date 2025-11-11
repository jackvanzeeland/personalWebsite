/**
 * BG4: Three.js 3D Particles Background
 * 3D floating geometric shapes with camera movement
 */

window.BackgroundBG4 = (function() {
    'use strict';

    let container = null;
    let scene = null;
    let camera = null;
    let renderer = null;
    let particles = [];
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;
    let currentThemeColor = '#ff8e53';

    // Customization parameters
    let particleCount = 200;
    let particleSize = 2;
    let rotationSpeed = 5;
    let cameraSpeed = 5;
    let fogDensity = 8;

    /**
     * Initialize the 3D particles background
     */
    function init(containerElement) {
        console.log('Initializing BG4: 3D Particles');

        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded yet, retrying...');
            setTimeout(() => init(containerElement), 100);
            return;
        }

        container = containerElement;

        // Create scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0008);

        // Create camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 100;

        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.id = 'bg4-canvas';
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-1';

        container.appendChild(renderer.domElement);

        // Create particles
        createParticles();

        // Add mouse movement listener
        document.addEventListener('mousemove', onMouseMove);

        // Start animation
        animate();

        console.log('BG4: 3D Particles initialized successfully');
    }

    /**
     * Create 3D particles
     */
    function createParticles() {
        const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.SphereGeometry(0.5, 8, 8),
            new THREE.TetrahedronGeometry(0.7),
            new THREE.OctahedronGeometry(0.6),
            new THREE.IcosahedronGeometry(0.5)
        ];

        const rgb = hexToRgb(currentThemeColor);
        const particleCount = 200;

        for (let i = 0; i < particleCount; i++) {
            // Random geometry
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];

            // Create material with theme color
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(
                    (rgb.r + Math.random() * 50) / 255,
                    (rgb.g + Math.random() * 50) / 255,
                    (rgb.b + Math.random() * 50) / 255
                ),
                emissive: new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255),
                emissiveIntensity: 0.2,
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Random position
            mesh.position.x = Math.random() * 200 - 100;
            mesh.position.y = Math.random() * 200 - 100;
            mesh.position.z = Math.random() * 200 - 100;

            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;

            // Random scale
            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            // Store velocity for animation
            mesh.userData = {
                velocityX: (Math.random() - 0.5) * 0.02,
                velocityY: (Math.random() - 0.5) * 0.02,
                velocityZ: (Math.random() - 0.5) * 0.02,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };

            scene.add(mesh);
            particles.push(mesh);
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        // Add point light that follows mouse
        const pointLight = new THREE.PointLight(
            new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255),
            1,
            100
        );
        pointLight.position.set(0, 0, 50);
        scene.add(pointLight);
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!scene || !camera || !renderer) return;

        // Update camera position based on mouse
        const camSpeed = cameraSpeed / 100;
        camera.position.x += (mouseX - camera.position.x) * camSpeed;
        camera.position.y += (-mouseY - camera.position.y) * camSpeed;
        camera.lookAt(scene.position);

        // Animate particles
        particles.forEach(particle => {
            // Move particles
            particle.position.x += particle.userData.velocityX;
            particle.position.y += particle.userData.velocityY;
            particle.position.z += particle.userData.velocityZ;

            // Rotate particles
            particle.rotation.x += particle.userData.rotationSpeed.x;
            particle.rotation.y += particle.userData.rotationSpeed.y;
            particle.rotation.z += particle.userData.rotationSpeed.z;

            // Wrap around boundaries
            if (particle.position.x > 100) particle.position.x = -100;
            if (particle.position.x < -100) particle.position.x = 100;
            if (particle.position.y > 100) particle.position.y = -100;
            if (particle.position.y < -100) particle.position.y = 100;
            if (particle.position.z > 100) particle.position.z = -100;
            if (particle.position.z < -100) particle.position.z = 100;
        });

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    }

    /**
     * Mouse move handler
     */
    function onMouseMove(event) {
        mouseX = (event.clientX / window.innerWidth) * 20 - 10;
        mouseY = (event.clientY / window.innerHeight) * 20 - 10;
    }

    /**
     * Update theme colors
     */
    function updateTheme(hexColor) {
        currentThemeColor = hexColor;

        if (!scene) return;

        const rgb = hexToRgb(hexColor);

        // Update particle colors
        particles.forEach(particle => {
            particle.material.color.setRGB(
                (rgb.r + Math.random() * 50) / 255,
                (rgb.g + Math.random() * 50) / 255,
                (rgb.b + Math.random() * 50) / 255
            );
            particle.material.emissive.setRGB(
                rgb.r / 255,
                rgb.g / 255,
                rgb.b / 255
            );
        });

        // Update fog color
        const fogColor = new THREE.Color(rgb.r / 255 * 0.1, rgb.g / 255 * 0.1, rgb.b / 255 * 0.1);
        scene.fog.color = fogColor;
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
        if (!camera || !renderer) return;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Pause animation
     */
    function pause() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    /**
     * Resume animation
     */
    function play() {
        if (!animationId && scene && camera && renderer) {
            animate();
        }
    }

    /**
     * Cleanup
     */
    function destroy() {
        pause();

        document.removeEventListener('mousemove', onMouseMove);

        // Dispose of Three.js objects
        if (scene) {
            particles.forEach(particle => {
                if (particle.geometry) particle.geometry.dispose();
                if (particle.material) particle.material.dispose();
                scene.remove(particle);
            });
            particles = [];
        }

        if (renderer) {
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
            renderer = null;
        }

        scene = null;
        camera = null;
        container = null;

        console.log('BG4: 3D Particles destroyed');
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
        setParticleCount: (count) => {
            particleCount = count;
            console.log('BG4: Particle count set to', count);
            // Would need to recreate particles - simplified for now
        },
        setParticleSize: (size) => {
            particleSize = size;
            if (particles.length > 0) {
                particles.forEach(particle => {
                    const scale = size / 2;
                    particle.scale.set(scale, scale, scale);
                });
            }
            console.log('BG4: Particle size set to', size);
        },
        setRotationSpeed: (speed) => {
            rotationSpeed = speed;
            if (particles.length > 0) {
                const factor = speed / 5;
                particles.forEach(particle => {
                    particle.userData.rotationSpeed.x = (Math.random() - 0.5) * 0.02 * factor;
                    particle.userData.rotationSpeed.y = (Math.random() - 0.5) * 0.02 * factor;
                    particle.userData.rotationSpeed.z = (Math.random() - 0.5) * 0.02 * factor;
                });
            }
            console.log('BG4: Rotation speed set to', speed);
        },
        setCameraSpeed: (speed) => {
            cameraSpeed = speed;
            console.log('BG4: Camera speed set to', speed);
        },
        setFogDensity: (density) => {
            fogDensity = density;
            if (scene && scene.fog) {
                scene.fog.density = density / 10000;
            }
            console.log('BG4: Fog density set to', density);
        }
    };
})();

console.log('bg4-threejs-particles.js loaded successfully!');
