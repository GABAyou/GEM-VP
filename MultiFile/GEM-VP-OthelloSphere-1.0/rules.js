/**
 * RULES.JS
 * Purpose: Othello Flip Logic & Great Circle Traversal.
 */

import { GEM_MANIFEST } from './manifest.js';

export function checkFlips(placedPointId, points) {
  const origin = points.find(p => p.id === placedPointId);
  const activeColor = GEM_MANIFEST.boardState[placedPointId];
  const opponentColor = activeColor === 1 ? 2 : 1;

  // 1. Define "Directions"
  // On a sphere, we look for neighbors within a certain 3D distance
  const searchRadius = 0.3; // Synergetic proximity
  const neighbors = points.filter(p => {
    const dist = Math.sqrt((p.x - origin.x)**2 + (p.y - origin.y)**2 + (p.z - origin.z)**2);
    return dist > 0 && dist < searchRadius;
  });

  neighbors.forEach(neighbor => {
    if (GEM_MANIFEST.boardState[neighbor.id] === opponentColor) {
      // 2. Potential Sandwich Found! 
      // Trace the vector from origin through neighbor to find the "Backstop"
      const vx = neighbor.x - origin.x;
      const vy = neighbor.y - origin.y;
      const vz = neighbor.z - origin.z;

      // Check further along this same vector
      for (let step = 2; step < 5; step++) {
        const tx = origin.x + vx * step;
        const ty = origin.y + vy * step;
        const tz = origin.z + vz * step;

        const nextPoint = points.find(p => {
          const d = Math.sqrt((p.x - tx)**2 + (p.y - ty)**2 + (p.z - tz)**2);
          return d < 0.15;
        });

        if (!nextPoint || GEM_MANIFEST.boardState[nextPoint.id] === 0) break;
        
        if (GEM_MANIFEST.boardState[nextPoint.id] === activeColor) {
          // 3. SUCCESS: Flip the stones in between
          for (let f = 1; f < step; f++) {
            const flipX = origin.x + vx * f;
            const flipY = origin.y + vy * f;
            const flipZ = origin.z + vz * f;
            const flipPoint = points.find(p => {
               const d = Math.sqrt((p.x - flipX)**2 + (p.y - flipY)**2 + (p.z - flipZ)**2);
               return d < 0.15;
            });
            if (flipPoint) GEM_MANIFEST.boardState[flipPoint.id] = activeColor;
          }
          break;
        }
      }
    }
  });
}