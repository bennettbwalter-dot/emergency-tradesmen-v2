// --- CONFIGURATION ---
const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index) => `frames/frame_${index.toString().padStart(4, '0')}.webp`;
const CANVAS_ID = 'video-canvas';

// --- INITIALIZATION ---
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById(CANVAS_ID);
const context = canvas.getContext('2d');
const images = [];
const videoSequence = { frame: 0 };

// --- FRAME PRELOADING ---
const preloadImages = () => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = FILENAME_PATTERN(i);
        images.push(img);
    }
};

const render = () => {
    const img = images[Math.floor(videoSequence.frame)];
    if (!img) return;

    // Canvas scaling (Cover mode with custom IMAGE_SCALE from skill)
    const IMAGE_SCALE = 0.85; // Padding for the professional look
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgWidth = img.width;
    const imgHeight = img.height;

    const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * IMAGE_SCALE;

    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;

    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 2;

    // Clear and draw
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Skill: Auto-sample edge (simulated with a dark fill for premium feel)
    context.fillStyle = '#050505';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.drawImage(img, x, y, newWidth, newHeight);
};

const updateCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
};

// --- GSAP CHOREOGRAPHY ---
const initAnimations = () => {
    // Canvas Scroll Animation
    gsap.to(videoSequence, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5, // Smooth lag as per "Premium Flow"
        },
        onUpdate: render
    });

    // Content Overlay Stagger (The Staggered Reveals Rule)
    const zones = document.querySelectorAll('.text-zone');
    const animations = [
        { opacity: 0, y: 50 },          // fade-up
        { opacity: 0, x: -100 },        // slide-left
        { opacity: 0, scale: 0.8 },      // scale-up
        { opacity: 0, rotateX: 45 }     // roll-in
    ];

    zones.forEach((zone, i) => {
        const frameStart = parseInt(zone.dataset.frame);
        const animProps = animations[i % animations.length];

        gsap.fromTo(zone,
            { ...animProps, visibility: 'hidden' },
            {
                opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0,
                visibility: 'visible',
                scrollTrigger: {
                    trigger: ".scroll-container",
                    start: `${(frameStart / FRAME_COUNT) * 100}% center`,
                    end: `${((frameStart + 30) / FRAME_COUNT) * 100}% center`,
                    scrub: true,
                    onToggle: self => {
                        if (self.isActive) {
                            gsap.to(zone, { opacity: 1, duration: 0.4 });
                        } else {
                            gsap.to(zone, { opacity: 0, duration: 0.4 });
                        }
                    }
                }
            }
        );
    });

    // Stats Counter Animation
    gsap.to('.dark-overlay', {
        opacity: 1,
        visibility: 'visible',
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "85% top",
            end: "100% bottom",
            scrub: true
        }
    });

    document.querySelectorAll('.stat-num').forEach(num => {
        const target = parseInt(num.dataset.val);
        gsap.to(num, {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            scrollTrigger: {
                trigger: ".scroll-container",
                start: "90% center",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Hero Reveal (The Hero Prominence Rule)
    gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        delay: 0.5
    });

    gsap.from('.hero-subtitle', {
        opacity: 0,
        duration: 1,
        delay: 1.2
    });
};

// --- LIFE-CYCLE ---
const initEnviroment = () => {
    // Lenis Smooth Scroll
    const lenis = new Lenis();
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initial setup
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    preloadImages();

    // Start everything once loader finishes (simulated)
    window.onload = () => {
        gsap.to('#loader', {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                document.getElementById('loader').style.display = 'none';
                initAnimations();
            }
        });
    };
};

initEnviroment();
