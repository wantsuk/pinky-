
import React, { useState, useEffect } from 'react';
import { EmojiSymbol } from '../types';
import { EMOJIS } from '../constants';

interface ReelProps {
  symbol: EmojiSymbol;
  isSpinning: boolean;
  delay: number;
}

const Reel: React.FC<ReelProps> = ({ symbol, isSpinning, delay }) => {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isSpinning) {
      interval = setInterval(() => {
        setDisplayIndex(prev => (prev + 1) % EMOJIS.length);
      }, 70); // Slightly slower than before for a more mechanical visual rhythm
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSpinning]);

  return (
    <div className="flex-1 min-w-0">
      <div className={`
        w-full aspect-square bg-white rounded-2xl border-4 border-pink-100 
        shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]
        flex items-center justify-center select-none overflow-hidden
        transition-all duration-300 transform relative
        ${isSpinning ? 'scale-95 brightness-95' : 'scale-100'}
      `}>
        <span className={`
          text-[50px] md:text-[60px] leading-none transition-all duration-75
          ${isSpinning ? 'animate-reel-roll blur-[2px] opacity-80' : 'animate-pop-in'}
        `}>
          {isSpinning ? EMOJIS[displayIndex] : symbol}
        </span>
      </div>
      
      <style>{`
        @keyframes reel-roll {
          0% { transform: translateY(-20px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(-20px); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-reel-roll {
          animation: reel-roll 0.1s linear infinite;
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default Reel;
