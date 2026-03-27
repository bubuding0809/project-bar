import { expect, test, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { Suspense } from 'react';
import Page from '../page';

// Mock GameOverlay to prevent Pusher errors
vi.mock('@/components/GameOverlay', () => ({
  default: () => <div data-testid="game-overlay-mock" />
}));

test('opens bottom sheet and shows stepper', async () => {
  const params = Promise.resolve({ tableId: '1' });
  
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Page params={params} />
      </Suspense>
    );
  });

  const button = await screen.findByText('Play Drink Roulette 🎰');
  fireEvent.click(button);
  
  expect(screen.getByText('Set the Stakes')).toBeTruthy();
  fireEvent.click(screen.getByText('+'));
  expect(screen.getByText('2')).toBeTruthy();
});
