
import React, { useState, useEffect, useRef } from 'react';
import { QuantumServer } from './server';
import { ServerLog, StrategyTestRequest, StrategyResult } from './types';
import { 
  Play, 
  History, 
  Database, 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Key,
  Copy,
  Link,
  ShieldCheck,
  Cpu,
  Wifi,
  WifiOff,
  Save,
  Webhook,
  ChevronRight,
  Code,
  Zap,
  User
} from 'lucide-react';

const App: React.FC = () => {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [history, setHistory] = useState<StrategyResult[]>([]);
  const [userId, setUserId] = useState('DevUser_01');
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'history' | 'connect' | 'docs'>('console');
  const [lastConnectionTime, setLastConnectionTime] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(QuantumServer.getWebhookUrl());
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const projectKey = QuantumServer.getAccessKey();
  const backendUrl = "http://localhost:8000";

  const isFrontendConnected = lastConnectionTime && 
    (Date.now() - new Date(lastConnectionTime).getTime() < 600000);

  useEffect(() => {
    fetchHistory();
  }, [userId, activeTab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchHistory = async () => {
    if (activeTab !== 'history') return;
    setIsLoadingHistory(true);
    try {
      const response = await QuantumServer.handleGetHistory(userId, projectKey);
      if (response.status === 200 && Array.isArray(response.data)) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const addLog = (method: 'GET' | 'POST', path: string, status: number, latency: number, body?: any) => {
    const newLog: ServerLog = {
      id: Math.random().toString(36).substr(2, 9),
      method,
      path,
      status,
      latency,
      timestamp: new Date().toISOString(),
      body
    };
    setLogs(prev => [...prev, newLog]);
    if (status === 200) {
      setLastConnectionTime(new Date().toISOString());
    }
  };

  const handleTestRun = async () => {
    setIsProcessing(true);
    const start = Date.now();
    const payload: StrategyTestRequest = { userId, strategy: "Internal Test Strategy" };
    try {
      const response = await QuantumServer.handleStrategyTest(payload, projectKey);
      addLog('POST', '/api/strategy/test', response.status, Date.now() - start, payload);
      setLastResponse(response);
      if (response.status === 200) {
        fetchHistory(); // Refresh history after successful test
      }
    } catch (e) {
      addLog('POST', '/api/strategy/test', 500, Date.now() - start);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveWebhook = () => {
    setIsSavingWebhook(true);
    setTimeout(() => {
      QuantumServer.setWebhookUrl(webhookUrl);
      setIsSavingWebhook(false);
      alert('Webhook configuration updated locally.');
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Quantum Admin</span>
        </div>

        <nav className="space-y-1 mb-10">
          {[
            { id: 'console', label: 'API Monitor', icon: Zap },
            { id: 'connect', label: 'Connect App', icon: Link },
            { id: 'history', label: 'Database', icon: Database },
            { id: 'docs', label: 'API Docs', icon: BookOpen },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
              <span className="font-semibold text-sm">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
           <div className={`p-4 rounded-2xl border transition-all duration-500 ${isFrontendConnected ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-slate-800/30 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 {isFrontendConnected ? (
                   <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                 ) : (
                   <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                 )}
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${isFrontendConnected ? 'text-emerald-500' : 'text-slate-500'}`}>
                   {isFrontendConnected ? 'Backend Live' : 'Checking API...'}
                 </span>
               </div>
               {isFrontendConnected && (
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               )}
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed">
               {isFrontendConnected 
                 ? `Connected to ${backendUrl}`
                 : 'Start the Python backend on port 8000 to link the dashboard.'}
             </p>
           </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Dev Context</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-2"><User className="w-3 h-3" /> User ID</label>
              <input 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        <header className="h-16 border-b border-slate-800/50 px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-white capitalize">{activeTab} View</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleTestRun}
              disabled={isProcessing}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Send Test Request
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'console' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Live API Traffic</h3>
                <button onClick={() => setLogs([])} className="text-slate-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center opacity-30">
                    <Zap className="w-12 h-12 mb-2" />
                    <p className="text-sm">Listening for incoming requests...</p>
                  </div>
                ) : [...logs].reverse().map(log => (
                  <div key={log.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-5 hover:bg-slate-800/80 transition-colors">
                    <div className={`p-2.5 rounded-xl ${log.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      <Code className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{log.method}</span>
                        <span className="text-sm font-semibold text-slate-200">{log.path}</span>
                      </div>
                      <span className="text-[10px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.status >= 400 ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                      {log.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300 pb-20">
              <div className="text-center mb-10">
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Key className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">Connect Your Frontend</h3>
                <p className="text-slate-400 mt-2">Use these credentials for your local Python backend.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" /> Project API Token
                  </h4>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-black/40 border border-slate-700/50 rounded-xl px-4 py-4 text-indigo-400 font-mono text-sm break-all">
                      {projectKey}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(projectKey)}
                      className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-500" /> Backend Base URL
                  </h4>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-black/40 border border-slate-700/50 rounded-xl px-4 py-4 text-blue-400 font-mono text-sm">
                      {backendUrl}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(backendUrl)}
                      className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Database Records (Python Backend)</h3>
                {isLoadingHistory && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />}
              </div>
              {history.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <Database className="w-12 h-12 mx-auto mb-2" />
                  <p>No records found in the backend database.</p>
                </div>
              ) : [...history].reverse().map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center group hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-indigo-400 font-bold text-sm">{item.userId}</span>
                      <span className="text-[10px] text-slate-600">{item.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{item.strategyText}"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white">{item.winRate.toFixed(1)}%</span>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
             <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="font-bold text-white mb-4">REST API Reference</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-xl">
                      <p className="text-xs font-bold text-indigo-400 mb-1">POST /api/strategy/test</p>
                      <p className="text-[10px] text-slate-500">Run a strategy analysis through Gemini.</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl">
                      <p className="text-xs font-bold text-emerald-400 mb-1">GET /api/strategy/history</p>
                      <p className="text-[10px] text-slate-500">Fetch previous results from the persistent JSON store.</p>
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isFrontendConnected ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            API_GATEWAY: {isFrontendConnected ? 'CONNECTED' : 'OFFLINE'}
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-600 italic">Quantum v2.6 // Python + React Hybrid</div>
      </footer>
    </div>
  );
};

export default App;
