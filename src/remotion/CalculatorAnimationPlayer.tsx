import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { FinancialCalculatorAnimation } from './FinancialCalculatorAnimation';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';

interface CalculatorAnimationPlayerProps {
  loanAmount?: number;
  loanTerm?: number;
  loanRate?: number;
  investReturnRate?: number;
  className?: string;
}

export const CalculatorAnimationPlayer: React.FC<CalculatorAnimationPlayerProps> = ({
  loanAmount = 1000,
  loanTerm = 30,
  loanRate = 2.2,
  investReturnRate = 6,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = React.useRef<any>(null);

  const handlePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Player Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-sm font-mono">financial-calculator.animation</span>
        <div className="w-16"></div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <Player
          ref={playerRef}
          component={FinancialCalculatorAnimation}
          inputProps={{
            loanAmount,
            loanTerm,
            loanRate,
            investReturnRate,
          }}
          durationInFrames={300}
          fps={60}
          compositionWidth={1080}
          compositionHeight={1080}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
          }}
          controls={false}
          loop
          autoPlay={false}
        />
      </div>

      {/* Controls */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-center gap-4 border-t border-slate-700">
        <button
          onClick={handleRestart}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          title="重新播放"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={handlePlay}
          className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          title={isPlaying ? '暫停' : '播放'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>
        <button
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors opacity-50 cursor-not-allowed"
          title="匯出功能需使用 Remotion CLI"
          disabled
        >
          <Download size={20} />
        </button>
      </div>

      {/* Parameters Display */}
      <div className="bg-slate-850 px-4 py-3 border-t border-slate-700">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500">貸款總額</div>
            <div className="text-emerald-400 font-mono font-bold">{loanAmount}萬</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">年期</div>
            <div className="text-sky-400 font-mono font-bold">{loanTerm}年</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">貸款利率</div>
            <div className="text-amber-400 font-mono font-bold">{loanRate}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">配息率</div>
            <div className="text-purple-400 font-mono font-bold">{investReturnRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorAnimationPlayer;
