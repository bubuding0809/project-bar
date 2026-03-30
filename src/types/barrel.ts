import { PlayerProfile } from '@/types/game';
import { ForfeitCategory } from '@/data/forfeits';

export type BarrelStatus = 'LOBBY' | 'ROUND_STARTING' | 'PLAYER_TURN' | 'ROUND_END';

export interface BarrelState {
  status: BarrelStatus;
  host: string;
  players: PlayerProfile[];
  roundId: string;
  currentPlayerIndex: number;
  triggerSlot: number;
  filledSlots: number[];
  loserId?: string;
  forfeitCategory?: ForfeitCategory;
  forfeitText?: string;
}
