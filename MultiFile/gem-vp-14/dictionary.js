// GEM-VP v16 Dictionary
export let mintedCards = [];
export let activeSequence = ["", "", ""];

export const DefaultCards = [
    {label: 'MOVE R', logic: 'Engine.movePlayer(50, 0);', icon: '➼', rotation: 0, id: "D1"},
    {label: 'MOVE L', logic: 'Engine.movePlayer(-50, 0);', icon: '➼', rotation: 180, id: "D2"},
    {label: 'MOVE D', logic: 'Engine.movePlayer(0, 50);', icon: '➼', rotation: 90, id: "D3"},
    {label: 'MOVE U', logic: 'Engine.movePlayer(0, -50);', icon: '➼', rotation: -90, id: "D4"},
    {label: 'HEAL', logic: 'GameState.hp = Math.min(100, GameState.hp + 20);', icon: '✚', rotation: 0, id: "S1"}
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
    export: async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(mintedCards));
            alert("Deck Copied!");
        } catch (e) { alert("Export Blocked"); }
    },
    import: async () => {
        const text = await navigator.clipboard.readText();
        try {
            const data = JSON.parse(text);
            mintedCards.length = 0;
            data.forEach(item => mintedCards.push(item));
            return true;
        } catch (e) { alert("Invalid Deck JSON"); return false; }
    }
};