/**
 * ObstaclePool.jsx
 * ─────────────────────────────────────────────────────────────────
 * PERFORMANCE-CRITICAL COMPONENT — zero React re-renders per frame.
 *
 * Uses THREE.InstancedMesh for obstacles:
 *   • ONE draw call for all car bodies
 *   • ONE draw call for all car cabins (offset in Y via matrix)
 *   • ONE draw call for all barriers
 *
 * Each frame, useFrame iterates obstaclesRef.current and updates
 * instance matrices directly. No setState, no JSX re-creation.
 *
 * Inactive instances are hidden by setting their scale to (0,0,0).
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   obstaclesRef {React.MutableRefObject<Array>} – simulation data array
 */
import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pool sizes — set to max concurrent obstacles you'll ever see
const CAR_POOL     = 16;
const BARRIER_POOL = 8;

// Reusable dummy object — never allocated inside useFrame
const DUMMY = new THREE.Object3D();
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0); // pre-built zero-scale matrix

// Car neon palette by colorTag
const CAR_COLORS = {
  red:    new THREE.Color('#ff0033'),
  orange: new THREE.Color('#ff6600'),
  pink:   new THREE.Color('#ff0099'),
};
const BARRIER_COLORS = {
  red:    new THREE.Color('#ff2244'),
  orange: new THREE.Color('#ff8800'),
  pink:   new THREE.Color('#ff44cc'),
};

export const ObstaclePool = memo(function ObstaclePool({ obstaclesRef }) {
  // Instanced mesh refs
  const carBodyRef    = useRef();
  const carCabinRef   = useRef();
  const barrierRef    = useRef();

  useFrame(() => {
    const obs = obstaclesRef.current;
    if (!carBodyRef.current || !barrierRef.current) return;

    let carIdx     = 0;
    let barrierIdx = 0;

    for (let i = 0; i < obs.length; i++) {
      const o = obs[i];
      const rotY = o.isOncoming ? Math.PI : 0;

      if (o.type === 'car' && carIdx < CAR_POOL) {
        const col = CAR_COLORS[o.colorTag] ?? CAR_COLORS.red;

        // ── Car body ──
        DUMMY.position.set(o.x, 0.3, o.z);
        DUMMY.rotation.set(0, rotY, 0);
        DUMMY.scale.set(1, 1, 1);
        DUMMY.updateMatrix();
        carBodyRef.current.setMatrixAt(carIdx, DUMMY.matrix);
        carBodyRef.current.setColorAt(carIdx, col);

        // ── Car cabin ──
        const cabinZOffset = o.isOncoming ? 0.1 : -0.1;
        DUMMY.position.set(o.x, 0.82, o.z + cabinZOffset);
        DUMMY.scale.set(0.75, 1, 0.55);
        DUMMY.updateMatrix();
        carCabinRef.current.setMatrixAt(carIdx, DUMMY.matrix);
        carCabinRef.current.setColorAt(carIdx, col);

        carIdx++;

      } else if (o.type === 'barrier' && barrierIdx < BARRIER_POOL) {
        const col = BARRIER_COLORS[o.colorTag] ?? BARRIER_COLORS.orange;

        DUMMY.position.set(o.x, 0.38, o.z);
        DUMMY.rotation.set(0, 0, 0);
        DUMMY.scale.set(1, 1, 1);
        DUMMY.updateMatrix();
        barrierRef.current.setMatrixAt(barrierIdx, DUMMY.matrix);
        barrierRef.current.setColorAt(barrierIdx, col);

        barrierIdx++;
      }
    }

    // ── Hide unused slots ───────────────────────────────────────
    while (carIdx < CAR_POOL) {
      carBodyRef.current.setMatrixAt(carIdx, HIDDEN);
      carCabinRef.current.setMatrixAt(carIdx, HIDDEN);
      carIdx++;
    }
    while (barrierIdx < BARRIER_POOL) {
      barrierRef.current.setMatrixAt(barrierIdx, HIDDEN);
      barrierIdx++;
    }

    // ── Mark dirty so Three.js uploads to GPU ──────────────────
    carBodyRef.current.instanceMatrix.needsUpdate  = true;
    carCabinRef.current.instanceMatrix.needsUpdate = true;
    barrierRef.current.instanceMatrix.needsUpdate  = true;

    if (carBodyRef.current.instanceColor)  carBodyRef.current.instanceColor.needsUpdate  = true;
    if (carCabinRef.current.instanceColor) carCabinRef.current.instanceColor.needsUpdate = true;
    if (barrierRef.current.instanceColor)  barrierRef.current.instanceColor.needsUpdate  = true;
  });

  return (
    <>
      {/* ── Car bodies ── */}
      <instancedMesh ref={carBodyRef} args={[null, null, CAR_POOL]} castShadow>
        <boxGeometry args={[1.05, 0.6, 2.1]} />
        <meshStandardMaterial
          metalness={0.6} roughness={0.2}
          emissiveIntensity={4} toneMapped={false}
          /* emissive color is per-instance via instanceColor */
        />
      </instancedMesh>

      {/* ── Car cabins ── */}
      <instancedMesh ref={carCabinRef} args={[null, null, CAR_POOL]} castShadow>
        <boxGeometry args={[1.05, 0.5, 1.05]} />
        <meshStandardMaterial
          metalness={0.7} roughness={0.15}
          emissiveIntensity={5} toneMapped={false}
        />
      </instancedMesh>

      {/* ── Barriers ── */}
      <instancedMesh ref={barrierRef} args={[null, null, BARRIER_POOL]} castShadow>
        <boxGeometry args={[2.8, 0.75, 0.38]} />
        <meshStandardMaterial
          metalness={0.4} roughness={0.3}
          emissiveIntensity={5} toneMapped={false}
        />
      </instancedMesh>
    </>
  );
});
