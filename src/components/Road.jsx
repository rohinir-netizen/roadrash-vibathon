/**
 * Road.jsx
 * Creates an infinitely scrolling straight road using two large plane tiles
 * that leapfrog each other. Lane dashes are drawn as thin box meshes.
 *
 * Props:
 *   speed {number} – current game speed (units/s) passed in via ref
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const TILE_LENGTH = 60; // length of each road tile in world units
const ROAD_WIDTH = 8;

export function Road({ speedRef }) {
  // Two tiles that alternate position to create the infinite loop
  const tileA = useRef();
  const tileB = useRef();

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 12;

    // Move both tiles toward the camera
    tileA.current.position.z += speed * delta;
    tileB.current.position.z += speed * delta;

    // When a tile scrolls past the camera, jump it back to the front
    if (tileA.current.position.z > TILE_LENGTH) {
      tileA.current.position.z -= TILE_LENGTH * 2;
    }
    if (tileB.current.position.z > TILE_LENGTH) {
      tileB.current.position.z -= TILE_LENGTH * 2;
    }
  });

  return (
    <group>
      {/* Tile A */}
      <RoadTile ref={tileA} startZ={0} />
      {/* Tile B – starts one tile length ahead */}
      <RoadTile ref={tileB} startZ={-TILE_LENGTH} />

      {/* Static kerb lines */}
      <Kerb x={-ROAD_WIDTH / 2} />
      <Kerb x={ROAD_WIDTH / 2} />
    </group>
  );
}

/** A single flat road plane with dashed lane markings. */
import { forwardRef } from 'react';

const RoadTile = forwardRef(function RoadTile({ startZ }, ref) {
  return (
    <group ref={ref} position={[0, 0, startZ]}>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, TILE_LENGTH]} />
        <meshStandardMaterial color="#2a2a2e" />
      </mesh>

      {/* Centre dashes – left lane divider at x = -1 */}
      <LaneDashes x={-2} tileLength={TILE_LENGTH} />
      {/* Centre dashes – right lane divider at x = +1 */}
      <LaneDashes x={2} tileLength={TILE_LENGTH} />
    </group>
  );
});

/** Dashed lane markings running along the Z axis. */
function LaneDashes({ x, tileLength }) {
  const dashCount = 10;
  const dashLength = 3;
  const gap = tileLength / dashCount;

  return (
    <group position={[x, 0.01, -tileLength / 2]}>
      {Array.from({ length: dashCount }).map((_, i) => (
        <mesh key={i} position={[0, 0, i * gap + gap / 2]}>
          <boxGeometry args={[0.12, 0.02, dashLength]} />
          <meshStandardMaterial color="#e8c84a" />
        </mesh>
      ))}
    </group>
  );
}

/** Kerb strip running along the side of the road. */
function Kerb({ x }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
      <planeGeometry args={[0.4, 300]} />
      <meshStandardMaterial color="#c0392b" />
    </mesh>
  );
}
