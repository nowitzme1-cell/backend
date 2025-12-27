
import React from 'react';
import { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-500 text-xs uppercase tracking-wider">
            <th className="px-6 py-3 font-semibold">Ticker</th>
            <th className="px-6 py-3 font-semibold">Type</th>
            <th className="px-6 py-3 font-semibold">Entry/Exit</th>
            <th className="px-6 py-3 font-semibold">Profit %</th>
            <th className="px-6 py-3 font-semibold">Amount</th>
            <th className="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-4 first:rounded-l-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                    {trade.ticker.slice(0, 2)}
                  </div>
                  <span className="font-semibold text-slate-200">{trade.ticker}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  trade.type === 'LONG' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'
                }`}>
                  {trade.type}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-300">${trade.entryPrice.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">→ ${trade.exitPrice.toFixed(2)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`flex items-center gap-1 font-mono font-medium ${
                  trade.profitPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {trade.profitPercentage >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(trade.profitPercentage).toFixed(2)}%
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`font-mono font-medium ${trade.profitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.profitAmount >= 0 ? '+' : ''}${trade.profitAmount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 last:rounded-r-xl">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  trade.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trade.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
