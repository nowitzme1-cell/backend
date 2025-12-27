
import { 
  StrategyTestRequest, 
  StrategyResult, 
  ApiResponse 
} from "./types";

// Point to the Python FastAPI backend
const API_BASE = 'http://localhost:8000/api';

export class QuantumServer {
  static async getConfig(): Promise<any> {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  }

  static getAccessKey(): string {
    // In a real app, this would be fetched from getConfig() 
    // For now, we return the one in localStorage or a placeholder
    return localStorage.getItem('quantum_project_api_key') || 'qt_loading...';
  }

  static getWebhookUrl(): string {
    return localStorage.getItem('quantum_n8n_webhook_url') || '';
  }

  static setWebhookUrl(url: string): void {
    localStorage.setItem('quantum_n8n_webhook_url', url);
    // In Python backend, you'd add an endpoint to update this globally
  }

  static async handleStrategyTest(req: StrategyTestRequest, apiKey: string): Promise<ApiResponse<StrategyResult>> {
    try {
      const response = await fetch(`${API_BASE}/strategy/test`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey 
        },
        body: JSON.stringify(req),
      });
      return await response.json();
    } catch (err: any) {
      return { 
        status: 500, 
        error: `Backend Connection Failed: ${err.message}`, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  static async handleGetHistory(userId: string, apiKey: string): Promise<ApiResponse<StrategyResult[]>> {
    try {
      const response = await fetch(`${API_BASE}/strategy/history?userId=${userId}`, {
        headers: { 'x-api-key': apiKey },
      });
      return await response.json();
    } catch (err: any) {
      return { status: 500, error: err.message, timestamp: new Date().toISOString() };
    }
  }
}
