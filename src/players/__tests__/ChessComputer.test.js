import { beforeEach, expect, test, vi } from "vitest";

import ChessComputer from "../ChessComputer";
import { getLocalBestMove } from "../localEngine";

vi.mock("../localEngine", () => ({
  getLocalBestMove: vi.fn(),
  preloadLocalEngine: vi.fn(),
}));
vi.mock("../../settings", () => ({ getSetting: async () => 16 }));

const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

test("turns the engine's move into squares", async () => {
  getLocalBestMove.mockResolvedValue("a7a8q");
  const move = await new ChessComputer().requestMove(fen);
  expect(move).toEqual({ source: "a7", target: "a8", promotion: "q" });
  expect(getLocalBestMove).toHaveBeenCalledWith(fen, 16);
});

test("retries when the engine fails", async () => {
  getLocalBestMove
    .mockRejectedValueOnce(new Error("worker broke"))
    .mockResolvedValue("e2e4");
  const move = await new ChessComputer().requestMove(fen);
  expect(move).toEqual({ source: "e2", target: "e4", promotion: "" });
  expect(getLocalBestMove).toHaveBeenCalledTimes(2);
});

test("returns nothing when there are no legal moves", async () => {
  getLocalBestMove.mockResolvedValue("(none)");
  expect(await new ChessComputer().requestMove(fen)).toBeUndefined();
});
