const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const powerupBtn = document.getElementById('powerup-btn');
const gameoverEl = document.getElementById('gameover');
const restartBtn = document.getElementById('restart-btn');

const WIDTH = 800, HEIGHT = 400, GROUND_Y = 320, RABBIT_SIZE = 40;
const GRAVITY = 0.8, JUMP_FORCE = -14, JUMP_FORCE_POWER = -20, MAX_CARROTS = 6;

let rabbitY, rabbitVelY, onGround, powerJumpReady;
let carrots, score, gameSpeed, spawnTimer, spawnInterval, gameOver;

function resetGame() {
  rabbitY = GROUND_Y - RABBIT_SIZE;
  rabbitVelY = 0;
  onGround = true;
  powerJumpReady = false;
  carrots = [];
  score = 0;
  gameSpeed = 5;
  spawnTimer = 0;
  spawnInterval = 90;
  gameOver = false;
  scoreEl.innerText = 'Pontos: 0';
  gameoverEl.style.display = 'none';
}

function spawnCarrot() {
  if (carrots.length < MAX_CARROTS) {
    carrots.push({ x: WIDTH + 20, y: GROUND_Y - 30 });
  }
}

function doJump() {
  if (onGround && !gameOver) {
    rabbitVelY = powerJumpReady ? JUMP_FORCE_POWER : JUMP_FORCE;
    powerJumpReady = false;
    onGround = false;
  }
}

function triggerPowerup() {
  powerJumpReady = true;
  powerupBtn.disabled = true;
  let time = 15;
  powerupBtn.innerText = time + 's';
  const interval = setInterval(() => {
    time--;
    if (time <= 0) {
      clearInterval(interval);
      powerupBtn.disabled = false;
      powerupBtn.innerText = 'POWER UP';
    } else {
      powerupBtn.innerText = time + 's';
    }
  }, 1000);
}

function checkCollision() {
  const rabbit = { x: 80, y: rabbitY, w: RABBIT_SIZE, h: RABBIT_SIZE };
  return carrots.some(c => {
    const carrot = { x: c.x, y: c.y - 10, w: 22, h: 40 };
    return rabbit.x < carrot.x + carrot.w && rabbit.x + rabbit.w > carrot.x &&
           rabbit.y < carrot.y + carrot.h && rabbit.y + rabbit.h > carrot.y;
  });
}

function drawScene() {
  ctx.fillStyle = '#87CEFA';
  ctx.fillRect(0, 0, WIDTH, GROUND_Y);

  ctx.fillStyle = '#FFDD00';
  ctx.fillRect(680, 40, 60, 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(100, 60, 60, 20);
  ctx.fillRect(130, 45, 50, 20);
  ctx.fillRect(350, 90, 70, 22);

  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(80, rabbitY, RABBIT_SIZE, RABBIT_SIZE);
  ctx.fillRect(85, rabbitY - 15, 8, 18);
  ctx.fillRect(100, rabbitY - 15, 8, 18);

  carrots.forEach(c => {
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(c.x, c.y, 22, 30);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(c.x + 4, c.y - 10, 14, 10);
  });
}

function gameLoop() {
  if (gameOver) return;

  rabbitVelY += GRAVITY;
  rabbitY += rabbitVelY;
  if (rabbitY >= GROUND_Y - RABBIT_SIZE) {
    rabbitY = GROUND_Y - RABBIT_SIZE;
    rabbitVelY = 0;
    onGround = true;
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnCarrot();
    spawnTimer = 0;
  }

  carrots.forEach(c => {
    const prevX = c.x;
    c.x -= gameSpeed;
    if (prevX >= 80 && c.x < 80) {
      score += 10;
      scoreEl.innerText = 'Pontos: ' + score;
      if (score % 100 === 0) {
        gameSpeed += 0.5;
        if (spawnInterval > 40) spawnInterval -= 8;
      }
    }
  });
  carrots = carrots.filter(c => c.x > -30);

  if (checkCollision()) {
    gameOver = true;
    gameoverEl.style.display = 'flex';
    return;
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawScene();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    doJump();
  }
});
powerupBtn.addEventListener('click', triggerPowerup);
restartBtn.addEventListener('click', () => { resetGame(); requestAnimationFrame(gameLoop); });

resetGame();
requestAnimationFrame(gameLoop);
