/**
 * App.jsx
 * Root component managing the top-level game state machine:
 *   idle     → press Enter → playing
 *   playing  → collision  → gameover
 *   gameover → Restart    → idle
 */
import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { resetSpawner } from './utils/obstacleSpawner';

export default function App() {
  // 'idle' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('idle');
  const [finalScore, setFinalScore] = useState(0);

  // Listen for Enter key on idle / gameover screens
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Enter') {
        if (gameState === 'idle' || gameState === 'gameover') {
          handleStart();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState]);

  const handleStart = useCallback(() => {
    resetSpawner();
    setFinalScore(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((score) => {
    setFinalScore(score);
    setGameState('gameover');
  }, []);

  return (
    <div className="game-root">
      {/* ── 3D Canvas (always mounted so Three.js doesn't re-init) ── */}
      {gameState === 'playing' && (
        <div className="canvas-wrapper">
          <GameCanvas onGameOver={handleGameOver} />
        </div>
      )}

      {/* ── Start Screen ── */}
      {gameState === 'idle' && (
        <div className="overlay">
          <div className="overlay-panel">
            <div className="game-title">
              <span className="title-icon">🏍️</span>
              <span>Moto Rush</span>
            </div>
            <p className="subtitle">Dodge traffic. Survive longer. Score higher.</p>
            <div className="controls-hint">
              <div className="key-row">
                <kbd>←</kbd> <kbd>→</kbd> <span>Steer</span>
              </div>
            </div>
            <button className="btn-start" onClick={handleStart}>
              ▶ &nbsp;Start Game <span className="key-hint">Enter</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Game Over Screen ── */}
      {gameState === 'gameover' && (
        <div className="overlay">
          <div className="overlay-panel gameover">
            <div className="gameover-icon">💥</div>
            <h2 className="gameover-title">Game Over</h2>
            <div className="score-display">
              <span className="score-label">Your Score</span>
              <span className="score-value">{finalScore}</span>
            </div>
            <button className="btn-start" onClick={handleStart}>
              🔄 &nbsp;Play Again <span className="key-hint">Enter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
