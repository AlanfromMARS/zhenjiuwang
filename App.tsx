
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Scene from './components/Scene';
import GameUI from './components/GameUI';
import { CASES, ACHIEVEMENTS } from './constants';
import { GameState } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 100,
    currentLevel: 0,
    isGameOver: false,
    hitPoints: [],
    achievements: []
  });
  const [wisdom, setWisdom] = useState<string>("宗师，请静心定神。经络乃生命之河，不可偏废。");
  const [isGameStarted, setIsGameStarted] = useState(false);

  const fetchWisdom = async (symptoms: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `针对以下病症提供一句简短的、富有中医美感的诗意医嘱（中文）：${symptoms}`,
      });
      if (response.text) setWisdom(response.text);
    } catch (e) {
      console.error("AI wisdom failed", e);
    }
  };

  useEffect(() => {
    if (isGameStarted) {
      fetchWisdom(CASES[gameState.currentLevel]?.symptoms || "医道针法");
    }
  }, [gameState.currentLevel, isGameStarted]);

  const handleHit = useCallback((pointId: string, isCorrect: boolean) => {
    setGameState(prev => {
      let newScore = isCorrect ? prev.score + 10 : prev.score - 10;
      let newHitPoints = [...prev.hitPoints];
      let newLevel = prev.currentLevel;
      let newIsGameOver = newScore <= 0;

      if (isCorrect && !newHitPoints.includes(pointId)) {
        newHitPoints.push(pointId);
        
        const currentCase = CASES[prev.currentLevel];
        if (newHitPoints.length === currentCase.requiredPoints.length) {
          // Level Complete!
          newScore += currentCase.reward;
          newLevel = Math.min(prev.currentLevel + 1, CASES.length - 1);
          newHitPoints = [];
        }
      }

      return {
        ...prev,
        score: newScore,
        hitPoints: newHitPoints,
        currentLevel: newLevel,
        isGameOver: newIsGameOver
      };
    });
  }, []);

  const restartGame = () => {
    setGameState({
      score: 100,
      currentLevel: 0,
      isGameOver: false,
      hitPoints: [],
      achievements: []
    });
    setIsGameStarted(true);
  };

  if (!isGameStarted) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50 text-white p-8">
        <div className="max-w-2xl text-center space-y-8 animate-in fade-in duration-1000">
          <h1 className="text-6xl font-bold tracking-tighter text-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
            ACU<span className="text-[#ffcc33]">CYBER</span>
          </h1>
          <p className="text-xl text-gray-400 italic">“古道玄机，赛博流光”</p>
          <div className="grid grid-cols-3 gap-4 border-y border-gray-800 py-8">
            <div className="space-y-2">
              <div className="text-[#00f3ff] text-2xl font-bold">10k+</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">灵气粒子</div>
            </div>
            <div className="space-y-2">
              <div className="text-[#ffcc33] text-2xl font-bold">361</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">活跃穴位</div>
            </div>
            <div className="space-y-2">
              <div className="text-red-500 text-2xl font-bold">8</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">医道方案</div>
            </div>
          </div>
          <button 
            onClick={() => setIsGameStarted(true)}
            className="px-12 py-4 bg-transparent border-2 border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-[#050505] transition-all duration-300 rounded-full font-bold uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)]"
          >
            开启针道
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* 3D Scene */}
      <Scene 
        onHit={handleHit} 
        currentLevel={gameState.currentLevel} 
        requiredPoints={CASES[gameState.currentLevel].requiredPoints}
        hitPoints={gameState.hitPoints}
      />

      {/* 2D HUD overlay */}
      <GameUI 
        gameState={gameState} 
        wisdom={wisdom}
        onRestart={restartGame}
      />

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] text-white">
          <h2 className="text-5xl font-black text-red-600 mb-4 tracking-tighter uppercase">真气涣散</h2>
          <p className="text-gray-400 mb-8">在病人康复前，你的真气已经耗尽了。</p>
          <button 
            onClick={restartGame}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 transition-colors font-bold uppercase"
          >
            重塑神元
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
