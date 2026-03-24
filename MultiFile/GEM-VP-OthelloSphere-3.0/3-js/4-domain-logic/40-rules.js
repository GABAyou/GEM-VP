/** refact
 * RULES.JS - v1.8 Beta
 * Purpose: Logic for Vertex Flips and Territory Painting.
 */

// --- VERTEX MODE: GREAT CIRCLE FLIPS ---
export function checkVertexFlips(startId, player, vertices, vBoard) {
    const opponent = player === 1 ? 2 : 1;
    let totalToFlip = [];
    const startV = vertices[startId];
    if (!startV || !startV.neighbors) return [];

    startV.neighbors.forEach(neighborId => {
        let path = [];
        let curr = neighborId;
        let prev = startId;
        while (curr !== undefined && vBoard[curr] === opponent) {
            path.push(curr);
            let next = findNextInLine(prev, curr, vertices);
            prev = curr;
            curr = next;
        }
        if (curr !== undefined && vBoard[curr] === player) {
            totalToFlip = totalToFlip.concat(path);
        }
    });
    return totalToFlip;
}

function findNextInLine(prevId, currId, vertices) {
    const vPrev = vertices[prevId];
    const vCurr = vertices[currId];
    const dir = { x: vCurr.x - vPrev.x, y: vCurr.y - vPrev.y, z: vCurr.z - vPrev.z };
    let bestNext = undefined;
    let maxDot = 0.8;
    vertices[currId].neighbors.forEach(nId => {
        if (nId === prevId) return;
        const vNext = vertices[nId];
        const nDir = { x: vNext.x - vCurr.x, y: vNext.y - vCurr.y, z: vNext.z - vCurr.z };
        const dot = (dir.x * nDir.x + dir.y * nDir.y + dir.z * nDir.z) / 
                    (Math.sqrt(dir.x**2 + dir.y**2 + dir.z**2) * Math.sqrt(nDir.x**2 + nDir.y**2 + nDir.z**2));
        if (dot > maxDot) { maxDot = dot; bestNext = nId; }
    });
    return bestNext;
}

export function updateTerritory(triangles, vBoard, fBoard) {
    if (!fBoard || !vBoard) return;

    // THE FIX: Define these variables BEFORE the loop starts
    let p1New = 0;
    let p2New = 0;

    triangles.forEach(tri => {
        const ids = tri.vertexIds;
        
        if (!ids || ids.length < 3 || ids.some(id => id === undefined)) return;

        const o1 = vBoard[ids[0]];
        const o2 = vBoard[ids[1]];
        const o3 = vBoard[ids[2]];

        if (o1 !== 0 && o1 === o2 && o1 === o3) {
            // Only count it as "New" if it wasn't already owned
            if (fBoard[tri.id] !== o1) {
                fBoard[tri.id] = o1;
                if (o1 === 1) p1New++; else p2New++;
            }
        } else {
            fBoard[tri.id] = 0;
        }
    });

    // Now these variables exist and won't cause a crash
    if (p1New > 0) window.gameLog(`WHITE captured ${p1New} triangles!`, "system");
    if (p2New > 0) window.gameLog(`MAGENTA captured ${p2New} triangles!`, "system");


// Return the counts so the main engine can award points
    return { p1: p1New, p2: p2New };
}