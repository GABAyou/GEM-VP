Perfect! Here's the complete, detailed gameplay instructions:

---

# GEM-VP OthelloSphere: Comprehensive Gameplay Instructions

## Quick Start

### For Human Players
1. **Launch the Game**: Open `index.html` in your web browser
2. **Understand the Board**: You'll see a 3D geodesic sphere covered in dots (vertices)
3. **Choose Your Color**: You are WHITE (player 1), opponent is MAGENTA (player 2)
4. **Make Your First Move**: Click any vertex to place your piece
5. **Watch for Flips**: When you place a piece, opponent pieces along straight lines get captured automatically
6. **Keep Playing**: Take turns until all vertices are filled
7. **Count Your Score**: The player with more vertices at the end wins!

### For AI Developers
1. **Understand the Game State**: Study `manifest.js` to see how board state is stored
2. **Implement Valid Move Generator**: Create a function that returns all legal moves for a position
3. **Implement a Scoring Function**: Evaluate board positions numerically
4. **Choose an Algorithm**: Start with Minimax or Alpha-Beta Pruning (explained below)
5. **Integrate into `executor.js`**: Your AI will be called when the RUN button is pressed
6. **Test Against Humans**: Play test games to verify your AI works correctly

---

## Human Rules (Never Played Othello Before?)

### The Objective
Win by owning more vertices (dots) than your opponent when all 162 vertices on the sphere are filled.

### How to Place a Piece
1. **Move your mouse** over the sphere - you'll see dots change color as you hover
2. **Click on an empty dot** (a dot with no color yet)
3. Your piece appears on that vertex

### The Capture Rule: "Great Circles"
When you place a piece, imagine **straight lines running across the sphere through your new piece**. These are called "great circles" (like longitude lines on Earth).

**If a great circle contains:**
- Your piece (on one end)
- One or more opponent pieces (in the middle)
- Your piece again OR you already own the far end

**Then all opponent pieces in between are captured and change to your color!**

### Example on a Sphere:
```
Before your move:
Vertex A (yours) --- Vertex B (opponent) --- Vertex C (opponent) --- Vertex D (empty)

You click on Vertex D:
Vertex A (yours) --- Vertex B (flipped!) --- Vertex C (flipped!) --- Vertex D (your new piece)

Result: Vertices B and C change to your color!
```

### Valid Move Rules
- You can ONLY place a piece where it captures at least one opponent piece
- If you can't capture anything, you must **skip your turn**
- If both players skip in a row, the game ends
- Game also ends when all 162 vertices are filled

### Scoring
At the end of the game, count your vertices:
- **Your Score** = number of vertices in your color
- **Opponent's Score** = number of vertices in their color
- **Winner** = whoever has more vertices

---

## Human Strategy (Tips for Winning)

### 1. **Control the Poles**
The sphere has a "North Pole" (red) and "South Pole" (blue) vertex. These are extreme positions with fewer neighbors, making them harder to flip. Controlling them early gives you stability.

### 2. **Avoid the Edges Early**
Placing pieces on the outer edges early can backfire—your opponent might capture long chains. Focus on central positions first.

### 3. **Think in Straight Lines**
Before you click, imagine 3D lines running through the sphere. Where will opponent pieces get sandwiched? Place your piece to maximize captures.

### 4. **Plan 2-3 Moves Ahead**
After you place a piece, think: "What moves will my opponent have?" Can you limit their options?

### 5. **Majority Doesn't Mean Victory**
Just because you have more pieces NOW doesn't mean you'll win. Your opponent might capture a huge chain at the end. Always stay aware of potential reversal threats.

### 6. **Use Corners as Anchors**
Once you own a "corner" position (a vertex with few neighbors), it's very hard to flip. These become safe strongholds.

---

## AI Implementation (For AI Developers)

### Understanding the Board State

The game stores two arrays in `manifest.js`:

```javascript
vertexBoard: [0, 1, 2, 0, 1, 1, ...]  // 162 elements
// 0 = empty, 1 = WHITE (your AI), 2 = MAGENTA (opponent)

vertices: [
  {id: 0, x: 0.5, y: 0.3, z: 0.8, neighbors: [1, 3, 5, ...]},
  {id: 1, x: 0.2, y: 0.7, z: 0.4, neighbors: [0, 2, 4, ...]},
  ...
]
```

