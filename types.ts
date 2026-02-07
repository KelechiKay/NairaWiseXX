
export interface PlayerStats {
  name: string;
  gender: 'male' | 'female' | 'other';
  ageBracket: string;
  salary: number;
  balance: number;
  savings: number;
  debt: number;
  happiness: number;
  currentWeek: number;
  job: string;
  city: string;
  challenge: string;
  maritalStatus: 'single' | 'married';
  numberOfKids: number;
  inventory: string[];
  businessDebt: number;
  narrationLanguage: 'English' | 'Pidgin';
  lastPaidWeeks: Record<string, number>;
  spendingByCategory: Record<string, number>;
}

export interface Choice {
  text: string;
  consequence: string;
  category?: 'Essential' | 'NonEssential' | 'Investment' | 'Asset' | 'Repairs' | 'Family' | 'Saving' | 'Transport' | 'BlackTax';
  impact: {
    balance: number;
    savings: number;
    debt: number;
    happiness: number;
  };
  investmentId?: string;
  itemId?: string; 
  isNegotiable?: boolean;
}

export interface SocialPost {
  id: string;
  handle: string;
  name: string;
  content: string;
  likes: string;
  retweets: string;
  isVerified: boolean;
  sentiment: 'bullish' | 'bearish' | 'funny' | 'advice';
}

export interface Scenario {
  title: string;
  description: string;
  imageTheme: string;
  lesson: string;
  choices: Choice[];
  socialFeed: SocialPost[];
}

export interface GameLog {
  week: number;
  title: string;
  decision: string;
  consequence: string;
  amount: number;
  balanceAfter: number;
}

export interface Stock {
  id: string;
  name: string;
  price: number;
  history: number[];
  sector: string;
  assetType: 'stock' | 'mutual_fund';
}

export interface PortfolioItem {
  stockId: string;
  shares: number;
  averagePrice: number;
  stopLoss?: number;
  takeProfit?: number;
}

export enum GameStatus {
  START = 'START',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  LESSONS = 'LESSONS',
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  VICTORY = 'VICTORY',
  LOADING = 'LOADING'
}
