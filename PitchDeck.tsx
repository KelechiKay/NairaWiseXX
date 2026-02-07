
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  X,
  Globe,
  DollarSign
} from 'lucide-react';

const SLIDES = [
  {
    title: "NairaWise",
    subtitle: "Gamifying Financial Survival in the Heart of Africa",
    content: "Building the next generation of financially savvy Africans through AI-driven roleplay and hyper-realistic economic simulations.",
    icon: Zap,
    color: "bg-emerald-600",
    stats: "200M+ Market Size"
  },
  {
    title: "The Problem",
    subtitle: "Financial Chaos & 'Sapa'",
    content: "Nigeria faces 30%+ inflation, currency volatility, and a deep lack of practical financial education. Traditional banking tools are reactive, not educational.",
    icon: ShieldCheck,
    color: "bg-rose-600",
    stats: "30% Inflation Gap"
  },
  {
    title: "The Solution",
    subtitle: "The Hustle Wallet RPG",
    content: "A Gemini-powered simulation engine that creates dynamic life scenarios. Users learn to manage 'Liquid Cash' vs 'Asset Gains' in a risk-free environment that feels like the streets.",
    icon: TrendingUp,
    color: "bg-indigo-600",
    stats: "AI-Driven Narratives"
  },
  {
    title: "The Tech Edge",
    subtitle: "AI as a Financial Mentor",
    content: "Using Gemini 3 Flash to generate hyper-local content in English and Pidgin. Real-time market sentiment analysis and personalized financial SWOT audits for every user.",
    icon: Globe,
    color: "bg-slate-900",
    stats: "Scalable Personalization"
  },
  {
    title: "Monetization",
    subtitle: "From Game to Gateway",
    content: "Lead generation for fintech partners (PiggyVest, OPay), high-value consumer behavior data, and premium educational modules for corporate CSR.",
    icon: DollarSign,
    color: "bg-amber-500",
    stats: "B2B & B2C Potential"
  }
];

export const PitchDeck: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [current, setCurrent] = useState(0);

  const next = () => current < SLIDES.length - 1 && setCurrent(current + 1);
  const prev = () => current > 0 && setCurrent(current - 1);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300 overflow-y-auto">
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
      >
        <X size={32} />
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        <div className="space-y-8 animate-in slide-in-from-left-10 duration-500">
           <div className="flex items-center gap-4">
             <div className={`p-4 rounded-3xl ${slide.color} text-white shadow-2xl`}>
               <Icon size={40} />
             </div>
             <div>
               <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">Slide {current + 1} / {SLIDES.length}</p>
               <h2 className="text-5xl md:text-7xl font-black text-white logo-font tracking-tighter">{slide.title}</h2>
             </div>
           </div>
           
           <div className="space-y-4">
             <h3 className="text-2xl md:text-3xl font-black text-slate-300 italic">"{slide.subtitle}"</h3>
             <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium">
               {slide.content}
             </p>
           </div>

           <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] inline-block">
             <p className="text-emerald-400 font-black text-2xl">{slide.stats}</p>
           </div>

           <div className="flex gap-4 pt-10">
              <button 
                onClick={prev} 
                disabled={current === 0}
                className="p-6 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all disabled:opacity-20"
              >
                <ArrowLeft size={24} />
              </button>
              <button 
                onClick={next} 
                disabled={current === SLIDES.length - 1}
                className="flex-1 p-6 bg-emerald-600 text-white rounded-full font-black text-xl flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all disabled:opacity-20 shadow-2xl shadow-emerald-600/20"
              >
                Next Slide <ArrowRight size={24} />
              </button>
           </div>
        </div>

        <div className="hidden lg:block relative">
           <div className={`absolute inset-0 ${slide.color} blur-[120px] opacity-20 transition-all duration-700`} />
           <div className="relative bg-slate-900/50 border border-white/10 p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl space-y-8 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 </div>
                 <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Investment Deck V1.0</div>
              </div>
              <div className="aspect-video bg-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden border border-white/5">
                 <img 
                    src={`https://picsum.photos/seed/pitch-${current}/800/450`} 
                    className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                 <p className="absolute bottom-10 left-10 text-white font-black text-2xl tracking-tighter uppercase">{slide.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${slide.color} transition-all duration-1000`} style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }} />
                 </div>
                 <div className="h-2 bg-white/5 rounded-full" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
