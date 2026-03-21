/**
 * MAIN.JS - v2.0 Gold
 * Purpose: Master Controller, Pass-Through Rendering, and Turn-Based Economy.
 */

window.gameLog = function(msg, type = '') {
    const output = document.getElementById('console-output');
    if (output) {
        const div = document.createElement('div');
        div.className = type ? `log-${type}` : '';
        div.innerText = `> ${new Date().toLocaleTimeString().split(' ')[0]} - ${msg}`;
        output.prepend(div); 
    }
    console.log(msg);
};

window.gameLog("SYSTEM: Console Initialized", "system");

import { GEM_MANIFEST } from './manifest.js';
import { generateGeodesicDual } from './engine.js';
import { setupInteraction } from './input.js';

// 1. STATE ANCHOR
// 1. UPDATE STATE
let state = { 
    rotX: 0, 
    rotY: 0, 
    hoveredId: null,
    lockedId: null // NEW: This stays even when the mouse moves away
};

// 2. DATA INITIALIZATION
const { triangles, vertices } = generateGeodesicDual(GEM_MANIFEST.metadata.frequency);
GEM_MANIFEST.vertexBoard = new Array(vertices.length).fill(0);
GEM_MANIFEST.faceBoard = new Array(triangles.length).fill(0);

window.gameLog(`ENGINE: Loaded ${vertices.length} vertices and ${triangles.length} faces.`, "system");

// 3. HUD UPDATER - Synchronized for v2.0 High Contrast
window.updateHUD = function() {
    const turnEl = document.getElementById('turn');
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    
    if (turnEl) {
        const mode = GEM_MANIFEST.metadata.activeMode;
        const p1CP = GEM_MANIFEST.metadata.player1CP;
        const p2CP = GEM_MANIFEST.metadata.player2CP;
        const player = GEM_MANIFEST.metadata.activePlayer === 1 ? 'WHITE' : 'MAGENTA';
        const playerColor = (player === 'WHITE') ? '#ffffff' : '#ff00ff';

        turnEl.innerHTML = `
            <span style="color:${playerColor}">${player}</span> (${mode}) | 
            CP: <span style="color:#ffffff">W:${p1CP}</span> 
            <span style="color:#ff00ff">M:${p2CP}</span>
        `;
    }
    
    const board = (GEM_MANIFEST.metadata.activeMode === 'FACE') 
        ? GEM_MANIFEST.faceBoard : GEM_MANIFEST.vertexBoard;

    if (score1El) score1El.innerText = board.filter(x => x === 1).length;
    if (score2El) score2El.innerText = board.filter(x => x === 2).length;
};

// 4. UI ATTACHMENT
const container = document.getElementById('sphere-box'); 
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

if (container) {
    container.appendChild(canvas);
} else {
    window.gameLog("LAYOUT ERROR: 'sphere-box' not found", "error");
}

// 5. INTERACTION HANDSHAKE - v2.0 Gold Edition
setupInteraction(canvas, (dx, dy) => {
    state.rotY += dx;
    state.rotX += dy;
}, (type) => {
    if (type === 'ZOOM_IN') {
        GEM_MANIFEST.metadata.zoomLevel = Math.min(GEM_MANIFEST.metadata.zoomLevel + 0.2, 3.0);
    } else if (type === 'ZOOM_OUT') {
        GEM_MANIFEST.metadata.zoomLevel = Math.max(GEM_MANIFEST.metadata.zoomLevel - 0.2, 0.5);
    } else if (type === 'ROTATE_TOGGLE') {
        GEM_MANIFEST.metadata.isAutoRotating = !GEM_MANIFEST.metadata.isAutoRotating;
    } else if (type === 'RESET') {
        state.rotX = 0; 
        state.rotY = 0;
        GEM_MANIFEST.metadata.zoomLevel = 1.0;
        state.lockedId = null; // Clear lock on reset
    } else if (type === 'CANVAS_CLICK' && state.hoveredId !== null) {
        const isV = (GEM_MANIFEST.metadata.activeMode === 'VERTEX');
        state.lockedId = state.hoveredId;
        window.gameLog(`TARGET LOCKED: Node ${state.lockedId}`, "system");

        // Use the Master Manifest directly
        if (GEM_MANIFEST.vertexBoard[state.hoveredId] === 0) {
            const currentPlayer = GEM_MANIFEST.metadata.activePlayer;
            GEM_MANIFEST.vertexBoard[state.hoveredId] = currentPlayer;
            
            window.gameLog(`${currentPlayer === 1 ? "WHITE" : "MAGENTA"} played at ${state.hoveredId}`);

            // Pass the MASTER board here
            handleFlips(state.hoveredId, currentPlayer, isV, GEM_MANIFEST.vertexBoard);
            harvestInterest();

            GEM_MANIFEST.metadata.activePlayer = (currentPlayer === 1) ? 2 : 1;
            window.updateHUD();
        }
    }
});

