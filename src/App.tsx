import { useEffect, useState } from "react";
import HeaderComponent from "./components/HeaderComponent";
import GridComponent from "./components/GridComponent";
import bfs from "./algorithms/bfs";
import aStar from "./algorithms/astar";
import hamiltonian from "./algorithms/hamiltonian";

import { MdAutoAwesome } from "react-icons/md";
import {
  FaRedo,
  FaPause,
  FaPlay,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import bestFirstSearch from "./algorithms/bestFirstSearch";

function App() {
  // Grid and other related states
  const [grid, setGrid] = useState<string[][]>([]);
  const [gridSize, setGridSize] = useState<number>(30);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [order, setOrder] = useState<number[][]>([]);
  const [showComputation, setShowComputation] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(
    window.localStorage.getItem("bestScore")
      ? Number(window.localStorage.getItem("bestScore"))
      : 0
  );
  const [bestAutoPilotScore, setBestAutoPilotScore] = useState<number>(
    window.localStorage.getItem("bestAutoPilotScore")
      ? Number(window.localStorage.getItem("bestAutoPilotScore"))
      : 0
  );

  // Snake and item states
  const [snake, setSnake] = useState<SnakeBlock[]>([
    { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) - 1 },
    { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) },
    { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) + 1 },
  ]);
  const [tail, setTail] = useState<SnakeBlock>();
  const [food, setFood] = useState<FoodBlock>({
    posX: Math.floor(Math.random() * gridSize - 1),
    posY: Math.floor(Math.random() * gridSize - 1),
  });
  const [path, setPath] = useState<SnakeBlock[]>([]);
  const [visited, setVisited] = useState<SnakeBlock[]>([]);

  // Game flow and related states
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isSnakeAlive, setIsSnakeAlive] = useState<boolean>(true);
  const [direction, setDirection] = useState<string>("left");
  const [speed, setSpeed] = useState<number>(25);
  const [difficulty, setDifficulty] = useState<string>("Easy");
  const [autoPilot, setautoPilot] = useState<boolean>(false);
  const [autoPilotUsed, setAutoPilotUsed] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<string>("Breadth First Search");
  const [description, setDescription] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [disableKeyPress, setDisableKeyPress] = useState<boolean>(false); // To solve button mashing bug

  const updateDifficulty = (speed: number) => {
    if (speed == 0) {
      setDifficulty("Very Easy");
    } else if (speed == 25) {
      setDifficulty("Easy");
    } else if (speed == 50) {
      setDifficulty("Medium");
    } else if (speed == 75) {
      setDifficulty("Hard");
    } else if (speed == 100) {
      setDifficulty("Inhuman");
    }

    setSpeed(speed);
  };

  // Update scores to local storage
  const updateScores = () => {
    const bestSc = window.localStorage.getItem("bestScore");
    const bestAutoPilotSc = window.localStorage.getItem("bestAutoPilotScore");

    if (bestSc == null)
      if (!autoPilotUsed)
        window.localStorage.setItem("bestScore", score.toString());
      else window.localStorage.setItem("bestAutoPilotScore", score.toString());
    else {
      if (!autoPilotUsed && Number(bestSc) < score) {
        window.localStorage.setItem("bestScore", score.toString());
      } else if (Number(bestAutoPilotSc) < score) {
        window.localStorage.setItem("bestAutoPilotScore", score.toString());
      }
    }
  };

  const moveSnake = () => {
    const movement: SnakeMovement = { x: 0, y: 0 };

    setDirection((prevDirection) => {
      switch (prevDirection) {
        case "up":
          movement.x = -1;
          break;
        case "down":
          movement.x = 1;
          break;
        case "left":
          movement.y = -1;
          break;
        case "right":
          movement.y = 1;
          break;
        default:
          break;
      }

      return prevDirection;
    });

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];

      const head = newSnake[0]; // Snake head block position is always == 0

      newSnake.unshift({
        posX: head.posX + movement.x,
        posY: head.posY + movement.y,
      });

      // Check if the snake has gone out of bounds
      if (
        newSnake[0].posX < 0 ||
        newSnake[0].posY < 0 ||
        newSnake[0].posX > gridSize - 1 ||
        newSnake[0].posY > gridSize - 1
      ) {
        console.log("Out of bounds");
        console.log(snake[0]);
        setIsGameRunning(false); // Stop the game immediately
        setIsSnakeAlive(false); // Set snake as dead
        updateScores();
        return newSnake.slice(1); // Remove the first out-of-bound element
      }

      // Check if the snake has bitten itself
      if (grid[newSnake[0].posX][newSnake[0].posY] === "snake") {
        console.log("Snake bites itself");
        console.log(snake[0]);
        setIsGameRunning(false); // Stop the game immediately
        setIsSnakeAlive(false); // Set snake as dead
        updateScores();
        return newSnake.slice(1); // Remove the first out-of-bound element
      }

      // Check if the snake has eaten food
      if (grid[newSnake[0].posX][newSnake[0].posY] === "food") {
        setScore((prevScore) => {
          const newScore = prevScore + 1;

          if (!autoPilotUsed && newScore > bestScore) {
            setBestScore(newScore);
          }

          if (autoPilot && newScore > bestAutoPilotScore) {
            setBestAutoPilotScore(newScore);
          }

          return newScore;
        });
        // Respawn food to a random location
        setFood(() => {
          let newPos = {
            posX: Math.floor(Math.random() * (gridSize - 1)),
            posY: Math.floor(Math.random() * (gridSize - 1)),
          };

          // Check if this pos is a unvisited node
          while (grid[newPos.posX][newPos.posY] !== "unvisited") {
            newPos = {
              posX: Math.floor(Math.random() * (gridSize - 1)),
              posY: Math.floor(Math.random() * (gridSize - 1)),
            };
          }

          return newPos;
        });

        newSnake.push(newSnake[newSnake.length - 1]);
      }

      // Set tail to be removed from the grid
      setTail(newSnake.pop()!);

      return newSnake;
    });
  };

  const getDirection = (
    position: SnakeBlock,
    nextPosition: SnakeBlock
  ): string => {
    if (
      position.posX > nextPosition.posX &&
      position.posY === nextPosition.posY
    ) {
      return "up";
    } else if (
      position.posX < nextPosition.posX &&
      position.posY === nextPosition.posY
    ) {
      return "down";
    } else if (
      position.posX === nextPosition.posX &&
      position.posY > nextPosition.posY
    ) {
      return "left";
    } else return "right";
  };

  useEffect(() => {
    // Set snake according to the new gridSize
    setSnake(() => {
      return [
        { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) - 1 },
        { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) },
        { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) + 1 },
      ];
    });

    // Respawn food according to the new gridSize
    if (!isInitialLoad) {
      setFood(() => {
        return {
          posX: Math.floor(Math.random() * gridSize - 1),
          posY: Math.floor(Math.random() * gridSize - 1),
        };
      });
    }

    setIsInitialLoad(false);

    // Compute hamiltonian cycle
    const initialOrder: number[][] = [];
    for (let i = 0; i < gridSize; ++i) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; ++j) {
        row.push(0);
      }
      initialOrder.push(row);
    }

    const initialPos: SnakeBlock = { posX: 0, posY: 0 };

    const { pathFound, pathOrder } = hamiltonian(
      initialPos,
      initialPos,
      gridSize,
      initialOrder,
      1
    );

    if (pathFound) {
      setOrder(pathOrder);
    }
  }, [gridSize]);

  useEffect(() => {
    switch (algorithm) {
      case "Breadth First Search":
        setDescription(
          "For the first rendition, used Breadth-First Search (BFS) for pathfinding between the snake and food. It mapped out shortest paths but also its computation grew hefty pretty quickly, especially on larger grids. Noticed performance issues due to this exhaustive exploration approach. Realised that there is a need for efficiency, leading to search other pathfinding algorithms that cut down on the unnecessary computations to improve perfomance. 🕹️🐍✨"
        );
        break;
      case "Best First Search":
        setDescription(
          "Recognizing the need for efficiency, switched to Best-First Search—a greedy algorithm, fastest compared to both of the other shortest path finding approaches. But the issue was the shortest path was not always optimal, snake often took longer paths to the goal. So next was to find an algorithm that balances efficiency and optimality. 🕹️🔍🚀"
        );
        break;
      case "A* Search":
        setDescription(
          "Transitioned to A* Search algprithm, the best solution out there to find the shortest path between two points. For this snake autopilot A* providied both efficiency and perfomance. For the most part it was doing a very well job to keep the snake alive for very long compared to a human. Despite this, it can't actually give a perfect game of snake. Over the time, working on this project I grew an obsession with always achieving a perfect score. So, I moved on to find something that can help me achieve exactly that. 🐍✨🏆🌟"
        );
        break;
      case "Hamiltonian Cycle":
        setDescription(
          "Later, I stumbled upon the Hamiltonian Cycle which with just one-time O(4^n) computation can actually result in a perfect game. However, it is painfully slow in visualizing the entire game as it follows the same path again and again often times without even the need. Once the cycle is calculated, it lazily follows the Hamiltonian cycle, which in turn ensures that the snake would never bite itself in its tail. Despite of the visualization issue, Hamiltonian cycle indeed results in a perfect game of snake. 🐍⚙️🏆🏁"
        );
        break;
    }
  }, [algorithm]);

  useEffect(() => {
    if (isGameRunning) {
      const intervalId = setInterval(() => {
        setDisableKeyPress(false); // Re-enable key once the grid is re-rendered therfore the next move

        // Get current snake state for every update
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          // Check if autoPilot is enabled
          if (autoPilot) {
            setAutoPilotUsed(true); // Set that user has used autopilot, update autopilot score only

            // Using prevFood state to get the current prevFood position instantly
            // If the code is BFS/A*
            if (
              algorithm === "Breadth First Search" ||
              algorithm === "Best First Search" ||
              algorithm === "A* Search"
            ) {
              // If algorithm is specifically BFS
              let path: SnakeBlock[] = [],
                visited: SnakeBlock[] = [];
              if (algorithm === "Breadth First Search") {
                const res = bfs(newSnake[0], grid, gridSize, food);

                path = res.path;
                visited = res.visited;
              } else if (algorithm === "Best First Search") {
                const res = bestFirstSearch(newSnake[0], grid, gridSize, food);

                path = res.path;
                visited = res.visited;
              } else {
                const res = aStar(newSnake[0], grid, gridSize, food);

                path = res.path;
                visited = res.visited;
              }

              if (path.length > 0) {
                const direction = getDirection(newSnake[0], path[0]);
                setDirection(direction);
              } else {
                let maxVisitedNodesByDirection: {
                  visited: SnakeBlock[];
                  direction: string;
                } = {
                  visited: [],
                  direction: "",
                };

                if (
                  newSnake[0].posX - 1 >= 0 &&
                  grid[newSnake[0].posX - 1][newSnake[0].posY] !== "snake" &&
                  direction !== "down"
                ) {
                  const { visited: visitedNodes } = bfs(
                    { posX: newSnake[0].posX - 1, posY: newSnake[0].posY },
                    grid,
                    gridSize,
                    food
                  );

                  if (
                    visitedNodes.length >
                    maxVisitedNodesByDirection.visited.length
                  ) {
                    maxVisitedNodesByDirection = {
                      visited: visitedNodes,
                      direction: "up",
                    };
                  }
                } else if (
                  newSnake[0].posX + 1 < gridSize &&
                  grid[newSnake[0].posX + 1][newSnake[0].posY] !== "snake" &&
                  direction !== "up"
                ) {
                  const { visited: visitedNodes } = bfs(
                    { posX: newSnake[0].posX + 1, posY: newSnake[0].posY },
                    grid,
                    gridSize,
                    food
                  );

                  if (
                    visitedNodes.length >
                    maxVisitedNodesByDirection.visited.length
                  ) {
                    maxVisitedNodesByDirection = {
                      visited: visitedNodes,
                      direction: "down",
                    };
                  }
                } else if (
                  newSnake[0].posY - 1 >= 0 &&
                  grid[newSnake[0].posX][newSnake[0].posY - 1] !== "snake" &&
                  direction !== "right"
                ) {
                  const { visited: visitedNodes } = bfs(
                    { posX: newSnake[0].posX, posY: newSnake[0].posY - 1 },
                    grid,
                    gridSize,
                    food
                  );

                  if (
                    visitedNodes.length >
                    maxVisitedNodesByDirection.visited.length
                  ) {
                    maxVisitedNodesByDirection = {
                      visited: visitedNodes,
                      direction: "left",
                    };
                  }
                } else if (
                  newSnake[0].posY + 1 < gridSize &&
                  grid[newSnake[0].posX][newSnake[0].posY - 1] !== "snake" &&
                  direction !== "left"
                ) {
                  const { visited: visitedNodes } = bfs(
                    { posX: newSnake[0].posX + 1, posY: newSnake[0].posY },
                    grid,
                    gridSize,
                    food
                  );

                  if (
                    visitedNodes.length >
                    maxVisitedNodesByDirection.visited.length
                  ) {
                    maxVisitedNodesByDirection = {
                      visited: visitedNodes,
                      direction: "right",
                    };
                  }
                }

                setDirection(maxVisitedNodesByDirection.direction);
              }

              setPath(path);
              setVisited(visited);
            } else {
              // If the algorithm is hamiltonian cycle
              // Edge case: Check if the hamiltonian cycle is computed or not
              if (order.length > 0) {
                // If the algorithm is hamiltonian cycle
                if (algorithm === "Hamiltonian Cycle") {
                  const newSnake = [...prevSnake];

                  const head = newSnake[0]; // Get head position of the snake

                  // Find the next number in the order the snake needs to move to
                  const nextOrder =
                    (order[head.posX][head.posY] + 1) % (gridSize * gridSize);

                  // Find what direction to move next by checking all the adjacent neighbours
                  if (
                    // Check for up direction, also check for out-of-bounds conditon
                    head.posX - 1 >= 0 &&
                    order[head.posX - 1][head.posY] === nextOrder
                  ) {
                    setDirection("up");
                  } else if (
                    // Check for down direction
                    head.posX + 1 < gridSize &&
                    order[head.posX + 1][head.posY] === nextOrder
                  ) {
                    setDirection("down");
                  } else if (
                    // Check for left direction
                    head.posY - 1 >= 0 &&
                    order[head.posX][head.posY - 1] === nextOrder
                  ) {
                    setDirection("left");
                  } else {
                    // Check for right direction
                    setDirection("right");
                  }
                }
              }
            }
          }

          moveSnake(); // Move snake to the next block
          return newSnake;
        });
      }, Math.abs(100 - speed));

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isGameRunning, direction, snake]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyPressed = event.key.toLowerCase();

      switch (keyPressed) {
        case "w":
          if (direction !== "up" && direction !== "down" && !disableKeyPress)
            setDirection("up");
          break;
        case "s":
          if (direction !== "down" && direction !== "up" && !disableKeyPress)
            setDirection("down");
          break;
        case "a":
          if (direction !== "left" && direction !== "right" && !disableKeyPress)
            setDirection("left");
          break;
        case "d":
          if (direction !== "right" && direction !== "left" && !disableKeyPress)
            setDirection("right");
          break;
        default:
          break;
      }

      setDisableKeyPress(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => removeEventListener("keydown", handleKeyDown);
  });

  const resetGame = () => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      snake.forEach(({ posX, posY }) => {
        newGrid[posX][posY] = "unvisited";
      });

      return newGrid;
    });

    setSnake([
      { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) - 1 },
      { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) },
      { posX: Math.floor(gridSize / 2), posY: Math.floor(gridSize / 2) + 1 },
    ]);

    setScore(0);
    setAutoPilotUsed(false);
    setIsSnakeAlive(true);
    setDirection("left");
  };

  return (
    <>
      <HeaderComponent
        score={score}
        bestScore={bestScore}
        bestAutoPilotScore={bestAutoPilotScore}
        isGameRunning={isGameRunning}
        isSnakeAlive={isSnakeAlive}
      />

      <div className="pt-16 lg:pb-0">
        <div className="m-4 block lg:hidden">
          <select
            value={algorithm}
            className="w-full outline-none text-3xl font-bold -mx-1"
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option>Breadth First Search</option>
            <option>Best First Search</option>
            <option>A* Search</option>
            <option>Hamiltonian Cycle</option>
          </select>
        </div>
      </div>

      <main className="flex flex-col space-y-4 p-4 lg:flex-row lg:space-y-0">
        <GridComponent
          grid={grid}
          setGrid={setGrid}
          gridSize={gridSize}
          showGrid={showGrid}
          snake={snake}
          tail={tail}
          food={food}
          path={path}
          visited={visited}
          order={order}
          showComputation={showComputation}
          algorithm={algorithm}
        />

        <div className="flex flex-col space-y-4 lg:w-1/2 pb-52 lg:pb-0 lg:px-24">
          <select
            value={algorithm}
            className="w-full outline-none text-3xl font-bold -mx-1 hidden lg:block"
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option>Breadth First Search</option>
            <option>Best First Search</option>
            <option>A* Search</option>
            <option>Hamiltonian Cycle</option>
          </select>

          <div>{description}</div>

          <div>
            <div className="flex flex-col">
              <label>
                Grid Size ({`${gridSize}x${gridSize}`}){" "}
                {gridSize > 25 && `May lag on few systems`}
              </label>
              <input
                type="range"
                min={10}
                max={50}
                step={10}
                value={gridSize}
                onChange={(e: any) =>
                  !isGameRunning && setGridSize(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col">
              <label>Difficulty: {difficulty}</label>

              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={speed}
                onChange={(e: any) => updateDifficulty(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-row space-x-2">
            <button
              onClick={() => setShowGrid((prevState) => !prevState)}
              className="w-full bg-blue-500 p-4 text-white rounded-lg"
            >
              {showGrid ? "Hide Grid" : "Show Grid"}
            </button>

            <button
              onClick={() => setShowComputation((prevState) => !prevState)}
              className="w-full bg-blue-500 p-4 text-white rounded-lg"
            >
              {showComputation ? "Hide Computation" : "Show Computation"}
            </button>
          </div>

          <div className="fixed lg:relative bottom-0 left-0 w-full bg-black bg-opacity-90 lg:bg-white">
            <div className="flex flex-row space-x-2 p-2 lg:p-0">
              <button
                className={`p-4 text-white rounded-lg ${
                  isSnakeAlive
                    ? isGameRunning
                      ? "bg-yellow-500"
                      : "bg-green-500"
                    : "bg-red-500"
                } flex flex-row items-center space-x-2 justify-center transition-all ${
                  isGameRunning ? "w-[12%]" : "w-[88%]"
                }`}
                onClick={() =>
                  isSnakeAlive
                    ? setIsGameRunning((prevState) => !prevState)
                    : resetGame()
                }
              >
                {isSnakeAlive ? (
                  isGameRunning ? (
                    <FaPause className="text-xl" />
                  ) : (
                    <FaPlay className="text-xl" />
                  )
                ) : (
                  <FaRedo className="text-xl" />
                )}

                {isSnakeAlive ? (
                  isGameRunning ? (
                    <></>
                  ) : (
                    <p>Play</p>
                  )
                ) : (
                  <p>Retry</p>
                )}
              </button>

              <button
                className={`p-4 text-white rounded-lg ${
                  autoPilot ? "bg-red-500" : "bg-green-500"
                } flex flex-row items-center space-x-2 justify-center transition-all ${
                  isGameRunning ? "w-[88%]" : "w-[12%]"
                }`}
                onClick={() => setautoPilot((prevState) => !prevState)}
              >
                <MdAutoAwesome className="text-xl" />

                {isGameRunning ? (
                  autoPilot ? (
                    <p>Disable AutoPilot</p>
                  ) : (
                    <p>Enable AutoPilot</p>
                  )
                ) : (
                  <></>
                )}
              </button>
            </div>
            <div className="flex flex-row justify-center lg:hidden items-center">
              <div>
                <button
                  onClick={() => {
                    if (direction !== "left" && direction !== "right") {
                      setDirection("left");
                      setDisableKeyPress(true);
                    }
                  }}
                  className="py-4 pl-4 text-white"
                >
                  <FaArrowLeft className="h-8 w-8" />
                </button>
              </div>

              <div className="flex flex-col space-y-10">
                <button
                  onClick={() => {
                    if (direction !== "up" && direction !== "down") {
                      setDirection("up");
                      setDisableKeyPress(true);
                    }
                  }}
                  className="px-4 pt-4 text-4xl text-white"
                >
                  <FaArrowUp className="h-8 w-8" />
                </button>

                <button
                  onClick={() => {
                    if (direction !== "down" && direction !== "up") {
                      setDirection("down");
                      setDisableKeyPress(true);
                    }
                  }}
                  className="px-4 pb-4 text-4xl text-white"
                >
                  <FaArrowDown className="h-8 w-8" />
                </button>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (direction !== "right" && direction !== "left") {
                      setDirection("right");
                      setDisableKeyPress(true);
                    }
                  }}
                  className="py-4 pr-4 text-4xl text-white"
                >
                  <FaArrowRight className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
