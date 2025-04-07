const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const scoreDisplay = document.getElementById("scoreValue");
const livesDisplay = document.getElementById("livesValue");
const levelDisplay = document.getElementById("levelValue");
const playAgainBtn = document.getElementById("playAgainBtn");

const START_X = 60;
const START_Y = 60;
const SAFE_RADIUS = 80;

let score = 0;
let lives = 3;
let currentLevel = 1;
const maxLevels = 5;
let gameOver = false;
let isRespawning = false;

const gameObjects = [];
const collectibles = [];
let keys = {};
let player;

class GameObject {
  constructor(x, y, width, height, color, isCollectible = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.size = Math.max(width, height);
    this.color = color;
    this.isCollectible = isCollectible;
    this.collected = false;
    this.opacity = 1;
    this.dy = !isCollectible ? (1 + Math.random() * 1.5) : 0;
  }

  draw() {
    if (this.collected && this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    if (this.isCollectible) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  update() {
    if (this.collected) {
      this.opacity -= 0.05;
      return;
    }

    if (!this.isCollectible) {
      this.y += this.dy;
      if (this.y <= 0 || this.y + this.height >= canvas.height) {
        this.dy *= -1;
      }
    }
  }
}

class Player {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = 5;
    this.collisionRadius = size * 1.2;
  }

  draw() {
    const { x, y, size } = this;
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  move() {
    if (isRespawning) return;

    let dx = 0;
    let dy = 0;
    if (keys["ArrowUp"]) dy = -this.speed;
    if (keys["ArrowDown"]) dy = this.speed;
    if (keys["ArrowLeft"]) dx = -this.speed;
    if (keys["ArrowRight"]) dx = this.speed;

    let nextX = this.x + dx;
    let nextY = this.y + dy;

    const minX = this.size;
    const maxX = canvas.width - this.size;
    const minY = this.size;
    const maxY = canvas.height - this.size;

    nextX = Math.max(minX, Math.min(maxX, nextX));
    nextY = Math.max(minY, Math.min(maxY, nextY));

    for (let obj of gameObjects) {
      if (!obj.isCollectible && isColliding(nextX, nextY, this.collisionRadius, obj)) {
        loseLife();
        return;
      }
    }

    this.x = nextX;
    this.y = nextY;
  }
}

function isColliding(px, py, pr, obj) {
  if (obj.isCollectible) {
    const dx = px - obj.x;
    const dy = py - obj.y;
    return Math.sqrt(dx * dx + dy * dy) < pr + obj.size;
  } else {
    const closestX = clamp(px, obj.x, obj.x + obj.width);
    const closestY = clamp(py, obj.y, obj.y + obj.height);
    const dx = px - closestX;
    const dy = py - closestY;
    return dx * dx + dy * dy < pr * pr;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loseLife() {
  isRespawning = true;
  lives--;
  livesDisplay.textContent = lives;

  setTimeout(() => {
    alert(`You died. You have ${lives} lives remaining.`);
    if (lives <= 0) {
      endGame("Game Over");
    } else {
      resetPlayer();
      isRespawning = false;
    }
  }, 100);
}

function resetPlayer() {
  player.x = START_X;
  player.y = START_Y;
  keys = {};
}

function advanceLevel() {
  if (currentLevel >= maxLevels) {
    endGame("🎉 You Win!");
  } else {
    currentLevel++;
    levelDisplay.textContent = currentLevel;
    loadLevel();
  }
}

function endGame(message) {
  gameOver = true;
  playAgainBtn.style.display = "block";
  alert(message);
}

function resetGame() {
  score = 0;
  lives = 3;
  currentLevel = 1;
  gameOver = false;
  isRespawning = false;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  levelDisplay.textContent = currentLevel;
  playAgainBtn.style.display = "none";
  loadLevel();
}

function loadLevel() {
  gameObjects.length = 0;
  collectibles.length = 0;

  const width = canvas.width;
  const height = canvas.height;

  const numObjects = currentLevel + 4;
  const numCollectibles = currentLevel + 2;

  for (let i = 0; i < numObjects; i++) {
    let x, y, w, h, distance;
    do {
      w = 30 + Math.random() * 50;
      h = 30 + Math.random() * 50;
      x = Math.random() * (width - w);
      y = Math.random() * (height - h);
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const dx = centerX - START_X;
      const dy = centerY - START_Y;
      distance = Math.sqrt(dx * dx + dy * dy);
    } while (distance < SAFE_RADIUS);

    const color = getRandomColor();
    gameObjects.push(new GameObject(x, y, w, h, color));
  }

  for (let i = 0; i < numCollectibles; i++) {
    const r = 15;
    const x = r + Math.random() * (width - r * 2);
    const y = r + Math.random() * (height - r * 2);
    const color = "#00ffc3";
    const col = new GameObject(x, y, r, r, color, true);
    gameObjects.push(col);
    collectibles.push(col);
  }

  if (!player) {
    player = new Player(START_X, START_Y, 20, "#ffffff");
  } else {
    resetPlayer();
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let obj of gameObjects) {
    obj.update();
    obj.draw();
  }

  if (!gameOver && player) {
    player.move();
    player.draw();

    for (let col of collectibles) {
      if (!col.collected && isColliding(player.x, player.y, player.collisionRadius, col)) {
        col.collected = true;
        score++;
        scoreDisplay.textContent = score;
        animateScore();
      }
    }

    if (collectibles.every(c => c.collected)) {
      advanceLevel();
    }
  }

  requestAnimationFrame(gameLoop);
}

function animateScore() {
  scoreDisplay.style.transition = "transform 0.2s, color 0.2s";
  scoreDisplay.style.transform = "scale(1.5)";
  scoreDisplay.style.color = "#ffff00";
  setTimeout(() => {
    scoreDisplay.style.transform = "scale(1)";
    scoreDisplay.style.color = "#00ffc3";
  }, 200);
}

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);
playAgainBtn.addEventListener("click", resetGame);

loadLevel();
requestAnimationFrame(gameLoop);

function getRandomColor() {
  const palette = ["#ff4d4d", "#4dffb8", "#4d94ff", "#ffd24d", "#d94dff"];
  return palette[Math.floor(Math.random() * palette.length)];
}
