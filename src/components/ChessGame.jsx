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
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="https://andrewmacheret.com/">
              <img src="https://andrewmacheret.com/favicon.svg" alt="" width="14" height="14" />
              andrewmacheret.com
            </a>
          </li>
          <li aria-current="page">Chess</li>
        </ol>
      </nav>
      <header className="header">
        <div>
          <h1>Chess</h1>
          <p>Play a friend, or Stockfish running right in your browser.</p>
        </div>
      </header>
      {players ? (
        <section className="stage">
          <ChessBoard players={players} newGame={newGame} />
        </section>
      ) : (
        <section className="stage picker" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="section-head">Who's playing?</h2>
          <div className="player-choices">
            {playerChoices.map((choice) => (
              <button
                key={choice.name}
                className="control player-choice"
                onClick={() => choosePlayers(choice)}
                aria-label={choice.name}
              >
                <PlayerSide pieceLetter="P" player={choice.players.w} />
                <span className="player-vs">vs</span>
                <PlayerSide pieceLetter="p" player={choice.players.b} />
              </button>
            ))}
          </div>
        </section>
      )}
      <footer className="footer">
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
