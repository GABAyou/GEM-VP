/**
 * INPUT.JS
 * Purpose: Handle Mouse and Touch interaction.
 * Bridges the physical world to the Spherical Manifest.
 */

export function setupInteraction(canvas, onRotate, onClick) {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Mouse/Touch Start
  const start = (x, y) => {
    isDragging = true;
    lastX = x;
    lastY = y;
  };

  // Mouse/Touch Move
  const move = (x, y) => {
    if (!isDragging) return;
    const dx = x - lastX;
    const dy = y - lastY;
    onRotate(dx * 0.01, dy * 0.01); // Pass rotation speed to main
    lastX = x;
    lastY = y;
  };

  // Mouse/Touch End
  const end = () => {
    isDragging = false;
  };

  // Event Listeners
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
  }, { passive: false });
  
  window.addEventListener('touchend', end);
  
  // Handle Clicks/Taps for piece placement
  canvas.addEventListener('click', (e) => {
    if (Math.abs(lastX - e.clientX) < 5) { // Only click if not dragging
      onClick(e.clientX, e.clientY);
    }
  });
}