/** refact
 * INPUT.JS - v1.9 Beta
 * Purpose: Handle User Interaction (Mouse, Touch, and UI Buttons).
 */

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

    const end = () => { isDragging = false; };

    // Canvas Events
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

    // UI BUTTON LISTENERS
    document.getElementById('btnZoomIn')?.addEventListener('click', () => onClick('ZOOM_IN'));
    document.getElementById('btnZoomOut')?.addEventListener('click', () => onClick('ZOOM_OUT'));
    document.getElementById('btnRotate')?.addEventListener('click', () => onClick('ROTATE_TOGGLE'));
    document.getElementById('btnReset')?.addEventListener('click', () => onClick('RESET'));

    canvas.addEventListener('click', (e) => {
        if (totalMove < dragThreshold) {
            onClick('CANVAS_CLICK', e.clientX, e.clientY);
        }
    });
}