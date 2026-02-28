/**
 * useNitro
 * Manages nitro boost state entirely via refs + useFrame — no React re-renders.
 *
 * nitroRef.current shape:
 *   active        {boolean}  – true while Space held AND fuel > 0
 *   fuel          {number}   – 0..1 (1 = full)
 *   cooldownTimer {number}   – seconds remaining before recharge starts
 *   multiplier    {number}   – smoothly lerped speed multiplier
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const NITRO_DRAIN_RATE = 0.35;   // fuel consumed per second when active
const NITRO_RECHARGE_RATE = 0.18;   // fuel restored per second when recharging
const COOLDOWN_DURATION = 1.8;    // seconds before recharge begins after depletion
const NITRO_MULTIPLIER = 2.5;    // top speed multiplier

function lerp(a, b, t) { return a + (b - a) * t; }

export function useNitro(keysRef) {
    const nitroRef = useRef({
        active: false,
        fuel: 1.0,
        cooldownTimer: 0,
        multiplier: 1.0,
    });

    useFrame((_, delta) => {
        const n = nitroRef.current;
        const space = keysRef.current.Space;

        const canBoost = space && n.fuel > 0 && n.cooldownTimer <= 0;
        n.active = canBoost;

        if (n.active) {
            // Drain fuel
            n.fuel = Math.max(0, n.fuel - NITRO_DRAIN_RATE * delta);
            if (n.fuel <= 0) n.cooldownTimer = COOLDOWN_DURATION;
        } else {
            // Tick cooldown
            if (n.cooldownTimer > 0) {
                n.cooldownTimer -= delta;
            } else {
                // Recharge
                n.fuel = Math.min(1, n.fuel + NITRO_RECHARGE_RATE * delta);
            }
        }

        // Smooth multiplier transition
        const target = n.active ? NITRO_MULTIPLIER : 1.0;
        n.multiplier = lerp(n.multiplier, target, Math.min(1, 6 * delta));
    });

    return nitroRef;
}
