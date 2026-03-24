/**
 * TABS.JS
 * Purpose: Navigation and Card-to-Hand Loading.
 * Manages the "Switching" of the three main views.
 */

import { GEM_MANIFEST } from '/3-js/1-manifest/10-manifest.js';

// 1. TAB SWITCHING LOGIC
window.showTab = function(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.style.display = 'none');

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        // Use flex for forge/deck to keep inputs centered, block for play
        activeTab.style.display = (tabName === 'play') ? 'flex' : 'flex';
    }
    if (tabName === 'deck') window.renderDeck();
};

// 2. RENDER DECK (From Manifest to Grid)
window.renderDeck = function() {
    const grid = document.getElementById('deck-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    GEM_MANIFEST.deck.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'deck-card';
        cardEl.innerText = card.label;
        cardEl.onclick = () => window.loadToHand(card);
        grid.appendChild(cardEl);
    });
};

// 3. LOAD TO HAND (From Deck to Play Slots)
window.loadToHand = function(card) {
    // Now looks for the first null in an array of 7
    const emptySlotIdx = GEM_MANIFEST.hand.findIndex(s => s === null);
    
    if (emptySlotIdx === -1) {
        alert("COMMAND BUFFER FULL: Run the sequence or Reset.");
        return;
    }
    
    GEM_MANIFEST.hand[emptySlotIdx] = card;
    window.renderHand(); 
};

// 4. RENDER HAND (Visualizing the 3 Dashed Boxes)
window.renderHand = function() {
    // Dynamically updates all 7 slots based on the Manifest
    GEM_MANIFEST.hand.forEach((card, idx) => {
        const slot = document.getElementById(`slot-${idx}`);
        if (!slot) return;
        
        if (card) {
            slot.innerHTML = `<div class="active-card-content">${card.label}</div>`;
            slot.style.borderColor = 'var(--white)'; // Highlight occupied slots
        } else {
            slot.innerHTML = ''; 
            slot.style.borderColor = 'var(--neon)'; // Dim empty slots
        }
    });
};

// Initialize the first view
window.showTab('play');