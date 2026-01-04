
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PlayerStats, 
  Scenario, 
  GameLog, 
  GameStatus, 
  Choice,
  Stock,
  PortfolioItem
} from './types';
import { getNextScenario, getEndGameAnalysis, getVictoryAnalysis } from './services/geminiService';
import Dashboard from './components/Dashboard';
import StockMarket from './StockMarket';
import SocialFeed from './SocialFeed';
import { 
  Loader2, 
  Banknote, 
  Heart, 
  Skull, 
  Flame, 
  Crown, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Zap,
  Users,
  MapPin,
  Briefcase,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Gamepad2,
  Lightbulb,
  Coins,
  PiggyBank,
  Scale,
  Percent,
  Trophy,
  BarChart,
  ClipboardCheck,
  ArrowRightCircle,
  History,
  TrendingDown,
  Info,
  ShieldAlert,
  HelpCircle,
  MousePointer2,
  BellRing,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Minus,
  Baby,
  Store,
  PackagePlus
} from 'lucide-react';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", 
  "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const JOBS = [
  "Digital Hustler", "Civil Servant", "Banker", "Market Trader", 
  "Tech Sis/Bro", "Doctor", "Artisan", "Content Creator", "Student"
];

const JOB_DEFAULTS: Record<string, number> = {
  "Digital Hustler": 150000,
  "Civil Servant": 75000,
  "Banker": 250000,
  "Market Trader": 0,
  "Tech Sis/Bro": 450000,
  "Doctor": 350000,
  "Artisan": 100000,
  "Content Creator": 200000,
  "Student": 30000
};

const CHALLENGES = [
  { id: 'sapa-max', name: 'Sapa Level Max', icon: Flame, color: 'text-orange-500', start: 10000, description: 'High inflation, low starting cash.' },
  { id: 'black-tax', name: 'Black Tax Heavy', icon: Heart, color: 'text-rose-500', start: 50000, description: 'Family needs pop up more often.' },
  { id: 'silver-spoon', name: 'Silver Spoon', icon: Crown, color: 'text-indigo-500', start: 500000, description: 'More cash, but lifestyle traps are deadly.' }
];

const INITIAL_STOCKS: Stock[] = [
  { id: 'mtn-ng', name: 'MTN Nigeria', price: 280, history: [270, 275, 280], sector: 'Telecom', assetType: 'stock' },
  { id: 'zenith', name: 'Zenith Bank', price: 42, history: [38, 40, 42], sector: 'Banking', assetType: 'stock' },
  { id: 'dangote-cem', name: 'Dangote Cement', price: 650, history: [600, 620, 650], sector: 'Industrial', assetType: 'stock' },
  { id: 'stanbic-fund', name: 'Stanbic IBTC Fund', price: 100, history: [100, 100, 100], sector: 'Growth', assetType: 'mutual_fund' },
];

const FINANCIAL_LESSONS = [
  { title: "The Choice: Owambe vs. Assets", icon: <Coins className="text-amber-500" />, lesson: "Wealth is built in the gap between what you earn and what you spend. Every Owambe is a withdrawal from your future." },
  { title: "Mutual Funds vs. Stocks", icon: <TrendingUp className="text-emerald-500" />, lesson: "Stocks are high-risk/high-reward. Mutual funds are professional managed pools that lower your risk through diversification." },
  { title: "The Black Tax Reality", icon: <Users className="text-indigo-500" />, lesson: "Budget for family assistance. 'No' is a complete sentence that protects your financial health." },
  { title: "The Trader's Secret", icon: <Store className="text-blue-500" />, lesson: "Inventory is your lifeblood. An empty shop earns 0. Always keep enough cash to restock." },
  { title: "Ponzi & 'Get Rich Quick'", icon: <ShieldAlert className="text-red-500" />, lesson: "If it sounds too good to be true, it is a scam. Protect your capital at all costs." }
];

