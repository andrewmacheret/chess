import React from "react";
import ReactDOM from "react-dom/client";
import "./chess.css";

import { ChessGame } from "./components";
import { preloadEngine } from "./players";

const root = ReactDOM.createRoot(document.getElementById("content"));
root.render(<ChessGame />);

// download the chess engine in the background once the page has loaded
window.addEventListener("load", () => {
  preloadEngine().catch((err) => console.error(err));
});
