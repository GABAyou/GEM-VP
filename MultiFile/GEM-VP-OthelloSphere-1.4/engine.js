/**
 * ENGINE.JS
 * Purpose: Geodesic Math and Triangle Generation.
 * This builds the 320-cell "Othello Planet" stage.
 */

export function generateGeodesicGrid(frequency) {
    const triangles = [];
    const t = (1 + Math.sqrt(5)) / 2; // Golden Ratio

    // 1. Define the 12 Base Vertices of an Icosahedron
    const vertices = [
        {x: -1, y:  t, z:  0}, {x:  1, y:  t, z:  0}, {x: -1, y: -t, z:  0}, {x:  1, y: -t, z:  0},
        {x:  0, y: -1, z:  t}, {x:  0, y:  1, z:  t}, {x:  0, y: -1, z: -t}, {x:  0, y:  1, z: -t},
        {x:  t, y:  0, z: -1}, {x:  t, y:  0, z:  1}, {x: -t, y:  0, z: -1}, {x: -t, y:  0, z:  1}
    ].map(v => {
        const mag = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        return { x: v.x/mag, y: v.y/mag, z: v.z/mag };
    });

    // 2. Base Faces
    const faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // 3. Subdivide into 320 Triangles (Frequency 4)
    // 3. Subdivide into 320 Triangles (Frequency 4)
    let triangleId = 0;
    faces.forEach(face => {
        const v1 = vertices[face[0]], v2 = vertices[face[1]], v3 = vertices[face[2]];
        
        for (let i = 0; i < frequency; i++) {
            for (let j = 0; j < frequency - i; j++) {
                // Upward Triangles
                const tri1 = createTriangle(v1, v2, v3, i, j, frequency, triangleId++);
                if (tri1.center.y > 0.95) tri1.isNorth = true;
                if (tri1.center.y < -0.95) tri1.isSouth = true;
                triangles.push(tri1);

                // Downward Triangles (The missing ones!)
                if (i + j < frequency - 1) {
                    const tri2 = createInverseTriangle(v1, v2, v3, i, j, frequency, triangleId++);
                    if (tri2.center.y > 0.95) tri2.isNorth = true;
                    if (tri2.center.y < -0.95) tri2.isSouth = true;
                    triangles.push(tri2);
                }
            }
        }
    });

    return triangles;
}

// NEW: Helper for the "Downward" pointing triangles
function createInverseTriangle(v1, v2, v3, i, j, freq, id) {
    const getPt = (a, b, c) => {
        const x = (v1.x*a + v2.x*b + v3.x*c)/freq;
        const y = (v1.y*a + v2.y*b + v3.y*c)/freq;
        const z = (v1.z*a + v2.z*b + v3.z*c)/freq;
        const mag = Math.sqrt(x*x + y*y + z*z);
        return { x: x/mag, y: y/mag, z: z/mag };
    };

    const p1 = getPt(freq-i-j-1, i+1, j);
    const p2 = getPt(freq-i-j-1, i, j+1);
    const p3 = getPt(freq-i-j-2, i+1, j+1); // The "Inverse" tip

    return {
        id: id,
        points: [p1, p2, p3],
        center: {
            x: (p1.x + p2.x + p3.x)/3,
            y: (p1.y + p2.y + p3.y)/3,
            z: (p1.z + p2.z + p3.z)/3
        },
        isNorth: false,
        isSouth: false
    };
}

function createTriangle(v1, v2, v3, i, j, freq, id) {
    const getPt = (a, b, c) => {
        const x = (v1.x*a + v2.x*b + v3.x*c)/freq;
        const y = (v1.y*a + v2.y*b + v3.y*c)/freq;
        const z = (v1.z*a + v2.z*b + v3.z*c)/freq;
        const mag = Math.sqrt(x*x + y*y + z*z);
        return { x: x/mag, y: y/mag, z: z/mag };
    };

    const p1 = getPt(freq-i-j, i, j);
    const p2 = getPt(freq-i-j-1, i+1, j);
    const p3 = getPt(freq-i-j-1, i, j+1);

    return {
        id: id,
        points: [p1, p2, p3],
        center: {
            x: (p1.x + p2.x + p3.x)/3,
            y: (p1.y + p2.y + p3.y)/3,
            z: (p1.z + p2.z + p3.z)/3
        },
        isNorth: false,
        isSouth: false
    };
}