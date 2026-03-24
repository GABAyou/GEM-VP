/** refact[20260322]
 * EXECUTOR.JS
 * Purpose: The "CPU" of the GEM-VP Engine.
 * Translates Card Actions into 3D Reality. check
 */

/**
 * EXECUTOR.JS
 * Purpose: The "CPU" - Translates Card Actions into Reality.
 */

import { GEM_MANIFEST } from '/3-js/1-manifest/10-manifest.js';

export function runCompound(sphereState, triangles) {
    console.log("EXECUTOR: Sequence started.");

    GEM_MANIFEST.hand.forEach((card, index) => {
        if (!card) return;

        setTimeout(() => {
            const cmd = card.action.toUpperCase();
            console.log(`EXECUTOR: Slot ${index} executing [${cmd}]`);

            // --- START OF SWITCH BLOCK ---
            switch (cmd) {
                case 'ROTATE_R':
                    sphereState.rotY += 0.8;
                    break;

                case 'ROTATE_L':
                    sphereState.rotY -= 0.8;
                    break;

                case 'FLIP_POLES':
                    triangles.forEach(t => {
                        if (t.isNorth || t.isSouth) {
                            GEM_MANIFEST.boardState[t.id] = GEM_MANIFEST.metadata.activePlayer;
                        }
                    });
                    console.log("EXECUTOR: Poles Captured!");
                    break;

                case 'RESET':
                    sphereState.rotY = 0;
                    sphereState.rotX = 0;
                    GEM_MANIFEST.boardState.fill(0);
                    break;

                case 'INVERT_BOARD':
                    GEM_MANIFEST.boardState = GEM_MANIFEST.boardState.map(cell => {
                        if (cell === 1) return 2; // White to Magenta
                        if (cell === 2) return 1; // Magenta to White
                        return 0; // Keep empty cells empty
                    });
                    console.log("EXECUTOR: Board Inverted!");
                    break;

                case 'SWITCH_MODE':
                      const current = GEM_MANIFEST.metadata.activeMode;
                      GEM_MANIFEST.metadata.activeMode = (current === 'FACE') ? 'VERTEX' : 'FACE';
                      window.gameLog(`SYSTEM: Mode swapped to ${GEM_MANIFEST.metadata.activeMode}`, "system");
                      
                      // Clear the card from the slot after use
                      GEM_MANIFEST.hand[index] = null;
                      if (window.renderHand) window.renderHand();
                      if (window.updateHUD) window.updateHUD();
                      break;
                

                default:
                    console.warn(`EXECUTOR: Unknown Command [${cmd}]`);
            }
            // --- END OF SWITCH BLOCK ---

            // Clear the card from the slot after playing
            GEM_MANIFEST.hand[index] = null;
            
            // Refresh visuals
            window.renderHand();
            if (window.updateHUD) window.updateHUD();

        }, index * 600); 
    });
}

// --- executor.js ---

// --- executor.js ---
export function runShockwave(targetId, player, vertices, vBoard) {
    const vertex = vertices[targetId];
    if (!vertex) return 0;

    // Use the engine-specific neighbor property
    const neighbors = vertex.neighbors || vertex.neighborIds || [];
    
    neighbors.forEach(nId => {
        // Force the flip in the Master Manifest board
        vBoard[nId] = player;
    });

    window.gameLog(`SHOCKWAVE: Flipped ${neighbors.length} neighbors!`, "system");
    return neighbors.length;
}