
import React, { useState } from 'react';
import { Stock, PortfolioItem, MarketNews } from './types';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Newspaper, 
  Settings2, 
  Target, 
  ShieldCheck, 
  PieChart, 
  BarChart3, 
  Info,
  Building2,
  Gem,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';

interface StockMarketProps {
  stocks: Stock[];
  portfolio: PortfolioItem[];
  news: MarketNews[];
  onBuy: (stockId: string) => void;
  onSell: (stockId: string) => void;
  balance: number;
  onSetTrigger: (stockId: string, type: 'stopLoss' | 'takeProfit', value: number | undefined) => void;
}

const StockMarket: React.FC<StockMarketProps> = ({ stocks, portfolio, news, onBuy, onSell, balance, onSetTrigger }) => {
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'stock' | 'mutual_fund'>('all');

  const filteredAssets = stocks.filter(s => filter === 'all' || s.assetType === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-500">
      {/* Sidebar / Filters */}
      <div className="lg:col-span-3 space-y-4 md:space-y-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
            <BarChart3 size={14} /> Trading Floor
          </h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Assets', icon: PieChart },
              { id: 'stock', label: 'Equities', icon: Building2 },
              { id: 'mutual_fund', label: 'Funds', icon: Gem },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm transition-all whitespace-nowrap ${
                  filter === item.id 
                  ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                }`}
              >
                <item.icon size={16} className="md:w-5 md:h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
           <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
           <p className="text-sm font-black uppercase tracking-wider mb-4">Investment Pro-Tip</p>
           <p className="text-xs font-medium leading-relaxed opacity-90 relative z-10">
             In Nigeria, blue-chip stocks pay dividends regularly. 
             Mutual funds like Stanbic are your safe haven for rainy day cash!
           </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="lg:col-span-9 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 px-2">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Market Board
            <span className="text-[10px] md:text-xs font-medium text-slate-400"> (₦ Prices)</span>
          </h3>
          <div className="w-fit px-4 md:px-5 py-2 md:py-2.5 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
            Cash: ₦{balance.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredAssets.map((asset) => {
            const holding = portfolio.find(p => p.stockId === asset.id);
            const priceChange = asset.history.length > 1 
              ? ((asset.price - asset.history[asset.history.length - 2]) / asset.history[asset.history.length - 2] * 100).toFixed(2)
              : "0.00";
            const isPositive = parseFloat(priceChange) >= 0;
            const chartData = asset.history.map((price, index) => ({ week: index, price }));

            return (
              <div key={asset.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col hover:border-indigo-100 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                        asset.assetType === 'stock' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {asset.assetType === 'stock' ? 'Equity' : 'Fund'}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest truncate">{asset.sector}</span>
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-tight truncate">{asset.name}</h4>
                  </div>
                  <div className={`flex items-center gap-1 font-black text-[10px] md:text-sm px-2 md:px-3 py-1 rounded-full whitespace-nowrap ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                    {priceChange}%
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4 md:mb-6">
                  <div>
                    <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">₦{asset.price.toLocaleString()}</p>
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">Value</p>
                  </div>
                  {holding && (
                    <div className="text-right">
                      <div className="bg-indigo-50 text-indigo-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl inline-block">
                        <p className="text-base md:text-lg font-black leading-none">{holding.shares}</p>
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest mt-0.5">Units</p>
                      </div>
                      <button 
                        onClick={() => setSelectedStockId(selectedStockId === asset.id ? null : asset.id)}
                        className={`block ml-auto mt-2 p-1.5 md:p-2 rounded-lg transition-all ${selectedStockId === asset.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200'}`}
                      >
                        <Settings2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {holding && selectedStockId === asset.id && (
                  <div className="mb-4 md:mb-6 p-4 md:p-5 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100 space-y-3 md:space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                        <Target className="w-3 h-3 text-emerald-500" /> Take Profit
                      </span>
                      <input 
                        type="number" 
                        value={holding.takeProfit || ''}
                        onChange={(e) => onSetTrigger(asset.id, 'takeProfit', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="₦"
                        className="w-20 md:w-28 p-2 md:p-2.5 text-xs font-black border border-slate-200 rounded-lg md:rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-rose-500" /> Stop Loss
                      </span>
                      <input 
                        type="number" 
                        value={holding.stopLoss || ''}
                        onChange={(e) => onSetTrigger(asset.id, 'stopLoss', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="₦"
                        className="w-20 md:w-28 p-2 md:p-2.5 text-xs font-black border border-slate-200 rounded-lg md:rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="h-20 md:h-28 w-full mb-6 md:mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isPositive ? '#10b981' : '#f43f5e'} 
                        strokeWidth={4} 
                        dot={false} 
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex gap-3 md:gap-4 mt-auto">
                  <button 
                    onClick={() => onBuy(asset.id)} 
                    disabled={balance < asset.price} 
                    className="flex-1 py-3 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-sm transition-all hover:bg-emerald-600 disabled:opacity-20 shadow-lg active:scale-95 uppercase tracking-widest"
                  >
                    Buy
                  </button>
                  <button 
                    onClick={() => onSell(asset.id)} 
                    disabled={!holding || holding.shares <= 0} 
                    className="flex-1 py-3 md:py-5 border-2 border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-sm transition-all disabled:opacity-20 active:scale-95 uppercase tracking-widest"
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockMarket;
