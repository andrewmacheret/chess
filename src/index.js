import React from "react";
import ReactDOM from "react-dom/client";
import "./chess.css";

import { ChessGame } from "./components";

const root = ReactDOM.createRoot(document.getElementById("content"));
root.render(<ChessGame />);
