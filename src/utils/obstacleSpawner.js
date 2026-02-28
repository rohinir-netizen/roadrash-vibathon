/**
 * obstacleSpawner.js
 * Generates randomised obstacle descriptors for the neon racing world.
 *
 * Lane X positions: -2, 0, +2
 * Obstacles spawn far ahead at z = -50 and scroll toward z = 0 (the bike).
 */

let nextId = 0;

const LANES = [-2, 0, 2];
const TYPES = ['car', 'car', 'car', 'barrier']; // cars more common

// Neon palette tags (used by Obstacle.jsx for colour selection)
const COLORS = ['red', 'orange', 'pink'];

/**
 * @returns {{ id, x, z, type, colorTag }}
 */
export function spawnObstacle() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const colorTag = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isOncoming = Math.random() < 0.4; // 40% chance for oncoming traffic

    return {
        id: nextId++,
        x: lane,
        z: -120, // Spawn further out for oncoming effect
        type,
        colorTag,
        isOncoming
    };
}

/** Call when restarting the game. */
export function resetSpawner() {
    nextId = 0;
}
