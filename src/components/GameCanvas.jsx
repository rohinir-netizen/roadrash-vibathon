/**
 * GameCanvas.jsx
 * ─────────────────────────────────────────────────────────────────
 * HIGH PERFORMANCE REFACTOR — Zero frame-based React re-renders.
 *
 * Architecture:
 *  • Simulation Layer (useFrame):
 *    - Updates positions, nitro, collision, spawning, scoring.
 *    - Uses only REFS to avoid expensive React reconciliation.
 *  • Rendering Layer (3D Components):
 *    - Bike, OpponentBike, ObstaclePool read from refs and update matrices.
 *    - Tunnel & Road handle their own internal scroll via refs.
 *  • UI Layer (App/HUD):
 *    - HUD reads from hudDataRef on a low-frequency interval.
 *    - useState strictly for game-over / screen transitions.
 * ─────────────────────────────────────────────────────────────────
 */
import { useRef, useState, memo, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

import { Road }         from './Road';
import { Tunnel }       from './Tunnel';
import { Bike }         from './Bike';
import { ObstaclePool } from './ObstaclePool';

import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useNitro }            from '../hooks/useNitro';
import { checkCollision }      from '../utils/collisionDetection';
import { spawnObstacle }       from '../utils/obstacleSpawner';
import { getBaseSpeed }        from '../utils/speedController';

// ─────────────────────────────────────────────────────────
// Chase Camera (Ref-optimized)
// ─────────────────────────────────────────────────────────
const ChaseCamera = memo(function ChaseCamera({ bikeXRef, nitroRef }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const nitro = nitroRef.current;
    const bikeX = bikeXRef.current;
    const multi = nitro.multiplier;

    // Smoothly calculate target positions
    const targetX = bikeX * 0.65;
    const targetY = 3.4 + (multi - 1) * 0.6;
    const targetZ = 9.0 + (multi - 1) * 3.5;
    const lerpAmt = Math.min(1, 5 * delta);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, lerpAmt * 0.8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, lerpAmt * 0.6);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, lerpAmt * 0.5);

    const drift = camera.position.x - bikeX;
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, drift * -0.04, lerpAmt);

    camera.lookAt(bikeX * 0.3, 0.8, -8);
  });

  return null;
});

// ─────────────────────────────────────────────────────────
// Environment (Memoized)
// ─────────────────────────────────────────────────────────
const Environment = memo(function Environment() {
  return (
    <>
      <color attach="background" args={['#04000e']} />
      <fog attach="fog" args={['#04000e', 40, 130]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 14, 6]} intensity={0.6} color="#a080ff" castShadow />
      <Stars radius={100} depth={60} count={4000} factor={5} saturation={0.4} fade />
      <mesh position={[0, 1.5, -120]} rotation={[0, 0, 0]}>
        <planeGeometry args={[120, 2.5]} />
        <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </>
  );
});

// ─────────────────────────────────────────────────────────
// Main Scene
// ─────────────────────────────────────────────────────────
function GameScene({ onGameOver, hudDataRef }) {
  const keysRef  = useKeyboardControls();
  const nitroRef = useNitro(keysRef);

  // Simulation Refs
  const bikeXRef    = useRef(0);
  const leanRef     = useRef(0);
  const speedRef    = useRef(getBaseSpeed(0));
  const distanceRef = useRef(0);
  const gameTimeRef = useRef(0);
  const obstaclesRef = useRef([]);
  const deadRef     = useRef(false);

  const spawnTimerRef = useRef(0);

  useFrame((state, delta) => {
    if (deadRef.current) return;

    const dt = Math.min(delta, 0.1); // Clamp for stability
    gameTimeRef.current += dt;

    // ── Update Speed & Distance ───────────────────────────
    const baseS = getBaseSpeed(gameTimeRef.current);
    const speed = baseS * nitroRef.current.multiplier;
    speedRef.current = speed;
    distanceRef.current += speed * dt;

    // ── Update HUD Ref ────────────────────────────────────
    if (hudDataRef.current) {
      const h = hudDataRef.current;
      h.speed       = speed;
      h.fuel        = nitroRef.current.fuel;
      h.nitroActive = nitroRef.current.active;
      h.cooldown    = nitroRef.current.cooldownTimer > 0;
      h.distance    = distanceRef.current;
    }

    // ── Steering ─────────────────────────────────────────
    const keys = keysRef.current;
    const turnSpd = 6.5 + (nitroRef.current.multiplier - 1) * 2.5;
    if (keys.ArrowLeft)  bikeXRef.current -= turnSpd * dt;
    if (keys.ArrowRight) bikeXRef.current += turnSpd * dt;
    bikeXRef.current = THREE.MathUtils.clamp(bikeXRef.current, -3.2, 3.2);

    const tiltTarget = keys.ArrowLeft ? 0.3 : keys.ArrowRight ? -0.3 : 0;
    leanRef.current = THREE.MathUtils.lerp(leanRef.current, tiltTarget, 8 * dt);

    // ── Obstacle Spawning ────────────────────────────────
    spawnTimerRef.current += dt;
    const interval = Math.max(0.6, 2.0 - (gameTimeRef.current * 0.06));
    if (spawnTimerRef.current >= interval) {
      spawnTimerRef.current = 0;
      obstaclesRef.current.push(spawnObstacle());
    }

    // ── Simulation: Movement & Collision ────────────────
    const obs = obstaclesRef.current;
    for (let i = obs.length - 1; i >= 0; i--) {
      const o = obs[i];
      
      // Oncoming traffic moves faster towards the player
      const relativeSpeed = o.isOncoming ? speed * 2.2 : speed;
      o.z += relativeSpeed * dt;

      // Despawn
      if (o.z > 10) {
        obs.splice(i, 1);
        continue;
      }

      // Check Collision — Zero Re-render
      if (checkCollision(bikeXRef.current, o, o.type)) {
        deadRef.current = true;
        document.body.classList.add('crash');
        setTimeout(() => {
          document.body.classList.remove('crash');
          onGameOver(Math.round(distanceRef.current));
        }, 500);
        return;
      }
    }
  });

  return (
    <>
      <ChaseCamera bikeXRef={bikeXRef} nitroRef={nitroRef} />
      <Environment />
      
      {/* Simulation components — all memoized, only logic inside useFrame */}
      <Road speedRef={speedRef} />
      <Tunnel speedRef={speedRef} />
      
      <Bike bikeXRef={bikeXRef} leanRef={leanRef} nitroRef={nitroRef} />
      
      {/* ObstaclePool handles its own logic inside useFrame */}
      <ObstaclePool obstaclesRef={obstaclesRef} />
    </>
  );
}

export function GameCanvas({ onGameOver, hudDataRef }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.4, 9], fov: 62 }}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.25,
        powerPreference: 'high-performance'
      }}
    >
      <GameScene onGameOver={onGameOver} hudDataRef={hudDataRef} />
    </Canvas>
  );
}
