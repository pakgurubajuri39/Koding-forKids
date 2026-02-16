
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LEVELS, BLOCK_LABELS, BLOCK_COLORS } from './constants';
import { GameState, BlockType, Position } from './types';
import { getGameHint } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0,
    program: [],
    playerPosition: LEVELS[0].start,
    isExecuting: false,
    isSuccess: false,
    isFailed: false,
    executionIndex: -1,
    message: LEVELS[0].story,
    lives: 3
  });

  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(true);
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const level = LEVELS[gameState.currentLevel];

  const resetLevel = () => {
    setGameState(prev => ({
      ...prev,
      program: [],
      playerPosition: level.start,
      isExecuting: false,
      isSuccess: false,
      isFailed: false,
      executionIndex: -1,
      message: level.story
    }));
    setHint(null);
  };

  const addBlock = (block: BlockType) => {
    if (gameState.isExecuting || gameState.program.length >= level.maxBlocks) return;
    setGameState(prev => ({
      ...prev,
      program: [...prev.program, block]
    }));
  };

  const removeBlock = (index: number) => {
    if (gameState.isExecuting) return;
    setGameState(prev => ({
      ...prev,
      program: prev.program.filter((_, i) => i !== index)
    }));
  };

  const nextLevel = () => {
    if (gameState.currentLevel < LEVELS.length - 1) {
      const nextIdx = gameState.currentLevel + 1;
      setGameState({
        currentLevel: nextIdx,
        program: [],
        playerPosition: LEVELS[nextIdx].start,
        isExecuting: false,
        isSuccess: false,
        isFailed: false,
        executionIndex: -1,
        message: LEVELS[nextIdx].story,
        lives: 3
      });
      setHint(null);
      setShowLevelInfo(true);
    }
  };

  const handleHint = async () => {
    setIsHintLoading(true);
    const result = await getGameHint(level.name, level.story, gameState.program);
    setHint(result);
    setIsHintLoading(false);
  };

  const executeProgram = () => {
    if (gameState.program.length === 0 || gameState.isExecuting) return;
    
    const flatProgram: BlockType[] = [];
    gameState.program.forEach(block => {
      if (block === 'REPEAT_2' && flatProgram.length > 0) {
        flatProgram.push(flatProgram[flatProgram.length - 1]);
      } else if (block === 'REPEAT_3' && flatProgram.length > 0) {
        flatProgram.push(flatProgram[flatProgram.length - 1]);
        flatProgram.push(flatProgram[flatProgram.length - 1]);
      } else {
        flatProgram.push(block);
      }
    });

    setGameState(prev => ({ ...prev, isExecuting: true, executionIndex: 0 }));
    runStep(0, flatProgram, level.start);
  };

  const runStep = (index: number, program: BlockType[], currentPos: Position) => {
    if (index >= program.length) {
      checkWinCondition(currentPos);
      return;
    }

    const block = program[index];
    let nextPos = { ...currentPos };

    switch (block) {
      case 'MOVE_UP': nextPos.y -= 1; break;
      case 'MOVE_DOWN': nextPos.y += 1; break;
      case 'MOVE_LEFT': nextPos.x -= 1; break;
      case 'MOVE_RIGHT': nextPos.x += 1; break;
    }

    if (nextPos.x < 0 || nextPos.x >= level.gridSize || nextPos.y < 0 || nextPos.y >= level.gridSize) {
      setGameState(prev => ({ ...prev, isExecuting: false, isFailed: true, message: "Ahmad menabrak tembok! 🚧" }));
      return;
    }

    if (level.obstacles.some(obs => obs.x === nextPos.x && obs.y === nextPos.y)) {
      setGameState(prev => ({ ...prev, isExecuting: false, isFailed: true, message: "Ahmad terjebak rintangan! 🌊" }));
      return;
    }

    setGameState(prev => ({ 
      ...prev, 
      playerPosition: nextPos, 
      executionIndex: index 
    }));

    executionTimeoutRef.current = setTimeout(() => {
      runStep(index + 1, program, nextPos);
    }, 400);
  };

  const checkWinCondition = (finalPos: Position) => {
    if (finalPos.x === level.target.x && finalPos.y === level.target.y) {
      setGameState(prev => ({ ...prev, isExecuting: false, isSuccess: true, message: "Alhamdulillah! Ahmad sampai tujuan! 🌙✨" }));
    } else {
      setGameState(prev => ({ ...prev, isExecuting: false, isFailed: true, message: "Yah, belum sampai. Coba lagi ya! 💪" }));
    }
  };

  useEffect(() => {
    return () => {
      if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-slate-900 overflow-y-auto pb-10">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-400 drop-shadow-lg">Ramadan Code Quest</h1>
          <p className="text-slate-400 text-sm">Level {level.id}: {level.name}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowLevelInfo(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>📜</span> Petunjuk
          </button>
          <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
            <span className="text-red-500 font-bold">❤️</span>
            <span className="font-bold">{gameState.lives}</span>
          </div>
          <button 
            onClick={nextLevel}
            disabled={!gameState.isSuccess}
            className={`px-4 py-2 rounded-full font-bold transition-all ${gameState.isSuccess ? 'bg-green-500 hover:bg-green-400' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
          >
            Lanjut ➔
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Game Board */}
        <div className="flex flex-col gap-4">
          <div 
            className="aspect-square bg-slate-800 rounded-2xl p-4 shadow-2xl relative border-4 border-slate-700 overflow-hidden"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${level.gridSize}, 1fr)`,
              gap: '4px'
            }}
          >
            {Array.from({ length: level.gridSize * level.gridSize }).map((_, i) => {
              const x = i % level.gridSize;
              const y = Math.floor(i / level.gridSize);
              const isObstacle = level.obstacles.some(o => o.x === x && o.y === y);
              const isTarget = level.target.x === x && level.target.y === y;
              const isPlayer = gameState.playerPosition.x === x && gameState.playerPosition.y === y;

              return (
                <div 
                  key={i} 
                  className={`relative rounded-md flex items-center justify-center text-2xl transition-all duration-300 ${
                    isObstacle ? 'bg-slate-700 shadow-inner' : 'bg-slate-700/30 border border-slate-800/50'
                  }`}
                >
                  {isObstacle && <span className="drop-shadow-sm">🧱</span>}
                  {isTarget && (
                    <div className="relative floating">
                      <span className="text-4xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">🕌</span>
                    </div>
                  )}
                  {isPlayer && (
                    <div className="z-10 transition-all duration-500 transform scale-110">
                      <span className="text-4xl drop-shadow-lg">👦</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-amber-400 font-bold mb-1 flex items-center gap-2">
              <span>💬</span> Status:
            </h3>
            <p className="text-slate-200 text-sm font-medium">{gameState.message}</p>
          </div>
        </div>

        {/* Right Side: Coding Blocks */}
        <div className="flex flex-col gap-6">
          
          {/* Palette */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex justify-between items-center">
              <span>📦 Blok Perintah</span>
              <span className="text-xs text-slate-400">Blok tersedia: {level.availableBlocks.length}</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {level.availableBlocks.map((block) => (
                <button
                  key={block}
                  onClick={() => addBlock(block)}
                  disabled={gameState.isExecuting || gameState.program.length >= level.maxBlocks}
                  className={`${BLOCK_COLORS[block]} p-3 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center min-w-[80px] disabled:opacity-50`}
                >
                  <span className="text-xl mb-1">
                    {block.includes('UP') && '⬆️'}
                    {block.includes('DOWN') && '⬇️'}
                    {block.includes('LEFT') && '⬅️'}
                    {block.includes('RIGHT') && '➡️'}
                    {block.includes('REPEAT') && '🔄'}
                  </span>
                  <span className="text-xs uppercase tracking-tight">{BLOCK_LABELS[block]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex-grow min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span>💻 Kode Ahmad</span>
                <span className={`text-xs px-2 py-1 rounded ${gameState.program.length >= level.maxBlocks ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                  {gameState.program.length} / {level.maxBlocks}
                </span>
              </h3>
              <button 
                onClick={resetLevel}
                className="text-xs text-red-400 hover:text-red-300 font-bold underline"
              >
                Reset Level
              </button>
            </div>
            
            <div className="flex-grow bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex flex-wrap content-start gap-2 overflow-y-auto max-h-[250px]">
              {gameState.program.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-sm">
                  Seret atau klik blok perintah untuk mulai mengoding!
                </div>
              )}
              {gameState.program.map((block, idx) => (
                <div 
                  key={idx}
                  onClick={() => removeBlock(idx)}
                  className={`${BLOCK_COLORS[block]} px-4 py-2 rounded-lg font-bold shadow-md cursor-pointer hover:bg-opacity-80 flex items-center gap-2 animate-in slide-in-from-top-2`}
                >
                  <span className="text-xs opacity-50">{idx + 1}</span>
                  <span>{BLOCK_LABELS[block]}</span>
                  <span className="ml-1 text-[10px]">✕</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={executeProgram}
                disabled={gameState.isExecuting || gameState.program.length === 0}
                className="flex-grow bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 py-4 rounded-xl font-bold text-slate-900 text-lg shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {gameState.isExecuting ? (
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><span>▶️</span> JALANKAN!</>
                )}
              </button>

              <button 
                onClick={handleHint}
                disabled={isHintLoading || gameState.isExecuting}
                className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-bold text-white shadow-xl transition-all disabled:opacity-50"
                title="Minta Bantuan AI"
              >
                {isHintLoading ? '⌛' : '💡'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Level Info Modal */}
      {showLevelInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 border-2 border-amber-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🌙</div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Level {level.id}: {level.name}</h2>
              <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Misi Kamu:</h4>
                <p className="text-white leading-relaxed">{level.story}</p>
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-slate-400">Ukuran Map: {level.gridSize}x{level.gridSize}</span>
                <span className="text-slate-400">Max Blok: {level.maxBlocks}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowLevelInfo(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 py-4 rounded-2xl font-bold text-slate-900 text-lg shadow-lg transition-all transform active:scale-95"
            >
              MENGERTI, AYO MULAI!
            </button>
          </div>
        </div>
      )}

      {/* AI Hint Popup */}
      {hint && (
        <div className="fixed bottom-0 left-0 w-full p-6 z-50 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-xl mx-auto bg-indigo-900 border-2 border-indigo-400 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setHint(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-400 rounded-full text-white font-bold flex items-center justify-center shadow-lg hover:bg-indigo-300"
            >
              ✕
            </button>
            <div className="flex gap-4 items-start">
              <div className="text-4xl">🦉</div>
              <div>
                <h4 className="font-bold text-indigo-200 mb-1">Bantuan Kak Burung Bijak:</h4>
                <p className="text-white italic leading-relaxed">{hint}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ramadan Decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 -z-10">
        <div className="absolute top-10 left-10 text-6xl floating" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute top-20 right-20 text-6xl floating" style={{ animationDelay: '1s' }}>🌙</div>
        <div className="absolute bottom-10 left-1/4 text-6xl floating" style={{ animationDelay: '2s' }}>🏮</div>
        <div className="absolute top-1/2 right-10 text-6xl floating" style={{ animationDelay: '1.5s' }}>⭐</div>
      </div>
    </div>
  );
};

export default App;
