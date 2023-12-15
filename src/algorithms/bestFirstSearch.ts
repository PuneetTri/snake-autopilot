type BFSNode = {
  position: SnakeBlock;
  path: SnakeBlock[];
  cost: number; // Cost including heuristic
};

const manhattanDistance = (a: SnakeBlock, b: SnakeBlock): number => {
  return Math.abs(a.posX - b.posX) + Math.abs(a.posY - b.posY);
};

const bestFirstSearch = (
  position: SnakeBlock,
  grid: string[][],
  gridSize: number,
  food: FoodBlock
): { path: SnakeBlock[]; visited: SnakeBlock[] } => {
  const visited = new Set<string>();
  const priorityQueue: BFSNode[] = [];

  const initialNode: BFSNode = {
    position,
    path: [],
    cost: manhattanDistance(position, food),
  };

  priorityQueue.push(initialNode);
  visited.add(`${position.posX}-${position.posY}`);

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.cost - b.cost); // Sort the queue based on cost

    const { position: current, path } = priorityQueue.shift()!;

    if (current.posX === food.posX && current.posY === food.posY) {
      return {
        path,
        visited: getVisitedArray(visited, food),
      };
    }

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    directions.forEach((direction) => {
      const newPos: SnakeBlock = {
        posX: current.posX + direction[0],
        posY: current.posY + direction[1],
      };

      if (
        newPos.posX >= 0 &&
        newPos.posY >= 0 &&
        newPos.posX < gridSize &&
        newPos.posY < gridSize &&
        grid[newPos.posX][newPos.posY] !== "snake"
      ) {
        const key = `${newPos.posX}-${newPos.posY}`;

        if (!visited.has(key)) {
          const newCost = manhattanDistance(newPos, food);

          priorityQueue.push({
            position: newPos,
            path: [...path, newPos],
            cost: newCost,
          });

          visited.add(key);
        }
      }
    });
  }

  return { path: [], visited: getVisitedArray(visited, food) };
};

// Util function to convert visited set of strings to an array of SnakeBlock
const getVisitedArray = (visited: Set<string>, food: FoodBlock) => {
  const visitedArray: SnakeBlock[] = Array.from(visited)
    .map((position) => {
      const [x, y] = position.split("-");
      const visitedPos: SnakeBlock = { posX: Number(x), posY: Number(y) };

      return visitedPos;
    })
    .filter(
      (visitedPos) =>
        !(visitedPos.posX === food.posX && visitedPos.posY === food.posY)
    );

  return visitedArray;
};

export default bestFirstSearch;
