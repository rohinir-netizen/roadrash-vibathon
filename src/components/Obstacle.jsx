/**
 * Obstacle.jsx
 * Renders a single obstacle at a given [x, z] position.
 *
 * Types:
 *   'car'     – tall coloured box resembling a car
 *   'barrier' – wide flat red barrier across the lane
 *
 * Props:
 *   position {[number, number, number]}
 *   type     {'car' | 'barrier'}
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const CONFIGS = {
  car: {
    bodySize: [1.0, 0.6, 1.9],
    bodyColor: '#e74c3c',
    roofSize: [0.75, 0.4, 1.0],
    roofColor: '#c0392b',
    roofY: 0.5,
    wheelSize: [0.18, 0.18, 0.18],
    wheelColor: '#111',
    wheels: [
      [-0.5, -0.2, 0.7],
      [0.5, -0.2, 0.7],
      [-0.5, -0.2, -0.7],
      [0.5, -0.2, -0.7],
    ],
  },
  barrier: {
    bodySize: [2.5, 0.7, 0.4],
    bodyColor: '#f39c12',
    roofSize: null,
    stripes: true,
  },
};

export function Obstacle({ position, type = 'car' }) {
  const cfg = CONFIGS[type] ?? CONFIGS.car;

  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, cfg.bodySize[1] / 2, 0]} castShadow>
        <boxGeometry args={cfg.bodySize} />
        <meshStandardMaterial color={cfg.bodyColor} />
      </mesh>

      {/* Roof (cars only) */}
      {cfg.roofSize && (
        <mesh position={[0, cfg.roofY + cfg.bodySize[1] / 2, 0]} castShadow>
          <boxGeometry args={cfg.roofSize} />
          <meshStandardMaterial color={cfg.roofColor} />
        </mesh>
      )}

      {/* Wheels (cars only) */}
      {cfg.wheels?.map((wp, i) => (
        <mesh key={i} position={[wp[0], wp[1] + cfg.bodySize[1] / 2, wp[2]]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color={cfg.wheelColor} />
        </mesh>
      ))}

      {/* Barrier stripes */}
      {cfg.stripes && (
        <>
          {[-0.8, -0.3, 0.3, 0.8].map((sx, i) => (
            <mesh key={i} position={[sx, cfg.bodySize[1] / 2 + 0.01, 0]}>
              <boxGeometry args={[0.2, cfg.bodySize[1], 0.42]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#e74c3c' : '#f39c12'} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
