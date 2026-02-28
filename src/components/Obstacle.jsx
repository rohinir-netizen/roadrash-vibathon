/**
 * Obstacle.jsx
 * Neon-styled obstacle mesh.
 *
 * Types:
 *   'car'     – angular cyberpunk car
 *   'barrier' – wide neon warning barrier
 *
 * colorTag ('red' | 'orange' | 'pink') selects the neon palette.
 *
 * Props:
 *   position  {[x, y, z]}
 *   type      {'car' | 'barrier'}
 *   colorTag  {string}
 */

const PALETTE = {
  red:    { base: '#ff0033', emissive: '#ff0033', glow: '#ff1144' },
  orange: { base: '#ff6600', emissive: '#ff6600', glow: '#ff8800' },
  pink:   { base: '#ff0099', emissive: '#ff0099', glow: '#ff44cc' },
};

export function Obstacle({ position, type = 'car', colorTag = 'red' }) {
  const pal = PALETTE[colorTag] ?? PALETTE.red;
  return type === 'car'
    ? <NeonCar position={position} pal={pal} />
    : <NeonBarrier position={position} pal={pal} />;
}

function Mat({ pal, intensity = 5 }) {
  return (
    <meshStandardMaterial
      color={pal.base}
      emissive={pal.emissive}
      emissiveIntensity={intensity}
      metalness={0.6}
      roughness={0.2}
      toneMapped={false}
    />
  );
}

function NeonCar({ position, pal }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.05, 0.55, 2.1]} />
        <Mat pal={pal} intensity={3} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.88, -0.1]} castShadow>
        <boxGeometry args={[0.8, 0.38, 1.1]} />
        <Mat pal={pal} intensity={4} />
      </mesh>
      {/* Windshield trim */}
      <mesh position={[0, 0.78, 0.5]}>
        <boxGeometry args={[0.78, 0.3, 0.08]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      {/* Wheels */}
      {[[-0.55, -0.68], [0.55, -0.68], [-0.55, 0.68], [0.55, 0.68]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.2, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          <meshStandardMaterial color="#111122" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      {[-0.3, 0.3].map((ox, i) => (
        <mesh key={i} position={[ox, 0.42, 1.06]}>
          <boxGeometry args={[0.18, 0.12, 0.06]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} toneMapped={false} />
        </mesh>
      ))}
      {/* Neon undercar glow */}
      <pointLight position={[0, 0.1, 0]} color={pal.glow} intensity={4} distance={4} />
    </group>
  );
}

function NeonBarrier({ position, pal }) {
  return (
    <group position={position}>
      {/* Main bar */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.8, 0.22, 0.35]} />
        <Mat pal={pal} intensity={4} />
      </mesh>
      {/* Support legs */}
      {[-1.0, 0, 1.0].map((ox, i) => (
        <mesh key={i} position={[ox, 0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.45]} />
          <Mat pal={pal} intensity={3} />
        </mesh>
      ))}
      {/* Warning stripe pattern */}
      {[-0.9, -0.3, 0.3, 0.9].map((ox, i) => (
        <mesh key={i} position={[ox, 0.55, 0.18]}>
          <boxGeometry args={[0.3, 0.24, 0.05]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ffdd00' : pal.base}
            emissive={i % 2 === 0 ? '#ffdd00' : pal.emissive}
            emissiveIntensity={5}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0.8, 0]} color={pal.glow} intensity={5} distance={5} />
    </group>
  );
}
