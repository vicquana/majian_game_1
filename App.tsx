
import React, { useState, useEffect, useCallback } from 'react';
import { MahjongTile, GameState } from './types';
import { generateDeck, INITIAL_HAND_SIZE, checkWin } from './constants';
import Tile from './components/Tile';
import ProbabilityAssistant from './components/ProbabilityAssistant';
import { RotateCcw, HelpCircle, Trophy, BarChart3, PartyPopper, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExtendedGameState extends GameState {
  canWin: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<ExtendedGameState>({
    deck: [],
    playerHand: [],
    discardPile: [],
    drawnTile: null,
    turn: 'player',
    isGameOver: false,
    message: '歡迎來到小小麻將概率教室！',
    winInfo: { isWin: false, reason: '' },
    canWin: false
  });

  const [showTutorial, setShowTutorial] = useState(true);

  // Confetti effect logic
  useEffect(() => {
    if (state.isGameOver && state.winInfo.isWin) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444']
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444']
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [state.isGameOver, state.winInfo.isWin]);

  const checkImmediateWin = useCallback((hand: MahjongTile[], drawn: MahjongTile | null) => {
    const currentFive = [...hand];
    if (drawn) currentFive.push(drawn);
    
    if (currentFive.length === 5) {
      const winCheck = checkWin(currentFive);
      if (winCheck.isWin) {
        return { isWin: true, reason: winCheck.reason, finalHand: currentFive };
      }
    }
    return { isWin: false, reason: '', finalHand: currentFive };
  }, []);

  const initGame = useCallback(() => {
    const fullDeck = generateDeck();
    const hand = fullDeck.splice(0, INITIAL_HAND_SIZE - 1); 
    const initialDraw = fullDeck.pop() || null; 
    
    const winResult = checkImmediateWin(hand, initialDraw);
    
    setState({
      deck: fullDeck,
      playerHand: hand,
      discardPile: [],
      drawnTile: initialDraw,
      turn: 'player',
      isGameOver: false,
      message: winResult.isWin ? '恭喜！你可以選擇胡牌或繼續挑戰更高分。' : '遊戲開始！請看右邊新摸的牌，選擇一張不需要的打掉。',
      winInfo: { isWin: false, reason: '' },
      canWin: winResult.isWin
    });
  }, [checkImmediateWin]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleWin = () => {
    if (!state.canWin || state.isGameOver) return;

    const currentFive = [...state.playerHand];
    if (state.drawnTile) currentFive.push(state.drawnTile);
    const winCheck = checkWin(currentFive);

    setState(prev => ({
      ...prev,
      playerHand: currentFive,
      drawnTile: null,
      isGameOver: true,
      winInfo: { isWin: true, reason: winCheck.reason },
      message: '胡牌勝利！恭喜達成目標！',
      canWin: false
    }));
  };

  const handleDiscard = (index: number, isDrawnTile: boolean) => {
    if (state.isGameOver || state.turn !== 'player') return;

    let newHand = [...state.playerHand];
    let discarded: MahjongTile;

    if (isDrawnTile && state.drawnTile) {
      discarded = state.drawnTile;
    } else {
      discarded = newHand.splice(index, 1)[0];
      if (state.drawnTile) {
        newHand.push(state.drawnTile);
      }
    }

    newHand.sort((a, b) => {
      if (a.type === b.type) return a.value - b.value;
      if (a.type === 'circle') return -1;
      if (b.type === 'circle') return 1;
      return a.type === 'dragon' ? -1 : 1;
    });

    const newDiscardPile = [...state.discardPile, discarded];
    const nextDeck = [...state.deck];
    const nextDraw = nextDeck.pop() || null;

    if (!nextDraw) {
      setState(prev => ({
        ...prev,
        playerHand: newHand,
        drawnTile: null,
        discardPile: newDiscardPile,
        isGameOver: true,
        message: '流局了（牌抓完啦），下次加油！',
        winInfo: { isWin: false, reason: '' },
        canWin: false
      }));
      return;
    }

    const winResult = checkImmediateWin(newHand, nextDraw);

    setState(prev => ({
      ...prev,
      deck: nextDeck,
      playerHand: newHand,
      drawnTile: nextDraw,
      discardPile: newDiscardPile,
      canWin: winResult.isWin,
      message: winResult.isWin 
        ? '機會來了！你可以胡牌了！' 
        : '打出了 ' + discarded.name + '。摸到了一張新牌！'
    }));
  };

  const getDistinctTargetValues = () => {
    const values = state.playerHand.map(t => t.value);
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.map(v => {
      if (v === 10) return 'dragon' as const;
      if (v === 0) return 'universal' as const;
      return v;
    });
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-800 p-4 font-sans flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-emerald-800 flex items-center gap-2">
            <span className="bg-emerald-600 text-white p-1 rounded">小</span>
            小小麻將概率教室
          </h1>
          <p className="text-xs text-emerald-600 font-medium tracking-tight">適合孩子學習概率的簡化麻將</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTutorial(!showTutorial)}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-emerald-600 border border-emerald-100"
            title="遊戲幫助"
          >
            <HelpCircle size={20} />
          </button>
          <button 
            onClick={initGame}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-emerald-600 border border-emerald-100"
            title="重新開始"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6 relative">
        {/* Victory Overlay */}
        {state.isGameOver && state.winInfo.isWin && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
             <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 text-center animate-in fade-in zoom-in duration-500">
                <PartyPopper size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce" />
                <h2 className="text-4xl font-black text-yellow-600 mb-2">胡牌勝利！</h2>
                <p className="text-xl font-bold text-emerald-700">{state.winInfo.reason}</p>
                <button 
                  onClick={initGame}
                  className="mt-6 pointer-events-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                >
                  再挑戰一次
                </button>
             </div>
          </div>
        )}

        {/* Game Info Panel */}
        <div className={`bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-between transition-all ${state.canWin ? 'ring-8 ring-orange-400/30' : ''}`}>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">當前進度</p>
            <p className={`text-lg font-bold leading-tight ${state.isGameOver ? (state.winInfo.isWin ? 'text-yellow-600' : 'text-slate-500') : (state.canWin ? 'text-orange-600' : 'text-emerald-700')}`}>
              {state.message}
            </p>
            {state.isGameOver && state.winInfo.isWin && (
              <div className="mt-2 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black uppercase">
                <Trophy size={14} className="mr-1.5" /> 勝利：{state.winInfo.reason}
              </div>
            )}
          </div>
          <div className="text-right border-l border-emerald-50 pl-4 ml-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">剩餘</p>
            <p className="text-3xl font-black text-emerald-600 leading-none">{state.deck.length}</p>
          </div>
        </div>

        {/* Table Area (Discards) */}
        <div className="bg-emerald-100/40 rounded-[2.5rem] p-8 border-4 border-dashed border-emerald-200 min-h-[220px] transition-colors">
          <h2 className="text-center text-[10px] font-black text-emerald-400 mb-6 tracking-[0.2em] uppercase">已打出的牌 (分析對象)</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {state.discardPile.length === 0 ? (
              <div className="flex flex-col items-center mt-6 text-emerald-300 opacity-60">
                <div className="text-4xl mb-2">🀄</div>
                <p className="italic text-sm">桌面上還沒有牌，大膽開始吧！</p>
              </div>
            ) : (
              state.discardPile.map((tile, idx) => (
                <div key={idx} className="opacity-60 scale-[0.7] -m-2.5 transition-all hover:opacity-100 hover:scale-100 hover:z-10">
                  <Tile tile={tile} disabled />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Player Area */}
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-10 relative">
            <div className="flex items-end gap-2 relative">
              {/* Main Hand */}
              <div className="flex gap-2 p-3 bg-white/50 rounded-2xl border border-emerald-100 shadow-inner">
                {state.playerHand.map((tile, idx) => (
                  <div key={tile.id} className="flex flex-col items-center gap-1.5 group">
                    <Tile 
                      tile={tile} 
                      onClick={() => handleDiscard(idx, false)}
                      disabled={state.isGameOver}
                    />
                    <span className="text-[10px] text-slate-400 font-black opacity-0 group-hover:opacity-100 transition-opacity">打出</span>
                  </div>
                ))}
              </div>

              {/* Drawn Tile */}
              {state.drawnTile && !state.isGameOver && (
                <div className="flex flex-col items-center gap-1.5 group ml-4">
                  <Tile 
                    tile={state.drawnTile} 
                    onClick={() => handleDiscard(-1, true)}
                    highlighted
                    disabled={state.isGameOver}
                    isDrawn
                  />
                  <span className="text-[10px] text-indigo-500 font-black tracking-tighter ml-4">新摸進</span>
                </div>
              )}
            </div>

            {/* Manual Win Button */}
            {state.canWin && !state.isGameOver && (
              <button
                onClick={handleWin}
                className="bg-orange-500 text-white rounded-full w-20 h-20 shadow-2xl border-4 border-orange-200 flex flex-col items-center justify-center gap-1 hover:bg-orange-600 active:scale-90 transition-all animate-pulse ring-4 ring-orange-400/20"
              >
                <Sparkles size={20} />
                <span className="text-2xl font-black">胡！</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Probability Assistant */}
            <div className="w-full transform transition-all hover:scale-[1.01]">
              <ProbabilityAssistant 
                discardPile={state.discardPile}
                hand={state.playerHand}
                targetValue={getDistinctTargetValues()[0] || 1}
              />
            </div>
            
            {/* Learning Panel */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
               <div>
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center">
                  <BarChart3 size={18} className="mr-2 text-indigo-500" /> 規則小貼士
                </h3>
                <ul className="text-xs space-y-3 text-slate-600 font-medium">
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                    胡牌公式：3 張一樣 (刻子) + 2 張一樣 (對子)。
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                    胡牌選擇：看到橙色的「胡」按鈕時即可勝利！
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-indigo-500 font-bold mt-0.5">★</span>
                    白板：幸運之星！它可以當作任何一張牌使用。
                  </li>
                </ul>
               </div>
              {state.isGameOver && (
                <button 
                  onClick={initGame}
                  className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> 再挑戰一次
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tutorial Modal Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setShowTutorial(false)}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <RotateCcw size={24} className="rotate-45" />
            </button>
            <h2 className="text-3xl font-black text-emerald-700 mb-6 text-center">胡牌攻略 📖</h2>
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-sm font-black text-emerald-800 mb-4 flex items-center">
                   勝利陣型示例
                </p>
                <div className="flex gap-1 justify-center scale-110">
                  <div className="flex gap-0.5 border-r-2 border-emerald-200 pr-2">
                    {[1,1,1].map((_, i) => <div key={i} className="w-7 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">1</div>)}
                  </div>
                  <div className="flex gap-0.5 pl-2">
                    {[2,2].map((_, i) => <div key={i} className="w-7 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">2</div>)}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-emerald-600 text-center mt-6">【3 張一樣】+【2 張一樣】</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 p-2 rounded-xl text-white font-black text-lg">胡</div>
                  <div>
                    <p className="font-black text-slate-800">主動胡牌</p>
                    <p className="text-xs text-slate-500 leading-relaxed">當滿足獲勝條件時，會出現橙色按鈕。點擊它即可宣布胡牌勝利！</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 text-2xl shadow-sm">📊</div>
                  <div>
                    <p className="font-black text-slate-800">學會推測概率</p>
                    <p className="text-xs text-slate-500 leading-relaxed">觀察桌面上的「明牌」。如果某種牌已經出現了 4 次，你就再也摸不到了。數量越多，摸到的機會越大！</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowTutorial(false)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all mt-6"
              >
                開始冒險！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-8">
        小小麻將概率教室 &copy; 2024 - 啟迪思維的遊戲之旅
      </footer>
    </div>
  );
};

export default App;
