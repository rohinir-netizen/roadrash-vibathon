/**
 * GameCanvas.jsx
 * Core R3F scene that wires together Road, Bike, Obstacles, ScoreBoard.
 *
 * Responsibilities:
 * 1. Runs the central useFrame game-loop:
 *    - Moves all obstacles toward the player each tick
 *    - Checks AABB collision between bike and each obstacle
 *    - Increments score over time
 *    - Spawns new obstacles at a regular interval
 *    - Gradually increases game speed
 * 2. Calls onGameOver(score) when a collision is detected
 *
 * Props:
 *   score        {number}
 *   setScore     {function}
 *   onGameOver   {function(finalScore)}
 */
import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';

import { Road } from './Road';
import { Bike } from './Bike';
import { Obstacle } from './Obstacle';
import { ScoreBoard } from './ScoreBoard';

import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { checkCollision } from '../utils/collisionDetection';
import { spawnObstacle } from '../utils/obstacleSpawner';

// ─────────────────────────────────────────────
// Inner scene component — must be inside <Canvas>
// ─────────────────────────────────────────────
function GameScene({ onGameOver }) {
  const keysRef = useKeyboardControls();

  // Bike world-position shared via ref (updated each frame inside Bike)
  const bikePos = useRef({ x: 0, z: 5 });

  // Game speed (units / second) — increases over time
  const speedRef = useRef(12);

  // Obstacle list — stored in a ref to avoid React re-renders inside useFrame
  const obstaclesRef = useRef([]);

  // Throttle spawning
  const spawnTimer = useRef(0);
  const SPAWN_INTERVAL = 1.8; // seconds between obstacle waves

  // Score accumulation
  const scoreRef = useRef(0);
  const scoreDisplayRef = useRef(0); // rounded value for display

  // Prevent firing onGameOver multiple times
  const deadRef = useRef(false);

  // Force React to re-render obstacle list when it changes
  const [obsVersion, setObsVersion] = useState(0);
  const obsVersionRef = useRef(0);

  // Score state for display (updated via callback to avoid stale closures)
  const [displayScore, setDisplayScore] = useState(0);

  useFrame((_, delta) => {
    if (deadRef.current) return;

    // Gradually ramp up speed (cap at 28)
    speedRef.current = Math.min(speedRef.current + 0.5 * delta, 28);

    // Accumulate score
    scoreRef.current += delta * 10 * (speedRef.current / 12);

    // Update display score every full integer point
    const rounded = Math.floor(scoreRef.current);
    if (rounded !== scoreDisplayRef.current) {
      scoreDisplayRef.current = rounded;
      setDisplayScore(rounded);
    }

    // ── Spawn obstacles ──
    spawnTimer.current += delta;
    if (spawnTimer.current >= SPAWN_INTERVAL) {
      spawnTimer.current = 0;
      // Spawn 1–2 obstacles per wave
      const count = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        obstaclesRef.current.push(spawnObstacle());
      }
      obsVersionRef.current++;
      setObsVersion(obsVersionRef.current); // trigger re-render
    }

    // ── Move obstacles and check collision ──
    const speed = speedRef.current;
    let collided = false;
    let alive = [];

    for (const obs of obstaclesRef.current) {
      obs.z += speed * delta;

      // Despawn when past the camera
      if (obs.z > 10) continue;

      // AABB collision check
      if (checkCollision(bikePos.current, obs, obs.type)) {
        collided = true;
        break;
      }

      alive.push(obs);
    }

    if (collided) {
      deadRef.current = true;
      setTimeout(() => onGameOver(Math.floor(scoreRef.current)), 200);
      return;
    }

    if (alive.length !== obstaclesRef.current.length) {
      obstaclesRef.current = alive;
      obsVersionRef.current++;
      setObsVersion(obsVersionRef.current);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-8, 6, -10]} intensity={0.6} color="#8ecdf7" />

      {/* Sky & stars */}
      <Sky sunPosition={[0, 0.1, -1]} turbidity={8} rayleigh={0.5} />
      <Stars radius={80} depth={50} count={3000} factor={4} fade />

      {/* Road */}
      <Road speedRef={speedRef} />

      {/* Player bike */}
      <Bike
        keysRef={keysRef}
        bikeRef={bikePos}
        speedRef={speedRef}
        gameOver={deadRef.current}
      />

      {/* Obstacles */}
      {obstaclesRef.current.map((obs) => (
        <Obstacle
          key={obs.id}
          position={[obs.x, 0, obs.z]}
          type={obs.type}
        />
      ))}

      {/* HUD score */}
      <ScoreBoard score={displayScore} />
    </>
  );
}

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────
export function GameCanvas({ onGameOver }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 12], fov: 60, near: 0.1, far: 500 }}
      style={{ width: '100%', height: '100%' }}
    >
      <GameScene onGameOver={onGameOver} />
    </Canvas>
  );
}