Each vertex knows its **neighbors** (vertices reachable via great circles).

### Step 1: Generate Valid Moves

Create a function that:
1. Iterates through all empty vertices (where `vertexBoard[i] === 0`)
2. For each empty vertex, checks if placing your piece there captures opponent pieces
3. Returns a list of all valid move positions

```pseudocode
function getValidMoves(vertexBoard, vertices, playerID):
  validMoves = []
  for each vertex V where vertexBoard[V.id] == 0:
    if wouldCaptureOpponents(V, playerID, vertexBoard, vertices):
      validMoves.append(V.id)
  return validMoves
```

### Step 2: Implement Capture Detection

Adapt the logic from `rules.js` `checkVertexFlips()`:

```pseudocode
function wouldCaptureOpponents(vertex, playerID, vertexBoard, vertices):
  opponent = (playerID == 1) ? 2 : 1
  
  for each neighbor in vertex.neighbors:
    path = []
    current = neighbor
    prev = vertex.id
    
    while current is defined AND vertexBoard[current] == opponent:
      path.append(current)
      current = findNextInLine(prev, current, vertices)
      prev = current
    
    if current is defined AND vertexBoard[current] == playerID:
      return true  // Valid capture found!
  
  return false
```

### Step 3: Create a Board Evaluation Function (Heuristic)

This function scores a board position. Higher score = better position for your AI.

```pseudocode
function evaluateBoard(vertexBoard, playerID):
  score = 0
  
  // Count pieces
  myPieces = count(vertexBoard == playerID)
  oppPieces = count(vertexBoard == (3 - playerID))
  score += (myPieces - oppPieces) * 10
  
  // Bonus for controlling poles (fewer neighbors = more stable)
  northPole = 0  // Vertex ID of north pole (you'll need to find this)
  southPole = 161  // Vertex ID of south pole
  
  if vertexBoard[northPole] == playerID:
    score += 50
  if vertexBoard[southPole] == playerID:
    score += 50
  
  // Bonus for corner/edge positions (vertices with fewer neighbors)
  for each vertex V where vertexBoard[V.id] == playerID:
    if V.neighbors.length < 6:  // Fewer connections = corner-like
      score += 5
  
  return score
```

### Step 4: Implement Minimax Algorithm

Minimax explores possible future moves and picks the best one.

```pseudocode
function minimax(vertexBoard, depth, isMaximizing, playerID):
  
  // Base case: depth limit or game over
  if depth == 0 OR noMovesAvailable(vertexBoard, playerID):
    return evaluateBoard(vertexBoard, playerID)
  
  if isMaximizing:  // Your AI's turn
    maxScore = -∞
    for each validMove in getValidMoves(vertexBoard, playerID):
      newBoard = vertexBoard.copy()
      executeMove(newBoard, validMove, playerID)
      score = minimax(newBoard, depth - 1, false, playerID)
      maxScore = max(maxScore, score)
    return maxScore
  
  else:  // Opponent's turn
    minScore = +∞
    for each validMove in getValidMoves(vertexBoard, opponent):
      newBoard = vertexBoard.copy()
      executeMove(newBoard, validMove, opponent)
      score = minimax(newBoard, depth - 1, true, playerID)
      minScore = min(minScore, score)
    return minScore
```

### Step 5: Alpha-Beta Pruning (Optimization)

This makes Minimax faster by eliminating branches that don't matter:

```pseudocode
function minimax_alphaBeta(vertexBoard, depth, isMaximizing, alpha, beta, playerID):
  
  if depth == 0 OR noMovesAvailable(vertexBoard, playerID):
    return evaluateBoard(vertexBoard, playerID)
  
  if isMaximizing:
    maxScore = -∞
    for each validMove in getValidMoves(vertexBoard, playerID):
      newBoard = vertexBoard.copy()
      executeMove(newBoard, validMove, playerID)
      score = minimax_alphaBeta(newBoard, depth - 1, false, alpha, beta, playerID)
      maxScore = max(maxScore, score)
      alpha = max(alpha, maxScore)
      if beta <= alpha:
        break  // Prune this branch
    return maxScore
  
  else:
    minScore = +∞
    for each validMove in getValidMoves(vertexBoard, opponent):
      newBoard = vertexBoard.copy()
      executeMove(newBoard, validMove, opponent)
      score = minimax_alphaBeta(newBoard, depth - 1, true, alpha, beta, playerID)
      minScore = min(minScore, score)
      beta = min(beta, minScore)
      if beta <= alpha:
        break  // Prune this branch
    return minScore
```

