
export type EmojiSymbol = '🌸' | '🎀' | '🍭' | '💎' | '✨';

export interface GameState {
  reels: EmojiSymbol[];
  isSpinning: boolean;
  lastWin: number;
  message: string;
}

export interface FortuneResponse {
  prediction: string;
  luckyNumber: number;
}
