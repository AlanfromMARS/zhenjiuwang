
import React from 'react';
import { GameState, Case } from '../types';
import { CASES, ACUPOINTS_DATA } from '../constants';

interface GameUIProps {
  gameState: GameState;
  wisdom: string;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, wisdom, onRestart }) => {
  const currentCase = CASES[gameState.currentLevel];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">
              ACU<span className="text-[#00f3ff]">CYBER</span>
            </h1>
            <div className="h-[2px] w-20 bg-[#00f3ff]/30"></div>
            <div className="text-xs uppercase tracking-widest text-[#00f3ff]">诊疗编号: 0361-ALPHA</div>
          </div>
          <div className="text-[#ffcc33] font-mono text-sm uppercase">关卡 {gameState.currentLevel + 1}: {currentCase.title}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-[#00f3ff]/20 p-4 rounded-xl text-right">
          <div className="text-xs uppercase tracking-widest text-gray-500">真气值</div>
          <div className={`text-4xl font-black ${gameState.score < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {gameState.score}
          </div>
        </div>
      </div>

      {/* Middle Right: Case Details */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 space-y-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl transform hover:scale-[1.02] transition-transform">
          <h3 className="text-[#ffcc33] text-xs uppercase tracking-[0.2em] font-bold mb-2">病症描述</h3>
          <p className="text-white text-lg font-light leading-relaxed mb-6">{currentCase.symptoms}</p>
          
          <h3 className="text-[#00f3ff] text-xs uppercase tracking-[0.2em] font-bold mb-3">所需穴位</h3>
          <div className="space-y-3">
            {currentCase.requiredPoints.map(pointId => {
              const pt = ACUPOINTS_DATA.find(a => a.id === pointId);
              const isHit = gameState.hitPoints.includes(pointId);
              return (
                <div key={pointId} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isHit ? 'bg-[#ffcc33] shadow-[0_0_10px_#ffcc33]' : 'bg-gray-700'}`}></div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${isHit ? 'text-[#ffcc33] line-through opacity-50' : 'text-gray-300'}`}>
                      {pt?.chineseName} ({pt?.id})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wisdom Terminal */}
        <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 p-4 rounded-xl">
          <div className="text-[10px] uppercase text-[#00f3ff]/50 mb-1 font-mono">灵感终端输出:</div>
          <p className="text-[#00f3ff] text-sm italic font-serif leading-relaxed">
            “{wisdom}”
          </p>
        </div>
      </div>

      {/* Bottom Bar: Instructions */}
      <div className="flex justify-between items-end">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-lg flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-xs text-white">左键</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">飞针击点</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-xs text-gray-400 uppercase tracking-widest">人体自动旋转</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.4em] text-gray-600 mb-2">赛博水墨医学模拟器 v4.2</div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={onRestart}
              className="px-4 py-2 text-[10px] border border-gray-800 hover:border-[#ffcc33] hover:text-[#ffcc33] transition-colors pointer-events-auto uppercase tracking-widest"
            >
              重置轮回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