### Step 6: Choose Your Move

```pseudocode
function chooseAIMove(vertexBoard, playerID):
  bestScore = -∞
  bestMove = null
  
  for each validMove in getValidMoves(vertexBoard, playerID):
    newBoard = vertexBoard.copy()
    executeMove(newBoard, validMove, playerID)
    score = minimax_alphaBeta(newBoard, 4, false, -∞, +∞, playerID)  // Depth = 4
    
    if score > bestScore:
      bestScore = score
      bestMove = validMove
  
  return bestMove
```

### Step 7: Integration Points

In `executor.js`, your AI will be called. You need to:

1. **Read the current board state** from `GEM_MANIFEST.vertexBoard`
2. **Call your minimax function** to get the best move
3. **Execute the move** by updating `GEM_MANIFEST.vertexBoard`
4. **Call the capture logic** from `rules.js` to flip opponent pieces
5. **Update the HUD** to reflect the new board state

---

## AI Strategy (Advanced Concepts)

### 1. **Difficulty Levels via Depth**
- Easy: `depth = 2` (looks only 2 moves ahead)
- Medium: `depth = 4` (looks 4 moves ahead)
- Hard: `depth = 6+` (computationally expensive but stronger)

### 2. **Opening Theory**
In classic Othello, opening moves matter. Precompute a small set of strong opening moves and use them:

```pseudocode
if moveCount < 5:  // First 5 moves
  return OPENING_MOVES[moveCount]  // Use pre-computed best moves
else:
  return minimax_choice(...)  // Switch to full AI
```

### 3. **Endgame Adjustment**
When few moves remain, increase depth to calculate exhaustively:

```pseudocode
if emptyVertices.length < 10:
  depth = 8  // Full calculation near the end
else:
  depth = 4  // Balanced play in mid-game
```

### 4. **Move Ordering for Better Pruning**
Sort moves by heuristic value before exploring them. This makes alpha-beta pruning more effective:

```pseudocode
validMoves.sort((a, b) => evaluateBoard(playMove(a)) - evaluateBoard(playMove(b)))
// Explore promising moves first
```

### 5. **Future: LLM Integration**

When cards and Compute Points are implemented, your AI can:

```pseudocode
function aiTurnWithCards(vertexBoard, hand, computePoints):
  
  // Option 1: Play a card action if strong
  if computePoints >= 10 AND hand contains powerful card:
    executeCard(hand[i])
    computePoints -= cost(hand[i])
  
  // Option 2: Make a normal move
  bestMove = minimax_choice(vertexBoard)
  
  // Option 3: Query LLM for novel strategies (future)
  if gameState.isNovelSituation():
    prompt = f"Board state: {vertexBoard}. Best move? Explain."
    llmResponse = callLLM(prompt)  // Could be Grok, Gemini, ChatGPT
    parsedMove = parseMove(llmResponse)
    return parsedMove
  
  return bestMove
```

### 6. **Building the ExplicitPrompt Dictionary**

As the AI plays and learns, store discovered strategies:

```javascript
// Example data structure (FORTH-like dictionary)
const ExplicitPrompts = {
  "control_poles": {
    condition: "early_game AND empty_poles",
    action: "prioritize_pole_vertices",
    reward: 50,
    timesUsed: 127,
    successRate: 0.78
  },
  "edge_capture": {
    condition: "opponent_has_edge_piece AND can_sandwich",
    action: "execute_long_line_capture",
    reward: 30,
    timesUsed: 312,
    successRate: 0.82
  },
  // ... grows over time as AI plays ...
};

// When choosing a move:
function aiChooseMoveWithLearning(vertexBoard):
  for each (strategyName, strategy) in ExplicitPrompts:
    if strategy.condition.evaluate(vertexBoard):
      move = strategy.action.execute(vertexBoard)
      if move.isValid():
        return move  // Use learned strategy
  
  // Fallback to minimax if no learned strategy applies
  return minimax_choice(vertexBoard)
```

---

## Flowcharts

