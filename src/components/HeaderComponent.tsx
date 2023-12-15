import { AiFillGithub } from "react-icons/ai";

type Props = {
  score: number;
  bestScore: number;
  bestAutoPilotScore: number;
  isGameRunning: boolean;
  isSnakeAlive: boolean;
};

const HeaderComponent = ({
  score,
  bestScore,
  bestAutoPilotScore,
  isGameRunning,
  isSnakeAlive,
}: Props) => {
  return (
    <>
      <header className="p-4 bg-blue-500 space-y-4 w-screen fixed">
        <div className="flex flex-row justify-between">
          <h1 className="text-xl font-bold">Snake Autopilot</h1>
          <button
            onClick={() =>
              window.open("https://github.com/PuneetTri/path-visualizer")
            }
          >
            <AiFillGithub className="w-8 h-8" />
          </button>
        </div>
      </header>

      <header
        className={`p-4 bg-green-500 space-y-4 w-screen fixed z-10 h-16 transition-all ${
          isGameRunning || !isSnakeAlive ? "mt-0" : "-mt-16"
        }`}
      >
        <div className="flex flex-row justify-center space-x-8">
          <h1 className="text-sm md:text-lg lg:text-xl font-bold">
            Score: {score}
          </h1>
          <h1 className="text-sm md:text-lg lg:text-xl font-bold">
            Your Best: {bestScore}
          </h1>
          <h1 className="text-sm md:text-lg lg:text-xl font-bold">
            Autopilot Best: {bestAutoPilotScore}
          </h1>
        </div>
      </header>
    </>
  );
};

export default HeaderComponent;
