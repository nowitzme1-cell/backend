
export interface Trade {
  // Unique identifier for the trade to support React keys
  id: string;
  ticker: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  profitPercentage: number;
  profitAmount: number;
  timestamp: string;
  status: 'WIN' | 'LOSS';
}

// Enum used for view navigation in Sidebar.tsx
export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  ANALYTICS = 'ANALYTICS'
}

export interface StrategyTestRequest {
  userId: string;
  strategy: string;
}

export interface StrategyResult {
  id: string;
  userId: string;
  strategyText: string;
  resultText: string;
  trades: Trade[];
  winRate: number;
  // Total profit/loss accumulated across all simulated trades
  totalProfit: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ServerLog {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  status: number;
  latency: number;
  timestamp: string;
  body?: any;
}
