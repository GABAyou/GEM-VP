import { GEM_MANIFEST } from './manifest.js';
import { generateGeodesicGrid } from './engine.js';
import { setupInteraction } from './input.js';
import { checkFlips } from './rules.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const triangles = generateGeodesicGrid(GEM_MANIFEST.metadata.frequency);
let rotY = 0, rotX = 0;
let hoveredId = null;

// Handle Phone/PC Zoom and Rotation Toggles
let zoomLevels = [0.6, 1.0, 1.8];
let currentZoomIdx = 1;

// Setup Interaction: Drag to rotate, Click to place
setupInteraction(canvas, 
  (dx, dy) => { 
    rotY += dx; 
    rotX += dy; 
  },
  // --- UPDATED CLICK HANDLER (Inside setupInteraction) ---
  (clickX, clickY) => {
    if (hoveredId !== null && GEM_MANIFEST.boardState[hoveredId] === 0) {
      const player = GEM_MANIFEST.metadata.activePlayer;
      GEM_MANIFEST.boardState[hoveredId] = player;
      
      // FIX: Pass the boardState explicitly to rules.js
      checkFlips(hoveredId, triangles, GEM_MANIFEST.boardState);
      
      // Turn Switch
      GEM_MANIFEST.metadata.activePlayer = (player === 1) ? 2 : 1;
      updateHUD();
    }
}
);

// GHOST PIECE: Tracks the mouse/finger position
window.addEventListener('mousemove', (e) => {
    const renderArea = Math.min(canvas.width, canvas.height) * 0.8;
    const scale = (renderArea / 2) * GEM_MANIFEST.metadata.zoomLevel;
    const centerX = canvas.width / 2, centerY = canvas.height / 2;
    let minDict = 20;
    hoveredId = null;

    triangles.forEach(t => {
        const p = t.center;
        const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        const z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        if (z2 < 0) {
            const sx = centerX + x1 * scale, sy = centerY + y2 * scale;
            const d = Math.sqrt((e.clientX - sx)**2 + (e.clientY - sy)**2);
            if (d < minDict) { minDict = d; hoveredId = t.id; }
        }
    });
});

// Z/R Keys for Zoom/Rotate (Useful for Library PC)
window.addEventListener('keydown', (e) => {
    // GUARD: If the focus is on a text input or textarea, STOP.
    const active = document.activeElement.tagName;
    if (active === 'INPUT' || active === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return; 
    }

    if (e.key.toLowerCase() === 'z') {
        currentZoomIdx = (currentZoomIdx + 1) % zoomLevels.length;
        GEM_MANIFEST.metadata.zoomLevel = zoomLevels[currentZoomIdx];
    }
    if (e.key.toLowerCase() === 'r') {
        GEM_MANIFEST.metadata.isAutoRotating = !GEM_MANIFEST.metadata.isAutoRotating;
    }
});

document.getElementById('btnReset').addEventListener('click', () => {
    GEM_MANIFEST.boardState.fill(0);
    GEM_MANIFEST.metadata.activePlayer = 1;
    updateHUD();
});

// --- UNIFIED BUTTON LOGIC (Mouse & Touch) ---
const handleZoom = (e) => {
    e.preventDefault();
    currentZoomIdx = (currentZoomIdx + 1) % zoomLevels.length;
    GEM_MANIFEST.metadata.zoomLevel = zoomLevels[currentZoomIdx];
};

const handleRotateToggle = (e) => {
    e.preventDefault();
    GEM_MANIFEST.metadata.isAutoRotating = !GEM_MANIFEST.metadata.isAutoRotating;
};

// Bind to Zoom Button
document.getElementById('btnZoom').addEventListener('click', handleZoom);
document.getElementById('btnZoom').addEventListener('touchstart', handleZoom, { passive: false });

// Bind to Rotation Button
document.getElementById('btnRotate').addEventListener('click', handleRotateToggle);
document.getElementById('btnRotate').addEventListener('touchstart', handleRotateToggle, { passive: false });

function draw() {
  ctx.fillStyle = GEM_MANIFEST.theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Define Rendering Area (Leaving room for future cards)
  const renderArea = Math.min(canvas.width, canvas.height) * 0.8;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = (renderArea / 2) * GEM_MANIFEST.metadata.zoomLevel;

  // 2. Handle Auto-Rotation
  if (GEM_MANIFEST.metadata.isAutoRotating) rotY += 0.005;

  // 3. Draw The Grid (The Cage)
  triangles.forEach(t => {
    const pts = t.vertices.map(v => {
        const x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
        const z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
        const y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        return {x: centerX + x1 * scale, y: centerY + y2 * scale, z: z2};
    });

    if (pts.every(p => p.z < 0)) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.closePath();
        ctx.strokeStyle = '#003300'; 
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
  });

  // 4. Draw Othello Pieces, Poles, and Ghost
  triangles.forEach(t => {
    const p = t.center;
    const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    const z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
    
    if (z2 < 0) {
        const sx = centerX + x1 * scale, sy = centerY + y2 * scale;
        const state = GEM_MANIFEST.boardState[t.id];
        
        if (state === 0) {
            // Check for Poles
            let dotColor = '#33ff33'; // Default Green
            if (p.y > 0.98) dotColor = '#00ffff'; // North Pole Cyan
            if (p.y < -0.98) dotColor = '#ffaa00'; // South Pole Orange

            if (hoveredId === t.id) {
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI*2);
                ctx.fill();
            } else {
                ctx.fillStyle = dotColor;
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5, 0, Math.PI*2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = state === 1 ? 'white' : 'magenta';
            ctx.beginPath();
            ctx.arc(sx, sy, 10, 0, Math.PI*2);
            ctx.fill();
        }
    }
  });
  requestAnimationFrame(draw);
}

function updateHUD() {
    document.getElementById('score1').innerText = GEM_MANIFEST.boardState.filter(s => s === 1).length;
    document.getElementById('score2').innerText = GEM_MANIFEST.boardState.filter(s => s === 2).length;
    const turnEl = document.getElementById('turn');
    turnEl.innerText = GEM_MANIFEST.metadata.activePlayer === 1 ? "WHITE" : "MAGENTA";
    turnEl.style.color = GEM_MANIFEST.metadata.activePlayer === 1 ? "white" : "magenta";
}

updateHUD();
draw();