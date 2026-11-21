import React, { useCallback, useState } from "react";

import { ChessHuman, ChessComputer } from "../players";

import ChessBoard from "./ChessBoard";

const playerChoices = [
  {
    name: "Player vs Player",
    players: { w: "human", b: "human" },
  },
  {
    name: "Player (white) vs AI",
    players: { w: "human", b: "ai" },
  },
  {
    name: "Player (black) vs AI",
    players: { w: "ai", b: "human" },
  },
  {
    name: "AI vs AI",
    players: { w: "ai", b: "ai" },
  },
];

const playerLabels = { human: "Human", ai: "AI" };

function PlayerSide({ pieceLetter, player }) {
  return (
    <span className="player-side">
      <span className={`piece piece-${pieceLetter}`} />
      <span className="player-label">{playerLabels[player]}</span>
    </span>
  );
}

export default function ChessGame() {
  const [players, setPlayers] = useState(null);

  const choosePlayers = useCallback((choice) => {
    setPlayers(
      Object.fromEntries(
        Object.entries(choice.players).map(([color, player]) => [
          color,
          player === "human" ? new ChessHuman() : new ChessComputer(),
        ])
      )
    );
  }, []);

  const newGame = useCallback(() => {
    if (window.confirm("Are you sure you want to start a new game?")) {
      setPlayers(null);
    }
  }, []);

  return (
    <main className="app">
      <h1 className="app-title">Chess</h1>
      {players ? (
        <ChessBoard players={players} newGame={newGame} />
      ) : (
        <>
          <p className="app-subtitle">Who's playing?</p>
          <div className="player-choices">
            {playerChoices.map((choice) => (
              <button
                key={choice.name}
                className="player-choice"
                onClick={() => choosePlayers(choice)}
                aria-label={choice.name}
              >
                <PlayerSide pieceLetter="P" player={choice.players.w} />
                <span className="player-vs">vs</span>
                <PlayerSide pieceLetter="p" player={choice.players.b} />
              </button>
            ))}
          </div>
        </>
      )}
      <footer className="app-footer">
        <a href="https://andrewmacheret.com/">More projects</a>
        <span aria-hidden="true">·</span>
        <span>
          AI by{" "}
          <a href="https://github.com/nmrugg/stockfish.js">Stockfish</a>{" "}
          (<a href="https://github.com/nmrugg/stockfish.js/blob/master/Copying.txt">GPL-3.0</a>)
        </span>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/andrewmacheret/chess">Source</a>
      </footer>
    </main>
  );
}
