/**
 * MANIFEST.JS
 * Purpose: The "Source of Truth" for the Game State.
 * This is the shared memory for all 11 files.
 */

export const GEM_MANIFEST = {
  metadata: {
    project: "GEM-VP Othello 1.3",
    frequency: 4,
    totalCells: 320,
    activePlayer: 1, // 1 = White, 2 = Magenta
    isAutoRotating: true,
    zoomLevel: 1.0,
    poleColorNorth: '#00ffff', // Cyan
    poleColorSouth: '#ffaa00'  // Orange
  },

  // 0 = Empty, 1 = White, 2 = Magenta
  boardState: new Array(320).fill(0),

  // THE CARD SYSTEM (The "Uber" Logic)
  deck: [],                // Your inventory of minted cards
  hand: [null, null, null, null, null, null, null], // Expanded to 7 slots

  // High-Contrast Theme (Optimized for your eyes)
  theme: {
    background: '#000000',
    gridLines: '#33ff33', // Neon Green
    player1: '#ffffff',   // White
    player2: '#ff00ff',   // Magenta
    ghost: '#ffff00'      // Yellow Snap
  }
};