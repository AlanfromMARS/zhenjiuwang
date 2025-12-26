
import React, { useState } from 'react';
import { GameState, Case } from '../types';
import { CASES, ACUPOINTS_DATA } from '../constants';

interface GameUIProps {
  gameState: GameState;
  wisdom: string;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, wisdom, onRestart }) => {
  const currentCase = CASES[gameState.currentLevel];
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-10 select-none">
      {/* Top Bar: Minimalist on mobile */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-xl md:text-3xl font-black text-white italic tracking-tighter">
              ACU<span className="text-[#00f3ff]">CYBER</span>
            </h1>
            <div className="hidden md:block h-[2px] w-12 bg-[#00f3ff]/30"></div>
            <div className="text-[8px] md:text-xs uppercase tracking-widest text-[#00f3ff] opacity-70">ID: 0361-A</div>
          </div>
          <div className="text-[#ffcc33] font-mono text-[10px] md:text-sm uppercase flex items-center gap-2">
            <span className="bg-[#ffcc33]/20 px-1 rounded">LV.{gameState.currentLevel + 1}</span>
            <span className="truncate max-w-[120px] md:max-w-none">{currentCase.title}</span>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-[#00f3ff]/20 px-3 py-1 md:p-4 rounded-lg md:rounded-xl text-right">
          <div className="text-[8px] md:text-xs uppercase tracking-widest text-gray-500">真气</div>
          <div className={`text-xl md:text-4xl font-black leading-none ${gameState.score < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {gameState.score}
          </div>
        </div>
      </div>

      {/* Case Details Panel: Responsive Position */}
      <div className="pointer-events-auto flex flex-col items-end lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 mt-4 lg:mt-0">
        <div 
          className={`
            bg-black/60 backdrop-blur-xl border border-gray-800 p-4 md:p-6 rounded-2xl 
            transition-all duration-300 ease-in-out
            w-full max-w-[260px] md:max-w-[320px]
            ${isDetailsOpen ? 'translate-x-0' : 'translate-x-[calc(100%-40px)] lg:translate-x-0'}
          `}
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          {/* Mobile toggle handle */}
          <div className="lg:hidden absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer">
            <div className={`w-1 h-8 bg-[#ffcc33]/50 rounded-full transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}></div>
          </div>

          <div className="pl-6 lg:pl-0">
            <h3 className="text-[#ffcc33] text-[10px] uppercase tracking-[0.2em] font-bold mb-1 md:mb-2">病症描述</h3>
            <p className="text-white text-sm md:text-lg font-light leading-snug mb-4 md:mb-6">{currentCase.symptoms}</p>
            
            <h3 className="text-[#00f3ff] text-[10px] uppercase tracking-[0.2em] font-bold mb-2 md:mb-3">待击穴位</h3>
            <div className="space-y-2 md:space-y-3">
              {currentCase.requiredPoints.map(pointId => {
                const pt = ACUPOINTS_DATA.find(a => a.id === pointId);
                const isHit = gameState.hitPoints.includes(pointId);
                return (
                  <div key={pointId} className="flex items-center gap-2 md:gap-3">
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isHit ? 'bg-[#ffcc33] shadow-[0_0_10px_#ffcc33]' : 'bg-gray-700'}`}></div>
                    <div className="flex-1">
                      <div className={`text-xs md:text-sm font-bold ${isHit ? 'text-[#ffcc33] line-through opacity-40' : 'text-gray-300'}`}>
                        {pt?.chineseName} <span className="text-[10px] opacity-50 ml-1">{pt?.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wisdom Terminal: Smaller and tucked away on mobile */}
        <div className="mt-3 bg-[#00f3ff]/5 border border-[#00f3ff]/10 p-2 md:p-4 rounded-xl w-full max-w-[260px] md:max-w-[320px] lg:block hidden">
          <div className="text-[8px] uppercase text-[#00f3ff]/50 mb-1 font-mono">灵感终端:</div>
          <p className="text-[#00f3ff] text-[10px] md:text-sm italic font-serif leading-relaxed">
            “{wisdom}”
          </p>
        </div>
      </div>

      {/* Bottom Interface */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Mobile Wisdom Line */}
        <div className="lg:hidden w-full bg-black/40 backdrop-blur-sm border-l-2 border-[#00f3ff] p-2 pointer-events-auto">
          <p className="text-[#00f3ff] text-[10px] italic truncate">“{wisdom}”</p>
        </div>

        <div className="flex w-full md:w-auto justify-between md:justify-start items-end gap-4 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 md:p-4 rounded-lg flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 md:w-8 md:h-8 rounded border border-white/20 flex items-center justify-center text-[10px] text-white">点击</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">飞针</span>
            </div>
            <div className="hidden md:block w-[1px] h-4 bg-white/10"></div>
            <div className="hidden md:block text-[10px] text-gray-400 uppercase tracking-widest">自动旋回</div>
          </div>

          <div className="text-right">
            <div className="hidden md:block text-[8px] uppercase tracking-[0.4em] text-gray-600 mb-2">AcuCyber Simulation v4.5</div>
            <button 
              onClick={onRestart}
              className="px-3 py-1 md:px-4 md:py-2 text-[10px] border border-gray-800 hover:border-[#ffcc33] hover:text-[#ffcc33] transition-colors uppercase tracking-widest bg-black/40"
            >
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
