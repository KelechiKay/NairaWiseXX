
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  PlayerStats, 
  Scenario, 
  GameLog, 
  GameStatus, 
  Stock,
  PortfolioItem
} from './types';
import { getNextScenario, getEndGameAnalysis } from './geminiService';
import Dashboard from './Dashboard';
import StockMarket from './StockMarket';
import SocialFeed from './SocialFeed';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis as ReYAxis,
  Cell
} from 'recharts';
import { 
  Loader2, 
  ArrowRight, 
  TrendingUp, 
  Target,
  User,
  Calendar,
  Briefcase,
  MapPin,
  Banknote,
  ScrollText,
  CheckCircle2,
  ShieldHalf,
  Coins,
  Heart,
  Globe,
  Info,
  Baby,
  Users,
  Plus,
  Minus,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

const JOBS = ["Digital Hustler", "Civil Servant", "Banker", "Market Trader", "Tech Bro", "Content Creator", "Artisan", "Custom Hustle..."];
const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Kano", "Oyo", "Enugu", "Anambra", "Delta", "Ogun", "Kaduna", "Edo", "Akwa Ibom"
];
const INITIAL_STOCKS: Stock[] = [
  { id: 'mtn-ng', name: 'MTN Nigeria', price: 280, history: [270, 275, 280], sector: 'Telecom', assetType: 'stock' },
  { id: 'zenith', name: 'Zenith Bank', price: 42, history: [38, 40, 42], sector: 'Banking', assetType: 'stock' },
  { id: 'dangote-cem', name: 'Dangote Cement', price: 650, history: [600, 620, 650], sector: 'Industrial', assetType: 'stock' },
  { id: 'stanbic-fund', name: 'Stanbic IBTC Fund', price: 100, history: [100, 100, 100], sector: 'Growth', assetType: 'mutual_fund' },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];