// 6. ECONOMY & GAME LOGIC
async function handleFlips(id, player, isV, vBoard) {
    try {
        const Rules = await import('./rules.js');
        // If 'vertices' isn't available in the scope, this line crashes
        if (isV) {
            const flips = Rules.checkVertexFlips(id, player, vertices, vBoard);
            flips.forEach(fId => vBoard[fId] = player);
            if (flips.length > 0) window.gameLog(`CAPTURE: Flipped ${flips.length} nodes!`);
        }

        Rules.updateTerritory(triangles, GEM_MANIFEST.vertexBoard, GEM_MANIFEST.faceBoard);
        window.updateHUD(); 
    } catch (err) {
        window.gameLog("RULES ERROR: " + err.message, "error");
    }
}

function harvestInterest() {
    const fBoard = GEM_MANIFEST.faceBoard;
    const p1Territory = fBoard.filter(x => x === 1).length;
    const p2Territory = fBoard.filter(x => x === 2).length;

    GEM_MANIFEST.metadata.player1CP += (p1Territory + 2);
    GEM_MANIFEST.metadata.player2CP += (p2Territory + 2);
    
    window.gameLog(`ECONOMY: W:+${p1Territory+2} M:+${p2Territory+2} CP earned.`, "system");
}

// 7. MOUSE SNAPPING
window.addEventListener('mousemove', (e) => {
    // Inside the mousemove listener in main.js
const rect = canvas.getBoundingClientRect();
const mouseX = e.clientX - rect.left;
const mouseY = e.clientY - rect.top;
    const scale = (Math.min(canvas.width, canvas.height) * 0.38) * GEM_MANIFEST.metadata.zoomLevel;
    // CRITICAL: This MUST match the cY in your animate() function (0.45)
const cX = canvas.width / 2;
const cY = canvas.height * 0.45;
    
    let minD = 25;
    state.hoveredId = null;
    const targets = (GEM_MANIFEST.metadata.activeMode === 'VERTEX') ? vertices : triangles;

    targets.forEach(t => {
        const p = (GEM_MANIFEST.metadata.activeMode === 'VERTEX') ? t : t.center;
        const x1 = p.x * Math.cos(state.rotY) - p.z * Math.sin(state.rotY);
        const z1 = p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY);
        const y2 = p.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
        const z2 = p.y * Math.sin(state.rotX) + z1 * Math.cos(state.rotX);
        
        if (z2 < 0) {
            const sx = cX + x1 * scale, sy = cY + y2 * scale;
            const d = Math.sqrt((mouseX-sx)**2 + (mouseY-sy)**2);
            if (d < minD) { minD = d; state.hoveredId = t.id; }
        }
    });
});

