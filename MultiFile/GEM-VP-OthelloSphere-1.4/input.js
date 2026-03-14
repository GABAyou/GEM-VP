/**
 * INPUT.JS
 * Purpose: Handle Mouse and Touch interaction.
 * Synchronized for the GEM-VP 1.3 Handshake.
 */

export function setupInteraction(canvas, onRotate, onClick) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let dragThreshold = 5; // Pixels moved before we count it as a "drag" instead of a "click"
    let totalMove = 0;

    // --- SHARED LOGIC ---
    const start = (x, y) => {
        isDragging = true;
        lastX = x;
        lastY = y;
        totalMove = 0;
    };

    const move = (x, y) => {
        if (!isDragging) return;
        const dx = x - lastX;
        const dy = y - lastY;
        
        totalMove += Math.abs(dx) + Math.abs(dy);
        
        // Pass rotation deltas back to Main.js
        onRotate(dx * 0.005, dy * 0.005);
        
        lastX = x;
        lastY = y;
    };

    const end = () => {
        isDragging = false;
    };

    // --- MOUSE EVENTS ---
    canvas.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);

    // --- TOUCH EVENTS (Mobile/Tablet Support) ---
    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        start(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        move(t.clientX, t.clientY);
        e.preventDefault(); // Stop page scrolling while playing
    }, { passive: false });

    window.addEventListener('touchend', end);

    // --- CLICK/TAP LOGIC ---
    canvas.addEventListener('click', (e) => {
        // Only trigger a "Click" if the user didn't drag the planet significantly
        if (totalMove < dragThreshold) {
            onClick(e.clientX, e.clientY);
        }
    });
}