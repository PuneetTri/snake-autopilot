type BFSNode = {
  position: SnakeBlock;
  path: SnakeBlock[];
};

const bfs = (
  position: SnakeBlock,
  grid: string[][],
  gridSize: number,
  food: FoodBlock
): { path: SnakeBlock[]; visited: SnakeBlock[] } => {
  const visited = new Set<string>();
  const queue: BFSNode[] = [];

  queue.push({ position, path: [] });
  visited.add(`${position.posX}-${position.posY}`);
  while (queue.length > 0) {
    // Deconstruct and store the current position and path travelled so far, also remove the first element
    const { position: current, path } = queue.shift()!;

    // Check if reached the goal/food node
    if (current.posX === food.posX && current.posY === food.posY) {
      return {
        path: path,
        visited: getVisitedArray(visited, food),
      };
    }

    // To avoid redundant code
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

      // Visit only if the node is not out of bounds or if the newPos is in the way of biting the snake
      if (
        newPos.posX >= 0 &&
        newPos.posY >= 0 &&
        newPos.posX < gridSize &&
        newPos.posY < gridSize &&
        grid[newPos.posX][newPos.posY] !== "snake"
      ) {
        const key = `${newPos.posX}-${newPos.posY}`;

        // If the node is not already visited, add it to the queue
        if (!visited.has(key)) {
          queue.push({ position: newPos, path: [...path, newPos] }); // Add the path visited of current as well
          visited.add(`${newPos.posX}-${newPos.posY}`);
        }
      }
    });
  }

  return { path: [], visited: getVisitedArray(visited, food) }; // If there is no path to goal/food available
};

// Util function to convert visited set of strings to array of snakeBlock
const getVisitedArray = (visited: Set<string>, food: FoodBlock) => {
  const visitedArray: SnakeBlock[] = Array.from(visited)
    .map((position) => {
      const [x, y] = position.split("-"); // Split the string into x and y coordinates
      const visitedPos: SnakeBlock = { posX: Number(x), posY: Number(y) }; // Convert x and y to number

      return visitedPos;
    })
    .filter((visitedPos) => {
      // Filter out positions equal to the food position
      return !(visitedPos.posX === food.posX && visitedPos.posY === food.posY);
    });

  return visitedArray;
};

export default bfs;