### Game Flow Diagram
```
START
  ↓
INITIALIZE BOARD (162 empty vertices)
  ↓
PLAYER 1 (WHITE) TURN
  ↓
[Check Valid Moves?] → NO → SKIP TURN
  ↓ YES
[Human or AI?] → HUMAN → Wait for click
                 ↓
                AI → Calculate best move
  ↓
EXECUTE MOVE
  ↓
CHECK CAPTURES (via rules.js)
  ↓
FLIP OPPONENT PIECES
  ↓
UPDATE SCORE
  ↓
[All vertices filled?] → YES → END GAME, COUNT SCORES
  ↓ NO
PLAYER 2 (MAGENTA) TURN
  ↓
[Repeat same logic as PLAYER 1]
  ↓
[All vertices filled?] → YES → END GAME
  ↓ NO
Back to PLAYER 1 TURN
```

### AI Decision Flowchart
```
AI TURN STARTS
  ↓
GET VALID MOVES
  ↓
[Empty list?] → YES → SKIP TURN
  ↓ NO
INITIALIZE MINIMAX
  ↓
FOR EACH VALID MOVE
  ↓
[Depth reached?] → YES → EVALUATE BOARD HEURISTIC
  ↓ NO
SIMULATE MOVE
  ↓
CALL MINIMAX RECURSIVELY (opposite player's turn)
  ↓
[Alpha-Beta Pruning?] → YES → SKIP REMAINING BRANCHES
  ↓ NO
CALCULATE SCORE
  ↓
[Better than best so far?] → YES → UPDATE BEST_MOVE
  ↓ NO
NEXT MOVE
  ↓
ALL MOVES EVALUATED
  ↓
EXECUTE BEST_MOVE
  ↓
APPLY CAPTURE LOGIC
  ↓
RETURN TO GAME LOOP
```

### Data Structure: Board State
```
GEM_MANIFEST {
  vertexBoard: [0, 1, 2, 0, 1, ...],  // 162 elements
  metadata: {
    activePlayer: 1 or 2,
    frequency: 4,
    player1CP: 0,  // Compute Points (for future cards)
    player2CP: 0
  },
  vertices: [
    {id: 0, x, y, z, neighbors: [1, 3, 5, ...]},
    {id: 1, x, y, z, neighbors: [0, 2, 4, ...]},
    ...
  ]
}
```

---

## Future: Card System & ExplicitPrompt Actions

### What Are Compute Points?
Compute Points (CP) are a currency earned by controlling vertices. Players spend them to activate card effects that modify gameplay.

**Examples (future implementations):**
- Card: "ROTATE_R" → Costs 10 CP → Rotates the sphere right
- Card: "FLIP_LINE" → Costs 15 CP → Forces an extra capture
- Card: "SHIELD" → Costs 20 CP → Prevents one capture next turn
- Card: "PEEK" → Costs 5 CP → See 2 moves ahead (for human players)

### ExplicitPrompt Structure
```javascript
const ExplicitPrompts = {
  "ROTATE_R": {
    cost: 10,
    effect: "rotate_sphere('right')",
    implementation: () => state.rotY += 0.2,
    description: "Rotate sphere 20 degrees clockwise"
  },
  "CAPTURE_BOOST": {
    cost: 15,
    effect: "double_flip_range",
    implementation: (move) => captureDistance *= 2,
    description: "Next capture affects pieces 2 great circles away"
  },
  // ... grows as game is played and new strategies discovered ...
};
```

### AI Learning Loop (Future)
```
1. AI plays a move using current ExplicitPrompts
2. Game evaluates success/failure
3. If successful AND novel: ADD to ExplicitPrompts
4. If frequently used: INCREASE priority weight
5. If failing: DECREASE priority or REMOVE
6. Optional: Query LLM for explanation of why strategy worked
7. Store explanation in ExplicitPrompt.rationale
```

---

## Summary for Players & Developers

**For Humans:**
- Place pieces to sandwich opponent pieces along sphere lines
- Control corner positions for stability
- Count your vertices at the end to determine winner

**For AI Developers:**
- Implement valid move generator
- Build board evaluation function
- Use Minimax with Alpha-Beta Pruning
- Adjust depth for difficulty levels
- Prepare for future LLM + ExplicitPrompt integration

**Game End Condition:**
All 162 vertices are filled OR neither player can move

**Victory:**
Whoever owns more vertices (dots) wins!

---

*Last Updated: 2026-03-20*