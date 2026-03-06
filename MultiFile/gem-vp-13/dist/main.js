import { Engine, GameState } from './engine.js';
import { DefaultCards, mintedCards, activeSequence, createCardSVG } from './dictionary.js';

function updateUI() {
    document.getElementById('stat-hp').innerText = GameState.hp;
    document.getElementById('stat-lives').innerText = GameState.lives;
    document.getElementById('stat-energy').innerText = GameState.energy;
    document.getElementById('stat-comp').innerText = GameState.compute;
    document.getElementById('stat-score').innerText = GameState.score;
}

function renderSlots() {
    ['play-slots', 'deck-slots'].forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = "";
        activeSequence.forEach((content, i) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.innerHTML = content;
            slot.onclick = () => { activeSequence[i] = ""; renderSlots(); };
            container.appendChild(slot);
        });
    });
}

function renderHand() {
    const handArea = document.getElementById('hand-area');
    if (!handArea) return;
    handArea.innerHTML = "";
    [...DefaultCards, ...mintedCards].forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        const svg = createCardSVG(card);
        div.innerHTML = svg;
        div.onclick = () => {
            const idx = activeSequence.indexOf("");
            if (idx !== -1) { activeSequence[idx] = svg; renderSlots(); }
        };
        handArea.appendChild(div);
    });
}

async function runSequence() {
    const consoleLog = document.getElementById('logic-console');
    for (let i = 0; i < activeSequence.length; i++) {
        const content = activeSequence[i];
        if (content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const logic = doc.querySelector('.card-logic').innerText;
            
            consoleLog.innerText = `Executing Word ${i+1}...`;
            
            // Execute the logic string
            try {
                const fn = new Function('Engine', 'GameState', logic);
                fn(Engine, GameState);
            } catch (e) {
                console.error("Logic Error:", e);
            }
            
            updateUI();
            await new Promise(r => setTimeout(r, 400));
        }
    }
    consoleLog.innerText = "Sequence Complete.";
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.onclick = () => {
            const viewId = 'view-' + tab.id.replace('tab-', '');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            tab.classList.add('active');
            renderSlots();
            renderHand();
        };
    });

    document.getElementById('btnReset').onclick = () => { Engine.reset(); updateUI(); renderSlots(); };
    document.getElementById('btnRun').onclick = () => runSequence();

    Engine.reset();
    updateUI();
    renderSlots();
    renderHand();
});