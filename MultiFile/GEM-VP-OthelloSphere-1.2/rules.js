/**
 * RULES.JS - Independent Logic
 * No longer relies on global manifest to prevent ReferenceErrors.
 */
export function checkFlips(placedPointId, triangles, boardState) {
  const origin = triangles.find(t => t.id === placedPointId);
  const activeColor = boardState[placedPointId];
  const opponentColor = activeColor === 1 ? 2 : 1;

  // 6 Search directions (X, Y, Z axes)
  const directions = [
    {x:1, y:0, z:0}, {x:-1, y:0, z:0},
    {x:0, y:1, z:0}, {x:0, y:-1, z:0},
    {x:0, y:0, z:1}, {x:0, y:0, z:-1}
  ];

  directions.forEach(dir => {
    let path = [];
    for (let dist = 0.1; dist < 2.0; dist += 0.1) {
      const tx = origin.center.x + dir.x * dist;
      const ty = origin.center.y + dir.y * dist;
      const tz = origin.center.z + dir.z * dist;

      const found = triangles.find(t => {
        const d = Math.sqrt((t.center.x-tx)**2 + (t.center.y-ty)**2 + (t.center.z-tz)**2);
        return d < 0.15; 
      });

      if (!found) continue;
      if (path.includes(found.id)) continue;
      
      const state = boardState[found.id];
      if (state === 0) break; 
      if (state === opponentColor) {
        path.push(found.id);
      } else if (state === activeColor) {
        path.forEach(id => boardState[id] = activeColor);
        break;
      }
    }
  });
}