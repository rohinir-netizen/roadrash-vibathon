/**
 * obstacleSpawner.js
 * Factory for creating randomised obstacle objects.
 *
 * The road has 3 lanes centred at x = -2, 0, +2.
 * Obstacles spawn at z = -40 (far ahead) and move toward the camera (positive z).
 */

let nextId = 0;

// Possible lane X positions
const LANES = [-2, 0, 2];

// Possible obstacle types
const TYPES = ['car', 'car', 'car', 'barrier']; // cars are more common

/**
 * Returns a fresh obstacle descriptor.
 * @returns {{ id: number, x: number, z: number, type: string }}
 */
export function spawnObstacle() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];

    return {
        id: nextId++,
        x: lane,
        z: -40,
        type,
    };
}

/** Reset the id counter (used when restarting the game). */
export function resetSpawner() {
    nextId = 0;
}
