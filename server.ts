
import { 
  StrategyTestRequest, 
  StrategyResult, 
  Trade, 
  ApiResponse 
} from "./types";

const DB_KEY = 'quantum_trade_api_db';
const API_KEY_STORAGE_KEY = 'quantum_project_api_key';
const WEBHOOK_URL_STORAGE_KEY = 'quantum_n8n_webhook_url';
const DEFAULT_WEBHOOK = 'https://sarmad5.app.n8n.cloud/webhook/971a62ff-2fbd-496e-8f09-ee7e23c43031';

// Generate or retrieve a persistent API Key for this user's project
const getProjectApiKey = (): string => {
  let key = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (!key) {
    key = 'qt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }
  return key;
};

// Get the current configured n8n webhook
const getStoredWebhookUrl = (): string => {
  return localStorage.getItem(WEBHOOK_URL_STORAGE_KEY) || DEFAULT_WEBHOOK;
};

const getDb = (): StrategyResult[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToDb = (result: StrategyResult) => {
  const db = getDb();
  db.push(result);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export class QuantumServer {
  /**
   * Configuration Getters/Setters
   */
  static getAccessKey(): string {
    return getProjectApiKey();
  }

  static getWebhookUrl(): string {
    return getStoredWebhookUrl();
  }

  static setWebhookUrl(url: string): void {
    localStorage.setItem(WEBHOOK_URL_STORAGE_KEY, url);
  }

  /**
   * Internal Validation Logic
   */
  private static validateAccess(providedKey?: string): boolean {
    return providedKey === getProjectApiKey();
  }

  private static async triggerWorkflow(payload: StrategyTestRequest): Promise<any> {
    const url = getStoredWebhookUrl();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Workflow Error: ${response.status}`);
    return await response.json();
  }

  static async handleStrategyTest(req: StrategyTestRequest, apiKey?: string): Promise<ApiResponse<StrategyResult>> {
    const timestamp = new Date().toISOString();
    
    // API KEY VALIDATION
    if (!this.validateAccess(apiKey)) {
      return { status: 401, error: "Unauthorized: Invalid or missing API Key", timestamp };
    }

    if (!req.userId || !req.strategy) {
      return { status: 400, error: "Missing userId or strategy", timestamp };
    }

    try {
      const workflowData = await this.triggerWorkflow(req);
      const rawTrades = workflowData.trades || [];
      const trades: Trade[] = rawTrades.map((t: any, i: number) => ({
        id: t.id || `trd_${Date.now()}_${i}`,
        ticker: t.ticker || 'STOCK',
        type: t.type || 'LONG',
        entryPrice: t.entryPrice || 0,
        exitPrice: t.exitPrice || 0,
        profitPercentage: t.profitPercentage || 0,
        profitAmount: t.profitAmount || 0,
        timestamp: t.timestamp || timestamp,
        status: t.status || (t.profitAmount > 0 ? 'WIN' : 'LOSS')
      }));

      const wins = trades.filter(t => t.status === 'WIN').length;
      const result: StrategyResult = {
        id: `res_${Date.now()}`,
        userId: req.userId,
        strategyText: req.strategy,
        resultText: workflowData.resultText || "Analysis complete.",
        trades,
        winRate: workflowData.winRate ?? (trades.length > 0 ? (wins / trades.length) * 100 : 0),
        totalProfit: workflowData.totalProfit ?? trades.reduce((acc, t) => acc + t.profitAmount, 0),
        timestamp
      };

      saveToDb(result);
      return { status: 200, data: result, timestamp };
    } catch (err: any) {
      return { status: 500, error: err.message, timestamp };
    }
  }

  static async handleGetHistory(userId: string, apiKey?: string): Promise<ApiResponse<StrategyResult[]>> {
    const timestamp = new Date().toISOString();
    
    if (!this.validateAccess(apiKey)) {
      return { status: 401, error: "Unauthorized: Invalid API Key", timestamp };
    }

    if (!userId) {
      return { status: 400, error: "userId is required", timestamp };
    }

    const history = getDb().filter(item => item.userId === userId);
    return { status: 200, data: history, timestamp };
  }
}