const FINANCIAL_RUDIMENTS = [
  { title: "The 50/30/20 Budget Rule", icon: <Scale className="text-indigo-600" />, desc: "Allocate 50% for Needs, 30% for Wants, and 20% for Savings & Investments." },
  { title: "Emergency Fund (Sapa Shield)", icon: <PiggyBank className="text-emerald-600" />, desc: "A stash of cash for the unexpected—hospital bills or salary delays." },
  { title: "Good Debt vs. Bad Debt", icon: <AlertCircle className="text-rose-600" />, desc: "Good debt helps you earn (business loan). Bad debt drains you (high-interest consumer loan)." },
  { title: "Compound Interest Magic", icon: <Percent className="text-amber-600" />, desc: "Earning interest on interest. Over time, small amounts grow into massive wealth." },
  { title: "The Inflation Monster", icon: <TrendingDown className="text-red-600" />, desc: "Inflation makes your money buy less. Don't leave all your cash idle in a bank." },
  { title: "Restock or Regret", icon: <PackagePlus className="text-blue-600" />, desc: "For traders, 'money in hand' is dangerous if 'goods on shelf' are low." }
];

const TUTORIAL_STEPS = [
  { title: "Wallet (Cash)", icon: <Skull size={32} className="text-slate-900" />, desc: "If hits ₦0, Sapa wins. Game Over." },
  { title: "Naira Box (Savings)", icon: <PiggyBank size={32} className="text-emerald-600" />, desc: "Your buffer for emergency bills." },
  { title: "Shop Stock (Inventory)", icon: <Store size={32} className="text-blue-600" />, desc: "Only for Traders. You must spend cash to fill your shop to make sales!" }
];

