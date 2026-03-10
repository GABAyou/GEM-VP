// main.js - GEM-VP v24
import { Engine, GameState } from './engine.js';
import { DefaultCards, mintedCards, activeSequence, createCardSVG, Storage } from './dictionary.js';

function updateUI() {
    const hp = document.getElementById('stat-hp');
    const energy = document.getElementById('stat-energy');
    const score = document.getElementById('stat-score');
    const comp = document.getElementById('stat-comp');
    const lives = document.getElementById('stat-lives');

    if (hp) hp.innerText = GameState.hp;
    if (energy) energy.innerText = GameState.energy;
    if (score) score.innerText = GameState.score;
    if (comp) comp.innerText = GameState.compute;
    if (lives) lives.innerText = GameState.lives;
}

function renderSlots() {
    ['play-slots', 'deck-slots'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = "";
        activeSequence.forEach((content, i) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.innerHTML = content;
            slot.onclick = () => { activeSequence[i] = ""; renderSlots(); };
            el.appendChild(slot);
        });
    });
}

function renderHand() {
    const hand = document.getElementById('hand-area');
    if (!hand) return;
    hand.innerHTML = "";
    [...DefaultCards, ...mintedCards].forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = createCardSVG(card);
        div.onclick = () => {
            const idx = activeSequence.indexOf("");
            if (idx !== -1) { activeSequence[idx] = div.innerHTML; renderSlots(); }
        };
        hand.appendChild(div);
    });
}

async function runSequence() {
    Engine.log("--- SEQUENCE START ---");
    for (let i = 0; i < activeSequence.length; i++) {
        if (activeSequence[i]) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(activeSequence[i], 'text/html');
            const logic = doc.querySelector('.card-logic')?.innerText;
            if (logic) {
                try {
                    const stage = document.getElementById('stage-container');
                    const player = document.getElementById('player');
                    const movePlayer = (x,y) => Engine.movePlayer(x,y);
                    const logToConsole = (m) => Engine.log(m);

                    const fn = new Function('Engine', 'GameState', 'stage', 'player', 'movePlayer', 'logToConsole', 'activeSequence', logic);
                    fn(Engine, GameState, stage, player, movePlayer, logToConsole, activeSequence);
                    updateUI();
                } catch (e) { Engine.log(`ERR: Slot ${i+1}`); }
            }
            await new Promise(r => setTimeout(r, 450));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.onclick = () => {
            const viewId = 'view-' + tab.id.split('-')[1];
            const targetView = document.getElementById(viewId);
            if (targetView) {
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                targetView.classList.add('active');
                tab.classList.add('active');
                renderSlots(); 
                renderHand();
            }
        };
    });

    if (document.getElementById('btnRun')) document.getElementById('btnRun').onclick = () => runSequence();
    if (document.getElementById('btnReset')) document.getElementById('btnReset').onclick = () => { Engine.reset(); updateUI(); renderSlots(); };
    
    Engine.reset(); updateUI(); renderSlots(); renderHand();
});