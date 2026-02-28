/**
 * Bike.jsx
 * Neon electric-blue racing bike.
 *
 * This component is PURELY visual — all physics/steering logic lives in GameScene.
 * It reads `bikeXRef` (number) and `leanRef` (number) set by GameScene's useFrame,
 * and animates lean, wheel rotation, and nitro flame visibility.
 *
 * Props:
 *   bikeXRef  – ref to current X position (updated by GameScene)
 *   leanRef   – ref to current Z-axis lean angle (updated by GameScene)
 *   nitroRef  – nitro state from useNitro
 */
import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { NitroEffect } from './NitroEffect';

export const Bike = memo(function Bike({ bikeXRef, leanRef, nitroRef }) {
  const groupRef      = useRef();
  const frontWheelRef = useRef();
  const rearWheelRef  = useRef();
  const headlightRef  = useRef();

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Sync position & lean from shared refs
    groupRef.current.position.x = bikeXRef?.current ?? 0;
    groupRef.current.rotation.z = leanRef?.current  ?? 0;

    // Wheel spin speed proportional to nitro multiplier
    const spin = 8 * (nitroRef?.current?.multiplier ?? 1);
    if (frontWheelRef.current) frontWheelRef.current.rotation.x -= spin * delta;
    if (rearWheelRef.current)  rearWheelRef.current.rotation.x  -= spin * delta;

    // Headlight intensity pulse
    if (headlightRef.current) {
      headlightRef.current.intensity = 4 + Math.sin(t * 3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── BODY ── */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.55, 0.5, 1.7]} />
        <meshStandardMaterial color="#0022ff" emissive="#0011cc" emissiveIntensity={2} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── FRONT FAIRING ── */}
      <mesh position={[0, 0.68, 0.65]} castShadow>
        <boxGeometry args={[0.48, 0.32, 0.6]} />
        <meshStandardMaterial color="#0044ff" emissive="#0033ee" emissiveIntensity={2.5} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── FRONT FAIRING NEON STRIP (cyan) ── */}
      <mesh position={[0, 0.58, 0.95]}>
        <boxGeometry args={[0.44, 0.06, 0.06]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={8} toneMapped={false} />
      </mesh>

      {/* ── RIDER TORSO ── */}
      <mesh position={[0, 0.97, 0.1]} castShadow>
        <boxGeometry args={[0.42, 0.6, 0.52]} />
        <meshStandardMaterial color="#111133" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rider chest neon stripe */}
      <mesh position={[0, 1.0, 0.27]}>
        <boxGeometry args={[0.38, 0.08, 0.04]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* ── HELMET ── */}
      <mesh position={[0, 1.42, 0.22]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color="#0033ff" emissive="#0022cc" emissiveIntensity={2} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.41, 0.4]}>
        <boxGeometry args={[0.28, 0.1, 0.06]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={5} transparent opacity={0.8} toneMapped={false} />
      </mesh>

      {/* ── FRONT WHEEL ── */}
      <mesh ref={frontWheelRef} position={[0, 0.22, 0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.5} />
      </mesh>
      {/* Front wheel neon rim */}
      <mesh position={[0, 0.22, 0.82]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.22, 0.025, 8, 24]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={5} toneMapped={false} />
      </mesh>

      {/* ── REAR WHEEL ── */}
      <mesh ref={rearWheelRef} position={[0, 0.22, -0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.18, 16]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.5} />
      </mesh>
      {/* Rear wheel neon rim */}
      <mesh position={[0, 0.22, -0.82]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.24, 0.028, 8, 24]} />
        <meshStandardMaterial color="#dd00ff" emissive="#dd00ff" emissiveIntensity={5} toneMapped={false} />
      </mesh>

      {/* ── EXHAUST PIPES ── */}
      {[-0.2, 0.2].map((xo, i) => (
        <mesh key={i} position={[xo, 0.3, -0.98]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.35, 8]} />
          <meshStandardMaterial color="#334455" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* ── BODY NEON UNDERLINE ── */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.5, 0.04, 1.6]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* ── HEADLIGHT ── */}
      <pointLight ref={headlightRef} position={[0, 0.65, 1.1]} color="#88ccff" intensity={4} distance={12} />
      <mesh position={[0, 0.62, 0.96]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaddff" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* ── NITRO FLAME (always in tree, toggled via ref) ── */}
      <NitroEffect nitroRef={nitroRef} />
    </group>
  );
});
