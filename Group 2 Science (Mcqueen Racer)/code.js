const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let gameOver = false;
let gameSpeed = 4;
let frame = 0;
let apples = [];
const groundH = 80;

let bucket = {
    x: 0,
    y: 0,
    w: 80,
    h: 60,
    targetX: 0
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bucket.y = canvas.height - groundH - bucket.h;
}
window.addEventListener('resize', resize);
resize();

// --- REALISTIC 8-BIT SPRITES ---
function drawApple(x, y, size, smashed = false) {
    const p = size / 8;
    if (!smashed) {
        ctx.fillStyle = "#ff0000"; ctx.fillRect(x + p, y + p, p*6, p*6); // Body
        ctx.fillStyle = "#b91d1d"; ctx.fillRect(x + p, y + p*4, p*6, p*3); // Shadow
        ctx.fillStyle = "#ffffff"; ctx.fillRect(x + p*2, y + p*2, p, p); // Highlight
        ctx.fillStyle = "#4a2c1d"; ctx.fillRect(x + p*3, y - p, p*2, p*2); // Stem
        ctx.fillStyle = "#71bc08"; ctx.fillRect(x + p*5, y - p, p, p); // Leaf
    } else {
        ctx.fillStyle = "#ff0000"; ctx.fillRect(x, y + p*4, p*10, p*2); // Splat
    }
}

function drawBucket(x, y, w, h) {
    const p = w / 10;
    // Main Body
    ctx.fillStyle = "#95a5a6"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(x, y + p, w, p); // Band
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(x, y + h - p, w, p); // Band
    // Shading
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(x + w - p*2, y, p*2, h);
    // Handle
    ctx.strokeStyle = "#bdc3c7"; ctx.lineWidth = 4;
    ctx.strokeRect(x + p, y - p*2, w - p*2, p*2);
}

function update() {
    if (gameOver) return;
    frame++;

    // Mouse follow
    bucket.x += (bucket.targetX - (bucket.x + bucket.w/2)) * 0.2;

    // Spawn Apples
    let spawnRate = Math.max(15, 60 - Math.floor(score/2));
    if (frame % spawnRate === 0) {
        apples.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -50,
            speed: Math.random() * 2 + gameSpeed,
            smashed: false
        });
    }

    apples.forEach((a, i) => {
        if (!a.smashed) {
            a.y += a.speed;

            // Catch Collision
            if (a.y + 30 > bucket.y && a.y < bucket.y + 20 &&
                a.x + 30 > bucket.x && a.x < bucket.x + bucket.w) {
                apples.splice(i, 1);
                score++;
                if (score % 5 === 0) gameSpeed += 0.2; // Speed up difficulty
                document.getElementById('score').innerText = score;
            }

            // Hit Ground
            if (a.y > canvas.height - groundH - 20) {
                a.smashed = true;
                a.y = canvas.height - groundH - 10;
                triggerGameOver();
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky & Sun
    ctx.fillStyle = "#f1c40f"; ctx.fillRect(canvas.width - 100, 50, 60, 60);

    // Tree Canopy (The Top)
    ctx.fillStyle = "#2ecc71";
    for(let i=0; i<canvas.width; i+=100) {
        ctx.beginPath();
        ctx.arc(i + 50, 20, 80, 0, Math.PI, true);
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = "#71bc08"; ctx.fillRect(0, canvas.height - groundH, canvas.width, 20);
    ctx.fillStyle = "#8b4513"; ctx.fillRect(0, canvas.height - groundH + 20, canvas.width, groundH);

    // Draw Assets
    apples.forEach(a => drawApple(a.x, a.y, 32, a.smashed));
    drawBucket(bucket.x, bucket.y, bucket.w, bucket.h);
}

function triggerGameOver() {
    gameOver = true;
    document.getElementById('gameOver').style.display = "block";
    document.getElementById('finalScore').innerText = score;
}

function resetGame() {
    score = 0; 
    gameSpeed = 4; 
    apples = []; 
    gameOver = false;
    document.getElementById('score').innerText = "0";
    document.getElementById('gameOver').style.display = "none";
}

// Input Handlers
window.addEventListener('mousemove', e => { 
    bucket.targetX = e.clientX; 
});

window.addEventListener('touchmove', e => { 
    bucket.targetX = e.touches[0].clientX; 
    e.preventDefault(); 
}, {passive: false});

// Game Loop
function loop() { 
    update(); 
    draw(); 
    requestAnimationFrame(loop); 
}

loop();