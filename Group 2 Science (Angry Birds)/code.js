const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('gameOverModal');
const restartBtn = document.getElementById('restartBtn');

// Physics & Game State
const gravity = 0.42;
const lift = -8.5;
const mass = 5; 
const gConstant = 9.8;

let bird = { x: 150, y: 300, velocity: 0, size: 60, angle: 0 };
let pillars = [];
let particles = [];
let frame = 0;
let score = 0;
let maxPotentialEver = 0;
let gameOver = false;

function resize() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resize);
resize();

function drawBird(x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Body
    let bodyGrad = ctx.createRadialGradient(-5, -5, 5, 0, 0, size/2);
    bodyGrad.addColorStop(0, "#ff5f6d"); 
    bodyGrad.addColorStop(1, "#b91d1d");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); 
    ctx.arc(0, 0, size/2, 0, Math.PI * 2); 
    ctx.fill();
    ctx.strokeStyle = "#450a0a"; 
    ctx.lineWidth = 3; 
    ctx.stroke();

    // Belly & Eyes
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath(); 
    ctx.ellipse(0, size/4, size/2.5, size/5, 0, 0, Math.PI, true); 
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(10, -8, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, -8, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(14, -8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-6, -8, 4, 0, Math.PI * 2); ctx.fill();

    // Brows
    ctx.beginPath(); 
    ctx.moveTo(-25, -25); 
    ctx.lineTo(0, -12); 
    ctx.lineTo(25, -25);
    ctx.lineTo(25, -15); 
    ctx.lineTo(0, -5); 
    ctx.lineTo(-25, -15); 
    ctx.fill();

    // Beak
    ctx.fillStyle = "#ffd200";
    ctx.beginPath(); 
    ctx.moveTo(15, -2); 
    ctx.quadraticCurveTo(45, 5, 15, 12); 
    ctx.closePath(); 
    ctx.fill(); 
    ctx.stroke();
    
    ctx.restore();
}

function update() {
    if (gameOver) return;
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Physics Math
    let heightMeters = Math.max(0, (canvas.height - bird.y) / 40);
    let currentPE = Math.round(mass * gConstant * heightMeters);
    let currentKE = Math.round(0.5 * mass * Math.pow(bird.velocity * 2, 2));
    
    document.getElementById('pe').innerText = currentPE + " J";
    document.getElementById('ke').innerText = currentKE + " J";
    if (currentPE > maxPotentialEver) maxPotentialEver = currentPE;

    // Particles
    if (frame % 2 === 0) particles.push({ x: bird.x - 20, y: bird.y, size: Math.random() * 12 + 5, opacity: 1 });
    particles.forEach((p, i) => { p.x -= 4; p.opacity -= 0.03; if (p.opacity <= 0) particles.splice(i, 1); });

    if (frame % 90 === 0) createPillar();

    pillars.forEach((p, i) => {
        p.x -= 6;
        if (bird.x + 20 > p.x && bird.x - 25 < p.x + p.width) {
            if (bird.y - 20 < p.top || bird.y + 20 > p.bottom) triggerGameOver();
        }
        if (!p.passed && p.x < bird.x) {
            score++; p.passed = true; document.getElementById('scoreBoard').innerText = score;
        }
        if (p.x + p.width < 0) pillars.splice(i, 1);
    });

    if (bird.y > canvas.height || bird.y < 0) triggerGameOver();
    frame++;
}

function triggerGameOver() {
    gameOver = true;
    modal.style.display = "block";
    document.getElementById('finalScore').innerText = score;
    document.getElementById('maxPE').innerText = maxPotentialEver + " J";
    
    let rank = "Beginner";
    if (score > 5) rank = "Amateur";
    if (score > 15) rank = "Master";
    if (score > 30) rank = "Expert";
    document.getElementById('rank').innerText = rank;
}

function createPillar() {
    const gap = 240;
    const width = 100;
    const topHeight = Math.random() * (canvas.height - gap - 200) + 100;
    pillars.push({ x: canvas.width, top: topHeight, bottom: topHeight + gap, width: width, passed: false });
}

function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });
    pillars.forEach(p => {
        let pGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
        pGrad.addColorStop(0, "#5d4037"); pGrad.addColorStop(0.5, "#8d6e63"); pGrad.addColorStop(1, "#5d4037");
        ctx.fillStyle = pGrad;
        ctx.fillRect(p.x, 0, p.width, p.top);
        ctx.fillRect(p.x, p.bottom, p.width, canvas.height);
        ctx.fillStyle = "#bdbdbd";
        ctx.fillRect(p.x - 5, p.top - 20, p.width + 10, 20);
        ctx.fillRect(p.x - 5, p.bottom, p.width + 10, 20);
    });
    bird.angle = bird.velocity * 0.04;
    drawBird(bird.x, bird.y, bird.size, bird.angle);
}

function tap() {
    if(!gameOver) bird.velocity = lift;
}

function reset() {
    bird = { x: 150, y: 300, velocity: 0, size: 60, angle: 0 };
    pillars = []; particles = []; score = 0; maxPotentialEver = 0;
    document.getElementById('scoreBoard').innerText = "0";
    modal.style.display = "none";
    gameOver = false;
    frame = 0;
}

window.addEventListener('keydown', e => { if(e.code==='Space') tap(); });
canvas.addEventListener('mousedown', tap);
restartBtn.addEventListener('click', (e) => { e.stopPropagation(); reset(); });

function loop() { 
    update(); 
    draw(); 
    requestAnimationFrame(loop); 
}
loop();