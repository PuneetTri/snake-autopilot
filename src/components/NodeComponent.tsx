type Props = {
  type: string;
  showGrid: boolean;
  orderNumber: number;
  showComputation: boolean;
  algorithm: string;
};

function NodeComponent({
  type,
  showGrid,
  orderNumber,
  showComputation,
  algorithm,
}: Props) {
  const gridVisibility = showGrid ? "border-black" : "border-white";

  switch (type) {
    case "unvisited":
      return (
        <div
          className={`border-[1px] ${gridVisibility} bg-white flex items-center justify-center`}
        >
          <p className="text-[0.4rem]">
            {algorithm === "Hamiltonian Cycle" &&
              showComputation &&
              orderNumber}
          </p>
        </div>
      );
    case "snake":
      return <div className={`border-[1px] ${gridVisibility} bg-black`}></div>;
    case "food":
      return (
        <div className={`border-[1px] ${gridVisibility} bg-red-500`}></div>
      );
    case "visited":
      return (
        <div className={`border-[1px] ${gridVisibility} bg-gray-500`}></div>
      );
    case "path":
      return (
        <div className={`border-[1px] ${gridVisibility} bg-yellow-500`}></div>
      );
  }
}

export default NodeComponent;
