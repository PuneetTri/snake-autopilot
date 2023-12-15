const hamiltonian = (
  position: SnakeBlock,
  initialNode: SnakeBlock,
  gridSize: number,
  order: number[][],
  depth: number
): { pathFound: boolean; pathOrder: number[][] } => {
  // Check for the bounding function
  if (order[position.posX][position.posY] !== 0) {
    // If this is the case then the current position node has been already traversed
    return { pathFound: false, pathOrder: order };
  }

  // If all the nodes have been traversed
  if (depth === gridSize * gridSize) {
    // Check if the last node is adjacent to the initial node
    const isAdjacent =
      Math.abs(position.posX - initialNode.posX) +
        Math.abs(position.posY - initialNode.posY) ===
      1;

    return { pathFound: isAdjacent, pathOrder: order };
  }

  order[position.posX][position.posY] = depth; // Setting the current node as the next position for the hamiltonian cycle

  // Going right
  if (position.posY + 1 < gridSize) {
    const newPos: SnakeBlock = { posX: position.posX, posY: position.posY + 1 };
    const { pathFound, pathOrder } = hamiltonian(
      newPos,
      initialNode,
      gridSize,
      order,
      depth + 1
    );

    if (pathFound) {
      return { pathFound, pathOrder };
    }
  }

  // Going down
  if (position.posX + 1 < gridSize) {
    const newPos: SnakeBlock = { posX: position.posX + 1, posY: position.posY };
    const { pathFound, pathOrder } = hamiltonian(
      newPos,
      initialNode,
      gridSize,
      order,
      depth + 1
    );

    if (pathFound) {
      return { pathFound, pathOrder };
    }
  }

  // Going left
  if (position.posY - 1 >= 0) {
    const newPos: SnakeBlock = { posX: position.posX, posY: position.posY - 1 };
    const { pathFound, pathOrder } = hamiltonian(
      newPos,
      initialNode,
      gridSize,
      order,
      depth + 1
    );

    if (pathFound) {
      return { pathFound, pathOrder };
    }
  }

  // Going up
  if (position.posX - 1 >= 0) {
    const newPos: SnakeBlock = { posX: position.posX - 1, posY: position.posY };
    const { pathFound, pathOrder } = hamiltonian(
      newPos,
      initialNode,
      gridSize,
      order,
      depth + 1
    );

    if (pathFound) {
      return { pathFound, pathOrder };
    }
  }

  return { pathFound: false, pathOrder: order };
};

export default hamiltonian;
