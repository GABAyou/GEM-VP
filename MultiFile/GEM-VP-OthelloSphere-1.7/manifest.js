/**
 * MANIFEST.JS
 * Purpose: The "Source of Truth" for the Game State.
 * This is the shared memory for all 11 files.
 */

/**
 * MANIFEST.JS - v1.6 Beta
 * Purpose: Memory for Dual-Mode Play (Faces vs. Vertices)
 */

export const GEM_MANIFEST = {
  metadata: {
    project: "GEM-VP OthelloSphere 1.6 Beta",
    frequency: 4,
    // MODES: 'FACE' (Othello) or 'VERTEX' (Great Circles)
    activeMode: 'VERTEX', 
    activePlayer: 1, 
    isAutoRotating: true,
    zoomLevel: 1.0,
    poleColorNorth: '#00ffff',
    poleColorSouth: '#ffaa00'
  },

  // BOARD 1: The 320 Triangles (Face Mode)
  faceBoard: new Array(320).fill(0),

  // BOARD 2: The ~162 Intersections (Vertex Mode)
  // This will be populated dynamically once the engine runs
  vertexBoard: [], 

  deck: [],                
  hand: [null, null, null, null, null, null, null],

  theme: {
    background: '#000000',
    gridLines: '#33ff33', 
    player1: '#ffffff',   
    player2: '#ff00ff',   
    ghost: '#ffff00'      
  }
};