// 8. RENDER LOOP
// 8. RENDER LOOP - Synchronized with Target Locking
function animate() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.fillStyle = GEM_MANIFEST.theme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (GEM_MANIFEST.metadata.isAutoRotating) state.rotY += 0.005;

    const scale = (Math.min(canvas.width, canvas.height) * 0.38) * GEM_MANIFEST.metadata.zoomLevel;
    const cX = canvas.width / 2, cY = canvas.height * 0.45;

    // PASS 1: GRID
    ctx.strokeStyle = GEM_MANIFEST.theme.gridLines;
    ctx.lineWidth = 1;
    triangles.forEach(t => {
        const z = t.center.y * Math.sin(state.rotX) + (t.center.x * Math.sin(state.rotY) + t.center.z * Math.cos(state.rotY)) * Math.cos(state.rotX);
        if (z < 0) {
            ctx.beginPath();
            t.points.forEach((p, i) => {
                const x1 = p.x * Math.cos(state.rotY) - p.z * Math.sin(state.rotY);
                const z1 = p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY);
                const y2 = p.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
                if (i === 0) ctx.moveTo(cX + x1 * scale, cY + y2 * scale); 
                else ctx.lineTo(cX + x1 * scale, cY + y2 * scale);
            });
            ctx.closePath();
            ctx.stroke();
        }
    });

    // PASS 2: TERRITORY
    triangles.forEach(t => {
        const z = t.center.y * Math.sin(state.rotX) + (t.center.x * Math.sin(state.rotY) + t.center.z * Math.cos(state.rotY)) * Math.cos(state.rotX);
        const owner = GEM_MANIFEST.faceBoard[t.id];
        if (z < 0 && owner !== 0) {
            ctx.fillStyle = (owner === 1) ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 0, 255, 0.8)";
            ctx.beginPath();
            t.points.forEach((p, i) => {
                const x1 = p.x * Math.cos(state.rotY) - p.z * Math.sin(state.rotY);
                const z1 = p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY);
                const y2 = p.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
                const sB = scale * 1.01;
                if (i === 0) ctx.moveTo(cX + x1 * sB, cY + y2 * sB);
                else ctx.lineTo(cX + x1 * sB, cY + y2 * sB);
            });
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = (owner === 1) ? "#ffffff" : "#ff00ff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // PASS 3: DOTS & LOCK INDICATOR
    vertices.forEach(v => {
        const z = v.y * Math.sin(state.rotX) + (v.x * Math.sin(state.rotY) + v.z * Math.cos(state.rotY)) * Math.cos(state.rotX);
        if (z < 0) {
            const x1 = v.x * Math.cos(state.rotY) - v.z * Math.sin(state.rotY);
            const z1 = v.x * Math.sin(state.rotY) + v.z * Math.cos(state.rotY);
            const y2 = v.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
            const sx = cX + x1 * scale, sy = cY + y2 * scale;
            const status = GEM_MANIFEST.vertexBoard[v.id] || 0;
            
            ctx.beginPath();
            ctx.arc(sx, sy, status === 0 ? 3 : 8, 0, Math.PI * 2);
            if (status === 0) {
                ctx.fillStyle = (v.id === state.hoveredId) ? GEM_MANIFEST.theme.ghost : (v.isNorth ? "#ff3333" : (v.isSouth ? "#3333ff" : "#33ff33"));
            } else {
                ctx.fillStyle = (status === 1) ? "#ffffff" : "#ff00ff";
            }
            ctx.fill();

            // DRAW GOLD LOCK (sx/sy now safely defined here)
            if (v.id === state.lockedId) {
                ctx.beginPath();
                ctx.arc(sx, sy, 12, 0, Math.PI * 2); 
                ctx.strokeStyle = "#ffcc00"; 
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

// 9. STARTUP & RUN BUTTON
animate();
window.updateHUD();

const runBtn = document.getElementById('btnRun');
if (runBtn) {
    runBtn.addEventListener('click', () => {
        window.gameLog("EXECUTOR: Sequence starting...", "system");
        import('./executor.js').then(m => {
            const sphereState = {
                get rotY() { return state.rotY; }, set rotY(v) { state.rotY = v; },
                get rotX() { return state.rotX; }, set rotX(v) { state.rotX = v; }
            };
            m.runShockwave(state.lockedId, GEM_MANIFEST.metadata.activePlayer, vertices, GEM_MANIFEST.vertexBoard);
            window.updateHUD();
        }).catch(err => {
            window.gameLog("ERROR: Executor failed: " + err.message, "error");
        });
    });
}