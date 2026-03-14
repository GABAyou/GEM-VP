/**
 * MAIN.JS
 * Purpose: Orchestrates 3D Rendering, Input, and Execution.
 * The central hub of the GEM-VP-OthelloSphere-1.3.
 */

import { GEM_MANIFEST } from './manifest.js';
import { generateGeodesicGrid } from './engine.js';
import { setupInteraction } from './input.js';
import { checkFlips } from './rules.js';
import { runCompound } from './executor.js';

// 1. STATE & CONSTANTS
let rotX = 0, rotY = 0;
let hoveredId = null;
const zoomLevels = [0.5, 1.0, 1.8];
let currentZoomIdx = 1;

// 2. CANVAS ATTACHMENT
const container = document.getElementById('tab-play');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (container) container.appendChild(canvas);

// 3. GEOMETRY GENERATION
const triangles = generateGeodesicGrid(GEM_MANIFEST.metadata.frequency);

// 4. VIEWPORT STABILIZATION
function resize() {
    if (container && container.clientWidth > 0) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
}
window.addEventListener('resize', resize);
resize();

// 5. MOUSE TRACKING (GHOST PIECE)
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
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
            const d = Math.sqrt((mouseX - sx)**2 + (mouseY - sy)**2);
            if (d < minDict) { minDict = d; hoveredId = t.id; }
        }
    });
});

// 6. INPUT HANDSHAKE (Rotate & Click)
setupInteraction(canvas, (dx, dy) => { 
    rotY += dx; rotX += dy; 
}, (x, y) => {
    if (hoveredId !== null && GEM_MANIFEST.boardState[hoveredId] === 0) {
        const p = GEM_MANIFEST.metadata.activePlayer;
        GEM_MANIFEST.boardState[hoveredId] = p;
        checkFlips(hoveredId, triangles, GEM_MANIFEST.boardState);
        GEM_MANIFEST.metadata.activePlayer = (p === 1) ? 2 : 1;
        window.updateHUD();
    }
});

// 7. BUTTON LOGIC
document.getElementById('btnRun').addEventListener('click', () => {
    runCompound({ get rotY() { return rotY; }, set rotY(v) { rotY = v; } });
});
document.getElementById('btnZoom').addEventListener('click', () => {
    currentZoomIdx = (currentZoomIdx + 1) % zoomLevels.length;
    GEM_MANIFEST.metadata.zoomLevel = zoomLevels[currentZoomIdx];
});
document.getElementById('btnRotate').addEventListener('click', () => {
    GEM_MANIFEST.metadata.isAutoRotating = !GEM_MANIFEST.metadata.isAutoRotating;
});

// 8. HUD MANAGEMENT
window.updateHUD = function() {
    const p1 = GEM_MANIFEST.boardState.filter(x => x === 1).length;
    const p2 = GEM_MANIFEST.boardState.filter(x => x === 2).length;
    document.getElementById('turn').innerText = GEM_MANIFEST.metadata.activePlayer === 1 ? 'WHITE' : 'MAGENTA';
    document.getElementById('score1').innerText = p1; 
    document.getElementById('score2').innerText = p2;
};

// 9. ANIMATION LOOP (3D RENDER)
function animate() {
    ctx.fillStyle = GEM_MANIFEST.theme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (GEM_MANIFEST.metadata.isAutoRotating) rotY += 0.005;

    const renderArea = Math.min(canvas.width, canvas.height) * 0.8;
    const scale = (renderArea / 2) * GEM_MANIFEST.metadata.zoomLevel;
    const centerX = canvas.width / 2, centerY = canvas.height / 2;

    triangles.forEach(t => {
        const p = t.center;
        const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        const z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);

        if (z2 < 0) {
            const sx = centerX + x1 * scale, sy = centerY + y2 * scale;
            
            // DRAW LINES
            ctx.beginPath();
            t.points.forEach((pt, i) => {
                const px1 = pt.x * Math.cos(rotY) - pt.z * Math.sin(rotY);
                const pz1 = pt.x * Math.sin(rotY) + pt.z * Math.cos(rotY);
                const py2 = pt.y * Math.cos(rotX) - pz1 * Math.sin(rotX);
                const ex = centerX + px1 * scale, ey = centerY + py2 * scale;
                if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
            });
            ctx.closePath();
            ctx.strokeStyle = GEM_MANIFEST.theme.gridLines;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // DRAW DOT/PIECE
            const state = GEM_MANIFEST.boardState[t.id];
            ctx.beginPath();
            ctx.arc(sx, sy, state === 0 ? 3 : 8, 0, Math.PI * 2);
            if (state === 0) {
                if (t.isNorth) ctx.fillStyle = GEM_MANIFEST.metadata.poleColorNorth;
                else if (t.isSouth) ctx.fillStyle = GEM_MANIFEST.metadata.poleColorSouth;
                else if (t.id === hoveredId) ctx.fillStyle = GEM_MANIFEST.theme.ghost;
                else ctx.fillStyle = GEM_MANIFEST.theme.gridLines;
            } else {
                ctx.fillStyle = (state === 1) ? GEM_MANIFEST.theme.player1 : GEM_MANIFEST.theme.player2;
            }
            ctx.fill();
        }
    });
    requestAnimationFrame(animate);
}

animate();
window.updateHUD();