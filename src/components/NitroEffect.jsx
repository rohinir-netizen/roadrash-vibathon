/**
 * NitroEffect.jsx
 * Flame cone + pulsing point light rendered as a child group inside the Bike.
 *
 * Visibility is toggled via a ref in useFrame — no React re-renders needed.
 *
 * Props:
 *   nitroRef {React.MutableRefObject} – nitroRef from useNitro
 */
import { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const NitroEffect = forwardRef(function NitroEffect({ nitroRef }, ref) {
  const coneRef  = useRef();
  const lightRef = useRef();
  const trailRef = useRef();

  useFrame(({ clock }) => {
    const active = nitroRef?.current?.active;
    if (!coneRef.current) return;
    coneRef.current.visible  = !!active;
    if (lightRef.current) lightRef.current.visible = !!active;
    if (trailRef.current) trailRef.current.visible  = !!active;

    if (active) {
      const t = clock.getElapsedTime();
      // Pulsing scale for flame shimmer
      const pulse = 1 + Math.sin(t * 28) * 0.18;
      coneRef.current.scale.set(pulse, 1 + Math.sin(t * 22) * 0.25, pulse);
      if (lightRef.current) {
        lightRef.current.intensity = 12 + Math.sin(t * 30) * 4;
      }
    }
  });

  return (
    // Positioned behind the bike (local space; z+ is toward camera)
    <group ref={ref} position={[0, 0.28, 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main flame cone — points backward (up in rotated space) */}
      <mesh ref={coneRef} visible={false}>
        <coneGeometry args={[0.22, 2.2, 10]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={6}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh ref={trailRef} position={[0, 0.5, 0]} visible={false}>
        <coneGeometry args={[0.1, 1.0, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={8}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Point light for nitro glow */}
      <pointLight ref={lightRef} color="#00ffaa" intensity={12} distance={8} visible={false} />
    </group>
  );
});
