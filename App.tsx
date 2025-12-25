
import React, { useState, useCallback } from 'react';
import { EmojiSymbol, GameState, FortuneResponse } from './types';
import { EMOJIS } from './constants';
import { audioService } from './services/audioService';
import { getFortune } from './services/geminiService';
import Reel from './components/Reel';
import Confetti from './components/Confetti';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    reels: ['🌸', '🌸', '🌸'],
    isSpinning: false,
    lastWin: 0,
    message: 'Good luck! 🌸'
  });

  const [testInput, setTestInput] = useState('Welcome to Pinky Slots!');

  const [prizes, setPrizes] = useState<Record<EmojiSymbol, string>>({
    '🌸': 'Pink Sakura Petal 🌸',
    '🎀': 'Sparkling Bow 🎀',
    '🍭': 'Sweet Lollipop 🍭',
    '💎': 'Diamond Treasure 💎',
    '✨': 'Magic Stardust ✨'
  });

  const [emojiWeights, setEmojiWeights] = useState<Record<EmojiSymbol, number>>({
    '🌸': 40,
    '🎀': 30,
    '🍭': 20,
    '💎': 5,
    '✨': 15
  });

  const [showWinModal, setShowWinModal] = useState(false);
  const [winningEmoji, setWinningEmoji] = useState<EmojiSymbol | null>(null);
  const [fortune, setFortune] = useState<FortuneResponse | null>(null);
  const [loadingFortune, setLoadingFortune] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getRandomEmoji = useCallback(() => {
    const weightsArray = Object.values(emojiWeights) as number[];
    const totalWeight = weightsArray.reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    
    let random = Math.random() * totalWeight;
    for (const emoji of EMOJIS) {
      if (random < emojiWeights[emoji]) return emoji;
      random -= emojiWeights[emoji];
    }
    return EMOJIS[EMOJIS.length - 1];
  }, [emojiWeights]);

  const checkWin = useCallback((reels: EmojiSymbol[]) => {
    const [r1, r2, r3] = reels;
    if (r1 === r2 && r2 === r3) {
      audioService.playWinFanfare();
      setWinningEmoji(r1);
      setShowConfetti(true);
      setShowWinModal(true);
      setTimeout(() => setShowConfetti(false), 5000);
      return { win: 1, msg: `CONGRATULATIONS! 💖` };
    }
    return { win: 0, msg: 'Spin again for free! ✨' };
  }, []);

  const spin = useCallback(async (isForcedWin: boolean = false) => {
    if (state.isSpinning) return;

    setState(prev => ({
      ...prev,
      isSpinning: true,
      message: 'ROLLING...',
    }));
    
    audioService.startMechanicalSpin();

    let finalReels: EmojiSymbol[];
    if (isForcedWin) {
      const symbol = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      finalReels = [symbol, symbol, symbol];
    } else {
      finalReels = [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()];
    }

    setTimeout(() => {
      audioService.stopMechanicalSpin();
      const { win, msg } = checkWin(finalReels);
      setState(prev => ({
        ...prev,
        reels: finalReels,
        isSpinning: false,
        message: msg
      }));
      setFortune(null);
    }, 1600);
  }, [state.isSpinning, getRandomEmoji, checkWin]);

  const handlePrizeChange = (emoji: EmojiSymbol, text: string) => {
    setPrizes(prev => ({ ...prev, [emoji]: text }));
  };

  const handleWeightChange = (emoji: EmojiSymbol, weight: number) => {
    setEmojiWeights(prev => ({ ...prev, [emoji]: weight }));
  };

  const handleAskFortune = async () => {
    setLoadingFortune(true);
    const result = await getFortune(state.reels);
    setFortune(result);
    setLoadingFortune(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-[#fff8fb] select-none">
      {showConfetti && <Confetti />}

      {/* CONGRATULATIONS MODAL */}
      {showWinModal && winningEmoji && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pink-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl border-4 border-pink-400 relative animate-in zoom-in-95 duration-300">
            <div className="text-8xl mb-4 animate-bounce drop-shadow-sm">{winningEmoji}</div>
            <h2 className="text-4xl font-fredoka text-pink-600 mb-2">YOU WON!</h2>
            <p className="text-pink-300 mb-6 uppercase tracking-widest font-black text-[10px]">Special Item Unlocked</p>
            <div className="bg-pink-50 py-8 px-4 rounded-2xl border-2 border-dashed border-pink-200 mb-6">
              <span className="text-2xl font-bold text-pink-700 block">{prizes[winningEmoji]}</span>
            </div>
            <button 
              onClick={() => setShowWinModal(false)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-fredoka text-2xl py-5 rounded-2xl shadow-lg active:translate-y-1 transition-all"
            >
              AWESOME! 💖
            </button>
          </div>
        </div>
      )}

      {/* LOGO */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-fredoka text-pink-500 drop-shadow-sm mb-1">Pinky Slots</h1>
        <p className="text-pink-300 font-bold tracking-[0.4em] uppercase text-[10px]">Mechanical Free-To-Play</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl w-full mb-10">
        
        {/* SIDE PANEL: PRIZES */}
        <div className="w-full lg:w-72 bg-white p-6 rounded-[2.5rem] shadow-lg border border-pink-100 flex flex-col gap-4 animate-in slide-in-from-left duration-500">
          <h3 className="text-pink-500 font-fredoka text-xl flex items-center gap-2">
            <span className="text-2xl">🎁</span> Prize List
          </h3>
          <div className="space-y-3">
            {EMOJIS.map(emoji => (
              <div key={emoji} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <input 
                    type="text" 
                    value={prizes[emoji]}
                    onChange={(e) => handlePrizeChange(emoji, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-pink-50 focus:border-pink-300 outline-none text-pink-600 font-semibold text-xs transition-all bg-pink-50/30"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN MACHINE */}
        <div className="flex-1 flex flex-col items-center w-full max-w-lg">
          <div className="bg-pink-500 p-8 rounded-[4rem] shadow-[0_20px_0_rgb(190,24,93),0_40px_80px_rgba(219,39,119,0.15)] border-b-[10px] border-pink-700 relative w-full border-x-2 border-pink-400">
            
            {/* TOP DISPLAY: GENERAL TEST INPUT */}
            <div className="bg-pink-900/40 rounded-3xl px-6 py-4 mb-8 shadow-inner border border-white/10">
              <input 
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full bg-transparent text-white font-bold text-center text-lg placeholder:text-pink-300/30 outline-none border-b border-pink-300/20 focus:border-pink-300 transition-all"
                placeholder="Status Message..."
              />
            </div>

            {/* REELS AREA - Balanced Scale */}
            <div className="flex gap-4 bg-pink-600 p-6 rounded-[3rem] border-8 border-pink-300 shadow-[inset_0_10px_30px_rgba(0,0,0,0.3)]">
              {state.reels.map((s, i) => (
                <Reel 
                  key={i} 
                  symbol={s} 
                  isSpinning={state.isSpinning} 
                  delay={i * 200} 
                />
              ))}
            </div>

            {/* STATUS MESSAGE */}
            <div className="mt-8 text-center h-8 flex items-center justify-center">
              <p className="text-pink-100 font-black tracking-widest text-xl uppercase italic">
                {state.message}
              </p>
            </div>

            {/* SPIN BUTTON */}
            <button
              onClick={() => spin()}
              disabled={state.isSpinning}
              className={`
                mt-8 w-full py-8 rounded-[3rem] text-4xl font-fredoka uppercase tracking-widest
                shadow-[0_12px_0_rgb(131,24,67)] active:shadow-none active:translate-y-3 transition-all
                ${state.isSpinning 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200 shadow-[0_12px_0_rgb(107,114,128)]' 
                  : 'bg-gradient-to-b from-pink-300 via-pink-400 to-pink-600 text-white hover:brightness-105'}
              `}
            >
              {state.isSpinning ? 'SPINNING' : 'SPIN'}
            </button>
          </div>

          {/* AI FORTUNE AREA */}
          <div className="mt-10 w-full bg-white rounded-[3rem] p-8 shadow-lg border border-pink-50">
            <h2 className="text-xl font-fredoka text-pink-500 mb-6 flex items-center gap-3">
              <span className="text-2xl">🔮</span> Oracle
            </h2>
            {fortune ? (
              <div className="animate-fade-in text-center">
                <p className="text-lg text-gray-700 italic mb-6">"{fortune.prediction}"</p>
                <div className="bg-pink-50 px-6 py-2 rounded-full inline-block border border-pink-100">
                  <span className="text-pink-600 font-bold uppercase text-xs">Lucky: {fortune.luckyNumber}</span>
                </div>
                <button 
                  onClick={() => setFortune(null)}
                  className="block mx-auto mt-6 text-pink-300 text-[10px] uppercase font-black hover:text-pink-500 transition-colors"
                >
                  Clear Reading
                </button>
              </div>
            ) : (
              <button
                onClick={handleAskFortune}
                disabled={loadingFortune || state.isSpinning}
                className="w-full bg-pink-50 text-pink-600 py-6 rounded-[2rem] font-bold text-sm hover:bg-pink-100 transition-all border border-pink-100/50"
              >
                {loadingFortune ? 'Consulting...' : 'Read My Destiny'}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM PANEL: PROBABILITIES */}
      <div className="w-full max-w-6xl bg-white p-10 rounded-[4rem] shadow-xl border border-pink-50 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h3 className="text-pink-600 font-fredoka text-3xl flex items-center gap-3">
              <span className="text-4xl">📊</span> Probability Control
            </h3>
            <p className="text-pink-300 font-bold uppercase text-[10px] tracking-widest ml-12">Adjust individual symbol spawn rates</p>
          </div>
          <button
            onClick={() => spin(true)}
            disabled={state.isSpinning}
            className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-pink-600 shadow-md transition-all active:scale-95"
          >
            Force Win ⚡️
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {EMOJIS.map(emoji => (
            <div key={emoji} className="bg-pink-50/20 p-6 rounded-[2rem] border border-pink-50 flex flex-col items-center gap-6">
              <span className="text-5xl">{emoji}</span>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-pink-300 font-bold text-[10px] uppercase">Rate</span>
                  <span className="text-pink-600 font-bold text-xl">{emojiWeights[emoji]}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={emojiWeights[emoji]}
                  onChange={(e) => handleWeightChange(emoji, parseInt(e.target.value))}
                  className="w-full accent-pink-500 h-2 bg-pink-100 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-auto mb-6 text-pink-200 font-bold uppercase tracking-[2em] text-[10px] text-center opacity-60">
        Pinky Slots • Deluxe Mechanical Edition
      </footer>

      <style>{`
        .font-fredoka { font-family: 'Fredoka One', cursive; }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #db2777;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 8px rgba(219,39,119,0.2);
          margin-top: -11px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #fbcfe8;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default App;
