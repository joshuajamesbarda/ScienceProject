const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let dist = 0, score = 0, fuel = 100, speed = 0, gameOver = false;
let keys = { gas: false, brake: false };
let items = [];

// Car Settings
let car = { x: 180, y: 0, vy: 0, rot: 0, grounded: false };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    car.y = 100;
}
window.addEventListener('resize', resize);
resize();

// Controls Setup
const setup = (id, k) => {
    const b = document.getElementById(id);
    b.onmousedown = b.ontouchstart = (e) => { e.preventDefault(); keys[k] = true; };
    b.onmouseup = b.ontouchend = () => { keys[k] = false; };
};
setup('btnGas', 'gas'); 
setup('btnBrake', 'brake');

// Generate the hill shape
function getTerrain(x) {
    const base = canvas.height - 180;
    const y = base + Math.sin(x * 0.004) * 50 + Math.sin(x * 0.0015) * 30;
    const yAhead = base + Math.sin((x + 8) * 0.004) * 50 + Math.sin((x + 8) * 0.0015) * 30;
    return { y, slope: Math.atan2(yAhead - y, 8) };
}

function update() {
    if (gameOver) return;

    // Movement Logic
    if (keys.gas && fuel > 0) {
        speed += 0.12; 
        fuel -= 0.08; 
    } else {
        speed *= 0.99; 
    }
    if (keys.brake) speed *= 0.92;
    if (speed < 0) speed = 0;

    dist += speed;

    // Physics/Gravity
    const terr = getTerrain(dist + car.x);
    car.vy += 0.45; 
    car.y += car.vy;

    if (car.y >= terr.y) {
        // Landing Logic
        if (!car.grounded) {
            let diff = Math.abs(car.rot - terr.slope);
            if (diff > 1.4) { 
                gameOver = true;
                document.getElementById('gameOver').style.display = "block";
            }
        }
        car.y = terr.y;
        car.vy = 0;
        car.grounded = true;
        car.rot += (terr.slope - car.rot) * 0.15;
    } else {
        car.grounded = false;
        car.rot += speed * 0.006; 
    }

    // Spawn Items
    if (Math.floor(dist) % 1000 < speed) {
        items.push({ x: canvas.width, type: Math.random() > 0.3 ? 'coin' : 'gas' });
    }

    // Item Collection
    items.forEach((it, i) => {
        it.x -= speed;
        const itY = getTerrain(dist + it.x).y - 40;
        if (Math.abs(it.x - car.x) < 40 && Math.abs(itY - car.y) < 60) {
            if (it.type === 'coin') score += 50; else fuel = Math.min(100, fuel + 50);
            items.splice(i, 1);
        }
        if (it.x < -100) items.splice(i, 1);
    });

    // Check Out of Gas
    if (fuel <= 0 && speed < 0.1) {
        gameOver = true;
        document.getElementById('gameOver').style.display = "block";
        document.getElementById('failReason').innerText = "OUT OF GAS";
    }

    // Update UI
    document.getElementById('score').innerText = Math.floor(score + dist/10);
    document.getElementById('finalScore').innerText = Math.floor(score + dist/10);
    document.getElementById('fuelBar').style.width = fuel + "%";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Sky
    ctx.fillStyle = "#3498db"; 
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // Draw Ground
    ctx.beginPath(); 
    ctx.fillStyle = "#2c3e50";
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width; i += 10) {
        ctx.lineTo(i, getTerrain(dist + i).y);
    }
    ctx.lineTo(canvas.width, canvas.height); 
    ctx.fill();

    // Grass Line
    ctx.strokeStyle = "#27ae60"; 
    ctx.lineWidth = 12;
    ctx.beginPath();
    for (let i = 0; i <= canvas.width; i += 10) {
        let ty = getTerrain(dist + i).y;
        if(i===0) ctx.moveTo(i, ty); else ctx.lineTo(i, ty);
    }
    ctx.stroke();

    // Items
    items.forEach(it => {
        ctx.fillStyle = it.type === 'coin' ? "#f1c40f" : "#e74c3c";
        ctx.fillRect(it.x, getTerrain(dist + it.x).y - 45, 25, 25);
        ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial";
        ctx.fillText(it.type === 'coin' ? "$" : "GAS", it.x+2, getTerrain(dist + it.x).y - 28);
    });

    // Draw Car
    ctx.save();
    ctx.translate(car.x, car.y - 12);
    ctx.rotate(car.rot);
    
    // Chassis
    ctx.fillStyle = "#e74c3c"; ctx.fillRect(-30, -15, 60, 18); 
    ctx.fillStyle = "#333"; ctx.fillRect(-15, -28, 30, 15); 
    ctx.fillStyle = "#87ceeb"; ctx.fillRect(-10, -25, 12, 10); 
    
    // Light Beam
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath(); ctx.moveTo(30, -5); ctx.lineTo(100, -30); ctx.lineTo(100, 20); ctx.fill();
    
    // Wheels
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(-18, 8, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 8, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#999";
    ctx.beginPath(); ctx.arc(-18, 8, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 8, 4, 0, Math.PI*2); ctx.fill();
    
    ctx.restore();
}

function loop() { 
    update(); 
    draw(); 
    requestAnimationFrame(loop); 
}

loop();