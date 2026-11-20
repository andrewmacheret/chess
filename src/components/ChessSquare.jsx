export default function ChessSquare({
  droppable, // bool, the picked up or selected piece can move here
  over, // bool, a piece is being dragged over this square
  selected, // bool
  occupied, // bool

  rowNumber, // number
  columnNumber, // number
  boardSize, // {width, height}
  name, // string

  children, // children
}) {
  const color = (rowNumber + columnNumber) % 2 ? "black" : "white";

  const classNames = ["square", "square-" + color, `square-${name}`];
  if (selected) {
    classNames.push("square-selected");
  }
  if (droppable) {
    classNames.push("square-droppable");
    if (occupied) {
      classNames.push("square-occupied");
    }
    if (over) {
      classNames.push("square-over");
    }
  }

  const widthPercent = 100 / boardSize.width;
  const heightPercent = 100 / boardSize.height;

  return (
    <div
      className={classNames.join(" ")}
      data-square={name}
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${widthPercent * columnNumber}%`,
        top: `${heightPercent * rowNumber}%`,
      }}
    >
      {children}
    </div>
  );
}
