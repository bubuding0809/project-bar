import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MenuItem } from './MenuItem';

describe('MenuItem Component', () => {
  it('renders item title and price', () => {
    render(<MenuItem id="aroi-cha-yen" title="Aroi Cha Yen" price={18.00} imgUrl="/placeholder.png" />);
    expect(screen.getByText('Aroi Cha Yen')).toBeDefined();
    expect(screen.getByText('$18.00')).toBeDefined();
  });
});
