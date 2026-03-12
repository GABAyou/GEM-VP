/**
 * MANIFEST.JS
 * Purpose: The "Source of Truth" for the Game State.
 * This is the only file the AI needs to read to "know" the board.
 */

export const GEM_MANIFEST = {
  metadata: {
    project: "GEM-VP Othello",
    geometry: "Icosahedral-Geodesic",
    frequency: 4,
    totalCells: 320,
    activePlayer: 1, // 1 = Black, 2 = White
  },
  // 0 = Empty, 1 = Black, 2 = White
  // We initialize an array of 320 zeros.
  boardState: Array(320).fill(0),
  
  // High-Contrast Theme Settings
  theme: {
    background: '#000000',
    gridLines: '#33ff33', // Neon Green for visibility
    player1: '#ffffff',   // White
    player2: '#ff00ff',   // Magenta (Better than black for TBI/Low-Vision)
  }
};