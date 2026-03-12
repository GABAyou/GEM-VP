/**
 * ENGINE.JS - Structural Index Edition
 * Fixes the "random cloud" by sharing vertex data.
 */

export function generateGeodesicGrid(frequency = 4) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [];
  const triangles = [];

  // 1. Create 12 base vertices of Icosahedron
  const baseV = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ].map(p => {
    const l = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2);
    return {x: p[0]/l, y: p[1]/l, z: p[2]/l};
  });

  const baseTriangles = [
    [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
    [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
    [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
    [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
  ];

  let idCounter = 0;
  baseTriangles.forEach(triIndices => {
    const v1 = baseV[triIndices[0]], v2 = baseV[triIndices[1]], v3 = baseV[triIndices[2]];

    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        // Function to get a vertex at a specific sub-coordinate
        const getV = (iv, jv) => {
          let x = (v1.x * (frequency-iv-jv) + v2.x * iv + v3.x * jv) / frequency;
          let y = (v1.y * (frequency-iv-jv) + v2.y * iv + v3.y * jv) / frequency;
          let z = (v1.z * (frequency-iv-jv) + v2.z * iv + v3.z * jv) / frequency;
          let l = Math.sqrt(x*x + y*y + z*z);
          return {x: x/l, y: y/l, z: z/l};
        };

        const c1 = getV(i, j);
        const c2 = getV(i + 1, j);
        const c3 = getV(i, j + 1);

        // Center for the Othello dot
        const cx = (c1.x + c2.x + c3.x) / 3, cy = (c1.y + c2.y + c3.y) / 3, cz = (c1.z + c2.z + c3.z) / 3;
        const cl = Math.sqrt(cx*cx + cy*cy + cz*cz);

        triangles.push({
          id: idCounter++,
          center: {x: cx/cl, y: cy/cl, z: cz/cl},
          vertices: [c1, c2, c3]
        });

        // Add the upside-down triangles between the upright ones
        if (i + j < frequency - 1) {
          const c4 = getV(i + 1, j + 1);
          const cx2 = (c2.x + c3.x + c4.x) / 3, cy2 = (c2.y + c3.y + c4.y) / 3, cz2 = (c2.z + c3.z + c4.z) / 3;
          const cl2 = Math.sqrt(cx2*cx2 + cy2*cy2 + cz2*cz2);
          
          triangles.push({
            id: idCounter++,
            center: {x: cx2/cl2, y: cy2/cl2, z: cz2/cl2},
            vertices: [c2, c4, c3]
          });
        }
      }
    }
  });
  return triangles;
}