const SAVE_KEY = 'nairawise_v30_stable';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [nextScenario, setNextScenario] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<GameLog[]>([]);
  const [lastConsequences, setLastConsequences] = useState<{items: {text: string, decision: string}[], lesson: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'scenario' | 'invest' | 'history' | 'analytics'>('scenario');
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [report, setReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isPrefetching = useRef(false);

  const [setup, setSetup] = useState({ 
    name: '', gender: 'male' as any, ageBracket: "26-35", job: JOBS[0], customJob: '', salary: 150000, 
    city: "Lagos", maritalStatus: 'single' as any, numberOfKids: 0, narrationLanguage: 'English' as any
  });

  const currentNetAssets = useMemo(() => {
    if (!stats) return 0;
    const portfolioValue = portfolio.reduce((acc, p) => {
      const stock = stocks.find(s => s.id === p.stockId);
      return acc + (stock ? stock.price * p.shares : 0);
    }, 0);
    return stats.balance + portfolioValue;
  }, [stats, portfolio, stocks]);

  const prefetch = useCallback(async (s: PlayerStats, h: GameLog[], immediate = false) => {
    if (isPrefetching.current) return;
    isPrefetching.current = true;
    try {
      const scene = await getNextScenario(s, h);
      if (immediate) {
        setCurrentScenario(scene);
      } else {
        setNextScenario(scene);
      }
      setErrorMsg(null);
    } catch (e) { 
      console.error("Scenario Error", e);
      setErrorMsg("NairaWise is having trouble connecting to the streets. Please try again.");
    }
    isPrefetching.current = false;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStats(data.stats);
        setHistory(data.history || []);
        setPortfolio(data.portfolio || []);
        setStocks(data.stocks || INITIAL_STOCKS);
        setStatus(GameStatus.PLAYING);
        prefetch(data.stats, data.history || [], true);
      } catch (e) { console.error("Load failed", e); }
    }
  }, [prefetch]);

  const handleStart = async () => {
    if (!setup.name) return alert("Please enter your name!");
    setStatus(GameStatus.LOADING);
    setErrorMsg(null);
    const finalJob = setup.job === "Custom Hustle..." ? setup.customJob : setup.job;
    const initial: PlayerStats = {
      ...setup, job: finalJob, balance: setup.salary / 2, savings: 0, debt: 0, happiness: 80, 
      currentWeek: 1, challenge: "The Grind Begins", inventory: [], businessDebt: 0, 
      lastPaidWeeks: {}, spendingByCategory: {}
    };
    
    try {
      const scene1 = await getNextScenario(initial, []);
      setStats(initial);
      setCurrentScenario(scene1);
      setStatus(GameStatus.PLAYING);
      prefetch({ ...initial, currentWeek: 2 }, []);
    } catch (e) { 
      console.error(e);
      setErrorMsg("Could not start the game. Check your internet connection or API key.");
      setStatus(GameStatus.SETUP); 
    }
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart the game? Your current progress will be lost.")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  const confirmChoice = async () => {
    if (!stats || !currentScenario || selectedIndices.length === 0) return;
    const isPayday = stats.currentWeek % 4 === 0;
    const salaryAmt = isPayday ? stats.salary : 0;
    
    let balImpactTotal = salaryAmt;
    let savingsImpactTotal = 0;
    let debtImpactTotal = 0;
    let hapImpactTotal = 0;
    
    let newSpending = { ...stats.spendingByCategory };
    let newPortfolio = [...portfolio];
    let cons: {text: string, decision: string}[] = [];

    if (isPayday) cons.push({ text: `Salary Credited: +₦${salaryAmt.toLocaleString()}`, decision: "Monthly Salary" });

    selectedIndices.forEach(idx => {
      const choice = currentScenario.choices[idx];
      balImpactTotal += choice.impact.balance;
      savingsImpactTotal += choice.impact.savings;
      debtImpactTotal += choice.impact.debt;
      hapImpactTotal += choice.impact.happiness;
      
      cons.push({ text: choice.consequence, decision: choice.text });
      
      if (choice.category) {
        if (choice.category !== 'Saving') {
          newSpending[choice.category] = (newSpending[choice.category] || 0) + Math.abs(choice.impact.balance);
        }
      }
      
      if (choice.investmentId) {
        const stock = stocks.find(s => s.id === choice.investmentId);
        if (stock) {
          const investedAmount = Math.abs(choice.impact.balance);
          const unitsToBuy = Math.floor(investedAmount / stock.price);
          if (unitsToBuy > 0) {
            const existingIdx = newPortfolio.findIndex(p => p.stockId === stock.id);
            if (existingIdx >= 0) newPortfolio[existingIdx].shares += unitsToBuy;
            else newPortfolio.push({ stockId: stock.id, shares: unitsToBuy, averagePrice: stock.price });
          }
        }
      }
    });

    const nextWeek = stats.currentWeek + 1;
    const newStats: PlayerStats = {
      ...stats, 
      balance: stats.balance + balImpactTotal,
      savings: stats.savings + savingsImpactTotal,
      debt: stats.debt + debtImpactTotal,
      happiness: Math.min(100, Math.max(0, stats.happiness + hapImpactTotal)),
      currentWeek: nextWeek, 
      spendingByCategory: newSpending
    };

    if (newStats.balance < 0 || nextWeek > 24) {
      setStatus(GameStatus.LOADING);
      const res = await getEndGameAnalysis(newStats, history, newStats.balance < 0 ? "Sapa Caught You" : "Completed Life Cycle");
      setReport(res);
      setStatus(newStats.balance < 0 ? GameStatus.GAMEOVER : GameStatus.VICTORY);
      return;
    }

    setStats(newStats); 
    setPortfolio(newPortfolio);
    setLastConsequences({ items: cons, lesson: currentScenario.lesson });
    
    const newHistory = [...history, { 
      week: stats.currentWeek, 
      title: currentScenario.title, 
      decision: selectedIndices.map(i => currentScenario.choices[i].text).join(" & "), 
      consequence: cons.map(c => c.text).join(" "), 
      amount: balImpactTotal, 
      balanceAfter: newStats.balance 
    }];
    
    setHistory(newHistory); 
    setSelectedIndices([]); 
    prefetch({ ...newStats, currentWeek: nextWeek + 1 }, newHistory);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ stats: newStats, history: newHistory, portfolio: newPortfolio, stocks }));
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen p-4 pb-24 relative selection:bg-emerald-100">
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="font-bold text-sm">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="ml-2 hover:opacity-50">✕</button>
        </div>
      )}

      {status === GameStatus.START && (
        <div className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-12 animate-in zoom-in">
           <div className="space-y-4">
             <h1 className="text-9xl font-black text-slate-900 logo-font tracking-tighter leading-none">
                <span className="text-gradient">Naira<br/>Wise</span>
             </h1>
             <p className="text-2xl font-medium text-slate-400 max-w-lg mx-auto italic">Master your money in the heart of Nigeria.</p>
           </div>
           <div className="flex flex-col gap-4 items-center">
             <button onClick={() => setStatus(GameStatus.HOW_TO_PLAY)} className="px-12 py-8 bg-slate-900 text-white rounded-full font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 shadow-2xl active:scale-95">Enter Streets <ArrowRight/></button>
           </div>
        </div>
      )}

      {status === GameStatus.HOW_TO_PLAY && (
        <div className="max-w-5xl mx-auto space-y-16 py-10 animate-in slide-in-from-bottom-12 pb-32">
          <header className="text-center space-y-6">
            <h2 className="text-6xl md:text-7xl font-black logo-font text-slate-900 tracking-tighter uppercase">The Hustle Handbook</h2>
            <p className="text-xl text-slate-500 font-medium">Survive Sapa and build wealth in 24 weeks.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 border-l-8 border-emerald-500 pl-6">Core Mechanics</h3>
              <div className="space-y-4">
                {[
                  { icon: Calendar, title: "24 Weeks of Grind", text: "Life moves fast. Payday is every 4th week. Plan for 'Black Tax' and expenses." },
                  { icon: TrendingUp, title: "NGX Investing", text: "Buy stocks like MTN and Zenith. Use stop-loss to protect your Naira from market volatility." },
                  { icon: Heart, title: "Happiness Index", text: "If happiness hits 0, the grind stops. Balance your hustle with joy and family." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-5">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl h-fit"><item.icon size={24}/></div>
                    <div><h4 className="font-black text-lg text-slate-900">{item.title}</h4><p className="text-slate-500 text-sm font-medium leading-relaxed">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 border-l-8 border-amber-500 pl-6">Street Advice</h3>
              <div className="space-y-4">
                {[
                  { icon: ShieldHalf, title: "Avoid 'Sapa' Mode", text: "Cash is king but assets are emperors. Keep an emergency box (Naira Box) always." },
                  { icon: Coins, title: "72-Hour Rule", text: "Before you flex on non-essentials, wait 3 days. Your account balance will thank you." },
                  { icon: Info, title: "Family & Legacy", text: "Marriage and kids add happiness but also monthly costs. Plan for school fees and home needs." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-5">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl h-fit"><item.icon size={24}/></div>
                    <div><h4 className="font-black text-lg text-slate-900">{item.title}</h4><p className="text-slate-500 text-sm font-medium leading-relaxed">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <button onClick={() => setStatus(GameStatus.SETUP)} className="w-full py-10 bg-slate-900 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-emerald-600 transition-all">Begin My Story</button>
        </div>
      )}

      {status === GameStatus.SETUP && (
        <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl max-w-4xl mx-auto space-y-12 border border-slate-100 animate-in slide-in-from-bottom-12 overflow-hidden">
           <header className="text-center space-y-2">
             <h2 className="text-5xl font-black logo-font text-slate-900 tracking-tighter uppercase">Identify Your Profile</h2>
           </header>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><User size={12}/> Name</label>
                <input value={setup.name} onChange={e => setSetup({...setup, name: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Enter name..." />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">Gender</label>
                <div className="flex bg-slate-50 p-2 rounded-[2rem] shadow-inner">
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} onClick={() => setSetup({...setup, gender: g as any})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${setup.gender === g ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Briefcase size={12}/> Career</label>
                <select value={setup.job} onChange={e => setSetup({...setup, job: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none">
                  {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {setup.job === "Custom Hustle..." && (
                <div className="space-y-2 animate-in slide-in-from-top-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Define Hustle</label>
                  <input value={setup.customJob} onChange={e => setSetup({...setup, customJob: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. Crypto Miner" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><MapPin size={12}/> Location</label>
                <select value={setup.city} onChange={e => setSetup({...setup, city: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none">
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Banknote size={12}/> Salary (₦)</label>
                <input type="number" value={setup.salary} onChange={e => setSetup({...setup, salary: Number(e.target.value)})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Globe size={12}/> Language</label>
                <select value={setup.narrationLanguage} onChange={e => setSetup({...setup, narrationLanguage: e.target.value as any})} className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold shadow-inner outline-none">
                  <option value="English">English</option>
                  <option value="Pidgin">Pidgin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Users size={12}/> Status</label>
                <div className="flex bg-slate-50 p-2 rounded-[2rem] shadow-inner">
                  {['single', 'married'].map(m => (
                    <button key={m} onClick={() => setSetup({...setup, maritalStatus: m as any})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${setup.maritalStatus === m ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {setup.maritalStatus === 'married' && (
                <div className="space-y-2 col-span-full md:col-span-1 animate-in slide-in-from-left-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Baby size={12}/> Children</label>
                  <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-[2rem] shadow-inner">
                    <button onClick={() => setSetup({...setup, numberOfKids: Math.max(0, setup.numberOfKids - 1)})} className="p-3 bg-white rounded-xl text-slate-400 hover:text-rose-500 shadow-sm"><Minus size={16}/></button>
                    <span className="flex-1 text-center font-black text-2xl">{setup.numberOfKids}</span>
                    <button onClick={() => setSetup({...setup, numberOfKids: Math.min(5, setup.numberOfKids + 1)})} className="p-3 bg-white rounded-xl text-slate-400 hover:text-emerald-500 shadow-sm"><Plus size={16}/></button>
                  </div>
                </div>
              )}
           </div>
           
           <button onClick={handleStart} className="w-full py-9 bg-emerald-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl hover:bg-emerald-700 transition-all transform active:scale-95">Confirm Profile</button>
        </div>
      )}

      {status === GameStatus.LOADING && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 text-center">
          <Loader2 className="w-24 h-24 text-emerald-600 animate-spin"/>
          <div className="space-y-4">
            <p className="font-black text-slate-900 text-2xl tracking-[0.5em] uppercase">Spawning in Nigeria...</p>
            <p className="text-slate-400 font-medium">Navigating traffic and checking the dollar rate...</p>
          </div>
        </div>
      )}

      {status === GameStatus.PLAYING && stats && (
        <div className="space-y-8 animate-in fade-in duration-1000">
          <header className="flex justify-center sticky top-6 z-[60]">
            <nav className="flex items-center gap-2 bg-white/80 backdrop-blur-3xl p-2 rounded-full border border-white shadow-2xl">
              {[
                { id: 'scenario', label: 'Hustle', icon: Calendar },
                { id: 'invest', label: 'Wealth', icon: TrendingUp },
                { id: 'analytics', label: 'Pulse', icon: Target },
                { id: 'history', label: 'Ledger', icon: ScrollText }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 sm:px-8 py-4 rounded-full transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>
                  <tab.icon size={14}/><span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </header>
          
          <Dashboard stats={stats} netAssets={currentNetAssets} stocks={stocks} portfolio={portfolio} />
          
          {!currentScenario && status === GameStatus.PLAYING && (
             <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[4rem] border border-slate-100 shadow-sm animate-pulse">
                <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Finding your next move...</p>
             </div>
          )}

          {activeTab === 'scenario' && currentScenario && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
              <div className="lg:col-span-8 space-y-8">
                {lastConsequences ? (
                  <div className="bg-white p-12 rounded-[4rem] shadow-2xl text-center space-y-12 border border-slate-50 overflow-hidden relative">
                    <h3 className="text-5xl font-black logo-font text-slate-900 tracking-tighter uppercase">Market Outcome</h3>
                    <div className="space-y-4">
                      {lastConsequences.items.map((it, i) => (
                        <div key={i} className={`p-8 rounded-[3rem] text-left border italic font-bold bg-slate-50 border-slate-200 text-slate-700`}>"{it.text}"</div>
                      ))}
                    </div>
                    <div className="bg-emerald-50 p-12 rounded-[3.5rem] text-left border-2 border-emerald-100">
                       <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Street Wisdom</h4>
                       <p className="text-3xl font-black text-emerald-950">{lastConsequences.lesson}</p>
                    </div>
                    <button onClick={() => { setLastConsequences(null); if(nextScenario){ setCurrentScenario(nextScenario); setNextScenario(null); } }} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-emerald-600 transition-all">Next Week</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100">
                      <div className="h-[400px] w-full relative">
                        <img src={`https://picsum.photos/seed/naira-${currentScenario?.imageTheme}/1200/800`} className="w-full h-full object-cover" alt="Scenario context"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-12">
                          <h2 className="text-5xl font-black logo-font text-white tracking-tighter uppercase">{currentScenario?.title}</h2>
                        </div>
                      </div>
                      <div className="p-12 text-slate-600 font-medium text-2xl leading-relaxed">{currentScenario?.description}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentScenario?.choices.map((c, i) => {
                        const isSelected = selectedIndices.includes(i);
                        return (
                          <div key={i} className={`p-10 rounded-[3.5rem] border-2 transition-all relative ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.01]' : 'bg-white border-transparent shadow-xl hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start cursor-pointer" onClick={() => setSelectedIndices(prev => prev.includes(i) ? prev.filter(x => x !== i) : (prev.length < 2 ? [...prev, i] : prev))}>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{c.category || 'Choice'}</span>
                                   {isSelected && <CheckCircle2 size={14} className="text-emerald-400" />}
                                 </div>
                                 <p className="font-black text-2xl leading-tight">{c.text}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className={`text-2xl font-black`}>
                                  {c.impact.balance === 0 ? '₦0' : `${c.impact.balance > 0 ? '+' : ''}₦${Math.abs(c.impact.balance).toLocaleString()}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedIndices.length > 0 && (
                      <button onClick={confirmChoice} className="w-full py-12 bg-emerald-600 text-white rounded-[4rem] font-black text-4xl shadow-2xl hover:bg-emerald-700 transition-all">Confirm Week's Move</button>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 space-y-8">
                <SocialFeed posts={currentScenario?.socialFeed || []} />
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <StockMarket 
              stocks={stocks} portfolio={portfolio} balance={stats.balance}
              onBuy={(id) => {
                const stock = stocks.find(s => s.id === id);
                if (stock && stats && stats.balance >= stock.price) {
                  setStats({...stats, balance: stats.balance - stock.price});
                  setPortfolio(prev => {
                    const has = prev.find(p => p.stockId === id);
                    if (has) return prev.map(p => p.stockId === id ? {...p, shares: p.shares + 1} : p);
                    return [...prev, { stockId: id, shares: 1, averagePrice: stock.price }];
                  });
                }
              }} 
              onSell={(id) => {
                const stock = stocks.find(s => s.id === id);
                const holding = portfolio.find(p => p.stockId === id);
                if (stock && holding && holding.shares > 0 && stats) {
                  setStats({...stats, balance: stats.balance + stock.price});
                  setPortfolio(prev => prev.map(p => p.stockId === id ? {...p, shares: p.shares - 1} : p));
                }
              }} 
              onSetTrigger={() => {}} 
            />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl max-w-5xl mx-auto space-y-12">
               <h3 className="text-5xl font-black text-center text-slate-900 tracking-tighter uppercase">Spending Analysis</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(stats.spendingByCategory).map(([name, value]) => ({ name, value }))}>
                      <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 900}} />
                      <ReYAxis />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                         {Object.entries(stats.spendingByCategory).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50 max-w-5xl mx-auto min-h-[60vh] flex flex-col">
               <div className="flex justify-between items-center mb-10">
                 <h3 className="text-4xl font-black logo-font flex items-center gap-5 text-slate-900 tracking-tighter"><ScrollText size={32} /> Street Ledger</h3>
                 <button 
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors"
                 >
                   <RefreshCcw size={16} /> Reset Hustle
                 </button>
               </div>
               <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                 {history.slice().reverse().map((h, i) => (
                   <div key={i} className="flex justify-between items-start p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-slate-200 transition-all group">
                     <div className="space-y-2 flex-1">
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-white bg-slate-400 px-3 py-1 rounded-full uppercase">Week {h.week}</span>
                         <p className="font-black text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">{h.title}</p>
                       </div>
                       <p className="text-sm text-slate-500 italic leading-relaxed">"{h.consequence}"</p>
                     </div>
                     <div className="text-right ml-4">
                       <p className={`text-2xl font-black ${h.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {h.amount >= 0 ? '+' : ''}₦{h.amount.toLocaleString()}
                       </p>
                     </div>
                   </div>
                 ))}
                 {history.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                     <ScrollText size={48} className="mb-4 opacity-20" />
                     <p className="font-black uppercase tracking-widest text-xs">No records yet. Start the grind!</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      )}

      {(status === GameStatus.GAMEOVER || status === GameStatus.VICTORY) && report && (
        <div className="flex flex-col items-center justify-center min-h-screen py-20 animate-in zoom-in duration-500">
          <div className="bg-white p-12 md:p-24 rounded-[5rem] shadow-2xl border-4 border-slate-50 space-y-16 max-w-4xl w-full mx-auto text-center">
            <h2 className={`text-7xl font-black tracking-tighter uppercase ${status === GameStatus.VICTORY ? 'text-emerald-600' : 'text-rose-600'}`}>
              {status === GameStatus.VICTORY ? 'Hustle King!' : 'Sapa Caught You'}
            </h2>
            <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Performance Grade: {report.grade || 'C'}</p>
            <div className="p-8 bg-slate-50 rounded-[3rem] text-xl font-bold text-slate-800 italic">{report.verdict}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {report.points?.map((p: string, i: number) => (
                 <div key={i} className="p-6 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-bold border border-emerald-100">{p}</div>
               ))}
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem(SAVE_KEY);
                window.location.reload();
              }} 
              className="w-full py-12 bg-slate-900 text-white rounded-[4rem] font-black text-3xl shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4"
            >
              <RefreshCcw size={32} /> Restart Cycle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
