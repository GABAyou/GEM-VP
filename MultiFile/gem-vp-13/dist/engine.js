export const GameState = {
    posX: 20, posY: 20, hp: 100, lives: 3, energy: 50, compute: 10, score: 0
};

export const Engine = {
    updateDisplay: () => {
        const p = document.getElementById('player');
        if (p) {
            p.style.left = GameState.posX + 'px';
            p.style.top = GameState.posY + 'px';
        }
    },
    movePlayer: (dx, dy) => {
        const stage = document.getElementById('stage-container');
        if (GameState.energy <= 0) return;
        
        GameState.posX = Math.max(0, Math.min(GameState.posX + dx, stage.clientWidth - 35));
        GameState.posY = Math.max(0, Math.min(GameState.posY + dy, stage.clientHeight - 35));
        
        Engine.updateDisplay();
        GameState.energy -= 1;
        Engine.checkCollision();
    },
    checkCollision: () => {
        const p = document.getElementById('player').getBoundingClientRect();
        const h = document.getElementById('hazard').getBoundingClientRect();
        const g = document.getElementById('goal').getBoundingClientRect();
        
        if (!(p.right < h.left || p.left > h.right || p.bottom < h.top || p.top > h.bottom)) {
            GameState.hp -= 10; 
            if (GameState.hp <= 0) { GameState.lives--; GameState.hp = 100; }
        }
        if (!(p.right < g.left || p.left > g.right || p.bottom < g.top || p.top > g.bottom)) {
            GameState.score += 10;
        }
    },
    reset: () => {
        GameState.posX = 20; GameState.posY = 20; GameState.hp = 100;
        GameState.energy = 50; GameState.compute = 10;
        Engine.updateDisplay();
    }
};