import { fireEvent, render, screen } from "@testing-library/react";
import ChessBoard from "../ChessBoard";
import ChessHuman from "../../players/ChessHuman";

// a computer that never answers, so it stays the computer's turn
const slowComputer = {
  isHuman: () => false,
  requestMove: () => new Promise(() => {}),
};

function renderBoard(players = { w: new ChessHuman(), b: new ChessHuman() }) {
  const { container } = render(<ChessBoard players={players} newGame={() => {}} />);
  const square = (name) => container.querySelector(`.square-${name}`);
  const piece = (name) => square(name).querySelector(".piece");
  return { container, square, piece };
}

function click(element) {
  fireEvent.pointerDown(element);
  fireEvent.pointerUp(element);
}

// jsdom has no layout, so make the board a 400px square at the top left
function mockBoardLayout(container) {
  const squares = container.querySelector(".squares");
  squares.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 400, width: 400, height: 400 });
  Object.defineProperty(squares, "clientWidth", { value: 400 });
  Object.defineProperty(squares, "clientHeight", { value: 400 });
  return squares;
}

// centers of squares on the 400px board
const e2 = { clientX: 225, clientY: 325 };
const e4 = { clientX: 225, clientY: 225 };

test("selects a piece and shows where it can go", () => {
  const { square, piece } = renderBoard();
  click(piece("e2"));

  expect(square("e2")).toHaveClass("square-selected");
  expect(square("e3")).toHaveClass("square-droppable");
  expect(square("e4")).toHaveClass("square-droppable");
  expect(square("d3")).not.toHaveClass("square-droppable");
});

test("moves a piece by clicking it and then a target square", () => {
  const { square, piece } = renderBoard();
  click(piece("e2"));
  click(square("e4"));

  expect(piece("e2")).toBeNull();
  expect(piece("e4")).toHaveClass("piece-P");
  expect(square("e4")).not.toHaveClass("square-selected");
  expect(screen.getByText("Black to move")).toBeInTheDocument();
});

test("clicking another piece switches the selection", () => {
  const { square, piece } = renderBoard();
  click(piece("e2"));
  click(piece("g1"));

  expect(square("e2")).not.toHaveClass("square-selected");
  expect(square("g1")).toHaveClass("square-selected");
  expect(square("f3")).toHaveClass("square-droppable");
  expect(square("e4")).not.toHaveClass("square-droppable");
});

test("clicking the same piece or an illegal square clears the selection", () => {
  const { container, square, piece } = renderBoard();
  click(piece("e2"));
  click(piece("e2"));
  expect(container.querySelector(".square-selected")).toBeNull();

  click(piece("e2"));
  click(square("e5"));
  expect(container.querySelector(".square-selected")).toBeNull();
  expect(piece("e2")).toHaveClass("piece-P");
  expect(screen.getByText("White to move")).toBeInTheDocument();
});

test("can't select the other side's pieces", () => {
  const { container, piece } = renderBoard();
  click(piece("e7"));

  expect(container.querySelector(".square-selected")).toBeNull();
  expect(piece("e7")).not.toHaveClass("piece-draggable");
  expect(piece("e2")).toHaveClass("piece-draggable");
});

test("can't pick up pieces on the computer's turn", () => {
  const { container, piece } = renderBoard({ w: slowComputer, b: new ChessHuman() });
  click(piece("e2"));

  expect(container.querySelector(".square-selected")).toBeNull();
  expect(container.querySelector(".piece-draggable")).toBeNull();
});

test("drags a piece to a new square", () => {
  const { container, square, piece } = renderBoard();
  const squares = mockBoardLayout(container);

  fireEvent.pointerDown(piece("e2"), e2);
  fireEvent.pointerMove(squares, e4);
  expect(piece("e2")).toHaveClass("piece-dragging");
  expect(piece("e2").style.transform).toBe("translate(0px, -100px)");
  expect(square("e4")).toHaveClass("square-droppable", "square-over");

  fireEvent.pointerUp(squares, e4);
  expect(piece("e2")).toBeNull();
  expect(piece("e4")).toHaveClass("piece-P");
  expect(container.querySelector(".piece-dragging")).toBeNull();
  expect(screen.getByText("Black to move")).toBeInTheDocument();
});

test("a tiny pointer movement is a click, not a drag", () => {
  const { container, square, piece } = renderBoard();
  const squares = mockBoardLayout(container);

  fireEvent.pointerDown(piece("e2"), e2);
  fireEvent.pointerMove(squares, { clientX: 227, clientY: 327 });
  expect(container.querySelector(".piece-dragging")).toBeNull();

  fireEvent.pointerUp(squares, { clientX: 227, clientY: 327 });
  expect(square("e2")).toHaveClass("square-selected");
});

test("dropping off the board puts the piece back", () => {
  const { container, piece } = renderBoard();
  const squares = mockBoardLayout(container);

  fireEvent.pointerDown(piece("e2"), e2);
  fireEvent.pointerMove(squares, { clientX: 600, clientY: 600 });
  fireEvent.pointerUp(squares, { clientX: 600, clientY: 600 });

  expect(piece("e2")).toHaveClass("piece-P");
  expect(container.querySelector(".piece-dragging")).toBeNull();
  expect(screen.getByText("White to move")).toBeInTheDocument();
});

test("pointercancel ends the drag without moving", () => {
  const { container, piece } = renderBoard();
  const squares = mockBoardLayout(container);

  fireEvent.pointerDown(piece("e2"), e2);
  fireEvent.pointerMove(squares, e4);
  fireEvent.pointerCancel(squares, e4);
  fireEvent.pointerUp(squares, e4);

  expect(piece("e2")).toHaveClass("piece-P");
  expect(container.querySelector(".piece-dragging")).toBeNull();
  expect(screen.getByText("White to move")).toBeInTheDocument();
});
