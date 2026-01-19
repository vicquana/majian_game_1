
import React from 'react';
import { MahjongTile } from '../types';

interface TileProps {
  tile: MahjongTile;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  isDrawn?: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, onClick, disabled, highlighted, isDrawn }) => {
  const getIcon = () => {
    if (tile.type === 'circle') {
      return (
        <div className="grid grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: tile.value }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
          ))}
        </div>
      );
    }
    if (tile.type === 'dragon') {
      return <div className="text-red-600 font-bold text-2xl">中</div>;
    }
    if (tile.type === 'universal') {
      return <div className="w-8 h-10 border-2 border-blue-400 rounded-md bg-white flex items-center justify-center text-blue-400 font-bold">★</div>;
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-14 h-20 rounded-lg shadow-md flex flex-col items-center justify-center border-2 transition-all duration-200
        ${highlighted ? 'border-yellow-400 scale-105 shadow-xl bg-yellow-50' : 'border-gray-200 bg-white'}
        ${disabled ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-90 active:brightness-95 cursor-pointer shadow-indigo-100/50'}
        ${isDrawn ? 'ml-4 ring-2 ring-indigo-400' : ''}
      `}
    >
      <div className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono select-none">
        {tile.name}
      </div>
      {getIcon()}
      <div className="absolute bottom-1 right-1 text-[10px] font-bold text-gray-300 select-none">
        {tile.type === 'circle' ? tile.value : ''}
      </div>
    </button>
  );
};

export default Tile;
