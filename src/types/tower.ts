import { PlayerProfile } from '@/types/game';
import { ForfeitCategory } from '@/data/forfeits';

export type TowerStatus = 'LOBBY' | 'PLAYER_TURN' | 'ROUND_END' | 'FORFEIT';

export interface TowerTurnResult {
  userId: string;
  fill: number;    // 0–1.0 (server-clamped)
  busted: boolean; // server-computed: submitted fill >= 1.0
}

export interface TowerForfeit {
  fromUserId: string;
  toUserId: string;
  text: string;
  category: ForfeitCategory;
}

export interface TowerState {
  status: TowerStatus;
  host: string;
  players: PlayerProfile[];
  roundId: string;
  currentPlayerIndex: number;
  results: TowerTurnResult[];
  hostDare?: string;         // host-entered dare text, set at LOBBY
  winnerId?: string;         // set at ROUND_END
  forfeitCategory?: ForfeitCategory;  // set at ROUND_END
  forfeitText?: string;      // set at ROUND_END
  forfeit?: TowerForfeit;    // set at FORFEIT after winner assigns
}
