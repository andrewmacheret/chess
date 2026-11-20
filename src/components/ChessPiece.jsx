import React, { useEffect, useState } from "react";

export default function ChessPiece({
  draggable, // bool
  dragOffset, // {x, y} in pixels while this piece is being dragged

  pieceLetter, // string
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

  const classNames = ["piece", `piece-${pieceLetter}`];

  if (draggable) {
    classNames.push("piece-draggable");
  }

  var styles = {};
  if (dragOffset) {
    classNames.push("piece-dragging");
    styles.transform = `translate(${dragOffset.x}px, ${dragOffset.y}px)`;
  }
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

  return <div className={classNames.join(" ")} style={styles} />;
}
