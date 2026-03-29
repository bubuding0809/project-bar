export type ForfeitCategory = 'dare' | 'drink' | 'pay';

export interface ForfeitOption {
  category: ForfeitCategory;
  text: string;
}

export const DRINK_FORFEITS: string[] = [
  'Finish your current drink.',
  'Buy the table a round of shots.',
  'Order the most expensive drink on the menu and share it.',
  'Down whatever is in front of you.',
];

export const PAY_FORFEITS: string[] = [
  'Pay for the next round.',
  'Cover the tab for everyone playing.',
  'Buy drinks for all players.',
];

/**
 * Builds the forfeit pool. If the host set a custom dare, it is included as
 * the sole "dare" option. Drink and pay options are always included.
 */
export function buildForfeitPool(hostDare?: string): ForfeitOption[] {
  const pool: ForfeitOption[] = [];
  if (hostDare?.trim()) {
    pool.push({ category: 'dare', text: hostDare.trim() });
  }
  DRINK_FORFEITS.forEach(text => pool.push({ category: 'drink', text }));
  PAY_FORFEITS.forEach(text => pool.push({ category: 'pay', text }));
  return pool;
}

export function pickRandomForfeit(hostDare?: string): ForfeitOption {
  if (hostDare?.trim()) {
    return { category: 'dare', text: hostDare.trim() };
  }
  const pool = buildForfeitPool();
  return pool[Math.floor(Math.random() * pool.length)];
}
