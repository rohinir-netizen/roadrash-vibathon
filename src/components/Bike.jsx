/**
 * Bike.jsx
 * The player-controlled bike mesh.
 *
 * - Reads keyboard input via the keys ref each frame
 * - Moves laterally (X) and slightly forward/backward (Z) within bounds
 * - Tilts the bike body on turns for a dynamic feel
 * - Exposes its world position via bikeRef for collision checks in GameCanvas
 *
 * Props:
 *   keysRef  {React.MutableRefObject} – from useKeyboardControls
 *   bikeRef  {React.MutableRefObject} – { x, z } position shared with parent
 *   speedRef {React.MutableRefObject} – current forward speed
 *   gameOver {boolean}                – freeze movement when true
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Lateral movement bounds (3 lanes: -2, 0, +2)
const X_MIN = -3.2;
const X_MAX = 3.2;

// The bike starts at z = 5 (in front of the camera but visible)
const BIKE_START_Z = 5;

export function Bike({ keysRef, bikeRef, speedRef, gameOver }) {
  const groupRef = useRef();
  const leanRef = useRef(0); // current lean angle

  // Initialise bikeRef position
  if (bikeRef) {
    bikeRef.current.x = 0;
    bikeRef.current.z = BIKE_START_Z;
  }

  useFrame((_, delta) => {
    if (gameOver || !groupRef.current) return;

    const keys = keysRef.current;
    const lateralSpeed = 6; // units per second left/right
    const tiltTarget =
      keys.ArrowLeft ? 0.25 : keys.ArrowRight ? -0.25 : 0;

    // Smooth lean interpolation
    leanRef.current += (tiltTarget - leanRef.current) * 8 * delta;

    // Update X position
    let nx = groupRef.current.position.x;
    if (keys.ArrowLeft) nx -= lateralSpeed * delta;
    if (keys.ArrowRight) nx += lateralSpeed * delta;
    nx = Math.max(X_MIN, Math.min(X_MAX, nx));
    groupRef.current.position.x = nx;

    // Apply lean
    groupRef.current.rotation.z = leanRef.current;

    // Sync bikeRef for collision detection
    if (bikeRef) {
      bikeRef.current.x = nexus(groupRef.current.position.x);
      bikeRef.current.z = BIKE_START_Z;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, BIKE_START_Z]}>
      {/* ── Body ── */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#1a73e8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Fairing / front cowl ── */}
      <mesh position={[0, 0.65, 0.55]} castShadow>
        <boxGeometry args={[0.42, 0.32, 0.55]} />
        <meshStandardMaterial color="#1558b0" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ── Rider torso ── */}
      <mesh position={[0, 0.95, 0.1]} castShadow>
        <boxGeometry args={[0.38, 0.55, 0.5]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>

      {/* ── Rider helmet ── */}  
      <mesh position={[0, 1.38, 0.22]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Front wheel ── */}
      <mesh position={[0, 0.22, 0.75]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 18]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* ── Rear wheel ── */}
      <mesh position={[0, 0.22, -0.75]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 18]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* ── Exhaust pipes ── */}
      {[-0.18, 0.18].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.28, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} />
        </mesh>
      ))}

      {/* ── Headlight glow ── */}
      <pointLight position={[0, 0.7, 1]} intensity={1.5} distance={6} color="#70b8ff" />
    </group>
  );
}

// tiny helper to avoid undefined
function nexus(v) { return v ?? 0; }
