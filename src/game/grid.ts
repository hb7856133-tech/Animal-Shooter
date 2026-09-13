import { AnimalType, GridPiece, HexCoord } from '../types';

export const HEX_SQRT3 = Math.sqrt(3);
export const GRID_MAX_ROWS = 24;

/**
 * Calculates world (x, y) coordinates for a hexagonal grid cell.
 */
export function getHexPosition(
  row: number,
  col: number,
  radius: number,
  stageWidth: number,
  cols: number,
  startY: number = 48
): { x: number; y: number } {
  const rowHeight = radius * HEX_SQRT3;
  const isOdd = row % 2 !== 0;

  // Center the grid horizontally
  const totalWidth = cols * (radius * 2);
  const startX = (stageWidth - totalWidth) / 2 + radius;

  const x = isOdd ? startX + radius + col * (radius * 2) : startX + col * (radius * 2);
  const y = startY + row * rowHeight;

  return { x, y };
}

/**
 * Gets valid adjacent neighbor hex coordinates for a given cell.
 */
export function getNeighbors(
  row: number,
  col: number,
  maxRows: number,
  cols: number
): HexCoord[] {
  const neighbors: HexCoord[] = [];
  const isOdd = row % 2 !== 0;

  // Horizontal neighbors
  const leftCol = col - 1;
  const rightCol = col + 1;
  const maxColsInRow = isOdd ? cols - 1 : cols;

  if (leftCol >= 0) neighbors.push({ row, col: leftCol });
  if (rightCol < maxColsInRow) neighbors.push({ row, col: rightCol });

  // Vertical neighbors
  const topRow = row - 1;
  const bottomRow = row + 1;

  if (isOdd) {
    // Odd row: Top and Bottom are Even rows (having `cols` items)
    const evenCols = cols;
    if (topRow >= 0) {
      if (col >= 0 && col < evenCols) neighbors.push({ row: topRow, col });
      if (col + 1 >= 0 && col + 1 < evenCols) neighbors.push({ row: topRow, col: col + 1 });
    }
    if (bottomRow < maxRows) {
      if (col >= 0 && col < evenCols) neighbors.push({ row: bottomRow, col });
      if (col + 1 >= 0 && col + 1 < evenCols) neighbors.push({ row: bottomRow, col: col + 1 });
    }
  } else {
    // Even row: Top and Bottom are Odd rows (having `cols - 1` items)
    const oddCols = cols - 1;
    if (topRow >= 0) {
      if (col - 1 >= 0 && col - 1 < oddCols) neighbors.push({ row: topRow, col: col - 1 });
      if (col >= 0 && col < oddCols) neighbors.push({ row: topRow, col });
    }
    if (bottomRow < maxRows) {
      if (col - 1 >= 0 && col - 1 < oddCols) neighbors.push({ row: bottomRow, col: col - 1 });
      if (col >= 0 && col < oddCols) neighbors.push({ row: bottomRow, col });
    }
  }

  return neighbors;
}

/**
 * Finds the exact closest vacant neighbor slot to attach a projectile after collision.
 */
export function findBestAttachmentSlot(
  px: number,
  py: number,
  hitRow: number,
  hitCol: number,
  grid: (GridPiece | null)[][],
  radius: number,
  stageWidth: number,
  cols: number,
  maxRows: number = GRID_MAX_ROWS,
  startY: number = 48
): HexCoord | null {
  // 1. Direct hit on a specific piece: attach to that piece's closest vacant neighbor!
  if (hitRow >= 0 && hitCol >= 0 && hitRow < maxRows && grid[hitRow]?.[hitCol]) {
    const neighbors = getNeighbors(hitRow, hitCol, maxRows, cols);
    let bestCoord: HexCoord | null = null;
    let minDist = Infinity;

    for (const n of neighbors) {
      if (n.row < maxRows && n.col >= 0 && (!grid[n.row] || !grid[n.row][n.col])) {
        const { x, y } = getHexPosition(n.row, n.col, radius, stageWidth, cols, startY);
        const dist = Math.hypot(px - x, py - y);
        if (dist < minDist) {
          minDist = dist;
          bestCoord = { row: n.row, col: n.col };
        }
      }
    }

    if (bestCoord) {
      return bestCoord;
    }
  }

  // 2. Collision with ceiling (row 0)
  if (py <= startY + radius * 1.5) {
    let bestCol = -1;
    let minDist = Infinity;
    for (let c = 0; c < cols; c++) {
      if (!grid[0]?.[c]) {
        const { x, y } = getHexPosition(0, c, radius, stageWidth, cols, startY);
        const dist = Math.hypot(px - x, py - y);
        if (dist < minDist) {
          minDist = dist;
          bestCol = c;
        }
      }
    }
    if (bestCol !== -1) {
      return { row: 0, col: bestCol };
    }
  }

  // 3. Fallback: search vacant neighbors of all active pieces closest to (px, py)
  let bestCoord: HexCoord | null = null;
  let minDist = Infinity;

  for (let r = 0; r < maxRows; r++) {
    if (!grid[r]) continue;
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    for (let c = 0; c < rowCols; c++) {
      if (grid[r][c]) {
        const nbrs = getNeighbors(r, c, maxRows, cols);
        for (const n of nbrs) {
          if (n.row < maxRows && (!grid[n.row] || !grid[n.row][n.col])) {
            const { x, y } = getHexPosition(n.row, n.col, radius, stageWidth, cols, startY);
            const dist = Math.hypot(px - x, py - y);
            if (dist < minDist) {
              minDist = dist;
              bestCoord = { row: n.row, col: n.col };
            }
          }
        }
      }
    }
  }

  return bestCoord;
}

