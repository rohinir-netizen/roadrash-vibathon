/**
 * ScoreBoard.jsx
 * HTML overlay HUD that displays the live score.
 * Uses @react-three/drei's <Html> to anchor it inside the canvas.
 */
import { Html } from '@react-three/drei';

export function ScoreBoard({ score }) {
  return (
    <Html
      position={[-3.5, 3.5, 0]}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div className="hud-score">
        🏁 <span>{score}</span>
      </div>
    </Html>
  );
}
