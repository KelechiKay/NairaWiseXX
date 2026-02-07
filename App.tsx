
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  PlayerStats, 
  Scenario, 
  GameLog, 
  GameStatus, 
  Stock,
  PortfolioItem
} from './types';
// Fixed: Importing from root to resolve build issues with nested directories
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
  Heart, 
  ArrowRight, 
  Zap, 
  Users, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Target,
  User,
  Calendar,
  Baby,
  Trash2,
  Banknote,
  ScrollText,
  Gavel,
  CheckCircle2,
  Languages,
  Wallet,
  ShieldAlert,
  Frown,
  Activity,
  ShieldHalf,
  Coins,
  Scale,
  BrainCircuit,
  PiggyBank,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';

const JOBS = ["Digital Hustler", "Civil Servant", "Banker", "Market Trader", "Tech Bro", "Content Creator", "Artisan", "Custom Hustle..."];
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];
const INITIAL_STOCKS: Stock[] = [
  { id: 'mtn-ng', name: 'MTN Nigeria', price: 280, history: [270, 275, 280], sector: 'Telecom', assetType: 'stock' },
  { id: 'zenith', name: 'Zenith Bank', price: 42, history: [38, 40, 42], sector: 'Banking', assetType: 'stock' },
  { id: 'dangote-cem', name: 'Dangote Cement', price: 650, history: [600, 620, 650], sector: 'Industrial', assetType: 'stock' },
  { id: 'stanbic-fund', name: 'Stanbic IBTC Fund', price: 100, history: [100, 100, 100], sector: 'Growth', assetType: 'mutual_fund' },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

const SAVE_KEY = 'nairawise_v26_stable';

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
  const [negotiatedIndices, setNegotiatedIndices] = useState<Set<number>>(new Set());
  const [report, setReport] = useState<any>(null);
  const isPrefetching = useRef(false);

  const [setup, setSetup] = useState({ 
    name: '', gender: 'male' as any, ageBracket: "26-35", job: JOBS[0], customJob: '', salary: 150000, 
    city: "Lagos", maritalStatus: 'single' as any, numberOfKids: 0, narrationLanguage: 'Pidgin' as any
  });

  const currentNetAssets = useMemo(() => {
    if (!stats) return 0;
    const portfolioValue = portfolio.reduce((acc, p) => {
      const stock = stocks.find(s => s.id === p.stockId);
      return acc + (stock ? stock.price * p.shares : 0);
    }, 0);
    return stats.balance + portfolioValue;
  }, [stats, portfolio, stocks]);

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
  }, []);

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
    } catch (e) { console.error("Scenario Error", e); }
    isPrefetching.current = false;
  }, []);

  const handleStart = async () => {
    if (!setup.name) return alert("Please enter your name!");
    setStatus(GameStatus.LOADING);
    const finalJob = setup.job === "Custom Hustle..." ? setup.customJob : setup.job;
    const initial: PlayerStats = {
      ...setup, job: finalJob, balance: setup.salary / 2, savings: 0, debt: 0, happiness: 80, 
      currentWeek: 1, challenge: "The Grind Begins", inventory: [], businessDebt: 0, 
      lastPaidWeeks: {}, spendingByCategory: {}
    };
    setStats(initial);
    try {
      const scene1 = await getNextScenario(initial, []);
      setCurrentScenario(scene1);
      setStatus(GameStatus.PLAYING);
      prefetch({ ...initial, currentWeek: 2 }, []);
    } catch (e) { 
      console.error(e);
      setStatus(GameStatus.START); 
    }
  };

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setStats(null);
    setHistory([]);
    setCurrentScenario(null);
    setNextScenario(null);
    setPortfolio([]);
    setReport(null);
    setLastConsequences(null);
    setStatus(GameStatus.START);
    setStocks(INITIAL_STOCKS);
  };

  const toggleNegotiation = (idx: number) => {
    setNegotiatedIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const confirmChoice = async () => {
    if (!stats || !currentScenario || selectedIndices.length === 0) return;
    
    const isPayday = stats.currentWeek % 4 === 0;
    const salaryAmt = isPayday ? stats.salary : 0;
    
    let balImpact = salaryAmt;
    let hapImpact = 0;
    let newSpending = { ...stats.spendingByCategory };
    let newPaidWeeks = { ...stats.lastPaidWeeks };
    let newPortfolio = [...portfolio];
    let cons: {text: string, decision: string}[] = [];

    if (isPayday) {
      cons.push({ text: `Salary Credited: +₦${salaryAmt.toLocaleString()}`, decision: "Monthly Salary" });
    }

    selectedIndices.forEach(idx => {
      const choice = currentScenario.choices[idx];
      let cost = choice.impact.balance;
      
      if (negotiatedIndices.has(idx)) {
        cost = Math.floor(cost * 0.85);
        cons.push({ text: `Haggled! You saved a few thousands.`, decision: `Negotiated ${choice.text}` });
      }

      balImpact += cost;
      hapImpact += choice.impact.happiness;
      cons.push({ text: choice.consequence, decision: choice.text });
      
      if (choice.category) {
        if (choice.category !== 'Saving') {
          newSpending[choice.category] = (newSpending[choice.category] || 0) + Math.abs(cost);
        }
        if (choice.category === 'Essential' || choice.category === 'Transport') {
           newPaidWeeks[choice.category] = stats.currentWeek;
        }
      }

      if (choice.investmentId) {
        const stock = stocks.find(s => s.id === choice.investmentId);
        if (stock) {
          const investedAmount = Math.abs(cost);
          const unitsToBuy = Math.floor(investedAmount / stock.price);
          if (unitsToBuy > 0) {
            const existingIdx = newPortfolio.findIndex(p => p.stockId === stock.id);
            if (existingIdx >= 0) {
              newPortfolio[existingIdx].shares += unitsToBuy;
            } else {
              newPortfolio.push({ stockId: stock.id, shares: unitsToBuy, averagePrice: stock.price });
            }
          }
        }
      }
    });

    // NOTE: Removed hardcoded food/transport penalties to focus on wealth generation strategy.
    
    const nextWeek = stats.currentWeek + 1;
    const newStats: PlayerStats = {
      ...stats,
      balance: stats.balance + balImpact,
      happiness: Math.min(100, Math.max(0, stats.happiness + hapImpact)),
      currentWeek: nextWeek,
      lastPaidWeeks: newPaidWeeks,
      spendingByCategory: newSpending
    };

    if (newStats.balance < 0 || nextWeek > 24) {
      setStatus(GameStatus.LOADING);
      const res = await getEndGameAnalysis(newStats, history, newStats.balance < 0 ? "Broke" : "Completed");
      setReport(res);
      setStatus(newStats.balance < 0 ? GameStatus.GAMEOVER : GameStatus.VICTORY);
      return;
    }

    setStats(newStats);
    setPortfolio(newPortfolio);
    setLastConsequences({ items: cons, lesson: currentScenario.lesson });
    
    const newHistory = [...history, { 
      week: stats.currentWeek, title: currentScenario.title, 
      decision: selectedIndices.map(i => currentScenario.choices[i].text).join(" & "), 
      consequence: cons.map(c => c.text).join(" "), amount: balImpact, balanceAfter: newStats.balance 
    }];
    setHistory(newHistory);
    setSelectedIndices([]);
    setNegotiatedIndices(new Set());
    
    prefetch({ ...newStats, currentWeek: nextWeek + 1 }, newHistory);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ stats: newStats, history: newHistory, portfolio: newPortfolio, stocks }));
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen p-4 pb-24 relative selection:bg-emerald-100">
      {status === GameStatus.START && (
        <div className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-12 animate-in zoom-in">
           <div className="space-y-4">
             <h1 className="text-9xl font-black text-slate-900 logo-font tracking-tighter leading-none"><span className="text-gradient">Naira<br/>Wise</span></h1>
             <p className="text-2xl font-medium text-slate-400 max-w-lg mx-auto italic">Master your money in the heart of Nigeria.</p>
           </div>
           <button onClick={() => setStatus(GameStatus.HOW_TO_PLAY)} className="px-12 py-8 bg-slate-900 text-white rounded-full font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 shadow-2xl active:scale-95">Enter Streets <ArrowRight/></button>
        </div>
      )}

      {status === GameStatus.HOW_TO_PLAY && (
        <div className="max-w-5xl mx-auto space-y-16 py-10 animate-in slide-in-from-bottom-12 pb-32">
          <header className="text-center space-y-6">
            <h2 className="text-6xl md:text-7xl font-black logo-font text-slate-900 tracking-tighter uppercase">The Hustle Handbook</h2>
            <div className="flex justify-center gap-4">
              <span className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-200">Survival Guide</span>
              <span className="px-6 py-2 bg-amber-100 text-amber-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-amber-200">Finance Hacks</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 border-l-8 border-emerald-500 pl-6">Street Survival</h3>
              <div className="space-y-4">
                {[
                  { icon: ShieldHalf, title: "Avoid 'Sapa' Mode", text: "If your balance hits zero, game over. Always keep 10% cash 'under your pillow' (Naira Box)." },
                  { icon: Coins, title: "The 72-Hour Rule", text: "Before buying that fancy item, wait 3 days. If you still want it AND can afford it twice, buy it." },
                  { icon: Scale, title: "Haggle Everything", text: "In the Nigerian market, the first price is never the real price. Use the 'Haggle' button to save." },
                  { icon: BrainCircuit, title: "Black Tax Budget", text: "Family will always ask. Set a 'Family' budget at the start of the month. Once it's gone, it's gone." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl h-fit"><item.icon size={24}/></div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 border-l-8 border-amber-500 pl-6">Naija Finance Hacks</h3>
              <div className="space-y-4">
                {[
                  { icon: Lightbulb, title: "Compound Interest", text: "Mutual funds beat savings accounts every time. Stanbic Fund is your best friend for steady, low-risk growth." },
                  { icon: ShieldCheck, title: "Blue-Chip Stocks", text: "Companies like MTN and Zenith pay dividends. They give you money just for owning a part of the company." },
                  { icon: Smartphone, title: "The Data Hustle", text: "Data is expensive. Use Wi-Fi whenever you can. Buying data in bulk saves you 30% compared to daily plans." },
                  { icon: Zap, title: "Bulk Market Runs", text: "Never buy groceries daily. Bulk buying at local markets saves thousands in food costs." }
                ].map((item, i) => (
                  <div key={i} className="bg-amber-50/50 p-6 rounded-[2rem] shadow-sm border border-amber-100 flex gap-5 hover:bg-amber-50 transition-colors">
                    <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl h-fit"><item.icon size={24}/></div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <button onClick={() => setStatus(GameStatus.SETUP)} className="w-full py-10 bg-slate-900 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-6 group">
            Ready to Hustle? <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform"/>
          </button>
        </div>
      )}

      {status === GameStatus.SETUP && (
        <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl max-w-4xl mx-auto space-y-12 border border-slate-100 animate-in slide-in-from-bottom-12">
           <header className="text-center space-y-2">
             <h2 className="text-5xl font-black logo-font text-slate-900 tracking-tighter uppercase">Identity Setup</h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Craft your digital hustler profile</p>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><User size={12}/> Your Name</label>
                <input 
                  value={setup.name} 
                  onChange={e => setSetup({...setup, name: e.target.value})} 
                  className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner" 
                  placeholder="Street Name or Real Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Briefcase size={12}/> The Hustle</label>
                <select 
                  value={setup.job} 
                  onChange={e => setSetup({...setup, job: e.target.value})} 
                  className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500 appearance-none shadow-inner"
                >
                  {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {setup.job === "Custom Hustle..." && (
                <div className="space-y-2 col-span-1 md:col-span-2 animate-in slide-in-from-top-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Target size={12}/> Specify Your Custom Hustle</label>
                  <textarea 
                    value={setup.customJob} 
                    onChange={e => setSetup({...setup, customJob: e.target.value})} 
                    className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner h-24" 
                    placeholder="e.g. Suya Man, Instagram Influencer, Fish Farmer..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><MapPin size={12}/> Location (State)</label>
                <select 
                  value={setup.city} 
                  onChange={e => setSetup({...setup, city: e.target.value})} 
                  className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500 appearance-none shadow-inner"
                >
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Banknote size={12}/> Monthly Take Home (₦)</label>
                <input 
                  type="number" 
                  value={setup.salary} 
                  onChange={e => setSetup({...setup, salary: parseInt(e.target.value)||0})} 
                  className="w-full bg-slate-50 p-6 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><User size={12}/> Gender</label>
                <div className="flex gap-2">
                  {['male', 'female', 'other'].map(g => (
                    <button 
                      key={g} 
                      onClick={() => setSetup({...setup, gender: g as any})} 
                      className={`flex-1 py-4 rounded-2xl font-black capitalize transition-all border-2 ${setup.gender === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Heart size={12}/> Marital Status</label>
                <div className="flex gap-2">
                  {['single', 'married'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setSetup({...setup, maritalStatus: m as any, numberOfKids: m === 'single' ? 0 : setup.numberOfKids})} 
                      className={`flex-1 py-4 rounded-2xl font-black capitalize transition-all border-2 ${setup.maritalStatus === m ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {setup.maritalStatus === 'married' && (
                <div className="space-y-2 animate-in slide-in-from-top-4 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Baby size={12}/> Number of Kids</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={setup.numberOfKids} 
                      onChange={e => setSetup({...setup, numberOfKids: parseInt(e.target.value)||0})} 
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-xl font-black">{setup.numberOfKids}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Languages size={12}/> Narrator Vibe</label>
                <div className="flex gap-2">
                  {['English', 'Pidgin'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => setSetup({...setup, narrationLanguage: l as any})} 
                      className={`flex-1 py-4 rounded-2xl font-black capitalize transition-all border-2 ${setup.narrationLanguage === l ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex gap-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl h-fit"><Info size={20}/></div>
             <p className="text-xs font-medium text-indigo-900 leading-relaxed italic">
               Heads up! Married hustlers with kids face higher costs but might find more community support and specific bonuses.
             </p>
           </div>

           <button onClick={handleStart} className="w-full py-9 bg-emerald-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4">
             Confirm Profile <ArrowRight size={32}/>
           </button>
        </div>
      )}

      {status === GameStatus.LOADING && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
          <Loader2 className="w-24 h-24 text-emerald-600 animate-spin"/>
          <p className="font-black text-slate-900 text-2xl tracking-[0.5em] uppercase text-center">Spawning in Nigeria...</p>
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
          
          {activeTab === 'scenario' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
              <div className="lg:col-span-8 space-y-8">
                {lastConsequences ? (
                  <div className="bg-white p-12 rounded-[4rem] shadow-2xl text-center space-y-12 border border-slate-50 overflow-hidden relative">
                    <h3 className="text-5xl font-black logo-font text-slate-900 tracking-tighter uppercase">Last Week's Result</h3>
                    <div className="space-y-4">
                      {lastConsequences.items.map((it, i) => (
                        <div key={i} className={`p-8 rounded-[3rem] text-left border italic font-bold ${it.decision.includes('Salary') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : (it.decision.includes('Neglected') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700')}`}>"{it.text}"</div>
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
                        <img src={`https://picsum.photos/seed/naira-${currentScenario?.imageTheme}/1200/800`} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-12">
                          <h2 className="text-5xl font-black logo-font text-white tracking-tighter uppercase">{currentScenario?.title}</h2>
                        </div>
                      </div>
                      <div className="p-12 text-slate-600 font-medium text-2xl leading-relaxed">{currentScenario?.description}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentScenario?.choices.map((c, i) => {
                        const isSelected = selectedIndices.includes(i);
                        const isNegotiated = negotiatedIndices.has(i);
                        const displayCost = isNegotiated ? Math.floor(Math.abs(c.impact.balance) * 0.85) : Math.abs(c.impact.balance);
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
                                <p className={`text-2xl font-black ${isNegotiated ? 'text-emerald-400' : ''}`}>
                                  {displayCost === 0 ? '₦0' : `₦${displayCost.toLocaleString()}`}
                                </p>
                              </div>
                            </div>
                            {c.category === 'Repairs' && !isSelected && (
                              <button onClick={(e) => { e.stopPropagation(); toggleNegotiation(i); }} className={`mt-4 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border flex items-center gap-2 transition-all ${isNegotiated ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}>
                                <Gavel size={14}/> {isNegotiated ? 'Negotiated' : 'Haggle'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedIndices.length > 0 && (
                      <button onClick={confirmChoice} className="w-full py-12 bg-emerald-600 text-white rounded-[4rem] font-black text-4xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">Confirm Week's Move</button>
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
              stocks={stocks} 
              portfolio={portfolio} 
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
              balance={stats.balance} 
              onSetTrigger={() => {}} 
            />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl max-w-5xl mx-auto space-y-12">
               <h3 className="text-5xl font-black text-center text-slate-900 tracking-tighter uppercase">Spending Flow</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats ? Object.entries(stats.spendingByCategory).map(([name, value]) => ({ name, value })) : []}>
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
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Bal: ₦{h.balanceAfter.toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {(status === GameStatus.GAMEOVER || status === GameStatus.VICTORY) && report && (
        <div className="flex flex-col items-center justify-center min-h-screen py-20 animate-in zoom-in duration-500">
          <div className="bg-white p-12 md:p-24 rounded-[5rem] shadow-2xl border-4 border-slate-50 space-y-16 max-w-4xl w-full mx-auto overflow-hidden relative">
            <div className="text-center space-y-6">
              <h2 className={`text-7xl font-black tracking-tighter uppercase ${status === GameStatus.VICTORY ? 'text-emerald-600' : 'text-rose-600'}`}>
                {status === GameStatus.VICTORY ? 'Hustle King!' : 'Game Over'}
              </h2>
              <div className="flex items-center justify-center gap-4">
                 <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-4xl font-black">
                   {report.grade || 'C'}
                 </div>
                 <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Final Grade</p>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[3rem] text-xl font-bold text-slate-800 italic border-2 border-slate-100">
              {report.verdict}
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Street Wisdom Points</h3>
              {report.points?.map((p: string, i: number) => (
                <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl h-fit"><CheckCircle2 size={20}/></div>
                  <p className="font-bold text-slate-700 leading-tight">{p}</p>
                </div>
              ))}
            </div>

            <button onClick={resetGame} className="w-full py-12 bg-slate-900 text-white rounded-[4rem] font-black text-3xl flex items-center justify-center gap-6 shadow-2xl transition-all hover:bg-emerald-600 active:scale-95">
              <Trash2 size={32} /> Restart Life Cycle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
