/**
 * Group 2 Science Game Hub - Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.game-card');
    
    // 1. Add Smooth Interaction for Game Cards
    cards.forEach(card => {
        // Log to console for debugging on GitHub
        card.addEventListener('mouseenter', () => {
            const gameName = card.querySelector('h2').innerText;
            console.log("Exploring: " + gameName);
        });

        // Visual feedback when clicking
        card.addEventListener('mousedown', () => {
            card.style.transform = "scale(0.95)";
        });

        card.addEventListener('mouseup', () => {
            card.style.transform = "translateY(-15px) scale(1.03)";
        });

        // Check if the link works (Internal Debugging)
        card.addEventListener('click', (e) => {
            const targetPath = card.getAttribute('href');
            console.log("Navigating to: " + targetPath);
            // On GitHub, the path must match the folder name exactly (Case-Sensitive)
        });
    });

    // 2. Create a "Science/Space" Particle Background
    createParticles();
});

/**
 * Creates a subtle moving star/particle background 
 * to give the Hub a "Science Arcade" atmosphere.
 */
function createParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Style the canvas to stay in the background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Behind everything
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    let dots = [];
    const dotCount = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random()
        });
    }

    function ani
