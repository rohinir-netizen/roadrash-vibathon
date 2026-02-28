/**
 * speedController.js
 * Pure utility functions for speed calculation.
 */

const BASE_SPEED = 15;   // starting speed (world units / second)
const MAX_SPEED = 30;   // hard cap before nitro
const RAMP_RATE = 0.9;  // units/s gained per second of play

/**
 * Get the current base speed based on how long the game has been running.
 * @param {number} elapsed – seconds since game start
 * @returns {number} speed in world units per second
 */
export function getBaseSpeed(elapsed) {
    return Math.min(BASE_SPEED + elapsed * RAMP_RATE, MAX_SPEED);
}

/**
 * Convert internal world-speed to a "km/h" display value.
 * (Purely cosmetic — scale factor chosen to feel realistic.)
 * @param {number} speed – world units / second
 * @returns {number} km/h display value
 */
export function getDisplayKmh(speed) {
    return Math.round(speed * 12);
}
