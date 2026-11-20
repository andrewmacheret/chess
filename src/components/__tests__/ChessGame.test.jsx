import { fireEvent, render, screen } from "@testing-library/react";
import ChessGame from "../ChessGame";

test("shows a button for each kind of game", () => {
  render(<ChessGame />);
  expect(screen.getByRole("button", { name: "Player vs Player" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Player (white) vs AI" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Player (black) vs AI" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "AI vs AI" })).toBeInTheDocument();
});

test("starts a player vs player game", () => {
  const { container } = render(<ChessGame />);
  fireEvent.click(screen.getByRole("button", { name: "Player vs Player" }));

  expect(container.querySelectorAll(".square")).toHaveLength(64);
  expect(container.querySelectorAll(".squares .piece")).toHaveLength(32);
  expect(screen.getByText("White to move")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
});
