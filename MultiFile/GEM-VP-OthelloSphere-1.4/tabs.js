/**
 * TABS.JS
 * Purpose: Navigation and Card-to-Hand Loading.
 * Manages the "Switching" of the three main views.
 */

import { GEM_MANIFEST } from './manifest.js';

// 1. TAB SWITCHING LOGIC
window.showTab = function(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.style.display = 'none');

    // Show the active one
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.style.display = (tabName === 'deck' || tabName === 'forge') ? 'flex' : 'block';
    }

    // If we switch to Deck, we need to refresh the view
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
        
        // When clicked, try to put it in an empty hand slot
        cardEl.onclick = () => window.loadToHand(card);
        grid.appendChild(cardEl);
    });
};

// 3. LOAD TO HAND (From Deck to Play Slots)
window.loadToHand = function(card) {
    const emptySlotIdx = GEM_MANIFEST.hand.findIndex(s => s === null);
    
    if (emptySlotIdx === -1) {
        alert("HAND FULL: Run the compound or reset.");
        return;
    }
    
    // Assign the card to the manifest hand
    GEM_MANIFEST.hand[emptySlotIdx] = card;
    window.renderHand(); 
    alert(`LOADED: ${card.label} into Slot ${emptySlotIdx + 1}`);
};

// 4. RENDER HAND (Visualizing the 3 Dashed Boxes)
window.renderHand = function() {
    GEM_MANIFEST.hand.forEach((card, idx) => {
        const slot = document.getElementById(`slot-${idx}`);
        if (!slot) return;
        
        if (card) {
            slot.innerHTML = `<div class="active-card-content">${card.label}</div>`;
        } else {
            slot.innerHTML = ''; // Keep it empty/dashed
        }
    });
};

// Initialize the first view
window.showTab('play');