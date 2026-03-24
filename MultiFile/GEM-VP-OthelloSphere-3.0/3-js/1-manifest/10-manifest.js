/** refact in progress
 * MANIFEST.JS - v1.8 Beta
 * Purpose: Central Game State & Metadata
 */

export const GEM_MANIFEST = {
    metadata: {
        title: "GEM-VP-OthelloSphere-1.8",
        activePlayer: 1,
        activeMode: 'VERTEX', // Defaulting to the new Great Circle mode
        frequency: 4,
        zoomLevel: 1.0,
        isAutoRotating: true,
        player1CP: 0, // NEW: Compute Points for White
        player2CP: 0, // NEW: Compute Points for Magenta
        poleColorNorth: "#ff3333",
        poleColorSouth: "#3333ff"
    },
    theme: {
        background: "#000000",
        gridLines: "#33ff33",
        player1: "#ffffff", // White
        player2: "#ff00ff", // Magenta
        ghost: "rgba(51, 255, 51, 0.4)"
    },
    deck: [],
    faceBoard: [],   // Stores ownership of the 320 triangles
    vertexBoard: [], // Stores ownership of the 162 vertices
    hand: new Array(7).fill(null)
};