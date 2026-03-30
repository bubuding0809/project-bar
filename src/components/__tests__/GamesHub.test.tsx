import { render, screen, fireEvent } from '@testing-library/react';
import GamesHub from '../GamesHub';

describe('GamesHub', () => {
  it('renders both game cards', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    expect(screen.getByText('Tower')).toBeInTheDocument();
    expect(screen.getByText('Shot Roulette')).toBeInTheDocument();
  });

  it('calls onPlayTower when Tower card is clicked', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    fireEvent.click(screen.getByText('Play Tower'));
    expect(onPlayTower).toHaveBeenCalled();
  });

  it('calls onPlayRoulette when Roulette card is clicked', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    fireEvent.click(screen.getByText('Play Roulette'));
    expect(onPlayRoulette).toHaveBeenCalled();
  });
});
