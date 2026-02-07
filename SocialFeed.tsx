
import React from 'react';
import { SocialPost } from './types';
import { MessageCircle, Heart, Share2, BadgeCheck, TrendingUp, TrendingDown, Laugh, Info } from 'lucide-react';

interface SocialFeedProps {
  posts: SocialPost[];
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Share2 size={14} className="text-emerald-500" /> Naija Trends
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-pulse">
          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> LIVE
        </span>
      </div>
      
      <div className="space-y-3">
        {posts.map((post, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-100 transition-all group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden border-2 border-slate-50">
                {post.sentiment === 'bullish' ? '📈' : post.sentiment === 'bearish' ? '📉' : post.sentiment === 'funny' ? '😂' : '💡'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-black text-slate-900 text-sm truncate max-w-[120px]">{post.name}</span>
                  {post.isVerified && <BadgeCheck size={14} className="text-emerald-500 fill-current text-white" />}
                  <span className="text-slate-400 text-xs font-medium">@{post.handle}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-3 font-medium">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-5">
                    <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                      <MessageCircle size={14} />
                      <span className="text-[10px] font-bold">{post.retweets}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                      <Heart size={14} />
                      <span className="text-[10px] font-bold">{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-1.5 opacity-50">
                      {post.sentiment === 'bullish' && <TrendingUp size={14} className="text-emerald-500" />}
                      {post.sentiment === 'bearish' && <TrendingDown size={14} className="text-rose-500" />}
                      {post.sentiment === 'funny' && <Laugh size={14} className="text-amber-500" />}
                      {post.sentiment === 'advice' && <Info size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white/90 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp size={60} />
        </div>
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Market Sentiment</p>
        <p className="text-xs font-medium leading-relaxed">
          Monitor the feed! Trends on "Naija X" often move the stock prices in the following week. 
          <span className="block mt-2 font-black text-white underline">#NairaWise #InvestmentTips #NGX</span>
        </p>
      </div>
    </div>
  );
};

export default SocialFeed;
