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

export default function ChessGame() {
  const [players, setPlayers] = useState(null);

  const choosePlayers = useCallback((event) => {
    let target = event.target;
    while (target && target.tagName !== "BUTTON") target = target.parentNode; // 😮‍💨
    const index = Number(target.value);
    setPlayers(
      Object.fromEntries(
        Object.entries(playerChoices[index].players).map(([color, player]) => [
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

  return players ? (
    <ChessBoard players={players} newGame={newGame} />
  ) : (
    <div className="button-group">
      {playerChoices.map((choice, index) => (
        <button
          key={choice.name}
          className="player-choice"
          onClick={choosePlayers}
          value={index}
        >
          <div className={`piece piece-P piece-${choice.players.w}`} />
          vs
          <div className={`piece piece-p piece-${choice.players.b}`} />
        </button>
      ))}
    </div>
  );
}
