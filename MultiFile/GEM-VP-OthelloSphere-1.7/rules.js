/**
 * RULES.JS - v1.6 Beta
 * Purpose: Logic for Vertex (Great Circle) and Face (Classic) Captures.
 */

// --- VERTEX MODE: GREAT CIRCLE FLIPS ---
export function checkVertexFlips(startId, player, vertices, board) {
    const opponent = player === 1 ? 2 : 1;
    let totalToFlip = [];

    const startV = vertices[startId];
    if (!startV || !startV.neighbors) return [];

    startV.neighbors.forEach(neighborId => {
        let path = [];
        let curr = neighborId;
        let prev = startId;

        // Trace the line through opponent pieces
        while (curr !== undefined && board[curr] === opponent) {
            path.push(curr);
            let next = findNextInLine(prev, curr, vertices);
            prev = curr;
            curr = next;
        }

        // If the path ends in a player piece, it's a capture!
        if (curr !== undefined && board[curr] === player) {
            totalToFlip = totalToFlip.concat(path);
        }
    });
    return totalToFlip;
}

// Logic to keep the flip moving in a "Straight Line"
function findNextInLine(prevId, currId, vertices) {
    const vPrev = vertices[prevId];
    const vCurr = vertices[currId];
    const dirX = vCurr.x - vPrev.x;
    const dirY = vCurr.y - vPrev.y;
    const dirZ = vCurr.z - vPrev.z;

    let bestNext = undefined;
    let maxDot = 0.8; // Tolerance for "Straightness"

    vertices[currId].neighbors.forEach(nId => {
        if (nId === prevId) return;
        const vNext = vertices[nId];
        const nX = vNext.x - vCurr.x;
        const nY = vNext.y - vCurr.y;
        const nZ = vNext.z - vCurr.z;
        
        // Dot product normalized to find the most linear path
        const dot = (dirX * nX + dirY * nY + dirZ * nZ) / 
                    (Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ) * Math.sqrt(nX*nX + nY*nY + nZ*nZ));
        
        if (dot > maxDot) {
            maxDot = dot;
            bestNext = nId;
        }
    });
    return bestNext;
}

// --- FACE MODE: Placeholder for standard Othello rules ---
export function checkFaceFlips(startId, player, triangles, board) {
    // For now, this returns empty to prevent crashes in 1.6 Beta
    return [];
}