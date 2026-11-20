import { useDrop } from "react-dnd";

export default function ChessSquare({
  move, // function
  canMove, // function

  rowNumber, // number
  columnNumber, // number
  boardSize, // {width, height}
  name, // string

  children, // children
}) {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: "piece",
      drop: (item) => {
        window.setTimeout(() => move(item.originSquare, name), 1);
      },
      canDrop: (item) => canMove(item.originSquare, name),
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
    }),
    [canMove, move]
  );

  const color = (rowNumber + columnNumber) % 2 ? "black" : "white";

  const classNames = ["square", "square-" + color, `square-${name}`];
  if (canDrop) {
    classNames.push("square-droppable");
    if (isOver) {
      classNames.push("square-over");
    }
  }

  const widthPercent = 100 / boardSize.width;
  const heightPercent = 100 / boardSize.height;

  return (
    <div
      className={classNames.join(" ")}
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${widthPercent * columnNumber}%`,
        top: `${heightPercent * rowNumber}%`,
      }}
      ref={drop}
    >
      {children}
    </div>
  );
}
