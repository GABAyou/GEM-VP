/**
 * RULES.JS
 * Purpose: Othello Flip Logic and Adjacency.
 * The "Law" of the OthelloSphere.
 */

export function checkFlips(placedId, triangles, boardState) {
    const activePlayer = boardState[placedId];
    const opponent = (activePlayer === 1) ? 2 : 1;
    
    // 1. Find Neighbors
    const neighbors = findNeighbors(placedId, triangles);

    neighbors.forEach(neighborId => {
        // If an adjacent piece is the opponent, look further in that "direction"
        if (boardState[neighborId] === opponent) {
            const path = findPath(placedId, neighborId, triangles, boardState, activePlayer);
            
            // If the path ends in our own color, flip everything in between!
            if (path.length > 0) {
                path.forEach(id => {
                    boardState[id] = activePlayer;
                });
            }
        }
    });
}

// Simple Adjacency: Triangles that share at least 2 points
function findNeighbors(id, triangles) {
    const target = triangles.find(t => t.id === id);
    if (!target) return [];

    return triangles.filter(t => {
        if (t.id === id) return false;
        // Count shared points
        const shared = t.points.filter(p1 => 
            target.points.some(p2 => p1.x === p2.x && p1.y === p2.y && p1.z === p2.z)
        );
        return shared.length >= 2; // Share an edge
    }).map(t => t.id);
}

// Recursive pathfinding to find "trapped" lines on a sphere
function findPath(startId, nextId, triangles, boardState, activePlayer) {
    // This is a simplified "Line" finder for the 1.3 Audit
    // Real spherical paths are curved, so we check immediate neighbors of neighbors
    let path = [nextId];
    let currentId = nextId;
    
    // Look "past" the neighbor in a similar direction
    // (Simplified for TBI/Low-Vision performance)
    for(let i=0; i<5; i++) { // Max search depth
        const nextNeighbors = findNeighbors(currentId, triangles);
        const opponent = (activePlayer === 1) ? 2 : 1;
        
        // Find a neighbor that isn't the one we just came from
        const furtherId = nextNeighbors.find(id => id !== startId && !path.includes(id));
        
        if (!furtherId) break;
        
        if (boardState[furtherId] === activePlayer) {
            return path; // Success! Return the captured IDs
        } else if (boardState[furtherId] === opponent) {
            path.push(furtherId);
            currentId = furtherId;
        } else {
            break; // Empty space, path is broken
        }
    }
    return []; // No capture found
}