/**
 * EXECUTOR.JS
 * Purpose: The "CPU" of the GEM-VP Engine.
 * Translates Card Actions into 3D Reality.
 */

import { GEM_MANIFEST } from './manifest.js';

export function runCompound(sphereState) {
    console.log("EXECUTOR: Starting Compound Sequence...");

    // Iterate through the 3 hand slots
    GEM_MANIFEST.hand.forEach((card, index) => {
        if (!card) return; // Skip empty slots

        // Delay each card by 800ms so the user can follow the logic
        setTimeout(() => {
            const action = card.action;
            console.log(`EXECUTOR: Playing Card [${action}]`);

            // --- THE TRANSLATION TABLE ---
            switch(action) {
                case 'ROTATE_R':
                    sphereState.rotY += 0.5;
                    break;
                case 'ROTATE_L':
                    sphereState.rotY -= 0.5;
                    break;
                case 'ZOOM_IN':
                    GEM_MANIFEST.metadata.zoomLevel = 1.8;
                    break;
                case 'ZOOM_OUT':
                    GEM_MANIFEST.metadata.zoomLevel = 1.0;
                    break;
                case 'RESET':
                    sphereState.rotY = 0;
                    sphereState.rotX = 0;
                    GEM_MANIFEST.metadata.zoomLevel = 1.0;
                    break;
                default:
                    console.warn(`EXECUTOR: Unknown Command [${action}]`);
            }

            // Clear the slot after it has been executed
            GEM_MANIFEST.hand[index] = null;

            // Refresh the HUD and Hand visuals
            if (window.renderHand) window.renderHand();
            if (window.updateHUD) window.updateHUD();

        }, index * 800); 
    });
}