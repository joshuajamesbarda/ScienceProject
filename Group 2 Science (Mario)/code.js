const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0, combo = 0, gameOver = false, gameSpeed = 8, frame = 0, shake = 0;
const groundH = 100;

let mario = { x: 150, y: 0, w: 50, h: 70, dy: 0, jForce: -19, grav: 0.95, grounded: false };
let entities = [], particles = [];

function resize() {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    mario.y = canvas.height - groundH - mario.h;
}
window.addEventListener('resize', resize);
resize();

// --- REALISTIC PIXEL ART DRAWING ---
function drawMario(x, y) {
    const p = 4.5;
    ctx.save(); 
    ctx.translate(x, y);
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)"; 
    ctx.fillRect(0, mario.h, mario.w, 10);
    // Sprite
    ctx.fillStyle = "#B53120"; ctx.fillRect(p*3, 0, p*8, p*2); // Hat
    ctx.fillStyle = "#FFCC99"; ctx.fillRect(p*3, p*2, p*8, p*5); // Face
    ctx.fillStyle = "#623514"; ctx.fillRect(p*8, p*5, p*4, p*2); // Mustache/Eyes
    ctx.fillStyle = "#ff0000"; ctx.fillRect(p*4, p*7, p*6, p*5); // Shirt
    ctx.fillStyle = "#0000AA"; ctx.fillRect(p*3, p*10, p*8, p*5); // Pants
    ctx.fillStyle = "#F1C40F"; ctx.fillRect(p*4, p*11, p, p); ctx.fillRect(p*9, p*11, p, p); // Buttons
    ctx.restore();
}

function drawEntity(en) {
    if (en.type === 'rock') {
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.fillStyle = "#bdc3c7"; ctx.fillRect(en.x+2, en.y+2, en.w-4, 6);
        ctx.fillStyle = "#2c3e50"; ctx.fillRect(en.x+10, en.y+20, 4, 15);
        ctx.fillStyle = "#95a5a6"; ctx.fillRect(en.x+en.w-12, en.y+en.h-12, 8, 8);
    } else if (en.type === 'goomba') {
        let wobble = Math.sin(frame * 0.2) * 3;
        ctx.fillStyle = "#8b4513"; ctx.fillRect(en.x, en.y + wobble, en.w, en.h*0.7);
        ctx.fillStyle = "#ffcc99"; ctx.fillRect(en.x+10, en.y+en.h*0.7, en.w-20, en.h*0.3);
        ctx.fillStyle = "black"; ctx.fillRect(en.x+12, en.y+10+wobble, 6, 12); ctx.fillRect(en.x+en.w-18, en.y+10+wobble, 6, 12);
    } else {
        ctx.fillStyle = "#bdc3c7";
        ctx.beginPath(); ctx.moveTo(en.x, en.y+en.h); ctx.lineTo(en.x+en.w/2, en.y); ctx.lineTo(en.x+en.w, en.y+en.h); ctx.fill();
    }
}

function triggerComboEffect() {
    const el = document.getElementById('comboIndicator');
    el.innerText = `X${combo}`;
    el.style.opacity = "1";
    el.style.transform = "translate(-50%, -50%) scale(1.5)";
    setTimeout(() => { 
        el.style.opacity = "0"; 
        el.style.transform = "translate(-50%, -50%) scale(1)"; 
    }, 300);
}

function update() {
    if (gameOver) return;
    frame++; 
    gameSpeed += 0.0015;
    if (shake > 0) shake *= 0.85;

    mario.dy += mario.grav;
    mario.y += mario.dy;

    if (mario.y > canvas.height - groundH - mario.h) {
        mario.y = canvas.height - groundH - mario.h;
        mario.dy = 0;
        if (!mario.grounded) combo = 0; 
        mario.grounded = true;
    }

    // Spawn obstacles
    if (frame % Math.floor(110 - gameSpeed) === 0) {
        let r = Math.random(), g = canvas.height - groundH;
        if (r < 0.3) entities.push({ type: 'spike', x: canvas.width, y: g-45, w: 45, h: 45, kill: false });
        else if (r < 0.65) entities.push({ type: 'rock', x: canvas.width, y: g-60, w: 60, h: 60, kill: true });
        else entities.push({ type: 'goomba', x: canvas.width, y: g-55, w: 55, h: 55, kill: true, vx: 2.5 });
    }

    entities.forEach((en, i) => {
        en.x -= (gameSpeed + (en.vx || 0));
        
        let mx = mario.x + 10, my = mario.y + 10, mw = mario.w - 20, mh = mario.h - 10;
        if (mx < en.x + en.w && mx + mw > en.x && my < en.y + en.h && my + mh > en.y) {
            
            // Check for Stomp
            if (en.kill && mario.dy > 0 && (my + mh) < en.y + 30) {
                entities.splice(i, 1);
                mario.dy = mario.jForce * 0.75; 
                combo++; 
                score += 100 * combo;
                shake = 12;
                if (combo > 1) triggerComboEffect();
                document.getElementById('score').innerText = score;
            } else {
                gameOver = true;
                document.getElementById('gameOver').style.display = "block";
                document.getElementById('finalScore').innerText = score;
            }
        }
        if (en.x < -100) entities.splice(i, 1);
    });
}

function draw() {
    ctx.save();
    if (shake > 1) ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Floor
    ctx.fillStyle = "#71bc08"; ctx.fillRect(0, canvas.height-groundH, canvas.width, 25);
    ctx.fillStyle = "#8b4513"; ctx.fillRect(0, canvas.height-groundH+25, canvas.width, groundH);

    entities.forEach(drawEntity);
    drawMario(mario.x, mario.y);
    ctx.restore();
}

function resetGame() {
    score = 0; combo = 0; gameSpeed = 8; entities = []; gameOver = false;
    document.getElementById('gameOver').style.display = "none";
    document.getElementById('score').innerText = "0";
}

// Controls
window.addEventListener('mousedown', () => { 
    if(mario.grounded) { 
        mario.dy = mario.jForce; 
        mario.grounded = false; 
    } 
});

window.addEventListener('keydown', e => { 
    if((e.code === "Space" || e.code === "ArrowUp") && mario.grounded) { 
        mario.dy = mario.jForce; 
        mario.grounded = false; 
    } 
});

function loop() { 
    update(); 
    draw(); 
    requestAnimationFrame(loop); 
}
loop();