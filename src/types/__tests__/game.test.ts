import { expect, test } from 'vitest';
import type { GameState } from '../game';

test('GameState includes stakes and timing', () => {
  const state: GameState = {
    status: 'GATHERING', host: 'h1', players: [], roundId: 'r1',
    drinkType: 'Tequila Shots', drinkQuantity: 4, targetEndTime: 123456789
  };
  expect(state.drinkQuantity).toBe(4);
});
