export interface PlayerProfile {
  userId: string;
  nickname: string;
  emoji: string;
}

export interface GameState {
  status: 'GATHERING' | 'SPINNING' | 'PAYMENT_PENDING' | 'PAID' | 'IDLE';
  host: string;
  players: PlayerProfile[];
  roundId: string;
  loserId?: string;
  drinkType?: string;
  drinkQuantity?: number;
  targetEndTime?: number;
}
