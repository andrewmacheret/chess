import { beforeEach, expect, test, vi } from "vitest";

import ChessComputer from "../ChessComputer";
import { getLocalBestMove } from "../localEngine";
import { getServerBestMove } from "../serverEngine";
import { getSetting } from "../../settings";

vi.mock("../localEngine", () => ({
  getLocalBestMove: vi.fn(),
  preloadLocalEngine: vi.fn(),
}));
vi.mock("../serverEngine", () => ({ getServerBestMove: vi.fn() }));
vi.mock("../../settings", () => ({ getSetting: vi.fn() }));

const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const movesUrl = "https://chess.example.com/moves";
let settings;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  settings = { engine: "local", movesUrl, depth: 16 };
  getSetting.mockImplementation(async (name) => settings[name]);
});

test("uses the local engine", async () => {
  getLocalBestMove.mockResolvedValue("a7a8q");
  const move = await new ChessComputer().requestMove(fen);
  expect(move).toEqual({ source: "a7", target: "a8", promotion: "q" });
  expect(getLocalBestMove).toHaveBeenCalledWith(fen, 16);
  expect(getServerBestMove).not.toHaveBeenCalled();
});

test("uses the server engine", async () => {
  settings.engine = "server";
  getServerBestMove.mockResolvedValue("e2e4");
  const move = await new ChessComputer().requestMove(fen);
  expect(move).toEqual({ source: "e2", target: "e4", promotion: "" });
  expect(getServerBestMove).toHaveBeenCalledWith(movesUrl, fen, 16);
  expect(getLocalBestMove).not.toHaveBeenCalled();
});

test("falls back to the server when the local engine fails", async () => {
  getLocalBestMove.mockRejectedValue(new Error("worker broke"));
  getServerBestMove.mockResolvedValue("e2e4");
  const move = await new ChessComputer().requestMove(fen);
  expect(move).toEqual({ source: "e2", target: "e4", promotion: "" });
});

test("returns nothing when there are no legal moves", async () => {
  getLocalBestMove.mockResolvedValue("(none)");
  expect(await new ChessComputer().requestMove(fen)).toBeUndefined();
});
