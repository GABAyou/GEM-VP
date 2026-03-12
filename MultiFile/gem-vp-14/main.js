import { Engine, GameState } from './engine.js';
import { DefaultCards, mintedCards, activeSequence, createCardSVG, Storage } from './dictionary.js';

function updateUI() {
    document.getElementById('stat-hp').innerText = GameState.hp;
    document.getElementById('stat-lives').innerText = GameState.lives;
    document.getElementById('stat-energy').innerText = GameState.energy;
    document.getElementById('stat-score').innerText = GameState.score;
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
    Engine.log("STARTING...");
    for (let i = 0; i < activeSequence.length; i++) {
        if (activeSequence[i]) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(activeSequence[i], 'text/html');
            const logic = doc.querySelector('.card-logic')?.innerText;
            if (logic) {
                try {
                    const fn = new Function('Engine', 'GameState', logic);
                    fn(Engine, GameState);
                    updateUI();
                } catch (e) { Engine.log("ERR Word " + (i+1)); }
            }
            await new Promise(r => setTimeout(r, 400));
        }
    }
    Engine.log("FINISHED.");
}

document.addEventListener('DOMContentLoaded', () => {
    // Nav Logic
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.onclick = () => {
            const target = 'view-' + tab.id.split('-')[1];
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            tab.classList.add('active');
            renderSlots(); renderHand();
        };
    });

    // Console Copy Workaround for CodePen Iframe
    document.getElementById('btnCopyConsole').onclick = () => {
        const text = document.getElementById('logic-console').innerText;
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            Engine.log("LOG COPIED (Fallback)");
        } catch (err) { Engine.log("COPY FAILED"); }
        document.body.removeChild(textArea);
    };

    document.getElementById('btnClearConsole').onclick = () => document.getElementById('logic-console').innerHTML = "";
    document.getElementById('btnRun').onclick = () => runSequence();
    document.getElementById('btnReset').onclick = () => { Engine.reset(); updateUI(); renderSlots(); };
    
    document.getElementById('btnMintCard').onclick = () => {
        const label = document.getElementById('new-label').value;
        const logic = document.getElementById('new-logic').value;
        if(label && logic) {
            mintedCards.push({label, logic, icon: "➼", id: "USR-"+Date.now().toString().slice(-3)});
            renderHand();
            Engine.log("Word Minted.");
        }
    };

    document.getElementById('btnImport').onclick = async () => {
        if(await Storage.import()) { renderHand(); Engine.log("DECK IMPORTED"); }
    };
    document.getElementById('btnExport').onclick = () => Storage.export();

    Engine.reset(); updateUI(); renderSlots(); renderHand();
});