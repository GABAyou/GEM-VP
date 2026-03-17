// ATTACH TO WINDOW SO ALL FILES CAN SEE IT
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

// Test it immediately
window.gameLog("SYSTEM: Console Initialized", "system");

import { GEM_MANIFEST } from './manifest.js';
import { generateGeodesicDual } from './engine.js';
import { setupInteraction } from './input.js';

// 1. STATE ANCHOR (Must be at the top)
let state = { 
    rotX: 0, 
    rotY: 0, 
    hoveredId: null 
};

/** 2. DATA & STATE **/
const { triangles, vertices } = generateGeodesicDual(GEM_MANIFEST.metadata.frequency);
if (GEM_MANIFEST.vertexBoard.length === 0) {
    GEM_MANIFEST.vertexBoard = new Array(vertices.length).fill(0);
}




/** 1. HUD LOGIC (The Top Bar) **/
window.updateHUD = function() {
    const turnEl = document.getElementById('turn');
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    
    if (turnEl) {
        const mode = GEM_MANIFEST.metadata.activeMode;
        const player = GEM_MANIFEST.metadata.activePlayer === 1 ? 'WHITE' : 'MAGENTA';
        turnEl.innerText = `${player} (${mode})`;
    }
    
    const board = (GEM_MANIFEST.metadata.activeMode === 'FACE') 
        ? GEM_MANIFEST.faceBoard : GEM_MANIFEST.vertexBoard;

    if (score1El) score1El.innerText = board.filter(x => x === 1).length;
    if (score2El) score2El.innerText = board.filter(x => x === 2).length;
};

/** 2. DATA & STATE **/


const container = document.getElementById('tab-play');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (container) container.appendChild(canvas);

/** 3. INTERACTION (Linking the Buttons) **/
/** 3. UPDATED INTERACTION (The Vertex Handshake) **/
/** 3. STABLE INTERACTION (The Vertex Handshake) **/
setupInteraction(canvas, (dx, dy) => {
    state.rotY += dx;
    state.rotX += dy;
}, (type) => {
    if (type === 'ZOOM') {
        GEM_MANIFEST.metadata.zoomLevel += 0.2;
        if (GEM_MANIFEST.metadata.zoomLevel > 3) GEM_MANIFEST.metadata.zoomLevel = 1.0;
    } else if (type === 'ROTATE_TOGGLE') {
        GEM_MANIFEST.metadata.isAutoRotating = !GEM_MANIFEST.metadata.isAutoRotating;
    } else if (type === 'RESET') {
        state.rotX = 0; state.rotY = 0;
        GEM_MANIFEST.metadata.zoomLevel = 1.0;
    } else if (type === 'CANVAS_CLICK') {
        if (state.hoveredId !== null) {
            const isV = (GEM_MANIFEST.metadata.activeMode === 'VERTEX');
            const board = isV ? GEM_MANIFEST.vertexBoard : GEM_MANIFEST.faceBoard;
            
            if (board[state.hoveredId] === 0) {
                const currentPlayer = GEM_MANIFEST.metadata.activePlayer;
                const colorName = currentPlayer === 1 ? "WHITE" : "MAGENTA";
                
                // 1. Record the move first
                board[state.hoveredId] = currentPlayer;
                window.gameLog(`${colorName} played at ${state.hoveredId}`);

                // 2. Trigger the Flip Rules
                handleFlips(state.hoveredId, currentPlayer, isV, board);

                // 3. Switch Turn
                GEM_MANIFEST.metadata.activePlayer = (currentPlayer === 1) ? 2 : 1;
                window.updateHUD();
            }
        }
    }
});

