/**
 * MINTER.JS
 * Purpose: Logic Creation and Card Minting.
 * Converts NELP strings into playable GEM-VP cards.
 */

import { GEM_MANIFEST } from '/3-js/1-manifest/10-manifest.js';

// 1. SETUP THE TRIGGER
// We wait for the DOM to load to ensure the button exists
document.addEventListener('DOMContentLoaded', () => {
    const mintBtn = document.getElementById('btn-mint-trigger');
    if (mintBtn) {
        mintBtn.addEventListener('click', window.mintCard);
    }
});

// 2. THE MINTING LOGIC
// --- Updated 2.0 MINTING LOGIC ---
window.mintCard = function() {
    const input = document.getElementById('mint-input');
    if (!input) return;

    const actionText = input.value.trim().toUpperCase().replace(/\s+/g, '_');
    
    if (!actionText) {
        alert("FORGE ERROR: Please enter a logic command.");
        return;
    }

    const newCard = {
        id: "card-" + Date.now(),
        action: actionText,
        label: actionText.replace(/_/g, ' ')
    };

    // 1. SAVE TO PERMANENT DECK
    GEM_MANIFEST.deck.push(newCard);

    // 2. NEW: LOAD DIRECTLY TO PLAY SLOTS
    const slots = document.querySelectorAll('.logic-slot');
    let filled = false;

    for (let slot of slots) {
        if (slot.innerHTML === "") { // Find first empty slot
            const cardDiv = document.createElement('div');
            cardDiv.className = 'gem-card active-card';
            cardDiv.innerText = newCard.label;
            cardDiv.dataset.action = newCard.action; // Store for Executor
            
            // High-Contrast styling for v2.0
            cardDiv.style.border = "2px solid #33ff33";
            cardDiv.style.color = "#33ff33";
            cardDiv.style.backgroundColor = "#000";
            
            slot.appendChild(cardDiv);
            filled = true;
            break;
        }
    }

    // 3. LOW-VISION FEEDBACK
    console.log("MINT SUCCESS:", newCard);
    if (filled) {
        window.gameLog(`FORGE: [${newCard.label}] minted and LOADED to Play Slot.`, "system");
    } else {
        window.gameLog(`FORGE: [${newCard.label}] saved to DECK (Slots Full).`, "warning");
    }

    input.value = '';
    if (window.renderDeck) window.renderDeck();
};