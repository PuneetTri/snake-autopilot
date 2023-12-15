type AStarNode = {
  position: SnakeBlock;
  path: SnakeBlock[];
  cost: number; // Total cost, including both path cost and heuristic cost
};

class PriorityQueue<T> {
  private items: T[] = [];
  private compareFunction: (a: T, b: T) => number;

  constructor(compareFunction: (a: T, b: T) => number) {
    this.compareFunction = compareFunction;
  }

  enqueue(element: T): void {
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.compareFunction(element, this.items[i]) < 0) {
        this.items.splice(i, 0, element);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(element);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

const calculateHeuristic = (pos: SnakeBlock, food: FoodBlock) => {
  // Manhattan distance between current position and food
  return Math.abs(pos.posX - food.posX) + Math.abs(pos.posY - food.posY);
};

const aStar = (
  position: SnakeBlock,
  grid: string[][],
  gridSize: number,
  food: FoodBlock
): { path: SnakeBlock[]; visited: SnakeBlock[] } => {
  const visited = new Set<string>();
  const priorityQueue = new PriorityQueue<AStarNode>((a, b) => a.cost - b.cost);

  priorityQueue.enqueue({
    position,
    path: [],
    cost: 0 + calculateHeuristic(position, food),
  });

  visited.add(`${position.posX}-${position.posY}`);

  while (!priorityQueue.isEmpty()) {
    const { position: current, path } = priorityQueue.dequeue()!;

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
          const newPath = [...path, newPos];
          const newCost = path.length + 1 + calculateHeuristic(newPos, food);

          priorityQueue.enqueue({
            position: newPos,
            path: newPath,
            cost: newCost,
          });

          visited.add(key);
        }
      }
    });
  }

  return { path: [], visited: getVisitedArray(visited, food) };
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

export default aStar;
