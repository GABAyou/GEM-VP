/**
 * ENGINE.JS
 * Purpose: Synergetic Geometry Engine.
 * Transforms the Manifest into 3D Space.
 */

export function generateSpherePoints(frequency) {
  const points = [];
  const phi = (1 + Math.sqrt(5)) / 2; // The Golden Ratio

  // Base Icosahedron Vertices
  const baseVertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  // For Level 1, we are creating a simplified spherical cloud
  // that matches the frequency count for the Othello pieces.
  for (let i = 0; i < 320; i++) {
    const lat = Math.acos(2 * Math.random() - 1);
    const lon = 2 * Math.PI * Math.random();
    
    points.push({
      id: i,
      x: Math.sin(lat) * Math.cos(lon),
      y: Math.sin(lat) * Math.sin(lon),
      z: Math.cos(lat)
    });
  }
  return points;
}