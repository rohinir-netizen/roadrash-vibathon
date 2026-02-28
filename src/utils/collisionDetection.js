/**
 * collisionDetection.js
 * AABB (Axis-Aligned Bounding Box) collision between the player bike and an obstacle.
 *
 * Coordinate system:
 *   • Bike is always at visual Z = 0 (world scrolls past it).
 *   • Obstacle has an (x, z) world position; collision window is when z is near 0.
 */

const BIKE_HALF = { x: 0.45, z: 1.0 };

const OBSTACLE_HALF = {
    car: { x: 0.58, z: 1.1 },
    barrier: { x: 1.25, z: 0.3 },
};

/**
 * @param {number} bikeX      – bike's X position in world space
 * @param {{ x: number, z: number }} obs – obstacle descriptor
 * @param {string} type       – 'car' | 'barrier'
 * @returns {boolean}
 */
export function checkCollision(bikeX, obs, type = 'car') {
    const oh = OBSTACLE_HALF[type] ?? OBSTACLE_HALF.car;
    const overlapX = Math.abs(bikeX - obs.x) < BIKE_HALF.x + oh.x;
    const overlapZ = Math.abs(obs.z) < BIKE_HALF.z + oh.z; // bike at z=0
    return overlapX && overlapZ;
}
