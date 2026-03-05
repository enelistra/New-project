export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function isOppositeDirection(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function createInitialState(options = {}) {
  const width = options.width ?? 20;
  const height = options.height ?? 20;
  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);
  const snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];

  const direction = DIRECTIONS.right;
  const food = placeFood(width, height, snake, options.rng ?? Math.random);

  return {
    width,
    height,
    snake,
    direction,
    food,
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function placeFood(width, height, snake, rng = Math.random) {
  const openCells = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * openCells.length);
  return openCells[index];
}

export function advanceState(state, requestedDirection, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  let nextDirection = state.direction;
  if (requestedDirection && !isOppositeDirection(requestedDirection, state.direction)) {
    nextDirection = requestedDirection;
  }

  const nextHead = {
    x: state.snake[0].x + nextDirection.x,
    y: state.snake[0].y + nextDirection.y,
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.x >= state.width ||
    nextHead.y < 0 ||
    nextHead.y >= state.height;

  if (hitsWall) {
    return { ...state, direction: nextDirection, gameOver: true };
  }

  const grows = state.food !== null && sameCell(nextHead, state.food);
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);
  const hitsBody = bodyToCheck.some((segment) => sameCell(segment, nextHead));

  if (hitsBody) {
    return { ...state, direction: nextDirection, gameOver: true };
  }

  const movedSnake = [nextHead, ...state.snake];
  if (!grows) {
    movedSnake.pop();
  }

  if (!grows) {
    return {
      ...state,
      snake: movedSnake,
      direction: nextDirection,
    };
  }

  const nextFood = placeFood(state.width, state.height, movedSnake, rng);
  return {
    ...state,
    snake: movedSnake,
    direction: nextDirection,
    food: nextFood,
    score: state.score + 1,
    gameOver: nextFood === null,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }
  return { ...state, paused: !state.paused };
}