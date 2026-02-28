/**
 * App.jsx
 * Root component — game state machine:
 *   idle  →  playing  →  gameover
 *
 * Creates hudDataRef and passes it to both GameCanvas (writer) and HUD (reader).
 * Enter key starts / restarts the game from any non-playing screen.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD }        from './components/HUD';
import { resetSpawner } from './utils/obstacleSpawner';

export default function App() {
  const [gameState, setGameState] = useState('idle');  // 'idle' | 'playing' | 'gameover'
  const [finalDist, setFinalDist] = useState(0);

  // Shared ref between GameCanvas (writes) and HUD (reads)
  const hudDataRef = useRef({ speed: 0, fuel: 1, distance: 0, nitroActive: false, cooldown: false });

  // Start / restart
  const handleStart = useCallback(() => {
    resetSpawner();
    hudDataRef.current = { speed: 0, fuel: 1, distance: 0, nitroActive: false, cooldown: false };
    setFinalDist(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((dist) => {
    setFinalDist(dist);
    setGameState('gameover');
  }, []);

  // Keyboard shortcut: Enter to start/restart
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Enter' && gameState !== 'playing') handleStart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, handleStart]);

  // Apply body class for global neon effect during play
  useEffect(() => {
    document.body.classList.toggle('game-active', gameState === 'playing');
  }, [gameState]);

  return (
    <div className="game-root">
      {/* ── 3D Canvas ── always rendered only while playing ── */}
      {gameState === 'playing' && (
        <>
          <div className="canvas-wrapper">
            <GameCanvas onGameOver={handleGameOver} hudDataRef={hudDataRef} />
          </div>
          <HUD hudDataRef={hudDataRef} />
          <div className="speed-vignette" />
        </>
      )}

      {/* ── START SCREEN ── */}
      {gameState === 'idle' && (
        <div className="overlay">
          <div className="overlay-panel">
            <div className="neon-badge">ARCADE RACER</div>
            <h1 className="game-title">
              <span className="title-neon">NEON</span>
              <span className="title-nitro">NITRO</span>
            </h1>
            <p className="game-subtitle">Race at the speed of light</p>

            <div className="controls-grid">
              <div className="ctrl-row"><kbd>←</kbd><kbd>→</kbd><span>Steer</span></div>
              <div className="ctrl-row"><kbd>SPACE</kbd><span>⚡ Nitro Boost</span></div>
            </div>

            <button className="btn-play" onClick={handleStart}>
              <span className="btn-icon">▶</span>
              <span>Start Racing</span>
              <kbd className="btn-key">Enter</kbd>
            </button>
          </div>
        </div>
      )}

      {/* ── GAME OVER SCREEN ── */}
      {gameState === 'gameover' && (
        <div className="overlay gameover-overlay">
          <div className="overlay-panel go-panel">
            <div className="crash-icon">💥</div>
            <h2 className="go-title">WIPEOUT</h2>
            <div className="go-score-block">
              <span className="go-score-label">DISTANCE</span>
              <span className="go-score-val">{finalDist.toLocaleString()} <small>m</small></span>
            </div>
            <button className="btn-play btn-restart" onClick={handleStart}>
              <span className="btn-icon">🔄</span>
              <span>Race Again</span>
              <kbd className="btn-key">Enter</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
