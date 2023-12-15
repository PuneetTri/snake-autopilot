import { useEffect } from "react";
import NodeComponent from "./NodeComponent";

type Props = {
  grid: string[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  gridSize: number;
  showGrid: boolean;
  snake: SnakeBlock[];
  tail: SnakeBlock | undefined;
  food: FoodBlock;
  path: SnakeBlock[];
  visited: SnakeBlock[];
  order: number[][];
  showComputation: boolean;
  algorithm: string;
};

function GridComponent({
  grid,
  setGrid,
  gridSize,
  showGrid,
  snake,
  tail,
  food,
  path,
  visited,
  order,
  showComputation,
  algorithm,
}: Props) {
  // Resize the grid to fit the screen
  useEffect(() => {
    const handleResize = () => {
      const grid = document.getElementById("grid");
      const headerHeight = 100; // Header is rough;y 100px, so therfore the space
      const padding = 16; // Addition 1 rem padding

      // Resize the gird based on the window size
      if (grid) {
        const windowHeight = window.innerHeight;
        const availableHeight = windowHeight - headerHeight - 2 * padding;

        const size = Math.min(availableHeight, window.innerWidth - 2 * padding);

        grid.style.width = `${size}px`;
        grid.style.height = `${size}px`;
      }
    };

    handleResize();

    // Add event listener to resize the grid when the window is resized
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Insert the nodes into the grid based on the grid size
  useEffect(() => {
    const temp = [];

    // Resize the grid based on the new grid size
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        row.push("unvisited");
      }
      temp.push(row);
    }

    setGrid(temp);
  }, [gridSize]);

  // Update snake blocks in the grid
  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      snake.forEach(({ posX, posY }) => {
        newGrid[posX][posY] = "snake";
      });

      if (tail !== undefined) newGrid[tail.posX][tail.posY] = "unvisited";

      return newGrid;
    });
  }, [snake]);

  // Update food block in the grid
  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      const { posX, posY } = food;
      newGrid[posX][posY] = "food";

      return newGrid;
    });
  }, [food]);

  const clearGrid = () => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      newGrid.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          if (
            newGrid[rowIndex][colIndex] === "visited" ||
            newGrid[rowIndex][colIndex] === "path"
          ) {
            newGrid[rowIndex][colIndex] = "unvisited";
          }
        });
      });

      return newGrid;
    });
  };

  // Update visited, path block in the grid
  useEffect(() => {
    clearGrid();

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      visited.forEach((position) => {
        if (
          newGrid[position.posX][position.posY] !== "snake" &&
          newGrid[position.posX][position.posY] !== "food"
        )
          if (showComputation)
            newGrid[position.posX][position.posY] = "visited";
      });

      path.forEach((position) => {
        if (
          newGrid[position.posX][position.posY] !== "snake" &&
          newGrid[position.posX][position.posY] !== "food"
        )
          if (showComputation) newGrid[position.posX][position.posY] = "path";
      });

      return newGrid;
    });
  }, [path, visited]);

  return (
    <div className="lg:w-1/2 flex flex-col justify-center items-start">
      <div
        id="grid"
        style={{
          display: "grid",
          // Create a grid of size gridSize x gridSize, therfore the rows and columns are repeated
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
        className={`border-[1px] border-black grid-rows-5 self-center`}
      >
        {grid.map((row, rowIndex: number) =>
          row.map((type, colIndex: number) => (
            <NodeComponent
              type={type}
              key={`${rowIndex}-${colIndex}`}
              showGrid={showGrid}
              orderNumber={order[rowIndex][colIndex]}
              showComputation={showComputation}
              algorithm={algorithm}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default GridComponent;
