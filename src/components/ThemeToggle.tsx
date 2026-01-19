import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ className = '', size = 'sm' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs
        transition-all duration-300 shrink-0
        ${isDark
          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
          : 'bg-slate-700/20 hover:bg-slate-700/30 text-slate-700 border border-slate-300'
        }
        ${className}
      `}
      title={isDark ? '切換至亮色模式' : '切換至深色模式'}
      aria-label={isDark ? '切換至亮色模式' : '切換至深色模式'}
    >
      {isDark ? (
        <>
          <Sun size={iconSize} className="transition-transform duration-300" />
          <span className="hidden sm:inline">亮色</span>
        </>
      ) : (
        <>
          <Moon size={iconSize} className="transition-transform duration-300" />
          <span className="hidden sm:inline">深色</span>
        </>
      )}
    </button>
  );
}
