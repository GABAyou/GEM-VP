/** refct in porgrerss
 * ENGINE.JS - v1.6 Beta
 * Purpose: Stable Geodesic Dual-Mode Generation with Adjacency Mapping. check
 */

export function generateGeodesicDual(frequency) {
    let triangles = [];
    const vertexMap = new Map();
    const uniqueVertices = [];

    // 1. BASE ICOSAHEDRON
    const t = (1 + Math.sqrt(5)) / 2;
    const basePts = [
        {x:-1, y: t, z: 0}, {x: 1, y: t, z: 0}, {x:-1, y:-t, z: 0}, {x: 1, y:-t, z: 0},
        {x: 0, y:-1, z: t}, {x: 0, y: 1, z: t}, {x: 0, y:-1, z:-t}, {x: 0, y: 1, z:-t},
        {x: t, y: 0, z:-1}, {x: t, y: 0, z: 1}, {x:-t, y: 0, z:-1}, {x:-t, y: 0, z: 1}
    ].map(p => {
        const mag = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
        return {x: p.x/mag, y: p.y/mag, z: p.z/mag};
    });

    const baseFaces = [
        [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
        [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];

    // 2. SUBDIVISION & VERTEX EXTRACTION
    baseFaces.forEach(face => {
        const v1 = basePts[face[0]], v2 = basePts[face[1]], v3 = basePts[face[2]];
        for (let i = 0; i < frequency; i++) {
            for (let j = 0; j < frequency - i; j++) {
                const k = frequency - i - j;
                const tri = { points: [
                    getPoint(v1, v2, v3, i, j, k, frequency),
                    getPoint(v1, v2, v3, i+1, j, k-1, frequency),
                    getPoint(v1, v2, v3, i, j+1, k-1, frequency)
                ]};
                
                tri.center = {
                    x: (tri.points[0].x + tri.points[1].x + tri.points[2].x) / 3,
                    y: (tri.points[0].y + tri.points[1].y + tri.points[2].y) / 3,
                    z: (tri.points[0].z + tri.points[1].z + tri.points[2].z) / 3
                };
                tri.id = triangles.length;

                // Map points to Unique IDs and track neighbors
                // Map points to Unique IDs with a broader "Snap"
                tri.vertexIds = tri.points.map(pt => {
    // Snap to 2 decimal places for better "Hub" merging
    const key = `${pt.x.toFixed(2)},${pt.y.toFixed(2)},${pt.z.toFixed(2)}`;
    
    if (!vertexMap.has(key)) {
        const id = uniqueVertices.length;
        vertexMap.set(key, id);
        uniqueVertices.push({ id, x: pt.x, y: pt.y, z: pt.z, neighbors: new Set() });
    }
    return vertexMap.get(key); 
});

// ADD THIS SAFETY LINE RIGHT AFTER THE MAP:
if (tri.vertexIds.includes(undefined)) {
    console.error(`ENGINE FATAL: Vertex mapping failed for triangle ${tri.id}`);
};

                // Establish connectivity (The "Highway" Map)
                const [va, vb, vc] = tri.vertexIds;
                uniqueVertices[va].neighbors.add(vb).add(vc);
                uniqueVertices[vb].neighbors.add(va).add(vc);
                uniqueVertices[vc].neighbors.add(va).add(vb);

                triangles.push(tri);
            }
        }
    });

    // CRITICAL: Finalize neighbors by converting Set to Array
    const finalizedVertices = uniqueVertices.map(v => ({
        ...v,
        neighbors: Array.from(v.neighbors),
        isNorth: v.y > 0.95,
        isSouth: v.y < -0.95
    }));

    return { triangles, vertices: finalizedVertices };
}

function getPoint(v1, v2, v3, i, j, k, f) {
    const x = (v1.x * i + v2.x * j + v3.x * k) / f;
    const y = (v1.y * i + v2.y * j + v3.y * k) / f;
    const z = (v1.z * i + v2.z * j + v3.z * k) / f;
    const mag = Math.sqrt(x*x + y*y + z*z);
    return { x: x/mag, y: y/mag, z: z/mag };
}