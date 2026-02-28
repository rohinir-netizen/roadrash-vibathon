/**
 * Road.jsx
 * Neon infinite scrolling road — two tiles leapfrogging indefinitely.
 *
 * Visual style:
 *   • Near-black asphalt surface with slight metallic sheen
 *   • Cyan emissive edge glow strips
 *   • Magenta dashed lane dividers
 *   • Ambient ground-level point lights for neon floor glow
 *
 * Props:
 *   speedRef {React.MutableRefObject<number>} – current world speed
 */
import { useRef, forwardRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';

const TILE_LEN  = 70;
const ROAD_W    = 9;

export const Road = memo(function Road({ speedRef }) {
  const tileA = useRef();
  const tileB = useRef();

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 15;
    tileA.current.position.z += speed * delta;
    tileB.current.position.z += speed * delta;
    if (tileA.current.position.z > TILE_LEN)       tileA.current.position.z -= TILE_LEN * 2;
    if (tileB.current.position.z > TILE_LEN)       tileB.current.position.z -= TILE_LEN * 2;
  });

  return (
    <group>
      <RoadTile ref={tileA} startZ={0} />
      <RoadTile ref={tileB} startZ={-TILE_LEN} />

      {/* Fixed kerb neon strips — long enough to always be visible */}
      <KerbStrip x={-ROAD_W / 2} />
      <KerbStrip x={ ROAD_W / 2} />
    </group>
  );
});

const RoadTile = forwardRef(function RoadTile({ startZ }, ref) {
  return (
    <group ref={ref} position={[0, 0, startZ]}>
      {/* Asphalt base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_W, TILE_LEN]} />
        <meshStandardMaterial color="#070710" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Left cyan edge glow strip */}
      <GlowStrip x={-ROAD_W / 2 + 0.25} tileLen={TILE_LEN} color="#00eeff" />
      {/* Right cyan edge glow strip */}
      <GlowStrip x={ ROAD_W / 2 - 0.25} tileLen={TILE_LEN} color="#00eeff" />

      {/* Lane dividers — magenta dashes */}
      <LaneDashes x={-2} tileLen={TILE_LEN} color="#dd00ff" />
      <LaneDashes x={ 2} tileLen={TILE_LEN} color="#dd00ff" />

      {/* Ground glow point lights at intervals */}
      {[-28, 0, 28].map((z) => (
        <pointLight key={z} position={[0, 0.5, z]} color="#3300ff" intensity={6} distance={22} />
      ))}
    </group>
  );
});

function GlowStrip({ x, tileLen, color }) {
  return (
    <mesh position={[x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.2, tileLen]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </mesh>
  );
}

function LaneDashes({ x, tileLen, color }) {
  const count = 12;
  const dashLen = 4;
  const step = tileLen / count;
  return (
    <group position={[x, 0.02, -tileLen / 2]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[0, 0, i * step + step / 2]}>
          <boxGeometry args={[0.1, 0.02, dashLen]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function KerbStrip({ x }) {
  return (
    <mesh position={[x, 0.03, -200]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.5, 600]} />
      <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  );
}
