/**
 * MAIN.JS - v1.9 Beta
 * Purpose: Master Controller, Rendering, and Game Loop.
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
let state = { 
    rotX: 0, 
    rotY: 0, 
    hoveredId: null 
};

// 2. DATA INITIALIZATION
const { triangles, vertices } = generateGeodesicDual(GEM_MANIFEST.metadata.frequency);
GEM_MANIFEST.vertexBoard = new Array(vertices.length).fill(0);
GEM_MANIFEST.faceBoard = new Array(triangles.length).fill(0);

window.gameLog(`ENGINE: Loaded ${vertices.length} vertices and ${triangles.length} faces.`, "system");

// 3. HUD UPDATER
window.updateHUD = function() {
    const turnEl = document.getElementById('turn');
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    
    if (turnEl) {
        const mode = GEM_MANIFEST.metadata.activeMode;
        const p1CP = GEM_MANIFEST.metadata.player1CP;
        const p2CP = GEM_MANIFEST.metadata.player2CP;
        const player = GEM_MANIFEST.metadata.activePlayer === 1 ? 'WHITE' : 'MAGENTA';
        turnEl.innerText = `${player} (${mode}) | CP: W:${p1CP} M:${p2CP}`;
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

// 5. INTERACTION HANDSHAKE
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
        state.rotX = 0; state.rotY = 0;
        GEM_MANIFEST.metadata.zoomLevel = 1.0;
    } else if (type === 'CANVAS_CLICK' && state.hoveredId !== null) {
        const isV = (GEM_MANIFEST.metadata.activeMode === 'VERTEX');
        const vBoard = GEM_MANIFEST.vertexBoard;
        
        if (vBoard[state.hoveredId] === 0) {
            const currentPlayer = GEM_MANIFEST.metadata.activePlayer;
            vBoard[state.hoveredId] = currentPlayer;
            window.gameLog(`${currentPlayer === 1 ? "WHITE" : "MAGENTA"} played at ${state.hoveredId}`);
            handleFlips(state.hoveredId, currentPlayer, isV, vBoard);
            GEM_MANIFEST.metadata.activePlayer = (currentPlayer === 1) ? 2 : 1;
            window.updateHUD();
        }
    }
});

async function handleFlips(id, player, isV, vBoard) {
    try {
        const Rules = await import('./rules.js');
        if (isV) {
            const flips = Rules.checkVertexFlips(id, player, vertices, vBoard);
            flips.forEach(fId => vBoard[fId] = player);
            if (flips.length > 0) window.gameLog(`CAPTURE: Flipped ${flips.length} nodes!`);
        }
        const rewards = Rules.updateTerritory(triangles, GEM_MANIFEST.vertexBoard, GEM_MANIFEST.faceBoard);
        if (rewards?.p1 > 0) GEM_MANIFEST.metadata.player1CP += (rewards.p1 * 10);
        if (rewards?.p2 > 0) GEM_MANIFEST.metadata.player2CP += (rewards.p2 * 10);
        window.updateHUD(); 
    } catch (err) {
        window.gameLog("RULES ERROR: " + err.message, "error");
    }
}

// Mouse Snapping
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const scale = (Math.min(canvas.width, canvas.height) * 0.38) * GEM_MANIFEST.metadata.zoomLevel;
    const cX = canvas.width / 2, cY = canvas.height * 0.45;
    
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

// 6. RENDER LOOP
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

    // PASS 3: DOTS
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
        }
    });
    requestAnimationFrame(animate);
}

animate();
window.updateHUD();

// RUN BUTTON
// 7. RUN BUTTON - Connecting the 3D world to the Logic Cards
const runBtn = document.getElementById('btnRun');
if (runBtn) {
    runBtn.addEventListener('click', () => {
        window.gameLog("EXECUTOR: Sequence starting...", "system");
        
        import('./executor.js').then(m => {
            const sphereState = {
                get rotY() { return state.rotY; }, 
                set rotY(v) { state.rotY = v; },
                get rotX() { return state.rotX; }, 
                set rotX(v) { state.rotX = v; }
            };
            m.runCompound(sphereState, triangles, vertices);
        }).catch(err => {
            window.gameLog("ERROR: Executor failed: " + err.message, "error");
        });
    });
}