const HOW_TO_PLAY_STEPS = [
  { title: "Weekly Moves", icon: <MousePointer2 size={24} className="text-indigo-600" />, desc: "Pick 2 options every week. Balance vibes and wealth." },
  { title: "Trader Sales", icon: <Store size={24} className="text-emerald-600" />, desc: "Traders make daily sales based on their Stock levels. No fixed salary!" },
  { title: "Salary Alert", icon: <BellRing size={24} className="text-amber-500" />, desc: "Fixed salary enters every 4 weeks for non-traders." }
];

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [nextScenario, setNextScenario] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<GameLog[]>([]);
  const [lastConsequences, setLastConsequences] = useState<{items: {text: string, decision: string}[], lesson: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'scenario' | 'invest' | 'history'>('scenario');
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [savingsInput, setSavingsInput] = useState('');
  const [restockInput, setRestockInput] = useState('');
  const [report, setReport] = useState('');
  const isPrefetching = useRef(false);

  const [setup, setSetup] = useState({ 
    name: '', gender: 'male' as 'male' | 'female' | 'other', job: JOBS[0], 
    salary: JOB_DEFAULTS[JOBS[0]], city: NIGERIAN_STATES[24], challengeId: 'sapa-max', 
    maritalStatus: 'single' as 'single' | 'married', numberOfKids: 0
  });

  const getNetAssets = useCallback(() => {
    if (!stats) return 0;
    const stockVal = portfolio.reduce((acc, p) => acc + (stocks.find(s => s.id === p.stockId)?.price || 0) * p.shares, 0);
    return stats.balance + stats.savings + stockVal + (stats.inventory || 0) - stats.debt;
  }, [stats, portfolio, stocks]);

  const prefetch = useCallback(async (s: PlayerStats, h: GameLog[]) => {
    if (isPrefetching.current) return;
    isPrefetching.current = true;
    try {
      const scene = await getNextScenario(s, h);
      setNextScenario(scene);
    } catch (e) { console.error(e); }
    isPrefetching.current = false;
  }, []);

  const handleStart = async () => {
    if (!setup.name) return alert("Abeg, what is your name?");
    setStatus(GameStatus.LOADING);
    const challenge = CHALLENGES.find(c => c.id === setup.challengeId)!;
    
    const initial: PlayerStats = {
      name: setup.name, gender: setup.gender, age: 24, 
      salary: setup.job === "Market Trader" ? 0 : (setup.salary || 0),
      balance: challenge.start, savings: 0, debt: 0, happiness: 80,
      currentWeek: 1, job: setup.job, city: setup.city, challenge: challenge.name,
      maritalStatus: setup.maritalStatus, 
      numberOfKids: setup.maritalStatus === 'married' ? setup.numberOfKids : 0,
      inventory: setup.job === "Market Trader" ? 50000 : 0,
      businessDebt: 0
    };
    setStats(initial);
    try {
      const scene = await getNextScenario(initial, []);
      setCurrentScenario(scene);
      setStatus(GameStatus.PLAYING);
      prefetch(initial, []);
    } catch (e) { setStatus(GameStatus.START); }
  };

  const toggleChoice = (index: number) => {
    setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : (prev.length < 2 ? [...prev, index] : prev));
  };

  const confirmChoice = async () => {
    if (!stats || !currentScenario || selectedIndices.length === 0) return;
    
    let balImpact = 0;
    let hapImpact = 0;
    let savImpact = 0;
    let debtImpact = 0;
    let invImpact = 0;
    let cons: {text: string, decision: string}[] = [];

    // Base Turn Sales Logic for Traders
    if (stats.job === "Market Trader" && stats.inventory > 0) {
      const salesPercent = 0.1 + (Math.random() * 0.15); // Sells 10-25% of inventory weekly
      const costOfGoods = Math.floor(stats.inventory * salesPercent);
      const profitMargin = 1.2 + (Math.random() * 0.3); // 20-50% profit
      const salesRevenue = Math.floor(costOfGoods * profitMargin);
      
      balImpact += salesRevenue;
      invImpact -= costOfGoods;
      cons.push({ 
        text: `Weekly Sales: You sold some goods for ₦${salesRevenue.toLocaleString()} (₦${(salesRevenue-costOfGoods).toLocaleString()} profit).`, 
        decision: "MARKET SALES" 
      });
    }

    // Salary Logic (Non-traders)
    if (stats.job !== "Market Trader" && stats.currentWeek % 4 === 0) {
      balImpact += stats.salary;
      cons.push({ text: `Salary Alert! ₦${stats.salary.toLocaleString()} don enter. Manage am well.`, decision: "SALARY" });
    }

    selectedIndices.forEach(idx => {
      const choice = currentScenario.choices[idx];
      balImpact += choice.impact.balance;
      hapImpact += choice.impact.happiness;
      savImpact += choice.impact.savings || 0;
      debtImpact += choice.impact.debt || 0;
      cons.push({ text: choice.consequence, decision: choice.text });

      if (choice.investmentId) {
        const stock = stocks.find(s => s.id === choice.investmentId);
        if (stock) {
          setPortfolio(prev => {
            const has = prev.find(p => p.stockId === stock.id);
            if (has) return prev.map(p => p.stockId === stock.id ? {...p, shares: p.shares + 1} : p);
            return [...prev, { stockId: stock.id, shares: 1, averagePrice: stock.price }];
          });
        }
      }
    });

    const nextWeek = stats.currentWeek + 1;
    const newStats = {
      ...stats,
      balance: stats.balance + balImpact,
      savings: Math.max(0, stats.savings + savImpact),
      debt: Math.max(0, stats.debt + debtImpact),
      inventory: Math.max(0, stats.inventory + invImpact),
      happiness: Math.min(100, Math.max(0, stats.happiness + hapImpact)),
      currentWeek: nextWeek
    };

    if (newStats.balance < 0) {
      const deficit = Math.abs(newStats.balance);
      if (newStats.savings >= deficit) {
        newStats.savings -= deficit;
        newStats.balance = 0;
        cons.push({ text: "Wallet dry, used Naira Box savings to pay bills.", decision: "AUTO-SAVINGS" });
      } else {
        const analysis = await getEndGameAnalysis(newStats, history);
        setReport(analysis);
        setStatus(GameStatus.GAMEOVER);
        return;
      }
    }

    if (nextWeek > 24) {
      setReport(await getVictoryAnalysis(newStats, getNetAssets()));
      setStatus(GameStatus.VICTORY);
      return;
    }

    setStats(newStats);
    setLastConsequences({ items: cons, lesson: currentScenario.lesson });
    setHistory([...history, { 
      week: stats.currentWeek, title: currentScenario.title, 
      decision: selectedIndices.map(i => currentScenario.choices[i].text).join(" & "), 
      consequence: cons.map(c => c.text).join(" "), amount: balImpact, balanceAfter: newStats.balance 
    }]);
    setSelectedIndices([]);
    if (!nextScenario) prefetch(newStats, history);
  };

  const handleRestock = () => {
    const amt = parseInt(restockInput);
    if (!stats || isNaN(amt) || amt <= 0 || stats.balance < amt) return;
    const newStats = { ...stats, balance: stats.balance - amt, inventory: stats.inventory + amt };
    setStats(newStats);
    setHistory([...history, { 
      week: stats.currentWeek, title: "Shop Restock", decision: `Spent ₦${amt.toLocaleString()} on goods`, 
      consequence: "Shop is now full for next week's sales.", amount: -amt, balanceAfter: newStats.balance 
    }]);
    setRestockInput('');
  };

  const nextTurn = () => {
    if (nextScenario) {
      setStocks(prev => prev.map(s => {
        const newPrice = Math.max(1, Math.floor(s.price * (1 + (Math.random() * 0.16 - 0.07))));
        return { ...s, price: newPrice, history: [...s.history.slice(-14), newPrice] };
      }));
      setCurrentScenario(nextScenario);
      setNextScenario(null);
      setLastConsequences(null);
      if (stats) prefetch(stats, history);
    } else {
      setStatus(GameStatus.LOADING);
      setTimeout(() => setStatus(GameStatus.PLAYING), 800);
    }
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen p-3 md:p-4 pb-24 overflow-x-hidden">
      {status === GameStatus.START && (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-8 md:space-y-12 animate-in fade-in zoom-in duration-1000">
           <div className="relative">
              <div className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse" />
              <h1 className="text-7xl md:text-[10rem] font-black text-slate-900 logo-font tracking-tighter relative leading-[0.8]">
                 <span className="text-gradient">Naira<br/>Wise</span>
              </h1>
           </div>
           <p className="text-lg md:text-2xl font-medium text-slate-500 max-w-lg leading-relaxed px-4">
              Master the hustle. Dodge Sapa. Build your legacy in 24 weeks.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-xl px-4">
             <button onClick={() => setStatus(GameStatus.HOW_TO_PLAY)} className="flex-1 py-5 md:py-7 bg-white border-2 md:border-4 border-slate-100 text-slate-900 rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl flex items-center justify-center gap-3 transition-all hover:border-indigo-200 shadow-xl group">
               <HelpCircle className="group-hover:text-indigo-600 transition-colors" /> Guide
             </button>
             <button onClick={() => setStatus(GameStatus.TUTORIAL)} className="flex-1 py-5 md:py-7 bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl">
               Enter Hustle <ArrowRight />
             </button>
           </div>
        </div>
      )}

      {/* Info Screens (Simplified for code length) */}
      {(status === GameStatus.HOW_TO_PLAY || status === GameStatus.TUTORIAL || status === GameStatus.LESSONS || status === GameStatus.RUDIMENTS) && (
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-16 rounded-3xl md:rounded-[4rem] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-500 relative">
          <button onClick={() => setStatus(GameStatus.START)} className="absolute top-6 left-6 p-3 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"><ArrowLeft size={20} /></button>
          <div className="mt-12 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            <header className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black mb-4 logo-font text-slate-900">Wisdom Hub</h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium">Get ready for the Nigerian market.</p>
            </header>
            <div className="space-y-6">
              {(status === GameStatus.HOW_TO_PLAY ? HOW_TO_PLAY_STEPS : 
                 status === GameStatus.TUTORIAL ? TUTORIAL_STEPS : 
                 status === GameStatus.LESSONS ? FINANCIAL_LESSONS : 
                 FINANCIAL_RUDIMENTS).map((step: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="p-4 bg-white rounded-xl shadow-sm text-indigo-600 flex-shrink-0">
                    {React.isValidElement(step.icon) ? step.icon : React.cloneElement(step.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-1">{step.title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{step.desc || step.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => {
              if (status === GameStatus.HOW_TO_PLAY) setStatus(GameStatus.TUTORIAL);
              else if (status === GameStatus.TUTORIAL) setStatus(GameStatus.LESSONS);
              else if (status === GameStatus.LESSONS) setStatus(GameStatus.RUDIMENTS);
              else setStatus(GameStatus.SETUP);
            }} className="w-full mt-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-xl transition-all">Next</button>
          </div>
        </div>
      )}

      {status === GameStatus.SETUP && (
        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl space-y-8 animate-in slide-in-from-bottom-8 border border-slate-100 max-w-3xl mx-auto relative overflow-hidden">
          <button onClick={() => setStatus(GameStatus.RUDIMENTS)} className="absolute top-6 left-6 p-3 bg-slate-50 rounded-full text-slate-400 z-10"><ArrowLeft size={20} /></button>
          <header className="text-center pt-8">
            <h2 className="text-3xl md:text-5xl font-black logo-font text-slate-900">Profile Creator</h2>
            <p className="text-slate-500 font-medium">Design your Nigerian journey.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] md:max-h-none pr-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Name</label>
              <input value={setup.name} onChange={e => setSetup({...setup, name: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all text-lg" placeholder="e.g. Chinedu" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Career</label>
              <select value={setup.job} onChange={e => setSetup({...setup, job: e.target.value, salary: JOB_DEFAULTS[e.target.value]})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none text-lg">
                {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            {setup.job !== "Market Trader" && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Monthly Salary (₦)</label>
                <input type="number" value={setup.salary} onChange={e => setSetup({...setup, salary: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 p-5 rounded-2xl font-black border-2 border-transparent focus:border-emerald-500 outline-none text-lg" />
              </div>
            )}
            {setup.job === "Market Trader" && (
              <div className="space-y-2 p-5 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                 <Store className="text-indigo-600 flex-shrink-0" />
                 <p className="text-xs font-bold text-indigo-900 leading-tight">Traders don't have salary. You make sales weekly based on your inventory!</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">City</label>
              <select value={setup.city} onChange={e => setSetup({...setup, city: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none text-lg">
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Marital Status</label>
              <select value={setup.maritalStatus} onChange={e => setSetup({...setup, maritalStatus: e.target.value as any})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none text-lg">
                <option value="single">Single Life</option>
                <option value="married">Married</option>
              </select>
            </div>
          </div>
          <button onClick={handleStart} className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl md:text-2xl shadow-xl transition-all">Start My Hustle</button>
        </div>
      )}

      {status === GameStatus.LOADING && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
          <div className="w-24 h-24 border-[10px] border-emerald-50 border-t-emerald-600 rounded-full animate-spin relative">
            <Loader2 className="w-10 h-10 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="font-black text-slate-900 text-xl uppercase tracking-widest">Consulting Oga Mentor...</p>
        </div>
      )}

      {status === GameStatus.PLAYING && stats && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
          <header className="flex justify-between items-center bg-white/90 backdrop-blur-2xl p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-3 md:top-6 z-50">
            <h1 className="text-xl md:text-3xl font-black text-gradient logo-font">NairaWise</h1>
            <nav className="flex gap-2 md:gap-4">
              {[
                { id: 'scenario', icon: Gamepad2, label: 'Game' },
                { id: 'invest', icon: TrendingUp, label: 'Wealth' },
                { id: 'history', icon: History, label: 'Bank' }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl transition-all font-black text-[10px] md:text-sm ${activeTab === t.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-900'}`}>
                  <t.icon size={18} /> <span className="hidden xs:inline">{t.label}</span>
                </button>
              ))}
            </nav>
          </header>

          <Dashboard stats={stats} netAssets={getNetAssets()} />

          {activeTab === 'scenario' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 pb-10">
              <div className="lg:col-span-8 space-y-6 md:space-y-10">
                {lastConsequences ? (
                  <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[4rem] shadow-2xl text-center space-y-6 md:space-y-10 animate-in zoom-in duration-500 border border-slate-100 relative overflow-hidden">
                    <h3 className="text-2xl md:text-4xl font-black logo-font">Week {stats.currentWeek - 1} Review</h3>
                    <div className="space-y-4">
                      {lastConsequences.items.map((it, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-2xl text-left border border-slate-100 flex gap-4">
                           <div className="mt-1 flex-shrink-0"><Info size={20} className="text-indigo-500" /></div>
                           <p className="text-base font-bold text-slate-700 leading-relaxed">"{it.text}"</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-left">
                       <h4 className="text-[8px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-2">Mentor's Wisdom</h4>
                       <p className="text-lg md:text-2xl font-black text-emerald-900">{lastConsequences.lesson}</p>
                    </div>
                    <button onClick={nextTurn} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl transition-all">Next Turn</button>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-10">
                    <div className="bg-white rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 relative group">
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 z-10 shadow-lg">Week {stats.currentWeek}</div>
                      <div className="h-48 md:h-80 w-full relative"><img src={`https://picsum.photos/seed/naija-${currentScenario?.imageTheme || 'market'}/1200/600`} className="w-full h-full object-cover" /></div>
                      <div className="p-6 md:p-12 relative">
                        <h2 className="text-2xl md:text-5xl font-black mb-3 logo-font text-slate-900">{currentScenario?.title}</h2>
                        <p className="text-slate-500 font-medium text-lg md:text-2xl leading-relaxed">{currentScenario?.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:gap-5">
                      {currentScenario?.choices.map((c, i) => {
                        const isSel = selectedIndices.includes(i);
                        return (
                          <button key={i} onClick={() => toggleChoice(i)} className={`w-full text-left p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 md:border-4 transition-all duration-300 ${isSel ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.02]' : 'bg-white border-transparent shadow-md hover:border-indigo-100'}`}>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                              <p className="font-black text-base md:text-2xl leading-tight pr-0 md:pr-10">{c.text}</p>
                              <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 text-[10px] md:text-[12px] font-black uppercase whitespace-nowrap">
                                <span className={`flex items-center gap-1.5 ${isSel ? 'text-white' : 'text-slate-500'}`}><Banknote size={16} /> {c.impact.balance >= 0 ? '+' : ''}₦{c.impact.balance.toLocaleString()}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedIndices.length > 0 && (
                      <button onClick={confirmChoice} className="w-full py-6 md:py-10 bg-slate-900 text-white rounded-2xl md:rounded-[3rem] font-black text-xl md:text-3xl flex items-center justify-center gap-4 md:gap-6 group shadow-2xl animate-in slide-in-from-bottom-8">Confirm Decision <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></button>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 space-y-6 md:space-y-10">
                {stats.job === "Market Trader" && (
                  <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
                    <h4 className="font-black text-sm md:text-lg mb-6 flex items-center gap-3 uppercase tracking-[0.2em] text-slate-900"><Store size={24} className="text-blue-500" /> Shop Restock</h4>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₦</span>
                        <input type="number" value={restockInput} onChange={e => setRestockInput(e.target.value)} placeholder="Amount to spend" className="w-full bg-slate-50 pl-12 p-5 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-400 outline-none transition-all" />
                      </div>
                      <button onClick={handleRestock} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 flex items-center justify-center gap-2 uppercase tracking-widest"><PackagePlus size={18} /> Buy Goods</button>
                      <p className="text-[10px] font-bold text-slate-400 text-center uppercase">Currently in shop: ₦{stats.inventory.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <SocialFeed posts={currentScenario?.socialFeed || []} />
                <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
                  <h4 className="font-black text-sm md:text-lg mb-6 flex items-center gap-3 uppercase tracking-[0.2em] text-slate-900"><PiggyBank size={24} className="text-amber-500" /> Naira Box</h4>
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₦</span>
                      <input type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 pl-12 p-5 rounded-2xl font-black text-lg border-2 border-transparent focus:border-amber-400 outline-none transition-all" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        const amt = parseInt(savingsInput);
                        if (amt > 0 && stats.balance >= amt) {
                          const newBalance = stats.balance - amt;
                          setStats({...stats, balance: newBalance, savings: stats.savings + amt});
                          setHistory([...history, { week: stats.currentWeek, title: "Savings Move", decision: "Wallet → Box", consequence: `Stored ₦${amt.toLocaleString()}`, amount: -amt, balanceAfter: newBalance }]);
                          setSavingsInput('');
                        }
                      }} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow-xl uppercase tracking-widest">SAVE</button>
                      <button onClick={() => {
                        const amt = parseInt(savingsInput);
                        if (amt > 0 && stats.savings >= amt) {
                          const newBalance = stats.balance + amt;
                          setStats({...stats, balance: newBalance, savings: stats.savings - amt});
                          setHistory([...history, { week: stats.currentWeek, title: "Withdrawal Move", decision: "Box → Wallet", consequence: `Took ₦${amt.toLocaleString()}`, amount: amt, balanceAfter: newBalance }]);
                          setSavingsInput('');
                        }
                      }} className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-black text-[10px] shadow-xl uppercase tracking-widest">TAKE</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <StockMarket stocks={stocks} portfolio={portfolio} news={[]} onBuy={(id) => {
              const s = stocks.find(x => x.id === id)!;
              if (stats.balance >= s.price) {
                const newBalance = stats.balance - s.price;
                setStats({...stats, balance: newBalance});
                setPortfolio(prev => {
                  const has = prev.find(p => p.stockId === id);
                  if (has) return prev.map(p => p.stockId === id ? {...p, shares: p.shares + 1} : p);
                  return [...prev, { stockId: id, shares: 1, averagePrice: s.price }];
                });
                setHistory([...history, { week: stats.currentWeek, title: `Buy: ${s.name}`, decision: `Bought 1 Unit`, consequence: "Asset added.", amount: -s.price, balanceAfter: newBalance }]);
              }
            }} onSell={(id) => {
              const s = stocks.find(x => x.id === id)!;
              const has = portfolio.find(p => p.stockId === id);
              if (has && has.shares > 0) {
                const newBalance = stats.balance + s.price;
                setStats({...stats, balance: newBalance});
                setPortfolio(prev => prev.map(p => p.stockId === id ? {...p, shares: p.shares - 1} : p).filter(p => p.shares > 0));
                setHistory([...history, { week: stats.currentWeek, title: `Sell: ${s.name}`, decision: `Sold 1 Unit`, consequence: "Capital liquidated.", amount: s.price, balanceAfter: newBalance }]);
              }
            }} balance={stats.balance} onSetTrigger={(id, type, val) => {
               setPortfolio(prev => prev.map(p => p.stockId === id ? {...p, [type]: val} : p));
            }} />
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-6 md:p-12 rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-right-8 max-w-4xl mx-auto">
               <h3 className="text-2xl md:text-4xl font-black logo-font mb-8 flex items-center gap-3">Bank Statement</h3>
               <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                 {history.slice().reverse().map((h, i) => (
                   <div key={i} className="flex flex-col md:flex-row justify-between md:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 group gap-4">
                     <div className="flex gap-4 items-center">
                       <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-100 flex flex-col items-center justify-center font-black">
                          <span className="text-[8px] text-slate-400">WK</span>
                          <span className="text-lg text-slate-900">{h.week}</span>
                       </div>
                       <div className="min-w-0">
                         <p className="font-black text-lg text-slate-900 leading-tight mb-0.5">{h.title}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{h.decision}</p>
                       </div>
                     </div>
                     <div className="text-left md:text-right border-t md:border-none pt-3 md:pt-0">
                       <p className={`font-black text-xl md:text-3xl ${h.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{h.amount >= 0 ? '+' : ''}₦{h.amount.toLocaleString()}</p>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bal: ₦{h.balanceAfter.toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {(status === GameStatus.GAMEOVER || status === GameStatus.VICTORY) && (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-10 animate-in zoom-in duration-700 px-4">
          <div className={`p-8 md:p-16 rounded-[3rem] ${status === GameStatus.VICTORY ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} w-full max-w-4xl shadow-2xl border-4`}>
             <h2 className="text-4xl md:text-7xl font-black mb-6 logo-font text-slate-900">{status === GameStatus.VICTORY ? 'Oga Boss Status!' : 'Sapa Wins!'}</h2>
             <div className="bg-white p-6 rounded-2xl mb-8 text-left border shadow-inner max-h-[40vh] overflow-y-auto">
                <p className="text-lg md:text-2xl font-medium text-slate-700 italic">"{report}"</p>
             </div>
             <button onClick={() => window.location.reload()} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-2xl transition-all">Start New Life</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
