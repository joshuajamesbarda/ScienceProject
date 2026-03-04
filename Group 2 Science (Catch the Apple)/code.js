const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let gameOver = false;
let gameSpeed = 15;
let roadOffset = 0;
const lanes = 3;
const laneW = 140;
const roadW = lanes * laneW;
let roadX = 0;

let car = { lane: 1, x: 0, y: 0, w: 75, h: 140, targetX: 0 };
let traffic = [];
let nature = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    roadX = (canvas.width - roadW) / 2;
    car.y = canvas.height - 220;
    updateTargetX();
    car.x = car.targetX;
}

function updateTargetX() {
    car.targetX = roadX + (car.lane * laneW) + (laneW / 2);
}

window.addEventListener('resize', resize);
resize();

// --- REALISTIC CAR RENDERING ---
function drawMcQueen(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Drop Shadow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); 
    ctx.roundRect(-38, 10, 76, 140, 25); 
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Main Body
    let bodyGrad = ctx.createLinearGradient(-40, 0, 40, 0);
    bodyGrad.addColorStop(0, "#800000"); 
    bodyGrad.addColorStop(0.3, "#ff0000"); 
    bodyGrad.addColorStop(0.5, "#ff3333"); 
    bodyGrad.addColorStop(0.7, "#ff0000"); 
    bodyGrad.addColorStop(1, "#800000");

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-35, 0); 
    ctx.bezierCurveTo(-45, 20, -50, 100, -38, 140); 
    ctx.lineTo(38, 140); 
    ctx.bezierCurveTo(50, 100, 45, 20, 35, 0); 
    ctx.closePath();
    ctx.fill();

    // 3. Cabin
    let glassGrad = ctx.createLinearGradient(0, 35, 0, 85);
    glassGrad.addColorStop(0, "#1a1a1a");
    glassGrad.addColorStop(1, "#333");
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.roundRect(-28, 35, 56, 55, 12);
    ctx.fill();

    // 4. Eyes (Windshield)
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(-24, 38); ctx.bezierCurveTo(-20, 28, 20, 28, 24, 38);
    ctx.lineTo(22, 58); ctx.lineTo(-22, 58);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = "#3498db";
    ctx.beginPath(); ctx.arc(-8, 48, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 48, 4, 0, Math.PI*2); ctx.fill();

    // 5. Rear Wing
    ctx.fillStyle = "#990000";
    ctx.fillRect(-45, 125, 90, 15);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(-45, 125, 90, 6);

    // 6. Decals
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath(); 
    ctx.moveTo(-40, 75); ctx.lineTo(-15, 95); ctx.lineTo(-40, 115);
    ctx.fill();
    ctx.fillStyle = "white"; 
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center"; 
    ctx.fillText("95", 10, 105);

    ctx.restore();
}

// --- CACTUS RENDERING ---
function drawCactus(s) {
    ctx.fillStyle = "#2d5a27";
    ctx.shadowBlur = 5; ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.roundRect(s.x, s.y, s.size/3, s.size, 10); ctx.fill();
    ctx.beginPath(); ctx.roundRect(s.x - s.size/3, s.y + s.size/3, s.size/1.5, s.size/5, 5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(s.x - s.size/3, s.y + s.size/6, s.size/6, s.size/5, 5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(s.x + s.size/2.5, s.y + s.size/6, s.size/6, s.size/5, 5); ctx.fill();
    ctx.shadowBlur = 0;
}

function update() {
    if (gameOver) return;
    roadOffset = (roadOffset + gameSpeed) % 120;
    car.x += (car.targetX - car.x) * 0.15;

    // Spawn Cactus
    if (Math.random() < 0.05) {
        let side = Math.random() < 0.5 ? roadX - 80 : roadX + roadW + 40;
        nature.push({ x: side + (Math.random()*40-20), y: -150, size: Math.random()*40 + 40 });
    }

    // Spawn Traffic
    if (Math.random() < 0.02) {
        let l = Math.floor(Math.random() * lanes);
        traffic.push({ lane: l, x: roadX + (l*laneW) + (laneW/2), y: -150, speed: Math.random()*5 + 5 });
    }

    nature.forEach((n, i) => { n.y += gameSpeed; if(n.y > canvas.height) nature.splice(i, 1); });

    traffic.forEach((t, i) => {
        t.y += (gameSpeed - t.speed);
        
        // Collision Detection
        if (t.lane === car.lane && t.y + 110 > car.y && t.y < car.y + 110) {
            gameOver = true;
            document.getElementById('screen').style.display = "block";
            document.getElementById('lastScore').innerText = score;
        }
        
        if (t.y > canvas.height) { 
            traffic.splice(i, 1); 
            score++; 
            document.getElementById('scoreDisplay').innerText = score; 
        }
    });
}

function draw() {
    // Desert ground
    ctx.fillStyle = "#c35a2d"; ctx.fillRect(0, 0, canvas.width, canvas.height); 
    // Road
    ctx.fillStyle = "#333"; ctx.fillRect(roadX, 0, roadW, canvas.height); 

    // Road Lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.setLineDash([40, 80]); 
    ctx.lineDashOffset = -roadOffset;
    for(let i=1; i<lanes; i++) {
        ctx.beginPath(); ctx.moveTo(roadX + i*laneW, 0); ctx.lineTo(roadX + i*laneW, canvas.height); ctx.stroke();
    }
    ctx.setLineDash([]);

    nature.forEach(drawCactus);
    
    traffic.forEach(t => {
        ctx.fillStyle = "#2c3e50";
        ctx.beginPath(); ctx.roundRect(t.x-30, t.y, 60, 110, 12); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(t.x-22, t.y+20, 44, 30);
    });

    drawMcQueen(car.x, car.y);
}

function resetGame() {
    score = 0; 
    traffic = []; 
    nature = []; 
    gameOver = false;
    document.getElementById('scoreDisplay').innerText = "0";
    document.getElementById('screen').style.display = "none";
    car.lane = 1; 
    updateTargetX();
}

// Controls
window.addEventListener('mousedown', e => {
    if (gameOver) return;
    if (e.clientX < canvas.width/2 && car.lane > 0) car.lane--;
    else if (e.clientX > canvas.width/2 && car.lane < lanes - 1) car.lane++;
    updateTargetX();
});

window.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === "ArrowLeft" && car.lane > 0) car.lane--;
    if (e.key === "ArrowRight" && car.lane < lanes - 1) car.lane++;
    updateTargetX();
});

function loop() { 
    update(); 
    draw(); 
    requestAnimationFrame(loop); 
}

loop();