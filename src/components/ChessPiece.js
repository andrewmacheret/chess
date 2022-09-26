import React, { useEffect, useState } from "react";

import { useDrag } from "react-dnd";

export default function ChessPiece({
  canMove, // function

  pieceLetter, // string
  originSquare, // string
  move, // ChessMove
  capture, // bool
  animate, // bool
}) {
  const [animated, setAnimated] = useState(false);
  const shouldAnimate = Boolean(animate && (move || capture));

  useEffect(() => {
    // if we rendered once with shouldAnimate=true, animated=false
    //   then render again with shouldAnimate=true, animated=true
    setAnimated(shouldAnimate);
  }, [animated, shouldAnimate]);

  const [{ isDragging, canDrag }, drag] = useDrag(() => {
    return {
      type: "piece",
      item: { originSquare, pieceLetter },
      canDrag: () => (canMove ? canMove(originSquare) : false),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        canDrag: monitor.canDrag(),
      }),
    };
  }, [canMove, originSquare, pieceLetter]);

  const classNames = ["piece", `piece-${pieceLetter}`];

  if (canDrag) {
    classNames.push("piece-draggable");
  }
  if (isDragging) {
    classNames.push("piece-dragging");
  }

  var styles = {};
  if (move) {
    classNames.push("last-move");

    if (shouldAnimate) {
      // artificially move the piece back from whence it came
      var dx = (move.source.columnNumber - move.target.columnNumber) * 100;
      var dy = (move.source.rowNumber - move.target.rowNumber) * 100;
      styles.left = dx + "%";
      styles.top = dy + "%";
    }
  }
  if (capture) {
    classNames.push("capture");
  }

  if (shouldAnimate) {
    classNames.push(!animated ? "animation-started" : "animation-ended");
  }

  return <div ref={drag} className={classNames.join(" ")} style={styles} />;
}
