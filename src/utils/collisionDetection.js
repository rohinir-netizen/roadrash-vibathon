/**
 * collisionDetection.js
 * Axis-Aligned Bounding Box (AABB) collision check.
 *
 * Both the bike and obstacles are treated as boxes defined by their
 * center position and half-extents.
 */

// Half-extents for the player bike
const BIKE_HALF = { x: 0.4, z: 0.8 };

// Half-extents for each obstacle type
const OBSTACLE_HALF = {
    car: { x: 0.55, z: 1.0 },
    barrier: { x: 1.2, z: 0.25 },
};

/**
 * @param {{ x: number, z: number }} bikePos  – bike world position
 * @param {{ x: number, z: number }} obs       – obstacle world position
 * @param {string} obsType                     – 'car' | 'barrier'
 * @returns {boolean}
 */
export function checkCollision(bikePos, obs, obsType = 'car') {
    const oh = OBSTACLE_HALF[obsType] ?? OBSTACLE_HALF.car;

    const overlapX = Math.abs(bikePos.x - obs.x) < BIKE_HALF.x + oh.x;
    const overlapZ = Math.abs(bikePos.z - obs.z) < BIKE_HALF.z + oh.z;

    return overlapX && overlapZ;
}