/**
 * Flood-fills to find all connected matching animals of the same group.
 * If target is Rainbow, it matches whichever adjacent animal group is formed.
 */
export function findConnectedCluster(
  grid: (GridPiece | null)[][],
  startRow: number,
  startCol: number,
  targetType: AnimalType,
  maxRows: number = GRID_MAX_ROWS,
  cols: number = 11
): HexCoord[] {
  // If targetType is Rainbow, check all adjacent animal groups and find the largest matching group
  if (targetType === 'rainbow') {
    const neighbors = getNeighbors(startRow, startCol, maxRows, cols);
    let bestCluster: HexCoord[] = [{ row: startRow, col: startCol }];

    for (const n of neighbors) {
      const neighborPiece = grid[n.row]?.[n.col];
      if (
        neighborPiece &&
        neighborPiece.type !== 'rock' &&
        neighborPiece.type !== 'bomb' &&
        neighborPiece.type !== 'rainbow'
      ) {
        const cluster = findClusterForType(grid, startRow, startCol, neighborPiece.type, maxRows, cols);
        if (cluster.length > bestCluster.length) {
          bestCluster = cluster;
        }
      }
    }

    return bestCluster;
  }

  return findClusterForType(grid, startRow, startCol, targetType, maxRows, cols);
}

function findClusterForType(
  grid: (GridPiece | null)[][],
  startRow: number,
  startCol: number,
  targetType: AnimalType,
  maxRows: number,
  cols: number
): HexCoord[] {
  const visited: boolean[][] = Array.from({ length: maxRows }, (_, r) => {
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    return Array(rowCols).fill(false);
  });

  const cluster: HexCoord[] = [];
  const queue: HexCoord[] = [{ row: startRow, col: startCol }];
  visited[startRow][startCol] = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    cluster.push(curr);

    const neighbors = getNeighbors(curr.row, curr.col, maxRows, cols);
    for (const n of neighbors) {
      if (n.row < maxRows && !visited[n.row][n.col]) {
        const neighborPiece = grid[n.row]?.[n.col];
        if (neighborPiece) {
          const isMatch =
            neighborPiece.type === targetType ||
            neighborPiece.type === 'rainbow';

          if (isMatch && neighborPiece.type !== 'rock' && neighborPiece.type !== 'bomb') {
            visited[n.row][n.col] = true;
            queue.push(n);
          }
        }
      }
    }
  }

  return cluster;
}

/**
 * Finds all pieces in blast radius for a Bomb piece.
 */
export function findBombCluster(
  grid: (GridPiece | null)[][],
  centerRow: number,
  centerCol: number,
  maxRows: number = GRID_MAX_ROWS,
  cols: number = 11
): HexCoord[] {
  const cluster: HexCoord[] = [{ row: centerRow, col: centerCol }];
  const neighbors = getNeighbors(centerRow, centerCol, maxRows, cols);

  for (const n of neighbors) {
    if (grid[n.row]?.[n.col]) {
      cluster.push(n);
      const secondNeighbors = getNeighbors(n.row, n.col, maxRows, cols);
      for (const sn of secondNeighbors) {
        if (
          grid[sn.row]?.[sn.col] &&
          !cluster.some((c) => c.row === sn.row && c.col === sn.col)
        ) {
          cluster.push(sn);
        }
      }
    }
  }

  return cluster;
}

/**
 * Finds all disconnected floating pieces that are no longer anchored to the top ceiling (row 0).
 */
export function findFloatingPieces(
  grid: (GridPiece | null)[][],
  maxRows: number = GRID_MAX_ROWS,
  cols: number = 11
): HexCoord[] {
  const visited: boolean[][] = Array.from({ length: maxRows }, (_, r) => {
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    return Array(rowCols).fill(false);
  });

  const queue: HexCoord[] = [];

  // Seed BFS with all active pieces in row 0 (the anchor ceiling)
  for (let c = 0; c < cols; c++) {
    if (grid[0]?.[c]) {
      visited[0][c] = true;
      queue.push({ row: 0, col: c });
    }
  }

  // Traverse through all connected pieces
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getNeighbors(curr.row, curr.col, maxRows, cols);

    for (const n of neighbors) {
      if (n.row < maxRows && !visited[n.row][n.col] && grid[n.row]?.[n.col]) {
        visited[n.row][n.col] = true;
        queue.push(n);
      }
    }
  }

  // Any active piece not visited is detached and floating!
  const floating: HexCoord[] = [];
  for (let r = 0; r < maxRows; r++) {
    if (!grid[r]) continue;
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    for (let c = 0; c < rowCols; c++) {
      if (grid[r][c] && !visited[r][c]) {
        floating.push({ row: r, col: c });
      }
    }
  }

  return floating;
}
