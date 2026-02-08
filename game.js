const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const gameOverEl = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");
const overlayRestartBtn = document.getElementById("overlay-restart-btn");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const speedMs = 110;

let snake;
let direction;
let pendingDirection;
let food;
let score;
let gameOver;
let loopId;

function resetGame() {
  snake = [
    { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) },
    { x: Math.floor(tileCount / 2) - 1, y: Math.floor(tileCount / 2) },
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = { ...direction };
  food = spawnFood();
  score = 0;
  gameOver = false;
  scoreEl.textContent = String(score);
  finalScoreEl.textContent = String(score);
  gameOverEl.classList.add("hidden");

  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(gameLoop, speedMs);
  draw();
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake && snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

function gameLoop() {
  if (gameOver) {
    return;
  }

  direction = { ...pendingDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const ateFood = head.x === food.x && head.y === food.y;
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (ateFood) {
    score += 1;
    scoreEl.textContent = String(score);
    finalScoreEl.textContent = String(score);
    food = spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = "#43d17a";
  snake.forEach((segment, index) => {
    const padding = index === 0 ? 2 : 3;
    ctx.fillRect(
      segment.x * gridSize + padding,
      segment.y * gridSize + padding,
      gridSize - padding * 2,
      gridSize - padding * 2,
    );
  });

  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize * 0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function setDirection(next) {
  if (gameOver) {
    return;
  }

  const isOpposite = next.x === -pendingDirection.x && next.y === -pendingDirection.y;
  if (isOpposite) {
    return;
  }

  pendingDirection = next;
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  switch (key) {
    case "arrowup":
    case "w":
      setDirection({ x: 0, y: -1 });
      break;
    case "arrowdown":
    case "s":
      setDirection({ x: 0, y: 1 });
      break;
    case "arrowleft":
    case "a":
      setDirection({ x: -1, y: 0 });
      break;
    case "arrowright":
    case "d":
      setDirection({ x: 1, y: 0 });
      break;
    default:
      break;
  }
}

function endGame() {
  gameOver = true;
  gameOverEl.classList.remove("hidden");
  clearInterval(loopId);
}

window.addEventListener("keydown", handleKeydown);
restartBtn.addEventListener("click", resetGame);
overlayRestartBtn.addEventListener("click", resetGame);

resetGame();
