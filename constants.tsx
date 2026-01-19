
import React from 'react';
import { MahjongTile } from './types';

export const INITIAL_HAND_SIZE = 5;

export const generateDeck = (): MahjongTile[] => {
  const deck: MahjongTile[] = [];
  
  // 1-9 Circles (4 of each) = 36 tiles
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 4; j++) {
      deck.push({
        id: `circle-${i}-${j}`,
        type: 'circle',
        value: i,
        name: `${i} 筒`
      });
    }
  }

  // 4 Red Dragons (Da Wang)
  for (let j = 0; j < 4; j++) {
    deck.push({
      id: `dragon-red-${j}`,
      type: 'dragon',
      value: 10, // Special value
      name: '紅中'
    });
  }

  // Add 1 Universal White Dragon (Joker)
  deck.push({
    id: 'universal-white',
    type: 'universal',
    value: 0,
    name: '白板'
  });

  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
};

export const checkWin = (hand: MahjongTile[]): { isWin: boolean; reason: string } => {
  if (hand.length !== 5) return { isWin: false, reason: '' };

  // Helper to handle Universal (White Dragon)
  const hasUniversal = hand.some(t => t.type === 'universal');
  const baseHand = hand.filter(t => t.type !== 'universal');

  // Count frequencies
  const counts: Record<string, number> = {};
  baseHand.forEach(t => {
    const key = `${t.type}-${t.value}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const frequencies = Object.values(counts);

  // If we have a Joker, we can simulate its identity
  if (hasUniversal) {
    // With 1 Joker and 4 other cards:
    // Pattern must be 3 + 2.
    // Case 1: Joker completes a triplet (Joker + Pair -> Triplet). We need another pair.
    // Case 2: Joker completes a pair (Joker + Single -> Pair). We need a triplet.

    if (frequencies.includes(3)) return { isWin: true, reason: '刻子 + 將牌 (用白板湊成對子)' };
    if (frequencies.filter(f => f === 2).length === 2) return { isWin: true, reason: '刻子 + 將牌 (用白板湊成刻子)' };
    
    return { isWin: false, reason: '' };
  }

  // Standard Win: 3 + 2
  const hasTriplet = frequencies.includes(3);
  const hasPair = frequencies.includes(2);

  if (hasTriplet && hasPair) {
    return { isWin: true, reason: '刻子 (3張一樣) + 對子 (2張一樣)' };
  }

  return { isWin: false, reason: '' };
};
