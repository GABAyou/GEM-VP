/**
 * MINTER.JS
 * Purpose: Logic Creation and Card Minting.
 * Converts NELP strings into playable GEM-VP cards.
 */

import { GEM_MANIFEST } from './manifest.js';

// 1. SETUP THE TRIGGER
// We wait for the DOM to load to ensure the button exists
document.addEventListener('DOMContentLoaded', () => {
    const mintBtn = document.getElementById('btn-mint-trigger');
    if (mintBtn) {
        mintBtn.addEventListener('click', window.mintCard);
    }
});

// 2. THE MINTING LOGIC
window.mintCard = function() {
    const input = document.getElementById('mint-input');
    if (!input) return;

    const actionText = input.value.trim().toUpperCase();
    
    // Prevent empty cards
    if (!actionText) {
        alert("FORGE ERROR: Please enter a logic command.");
        return;
    }

    // Create the Card Object
    const newCard = {
        id: "card-" + Date.now(),
        action: actionText,
        label: actionText.replace(/_/g, ' ') // Makes "ROTATE_R" readable as "ROTATE R"
    };

    // Push to the Global Manifest Deck
    GEM_MANIFEST.deck.push(newCard);

    // Provide immediate feedback for your TBI/Low-Vision
    console.log("MINT SUCCESS:", newCard);
    alert(`FORGE: Card [${newCard.label}] successfully minted to DECK.`);

    // Clear the input for the next command
    input.value = '';
    
    // If the user is on the Deck tab, refresh it automatically
    if (window.renderDeck) window.renderDeck();
};