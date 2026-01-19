
import React from 'react';
import { MahjongTile } from '../types';

interface ProbabilityAssistantProps {
  discardPile: MahjongTile[];
  hand: MahjongTile[];
  targetValue: number | 'dragon' | 'universal';
}

const ProbabilityAssistant: React.FC<ProbabilityAssistantProps> = ({ discardPile, hand, targetValue }) => {
  // Count visible tiles
  const countVisible = (val: number | string, type: string) => {
    const fromDiscard = discardPile.filter(t => t.type === type && (t.type === 'circle' ? t.value === val : true)).length;
    const fromHand = hand.filter(t => t.type === type && (t.type === 'circle' ? t.value === val : true)).length;
    return fromDiscard + fromHand;
  };

  const calculateRemaining = () => {
    if (targetValue === 'universal') return 1 - countVisible(0, 'universal');
    if (targetValue === 'dragon') return 4 - countVisible(10, 'dragon');
    return 4 - countVisible(targetValue as number, 'circle');
  };

  const remaining = calculateRemaining();
  const totalInDeck = targetValue === 'universal' ? 1 : 4;

  return (
    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
      <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
        <span className="mr-2">💡</span> 概率推測助手
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-indigo-700">目標牌: {targetValue === 'dragon' ? '紅中' : targetValue === 'universal' ? '白板' : `${targetValue} 筒`}</span>
          <span className="font-bold text-indigo-900">剩餘: {remaining} / {totalInDeck}</span>
        </div>
        
        {/* Stone visualization */}
        <div className="flex gap-1 h-8 items-end">
          {Array.from({ length: totalInDeck }).map((_, i) => (
            <div 
              key={i} 
              className={`w-6 rounded-t-md transition-all duration-500 ${i < remaining ? 'bg-indigo-500 h-full' : 'bg-gray-200 h-1 border-t border-gray-300'}`}
              title={i < remaining ? "可能還在牌堆裡" : "已經出現過了"}
            />
          ))}
        </div>

        <p className="text-[10px] text-indigo-600 italic">
          {remaining === 0 
            ? "⚠️ 不可能事件：場上已經集齊了，再也摸不到了！" 
            : remaining === 1 
            ? "🍀 只有 1 顆小石頭：全憑運氣啦。" 
            : "💪 有好幾顆石頭：贏的機會很大哦！"}
        </p>
      </div>
    </div>
  );
};

export default ProbabilityAssistant;
