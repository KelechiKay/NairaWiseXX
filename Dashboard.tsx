
import React from 'react';
import { PlayerStats, Stock, PortfolioItem } from './types';
import { 
  TrendingUp, 
  Wallet, 
  Heart, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Banknote, 
  PiggyBank, 
  ShieldAlert, 
  Zap, 
  ShieldCheck,
  User,
  Users,
  Coins,
  Baby,
  Home,
  Frown
} from 'lucide-react';

interface DashboardProps {
  stats: PlayerStats;
  netAssets: number;
  stocks: Stock[];
  portfolio: PortfolioItem[];
}

const StatCard = ({ icon: Icon, label, value, color, unit = "₦", trend }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-current`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none truncate">
        {unit === "₦" ? `₦${Math.floor(value).toLocaleString()}` : `${Math.floor(value)}${unit}`}
      </p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, netAssets, stocks, portfolio }) => {
  const currentMonth = Math.ceil(stats.currentWeek / 4);
  
  const currentPortfolioValue = portfolio.reduce((acc, p) => {
    const stock = stocks.find(s => s.id === p.stockId);
    return acc + (stock ? stock.price * p.shares : 0);
  }, 0);

  const healthScore = Math.min(100, Math.max(0, 
    (stats.balance / (stats.salary || 1)) * 30 + 
    (stats.happiness * 0.4) + 
    (stats.savings > 0 ? 30 : 0)
  ));
  
  const getHealthText = () => {
    if (healthScore > 80) return { label: "Wealthy Hustler", color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck };
    if (healthScore > 40) return { label: "Stable Living", color: "text-indigo-600", bg: "bg-indigo-50", icon: Zap };
    return { label: "Sapa Mode", color: "text-rose-600", bg: "bg-rose-50", icon: ShieldAlert };
  };

  const health = getHealthText();
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="text-indigo-500" size={20} /> 
              Hustle Timeline
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Week {stats.currentWeek} of 24 — Month {currentMonth}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${health.bg} ${health.color} ${health.color.replace('text-', 'border-').replace('600', '200')}`}>
              <HealthIcon size={14} /> Status: {health.label}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest">Payday: Week {currentMonth * 4}</p>
            </div>
          </div>
        </div>

        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${((stats.currentWeek - 1) / 24) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Liquid Cash</p>
              <h2 className="text-6xl font-black tracking-tighter">₦{stats.balance.toLocaleString()}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                    <Calendar size={12} /> Next Pay: Week {currentMonth * 4}
                 </div>
                 <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-indigo-500/20">
                    <TrendingUp size={12} /> Target: Financial Freedom
                 </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-center min-w-[240px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
              <p className="text-3xl font-black">₦{currentPortfolioValue.toLocaleString()}</p>
              <p className="text-[10px] font-bold mt-2 text-indigo-400 uppercase">Growth Assets</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={PiggyBank} label="Naira Box" value={stats.savings} color="bg-amber-500" />
          <StatCard icon={TrendingUp} label="Net Worth" value={netAssets} color="bg-indigo-500" />
          <StatCard icon={CreditCard} label="Bad Debt" value={stats.debt} color="bg-rose-500" />
          <StatCard 
            icon={stats.happiness < 40 ? Frown : Heart} 
            label="Happiness" 
            value={stats.happiness} 
            color={stats.happiness < 40 ? "bg-rose-500" : "bg-pink-500"} 
            unit="%" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-slate-50 rounded-xl"><User size={24} className="text-slate-400" /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hustler</p>
            <p className="text-lg font-black text-slate-900 truncate">{stats.name}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-slate-50 rounded-xl"><Users size={24} className="text-slate-400" /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Household</p>
            <p className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
              {stats.maritalStatus} {stats.numberOfKids > 0 && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">+{stats.numberOfKids} Kids</span>}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
          <div className="p-4 bg-slate-50 rounded-xl"><Home size={24} className="text-slate-400" /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
            <p className="text-lg font-black text-slate-900">{stats.city}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
