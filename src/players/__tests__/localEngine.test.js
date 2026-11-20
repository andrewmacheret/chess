import { afterEach, beforeEach, expect, test, vi } from "vitest";

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const afterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

class FakeWorker {
  static instances = [];
  constructor(url) {
    this.url = url;
    this.messages = [];
    this.terminated = false;
    FakeWorker.instances.push(this);
  }
  postMessage(message) {
    this.messages.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  reply(line) {
    this.onmessage({ data: line });
  }
}

let getLocalBestMove;

beforeEach(async () => {
  vi.useFakeTimers();
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  vi.resetModules();
  ({ getLocalBestMove } = await import("../localEngine"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("asks the worker for a move", async () => {
  const move = getLocalBestMove(startFen, 16);
  await vi.advanceTimersByTimeAsync(0);

  const [worker] = FakeWorker.instances;
  expect(worker.url).toMatch(/stockfish-19-lite-single\.js#.*stockfish-19-lite-single\.wasm/);
  expect(worker.messages).toEqual([
    "ucinewgame",
    `position fen ${startFen}`,
    "go depth 16 movetime 3000",
  ]);

  worker.reply("info depth 16 score cp 30 pv e2e4");
  worker.reply("bestmove e2e4 ponder e7e5");
  await expect(move).resolves.toBe("e2e4");
});

test("a newer request stops the old search and waits for it", async () => {
  const first = getLocalBestMove(startFen, 16);
  await vi.advanceTimersByTimeAsync(0);
  const second = getLocalBestMove(afterE4, 16);
  await vi.advanceTimersByTimeAsync(0);

  const [worker] = FakeWorker.instances;
  expect(worker.messages.at(-1)).toBe("stop");
  expect(worker.messages).not.toContain(`position fen ${afterE4}`);

  worker.reply("bestmove d2d4");
  await expect(first).resolves.toBe("d2d4");
  await vi.advanceTimersByTimeAsync(0);
  expect(worker.messages).toContain(`position fen ${afterE4}`);

  worker.reply("bestmove e7e5");
  await expect(second).resolves.toBe("e7e5");
});

test("starts a new worker when the old one stops answering", async () => {
  const move = getLocalBestMove(startFen, 16);
  const failed = expect(move).rejects.toThrow(/no move/);
  await vi.advanceTimersByTimeAsync(5000);
  await failed;
  expect(FakeWorker.instances[0].terminated).toBe(true);

  const retry = getLocalBestMove(startFen, 16);
  await vi.advanceTimersByTimeAsync(0);
  expect(FakeWorker.instances).toHaveLength(2);
  FakeWorker.instances[1].reply("bestmove e2e4");
  await expect(retry).resolves.toBe("e2e4");
});
