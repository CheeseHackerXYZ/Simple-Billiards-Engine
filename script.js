const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- Physical Constants ---
const ball_r = 10;
const pocket_r = 18;
const MAX_PULL = 150;
const FRICTION = 0.985;

// Pocket Spot
// [pocketX,pocketY]
const pocket_pos = [
  [15, 15],
  [400, 10],
  [785, 15],
  [15, 385],
  [400, 390],
  [785, 385]
];

// Wall Line
// [startX,startY,goalX,goalY]
const board = [
  [0, 0, 800, 0], [800, 0, 800, 400], [800, 400, 0, 400], [0, 400, 0, 0],
  [25, 0, 390, 0], [390, 0, 370, 20], [370, 20, 45, 20], [45, 20, 25, 0],
  [410, 0, 775, 0], [775, 0, 755, 20], [755, 20, 430, 20], [430, 20, 410, 0],
  [25, 400, 390, 400], [390, 400, 370, 380], [370, 380, 45, 380], [45, 380, 25, 400],
  [410, 400, 775, 400], [775, 400, 755, 380], [755, 380, 430, 380], [430, 380, 410, 400],
  [0, 25, 0, 375], [0, 375, 20, 355], [20, 355, 20, 45], [20, 45, 0, 25],
  [800, 25, 800, 375], [800, 375, 780, 355], [780, 355, 780, 45], [780, 45, 800, 25]
];

let balls = [];
let cueBall;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let mousePos = { x: 0, y: 0 };

class Ball {
  constructor(x, y, radius, isCue = false) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.isCue = isCue;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    if (this.isCue) {
      // This is cue ball style
      ctx.fillStyle = "#0000ff";
      ctx.fill();
    } else {
      // This ball is object ball
      ctx.fillStyle = "#333333";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.closePath();
  }

  update() {
    let speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);

    // Speed limit
    // Increasing this value may cause Ball to pass through Walls.
    if (speed > 15) {
      this.vx = (this.vx / speed) * 15;
      this.vy = (this.vy / speed) * 15;
      speed = 15;
    }

    
    if (speed > 0) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= FRICTION;
      this.vy *= FRICTION;
      
      // Stop when speed is too slow
      if (speed < 0.15) {
        this.vx = 0;
        this.vy = 0;
      }
    }
  }
}


function resetGame() {
  balls = [];

  // Cue ball
  cueBall = new Ball(200, 200, ball_r, true);
  balls.push(cueBall);

  // Object ball
  const rackStartX = 550;
  const rackStartY = 200;
  const dy = ball_r * 2 + 1;
  const dx = Math.sqrt(3) * ball_r + 1;

  // Place the balls
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c <= r; c++) {
      balls.push(
        new Ball(
          rackStartX + r * dx,
          rackStartY + (c - r / 2) * dy,
          ball_r,
          false
        )
      );
    }
  }
}

// --- Physical Engine ---

// Wall collision
function resolveWallCollision(ball) {
  board.forEach(line => {
    const [x1, y1, x2, y2] = line;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return;

    let t = Math.max(
      0,
      Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / l2)
    );

    const cx = x1 + t * dx;
    const cy = y1 + t * dy;
    const dist = Math.sqrt((ball.x - cx) ** 2 + (ball.y - cy) ** 2);

    if (dist < ball.radius) {
      const nx = (ball.x - cx) / dist;
      const ny = (ball.y - cy) / dist;

      ball.x += nx * (ball.radius - dist);
      ball.y += ny * (ball.radius - dist);

      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;
        ball.vx *= 0.8;
        ball.vy *= 0.8;
      }
    }
  });
}

// Ball collision
function resolveBallCollision(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = b1.radius + b2.radius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    b1.x -= nx * overlap * 0.5;
    b1.y -= ny * overlap * 0.5;
    b2.x += nx * overlap * 0.5;
    b2.y += ny * overlap * 0.5;

    const rvX = b1.vx - b2.vx;
    const rvY = b1.vy - b2.vy;
    const vNormal = rvX * nx + rvY * ny;

    if (vNormal < 0) return;

    const j = -vNormal;

    b1.vx += j * nx;
    b1.vy += j * ny;
    b2.vx -= j * nx;
    b2.vy -= j * ny;
  }
}


function update() {
  balls.forEach(b => b.update());

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];

    for (const p of pocket_pos) {
      if (Math.sqrt((b.x - p[0]) ** 2 + (b.y - p[1]) ** 2) < pocket_r) {
        if (b.isCue) {
          b.vx = 0;
          b.vy = 0;
          b.x = 200;
          b.y = 200;
        } else {
          balls.splice(i, 1);
        }
        break;
      }
    }
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      resolveBallCollision(balls[i], balls[j]);
    }
  }

  balls.forEach(b => resolveWallCollision(b));
}


// Display on the canvas
function draw() {
  // 1. Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Draw the pocket
  ctx.fillStyle = "#1a1a1a";
  pocket_pos.forEach(p => {
    ctx.beginPath();
    ctx.arc(p[0], p[1], pocket_r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Draw the board
  ctx.fillStyle = "rgba(0,0,0,0.03)";
  for (let i = 4; i < board.length; i += 4) {
    ctx.beginPath();
    ctx.moveTo(board[i][0], board[i][1]);
    ctx.lineTo(board[i][2], board[i][3]);
    ctx.lineTo(board[i + 1][2], board[i + 1][3]);
    ctx.lineTo(board[i + 2][2], board[i + 2][3]);
    ctx.fill();
  }

  // 4. Draw prediction line
  if (isDragging) {
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);

    const angle = Math.atan2(
      dragStart.y - mousePos.y,
      dragStart.x - mousePos.x
    );

    const dist = Math.min(
      Math.sqrt(
        (dragStart.x - mousePos.x) ** 2 +
        (dragStart.y - mousePos.y) ** 2
      ),
      MAX_PULL
    );

    ctx.lineTo(
      cueBall.x + Math.cos(angle) * dist,
      cueBall.y + Math.sin(angle) * dist
    );

    ctx.stroke();
  }
  
  // 5. Draw the ball
  balls.forEach(b => b.draw());
}

// --- Mouse/Touch event ---
canvas.addEventListener('pointerdown', e => {
  const r = canvas.getBoundingClientRect();
  const px = e.clientX - r.left;
  const py = e.clientY - r.top;

  if (balls.every(b => b.vx === 0 && b.vy === 0)) {
    if (Math.sqrt((px - cueBall.x) ** 2 + (py - cueBall.y) ** 2) < ball_r * 4) {
      dragStart.x = px;
      dragStart.y = py;
      isDragging = true;
      canvas.setPointerCapture(e.pointerId);
    }
  }
});

window.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - r.left;
  mousePos.y = e.clientY - r.top;
});

window.addEventListener('pointerup', e => {
  if (!isDragging) return;

  const r = canvas.getBoundingClientRect();
  const dx = dragStart.x - (e.clientX - r.left);
  const dy = dragStart.y - (e.clientY - r.top);
  const distSq = dx * dx + dy * dy;

  if (distSq > 100) {
    const dist = Math.min(Math.sqrt(distSq), MAX_PULL);
    const angle = Math.atan2(dy, dx);

    cueBall.vx = Math.cos(angle) * dist * 0.16;
    cueBall.vy = Math.sin(angle) * dist * 0.16;
  }

  isDragging = false;
});

// Main game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Init game
resetGame();
loop();
