import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn((key: string) => {
    if (key === 'demo_user_id') return 'user_1';
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
