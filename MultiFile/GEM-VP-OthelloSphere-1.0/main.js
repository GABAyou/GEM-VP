/**
 * MAIN.JS - Updated with Flip Rules
 * Level 4: The Game Logic Integration
 */

import { GEM_MANIFEST } from './manifest.js';
import { generateSpherePoints } from './engine.js';
import { setupInteraction } from './input.js';
import { checkFlips } from './rules.js'; // 1. Added the Rules import

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const points = generateSpherePoints(GEM_MANIFEST.metadata.frequency);
let rotY = 0;
let rotX = 0;

// Setup the Interaction
setupInteraction(canvas, 
  (dx, dy) => { 
    rotY += dx;
    rotX += dy;
  },
  (clickX, clickY) => { 
    let closestPoint = null;
    let minDistance = 25; 

    points.forEach(p => {
      const xRot = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
      const zRot = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
      const yRot = p.y * Math.cos(rotX) - zRot * Math.sin(rotX);
      const zFinal = p.y * Math.sin(rotX) + zRot * Math.cos(rotX);

      if (zFinal < 0) { 
        const sx = (canvas.width / 2) + xRot * 250;
        const sy = (canvas.height / 2) + yRot * 250;
        
        const dist = Math.sqrt((clickX - sx)**2 + (clickY - sy)**2);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = p;
        }
      }
    });

    // === START OF PLACEMENT LOGIC ===
    if (closestPoint && GEM_MANIFEST.boardState[closestPoint.id] === 0) {
      const player = GEM_MANIFEST.metadata.activePlayer;
      
      // 2. Update the manifest for the new piece
      GEM_MANIFEST.boardState[closestPoint.id] = player;
      
      // 3. RUN THE RULES: Check for sandwiches and flip pieces
      checkFlips(closestPoint.id, points);

      // 4. Switch Turns (1 to 2, or 2 to 1)
      GEM_MANIFEST.metadata.activePlayer = (player === 1) ? 2 : 1;
      
      console.log(`Player ${player} moved to ${closestPoint.id}. Next: Player ${GEM_MANIFEST.metadata.activePlayer}`);
    }
    // === END OF PLACEMENT LOGIC ===
  }
);

function draw() {
  ctx.fillStyle = GEM_MANIFEST.theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = 250;

  points.forEach(p => {
    const x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    const z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);

    if (z2 < 0) {
      const screenX = centerX + x1 * scale;
      const screenY = centerY + y2 * scale;

      const cellState = GEM_MANIFEST.boardState[p.id];
      let color = GEM_MANIFEST.theme.gridLines; 
      let size = 3;

      if (cellState === 1) { 
        color = GEM_MANIFEST.theme.player1; // White
        size = 10; // Made slightly larger for better TBI/Low-Vision visibility
      } else if (cellState === 2) { 
        color = GEM_MANIFEST.theme.player2; // Magenta
        size = 10;
      }

      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  requestAnimationFrame(draw);
}

draw();