// NEW HELPER FUNCTION: This keeps the rules from breaking the sphere
async function handleFlips(id, player, isV, board) {
    try {
        const Rules = await import('./rules.js');
        let flips = [];
        
        if (isV) {
            // PASSING: id, player, the vertices array, and the board
            flips = Rules.checkVertexFlips(id, player, vertices, board);
        }

        if (flips && flips.length > 0) {
            flips.forEach(fId => board[fId] = player);
            window.gameLog(`CAPTURE: Flipped ${flips.length} nodes!`, "system");
        }
    } catch (err) {
        window.gameLog("RULES ERROR: Check rules.js " + err.message, "error");
    }
};
// Mouse Snapping
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const scale = (Math.min(canvas.width, canvas.height) * 0.4) * GEM_MANIFEST.metadata.zoomLevel;
    const cX = canvas.width / 2, cY = canvas.height / 2;
    
    let minD = 25;
    state.hoveredId = null;
    const targets = (GEM_MANIFEST.metadata.activeMode === 'FACE') ? triangles : vertices;

    targets.forEach(t => {
        const p = (GEM_MANIFEST.metadata.activeMode === 'FACE') ? t.center : t;
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

/** 4. THE RENDER LOOP **/
/** 4. THE REFINED RENDER LOOP (Backside Culling) **/
function animate() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.fillStyle = GEM_MANIFEST.theme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (GEM_MANIFEST.metadata.isAutoRotating) state.rotY += 0.005;

    // ALIGNMENT: Move center up slightly to match the SVG mockup
    const scale = (Math.min(canvas.width, canvas.height) * 0.38) * GEM_MANIFEST.metadata.zoomLevel;
    const cX = canvas.width / 2;
    const cY = canvas.height * 0.45; // Moved up from 0.5

    // DRAW GRID (With Backside Culling)
    ctx.strokeStyle = GEM_MANIFEST.theme.gridLines;
    triangles.forEach(t => {
        // Calculate the center Z to see if it's in front
        const zCenter = t.center.y * Math.sin(state.rotX) + (t.center.x * Math.sin(state.rotY) + t.center.z * Math.cos(state.rotY)) * Math.cos(state.rotX);
        
        if (zCenter < 0) { // ONLY DRAW IF IN FRONT
            ctx.beginPath();
            t.points.forEach((p, i) => {
                const x1 = p.x * Math.cos(state.rotY) - p.z * Math.sin(state.rotY);
                const z1 = p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY);
                const y2 = p.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
                const ex = cX + x1 * scale, ey = cY + y2 * scale;
                if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
            });
            ctx.closePath();
            ctx.stroke();
        }
    });

    // DRAW DOTS (Only if in front)
    const isV = (GEM_MANIFEST.metadata.activeMode === 'VERTEX');
    const nodes = isV ? vertices : triangles;
    const board = isV ? GEM_MANIFEST.vertexBoard : GEM_MANIFEST.faceBoard;

    nodes.forEach(n => {
        const p = isV ? n : n.center;
        const zNode = p.y * Math.sin(state.rotX) + (p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY)) * Math.cos(state.rotX);

        if (zNode < 0) { // ONLY DRAW IF IN FRONT
            const x1 = p.x * Math.cos(state.rotY) - p.z * Math.sin(state.rotY);
            const z1 = p.x * Math.sin(state.rotY) + p.z * Math.cos(state.rotY);
            const y2 = p.y * Math.cos(state.rotX) - z1 * Math.sin(state.rotX);
            const sx = cX + x1 * scale, sy = cY + y2 * scale;
            
            const status = board[n.id] || 0;
            ctx.beginPath();
            ctx.arc(sx, sy, status === 0 ? 3 : 8, 0, Math.PI * 2);
            
            if (status === 0) {
                if (n.id === state.hoveredId) ctx.fillStyle = GEM_MANIFEST.theme.ghost;
                else if (n.isNorth) ctx.fillStyle = GEM_MANIFEST.metadata.poleColorNorth;
                else if (n.isSouth) ctx.fillStyle = GEM_MANIFEST.metadata.poleColorSouth;
                else ctx.fillStyle = GEM_MANIFEST.theme.gridLines;
            } else {
                ctx.fillStyle = (status === 1) ? GEM_MANIFEST.theme.player1 : GEM_MANIFEST.theme.player2;
            }
            ctx.fill();
        }
    });
    requestAnimationFrame(animate);
}

animate();
window.updateHUD();

// THE RUN BUTTON: This connects the 3D world to the Logic Cards
const runBtn = document.getElementById('btnRun');
if (runBtn) {
    runBtn.addEventListener('click', () => {
        window.gameLog("EXECUTOR: Sequence starting...", "system");
        
        // Pass vertices so the Switch and Flip logic can access them
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