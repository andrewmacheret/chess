// Stockfish running in AWS Lambda (andrewmacheret/chess-server-lambda)

// returns a move like 'e2e4' or 'a7a8q', or '(none)' if there are no legal moves
export const getServerBestMove = async (movesUrl, fen, depth) => {
  const params = new URLSearchParams({ fen, ...(depth && { depth }) });
  const response = await fetch(`${movesUrl}?${params}`);
  const json = await response.json();
  if (!json?.bestmove) {
    throw new Error(`No move from the server: ${JSON.stringify(json)}`);
  }
  return json.bestmove;
};
