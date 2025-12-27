
import React, { useState, useEffect, useRef } from 'react';
import { QuantumServer } from './server';
import { ServerLog, StrategyTestRequest } from './types';
import { 
  Play, 
  History, 
  Database, 
  BookOpen, 
  Info, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Layers,
  Zap,
  ChevronRight,
  Code,
  RefreshCw,
  Key,
  Copy,
  Link,
  ShieldCheck,
  Cpu,
  Wifi,
  WifiOff,
  Settings,
  Save,
  Webhook
} from 'lucide-react';

const App: React.FC = () => {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [userId, setUserId] = useState('DevUser_01');
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'history' | 'connect' | 'docs'>('console');
  const [lastConnectionTime, setLastConnectionTime] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(QuantumServer.getWebhookUrl());
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectKey = QuantumServer.getAccessKey();
  const backendUrl = window.location.origin;

  // Determine if a frontend is "connected" based on recent activity (last 10 mins)
  const isFrontendConnected = lastConnectionTime && 
    (Date.now() - new Date(lastConnectionTime).getTime() < 600000);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

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
    
    // If request was successful, update connection status
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
      alert('Webhook configuration updated successfully!');
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Friendly Sidebar */}
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
           {/* CONNECTION STATUS INDICATOR */}
           <div className={`p-4 rounded-2xl border transition-all duration-500 ${isFrontendConnected ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-slate-800/30 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 {isFrontendConnected ? (
                   <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                 ) : (
                   <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                 )}
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${isFrontendConnected ? 'text-emerald-500' : 'text-slate-500'}`}>
                   {isFrontendConnected ? 'Frontend Linked' : 'Waiting...'}
                 </span>
               </div>
               {isFrontendConnected && (
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               )}
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed">
               {isFrontendConnected 
                 ? `Last ping: ${new Date(lastConnectionTime!).toLocaleTimeString()}`
                 : 'Backend is idle. Link your frontend app to see activity.'}
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

      {/* Main Experience */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        <header className="h-16 border-b border-slate-800/50 px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-white capitalize">{activeTab} View</h2>
            {isFrontendConnected && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500">CLIENT_CONNECTED</span>
              </div>
            )}
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
                ) : logs.map(log => (
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
                  {isFrontendConnected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white">Connect Your Frontend</h3>
                <p className="text-slate-400 mt-2">Use these credentials and configure your n8n workflow.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* PROJECT TOKEN CARD */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Key className="w-32 h-32" />
                  </div>
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

                {/* WORKFLOW WEBHOOK CONFIG CARD */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-purple-500" /> Workflow Webhook (n8n)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Paste your n8n Production Webhook URL here to process strategies.</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-black/40 border border-slate-700/50 rounded-xl flex items-center overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                      <div className="px-4 text-slate-600">
                        <Link className="w-4 h-4" />
                      </div>
                      <input 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        className="w-full bg-transparent border-none px-2 py-4 text-indigo-300 font-mono text-sm outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleSaveWebhook}
                      disabled={isSavingWebhook}
                      className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20"
                    >
                      {isSavingWebhook ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 italic">This URL is stored in your local session.</p>
                </div>

                {/* BACKEND URL CARD */}
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

              {/* LIVE CONNECTION BOX */}
              <div className={`p-8 rounded-3xl border transition-all duration-700 ${isFrontendConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${isFrontendConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <Wifi className={`w-4 h-4 ${isFrontendConnected ? 'animate-pulse' : ''}`} /> 
                    Handshake Status
                  </h4>
                  {isFrontendConnected ? (
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">CONNECTED</span>
                  ) : (
                    <span className="text-[10px] font-black bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">IDLE</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isFrontendConnected 
                    ? "Successfully linked with a frontend client! The backend is now receiving and processing remote strategy requests through your configured n8n workflow."
                    : "The API is currently waiting for the first request from your frontend app. Once you set the API Key in your dashboard and make a call, this status will turn green."}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-white mb-6">Database Records</h3>
              {JSON.parse(localStorage.getItem('quantum_trade_api_db') || '[]').reverse().map((item: any) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-indigo-400 font-bold text-sm">{item.userId}</span>
                      <span className="text-[10px] text-slate-600">{item.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 italic">"{item.strategyText}"</p>
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
                  <h4 className="font-bold text-white mb-4">API Authentication</h4>
                  <p className="text-xs text-slate-400 mb-4">To authenticate, pass the API Key in the query parameters or request body.</p>
                  <pre className="bg-black/40 p-4 rounded-xl text-[11px] text-indigo-300 font-mono">
{`// Example GET request
fetch('${backendUrl}/api/strategy/history?userId=123&apiKey=${projectKey}')`}
                  </pre>
                </div>
             </div>
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isFrontendConnected ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            GATEWAY_UP {isFrontendConnected && '[LINKED]'}
          </div>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1">
            <Webhook className="w-3 h-3" />
            N8N_RELAY: <span className="text-indigo-400">ACTIVE</span>
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-600 italic">Quantum v2.6 // Secure API Layer</div>
      </footer>
    </div>
  );
};

const Activity: React.FC<any> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default App;
