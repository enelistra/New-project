import {
  DIRECTIONS,
  advanceState,
  createInitialState,
  togglePause,
  sameCell,
} from './snake-logic.mjs';

const TICK_MS = 120;
const statusText = {
  running: 'Running',
  paused: 'Paused',
  gameOver: 'Game Over',
};

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const restartEl = document.getElementById('restart');
const pauseEl = document.getElementById('pause');

let state = createInitialState();
let pendingDirection = null;

const keyToDirection = {
  ArrowUp: DIRECTIONS.up,
  ArrowDown: DIRECTIONS.down,
  ArrowLeft: DIRECTIONS.left,
  ArrowRight: DIRECTIONS.right,
  w: DIRECTIONS.up,
  s: DIRECTIONS.down,
  a: DIRECTIONS.left,
  d: DIRECTIONS.right,
};

function setDirection(direction) {
  pendingDirection = direction;
}

function statusKey() {
  if (state.gameOver) return 'gameOver';
  if (state.paused) return 'paused';
  return 'running';
}

function restartGame() {
  state = createInitialState();
  pendingDirection = null;
  render();
}

function togglePauseGame() {
  state = togglePause(state);
  render();
}

function render() {
  const totalCells = state.width * state.height;
  boardEl.style.gridTemplateColumns = `repeat(${state.width}, 1fr)`;

  const snakeMap = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const foodKey = state.food ? `${state.food.x},${state.food.y}` : null;

  let markup = '';
  for (let idx = 0; idx < totalCells; idx += 1) {
    const x = idx % state.width;
    const y = Math.floor(idx / state.width);
    const key = `${x},${y}`;
    const classes = ['cell'];
    if (snakeMap.has(key)) classes.push('snake');
    if (foodKey && key === foodKey) classes.push('food');
    markup += `<div class="${classes.join(' ')}"></div>`;
  }

  boardEl.innerHTML = markup;
  scoreEl.textContent = String(state.score);
  statusEl.textContent = statusText[statusKey()];
  pauseEl.textContent = state.paused ? 'Resume' : 'Pause';
}

function tick() {
  state = advanceState(state, pendingDirection);
  pendingDirection = null;
  render();
}

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (key === 'r') {
    restartGame();
    return;
  }

  if (key === ' ' || key === 'p') {
    event.preventDefault();
    togglePauseGame();
    return;
  }

  const direction = keyToDirection[key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  setDirection(direction);
});

restartEl.addEventListener('click', restartGame);
pauseEl.addEventListener('click', togglePauseGame);

document.querySelectorAll('[data-dir]').forEach((button) => {
  button.addEventListener('click', () => {
    const direction = DIRECTIONS[button.dataset.dir];
    if (direction) {
      setDirection(direction);
    }
  });
});

render();
setInterval(tick, TICK_MS);