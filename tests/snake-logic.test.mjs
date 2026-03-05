import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIRECTIONS,
  advanceState,
  createInitialState,
  placeFood,
} from '../snake-logic.mjs';

function fixedRng(value) {
  return () => value;
}

test('snake moves forward one cell each tick', () => {
  const state = createInitialState({ width: 10, height: 10, rng: fixedRng(0) });
  const next = advanceState(state);

  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.snake.length, state.snake.length);
});

test('snake grows and score increases when eating food', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: DIRECTIONS.right,
    food: { x: 3, y: 2 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = advanceState(state, null, fixedRng(0));

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, state.snake.length + 1);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.ok(!next.gameOver);
});

test('hitting wall causes game over', () => {
  const state = {
    width: 4,
    height: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: DIRECTIONS.right,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = advanceState(state);
  assert.equal(next.gameOver, true);
});

test('hitting own body causes game over', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
    ],
    direction: DIRECTIONS.up,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = advanceState(state, DIRECTIONS.right);
  assert.equal(next.gameOver, true);
});

test('food placement avoids snake cells', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(4, 1, snake, fixedRng(0));
  assert.deepEqual(food, { x: 3, y: 0 });
});
