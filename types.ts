
export type TileType = 'circle' | 'dragon' | 'universal';

export interface MahjongTile {
  id: string;
  type: TileType;
  value: number; // 1-9 for circles, 0 for dragons/universal
  name: string;
}

export interface GameState {
  deck: MahjongTile[];
  playerHand: MahjongTile[];
  discardPile: MahjongTile[];
  drawnTile: MahjongTile | null;
  turn: 'player' | 'calculating';
  isGameOver: boolean;
  message: string;
  winInfo: {
    isWin: boolean;
    reason: string;
  };
}

export type WinningPattern = 'triplet_and_pair';
