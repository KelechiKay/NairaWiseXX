
export interface PlayerStats {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
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
  inventory: number; // For traders: Value of goods in shop
  businessDebt: number; // Money owed by customers
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  category: 'savings' | 'investment' | 'lifestyle';
  completed: boolean;
}

export interface Stock {
  id: string;
  name: string;
  price: number;
  history: number[];
  sector: string;
  assetType: 'stock' | 'mutual_fund' | 'inventory';
  description?: string;
}

export interface PortfolioItem {
  stockId: string;
  shares: number;
  averagePrice: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface MarketNews {
  headline: string;
  impact: 'positive' | 'negative' | 'neutral';
  stockId?: string;
}

export interface Choice {
  text: string;
  consequence: string;
  impact: {
    balance: number;
    savings: number;
    debt: number;
    happiness: number;
  };
  investmentId?: string;
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
  marketEvent?: MarketNews;
}

export interface GameLog {
  week: number;
  title: string;
  decision: string;
  consequence: string;
  amount: number;
  balanceAfter: number;
}

export enum GameStatus {
  START = 'START',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  TUTORIAL = 'TUTORIAL',
  LESSONS = 'LESSONS',
  RUDIMENTS = 'RUDIMENTS',
  CHALLENGES_INFO = 'CHALLENGES_INFO',
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  VICTORY = 'VICTORY',
  LOADING = 'LOADING'
}
