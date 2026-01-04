
import React from 'react';
import { PlayerStats } from './types';
import { TrendingUp, Wallet, Heart, CreditCard, Calendar, Briefcase, MapPin, Banknote, PiggyBank, ShieldAlert, Zap } from 'lucide-react';

interface DashboardProps {
  stats: PlayerStats;
  netAssets: number;
}

const StatCard = ({ icon: Icon, label, value, color, unit = "₦" }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-all hover:border-emerald-100">
    <div className={`p-4 rounded-[1.2rem] ${color} text-white flex-shrink-0 shadow-lg`}>
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 truncate">
        {unit === "₦" ? `₦${Math.floor(value).toLocaleString()}` : `${Math.floor(value)}${unit}`}
      </p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, netAssets }) => {
  const isQ2 = stats.currentWeek > 12;
  const healthScore = Math.min(100, Math.max(0, (stats.balance / stats.salary) * 20 + (stats.savings / stats.salary) * 40 + stats.happiness * 0.4));
  
  const getHealthText = () => {
    if (healthScore > 80) return { label: "Wealthy", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (healthScore > 50) return { label: "Stable", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" };
    if (healthScore > 20) return { label: "Struggling", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Sapa Mode", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const health = getHealthText();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-xl">
               <Calendar size={20} />
            </div>
            <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Week {stats.currentWeek} <span className="text-slate-300">/ 24</span></span>
          </div>
          <div className={`px-5 py-2 rounded-2xl border-[3px] font-black text-[12px] uppercase tracking-widest flex items-center gap-2 ${health.bg} ${health.color} ${health.border} animate-pulse`}>
            <ShieldAlert size={16} />
            Hustle Status: {health.label}
          </div>
        </div>
        <div className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isQ2 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <Zap size={14} className="fill-current" />
          {isQ2 ? 'Season: The Heat' : 'Season: The Hustle'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Wallet} label="Liquid Cash" value={stats.balance} color="bg-emerald-500" />
        <StatCard icon={PiggyBank} label="Naira Box" value={stats.savings} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Total Assets" value={netAssets} color="bg-indigo-500" />
        <StatCard icon={CreditCard} label="Bad Debt" value={stats.debt} color="bg-rose-500" />
        <StatCard icon={Heart} label="Vibes" value={stats.happiness} color="bg-pink-500" unit="%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4 group">
          <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Briefcase size={28} className="text-slate-500" /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Career</p>
            <p className="text-lg font-black uppercase text-slate-700 truncate">{stats.job}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4 group">
          <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><MapPin size={28} className="text-slate-500" /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Base</p>
            <p className="text-lg font-black uppercase text-slate-700 truncate">{stats.city}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4 group">
          <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Banknote size={28} className="text-slate-500" /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Salary</p>
            <p className="text-lg font-black text-slate-700 truncate">₦{stats.salary.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
