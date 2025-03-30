const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelDisplay = document.getElementById("levelDisplay");
const targetsRemaining = document.getElementById("targetsRemaining");

let backgroundColor = "white";
let keys = {};
let bullets = [];
let targets = [];
let currentLevel = 1;
let maxLevels = 5;
let levelInProgress = true;
let lastShotTime = 0;
let shotCooldown = 100;

class GameObject {
  constructor(x, y, radius, color, dx = 0, dy = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.baseColor = color;
    this.color = color;
    this.dx = dx;
    this.dy = dy;
    this.hitCount = 0;
    this.maxHits = 50;
    this.flashTimer = 0;
    this.destroyed = false;
  }

  draw() {
    if (this.destroyed) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${this.maxHits - this.hitCount}`, this.x, this.y + 5);
  }

  move() {
    if (this.destroyed) return;

    this.x += this.dx;
    this.y += this.dy;

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.dx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.dy *= -1;

    if (this.flashTimer > 0) {
      this.flashTimer--;
      this.color = "yellow";
    } else {
      this.color = this.baseColor;
    }
  }

  flash() {
    this.flashTimer = 5;
  }

  checkCollision(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  resetHits() {
    this.hitCount = 0;
  }
}

class Player extends GameObject {
  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.radius);
    ctx.lineTo(this.x - this.radius, this.y + this.radius);
    ctx.lineTo(this.x + this.radius, this.y + this.radius);
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 7;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }

  hits(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.radius + target.radius;
  }
}

const player = new Player(canvas.width / 2, canvas.height - 60, 20, "green");

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function spawnTargets(count) {
  targets = [];
  for (let i = 0; i < count; i++) {
    let x = 100 + Math.random() * (canvas.width - 200);
    let y = 50 + Math.random() * (canvas.height / 2 - 100);
    let dx = 2 * (Math.random() > 0.5 ? 1 : -1);
    let dy = 2 * (Math.random() > 0.5 ? 1 : -1);
    targets.push(new GameObject(x, y, 40, "red", dx, dy));
  }
}

function shootBullet() {
  let now = Date.now();
  if (now - lastShotTime > shotCooldown) {
    bullets.push(new Bullet(player.x, player.y - player.radius));
    lastShotTime = now;
  }
}

function handleInput() {
  const speed = 4;
  if (keys["ArrowUp"]) player.y -= speed;
  if (keys["ArrowDown"]) player.y += speed;
  if (keys["ArrowLeft"]) player.x -= speed;
  if (keys["ArrowRight"]) player.x += speed;

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  if (keys[" "] || keys["Spacebar"]) shootBullet();
}

function updateBullets() {
  bullets.forEach(b => b.update());

  bullets = bullets.filter(b => {
    let hit = false;
    targets.forEach(target => {
      if (!target.destroyed && b.hits(target)) {
        target.hitCount++;
        target.flash();
        hit = true;
        if (target.hitCount >= target.maxHits) {
          target.destroyed = true;
        }
      }
    });
    return !hit && b.y > 0;
  });
}

function checkPlayerTargetCollision() {
  targets.forEach(target => {
    if (!target.destroyed && player.checkCollision(target)) {
      target.resetHits();
      target.radius += 5;
      player.radius += 5;
      backgroundColor = "#ffcccc";
      setTimeout(() => {
        target.radius = 40;
        player.radius = 20;
        backgroundColor = "white";
      }, 300);
    }
  });
}

function checkLevelComplete() {
  return targets.every(t => t.destroyed);
}

function showLevelCompleteOverlay() {
  const overlay = document.getElementById("levelOverlay");
  const message = document.getElementById("overlayText");
  const button = document.getElementById("nextLevelBtn");

  message.textContent = currentLevel === maxLevels ? "🏆 You Win!" : `✅ Level ${currentLevel} Complete!`;
  button.textContent = currentLevel === maxLevels ? "Restart Game" : "Next Level";

  overlay.style.display = "flex";

  button.onclick = () => {
    if (currentLevel === maxLevels) {
      currentLevel = 1;
    } else {
      currentLevel++;
    }

    bullets = [];
    spawnTargets(currentLevel);
    overlay.style.display = "none";
    levelInProgress = true;
  };
}

function animate() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  levelDisplay.textContent = `Level: ${currentLevel}`;
  const aliveTargets = targets.filter(t => !t.destroyed).length;
  targetsRemaining.textContent = `Targets Remaining: ${aliveTargets}`;

  if (levelInProgress) {
    handleInput();
    updateBullets();
    checkPlayerTargetCollision();

    player.draw();
    bullets.forEach(b => b.draw());

    targets.forEach(target => {
      target.move();
      target.draw();
    });

    if (checkLevelComplete()) {
      levelInProgress = false;
      setTimeout(showLevelCompleteOverlay, 500);
    }
  }

  requestAnimationFrame(animate);
}

spawnTargets(currentLevel);
animate();
document.getElementById("playMusicBtn").addEventListener("click", () => {
    const music = document.getElementById("bgMusic");
    music.play();
  });
  