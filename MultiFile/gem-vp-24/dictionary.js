// GEM-VP v24 Word Dictionary
export let mintedCards = [];
export let activeSequence = ["", "", ""]; 

export const DefaultCards = [
    {label: 'MOVE R', logic: 'Engine.movePlayer(50, 0);', icon: '➼', rotation: 0, id: "D1"},
    {label: 'MOVE L', logic: 'Engine.movePlayer(-50, 0);', icon: '➼', rotation: 180, id: "D2"},
    {label: 'MOVE D', logic: 'Engine.movePlayer(0, 50);', icon: '➼', rotation: 90, id: "D3"},
    {label: 'MOVE U', logic: 'Engine.movePlayer(0, -50);', icon: '➼', rotation: -90, id: "D4"},
    {label: 'HEAL', logic: 'GameState.hp = Math.min(100, GameState.hp + 20);', icon: '✚', rotation: 0, id: "S1"},
    
    // RESTORED: Teleport logic using backticks for the log string
    {label: 'TELEPORT', logic: 'GameState.posX = Math.random() * (stage.clientWidth - 40); GameState.posY = Math.random() * (stage.clientHeight - 40); Engine.updateDisplay(); Engine.log(`Phase Shift Engaged`);', icon: '✧', rotation: 0, id: "EXP-001"},
    
    // RESTORED: Loop logic (Compute required to run)
    {label: "LOOP-2", logic: "if(GameState.compute > 0) { GameState.compute -= 1; Engine.log(`Looping... (Comp: ${GameState.compute})`); setTimeout(() => { document.getElementById('btnRun').click(); }, 600); } else { Engine.log('Loop Terminated: No Compute'); }", icon: "⟳", rotation: 0, id: "EXP-002"},

    // New Economy Cards
    {label: 'UPGRADE', logic: 'if(GameState.score >= 500) { GameState.score -= 500; activeSequence.push(""); Engine.log(`Slots Upgraded!`); } else { Engine.log(`Need 500$$`); }', icon: '⇪', rotation: 0, id: "H1"},
    {label: 'COMP+', logic: 'if(GameState.score >= 50) { GameState.score -= 50; GameState.compute += 5; Engine.log(`Compute +5`); } else { Engine.log(`Need 50$$`); }', icon: '⚡', rotation: 0, id: "C1"},
    {label: 'LIFE+', logic: 'if(GameState.score >= 200) { GameState.score -= 200; GameState.lives += 1; Engine.log(`Life Added`); } else { Engine.log(`Need 200$$`); }', icon: '♥', rotation: 0, id: "L1"},
    {label: 'FUEL', logic: 'if(GameState.score >= 30) { GameState.score -= 30; GameState.energy = 50; Engine.log(`Energy Refilled`); } else { Engine.log(`Need 30$$`); }', icon: '⛽', rotation: 0, id: "F1"}
];

export function createCardSVG(card) {
    return `<svg width="110" height="150" viewBox="0 0 110 150">
        <rect width="106" height="146" x="2" y="2" fill="#000" stroke="#fff" stroke-width="4"/>
        <text x="55" y="60" fill="#fff" font-size="50" text-anchor="middle" transform="rotate(${card.rotation || 0}, 55, 50)">${card.icon || "➼"}</text>
        <text x="55" y="110" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">${card.label}</text>
        <text x="55" y="135" fill="#555" font-size="9" text-anchor="middle">${card.id}</text>
    </svg><div class="card-logic" style="display:none;">${card.logic}</div>`;
}

export const Storage = {
    export: async () => { try { await navigator.clipboard.writeText(JSON.stringify(mintedCards)); alert("Deck Copied!"); } catch (e) { alert("Blocked"); } },
    import: async () => {
        let t = ""; try { t = await navigator.clipboard.readText(); } catch (e) { t = window.prompt("Paste JSON:"); }
        if (!t) return false;
        try { const d = JSON.parse(t); if (Array.isArray(d)) { mintedCards.length = 0; d.forEach(c => mintedCards.push(c)); return true; } } catch (e) { return false; }
    }
};