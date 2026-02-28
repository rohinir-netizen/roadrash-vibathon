/**
 * Tunnel.jsx
 * Recycling neon arch structures that scroll past the camera,
 * creating the sense of racing through a futuristic tunnel/highway.
 *
 * 8 arches are placed at z = -15, -30, -45 … and recycled
 * to the back when they scroll past the camera.
 *
 * Props:
 *   speedRef {React.MutableRefObject<number>}
 */
import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';

const ARCH_GAP   = 18;   // world units between arches
const ARCH_COUNT = 8;
const RECYCLE_Z  = 14;   // recycle when past camera by this amount
const SPAN_Z     = ARCH_COUNT * ARCH_GAP;

// Alternating neon colours for arches
const ARCH_COLORS = ['#00eeff', '#cc00ff', '#00eeff', '#ff00aa', '#00eeff', '#cc00ff', '#00eeff', '#ff00aa'];

export const Tunnel = memo(function Tunnel({ speedRef }) {
  // Store arch Z positions in a plain ref array
  const positions = useRef(
    Array.from({ length: ARCH_COUNT }, (_, i) => -(i + 1) * ARCH_GAP)
  );
  const groupRefs = useRef(
    Array.from({ length: ARCH_COUNT }, () => ({ current: null }))
  );

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 15;
    positions.current.forEach((z, i) => {
      const newZ = z + speed * delta;
      positions.current[i] = newZ > RECYCLE_Z ? newZ - SPAN_Z - ARCH_GAP : newZ;
      if (groupRefs.current[i]?.current) {
        groupRefs.current[i].current.position.z = positions.current[i];
      }
    });
  });

  return (
    <group>
      {Array.from({ length: ARCH_COUNT }).map((_, i) => (
        <Arch
          key={i}
          color={ARCH_COLORS[i]}
          ref={groupRefs.current[i]}
          initZ={-(i + 1) * ARCH_GAP}
        />
      ))}
    </group>
  );
});

import { forwardRef } from 'react';

const POLE_H   = 6.5;
const ROAD_W   = 9;
const POLE_GAP = ROAD_W / 2 + 0.3;   // just outside road edge

const Arch = forwardRef(function Arch({ color, initZ }, ref) {
  return (
    <group ref={ref} position={[0, 0, initZ]}>
      {/* Left pole */}
      <mesh position={[-POLE_GAP, POLE_H / 2, 0]} castShadow>
        <boxGeometry args={[0.22, POLE_H, 0.22]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>

      {/* Right pole */}
      <mesh position={[POLE_GAP, POLE_H / 2, 0]} castShadow>
        <boxGeometry args={[0.22, POLE_H, 0.22]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>

      {/* Top crossbar */}
      <mesh position={[0, POLE_H, 0]}>
        <boxGeometry args={[ROAD_W + 1.2, 0.22, 0.22]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>

      {/* Downward neon spotlight from arch top */}
      <pointLight
        position={[0, POLE_H - 0.5, 0]}
        color={color}
        intensity={8}
        distance={12}
      />

      {/* Small indicator dots on poles */}
      {[-POLE_GAP, POLE_GAP].map((x, j) => (
        <mesh key={j} position={[x, POLE_H * 0.55, 0.15]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});
