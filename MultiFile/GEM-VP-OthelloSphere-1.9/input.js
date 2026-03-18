/**
 * INPUT.JS - v1.6 Beta
 * Purpose: Handle Mouse/Touch with Zoom Debouncing. check
 */

let isZooming = false; 

export function setupInteraction(canvas, onRotate, onClick) {
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let dragThreshold = 5, totalMove = 0;

    const start = (x, y) => {
        isDragging = true;
        lastX = x; lastY = y;
        totalMove = 0;
    };

    const move = (x, y) => {
        if (!isDragging) return;
        const dx = x - lastX, dy = y - lastY;
        totalMove += Math.abs(dx) + Math.abs(dy);
        onRotate(dx * 0.005, dy * 0.005);
        lastX = x; lastY = y;
    };

    const end = () => { isDragging = false; isZooming = false; };

    // Events
    canvas.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);

    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        start(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        move(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', end);

    // --- UI BUTTONS ---
    const btnZoom = document.getElementById('btnZoom');
    const btnRotate = document.getElementById('btnRotate');
    const btnReset = document.getElementById('btnReset');

    if (btnZoom) {
        btnZoom.onmousedown = (e) => {
            e.preventDefault();
            if (!isZooming) {
                onClick('ZOOM');
                isZooming = true;
            }
        };
    }

    if (btnRotate) {
        btnRotate.onclick = (e) => {
            e.preventDefault();
            onClick('ROTATE_TOGGLE');
        };
    }

    if (btnReset) {
        btnReset.onclick = (e) => {
            e.preventDefault();
            onClick('RESET');
        };
    }

    canvas.addEventListener('click', (e) => {
        if (totalMove < dragThreshold) {
            onClick('CANVAS_CLICK', e.clientX, e.clientY);
        }
    });
}