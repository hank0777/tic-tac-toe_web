import './App.css';
import { useState } from 'react';

let winningArr = Array(3).fill(null);

function Square({value, onSquareClick, isWinning}) {
  return (
    <button className={"square" + (isWinning ? " winning" : "")} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({xIsNext, squares, onPlay}) {
  function handleClick(i) {
    if (isFullBoard(squares) || calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner === null && isFullBoard(squares)) {
    status = "Draw";
  } else if (winner) {
    status = winner + " wins!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return(
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map(row => {
        return(
          <div className="board-row" key={row}>
            {[0, 1, 2].map(col => {
              let i = 3 * row + col;
              return (
                <Square key={i} id={i} value={squares[i]} isWinning={winningArr.includes(i)} onSquareClick={()=>handleClick(i)} />
              );
            })
            }
          </div> 
        );   
      })
      } 
    </>
  );
}

function MultiPlayerButtons({isOnePlayerClicked, onMultiPlayerClick}) {
  return (
    <div className="player-number-row">
      <button className={"player-number" + (isOnePlayerClicked ? " clicked" : "")} onClick={()=>onMultiPlayerClick(true)}>{"One player"}</button>
      <button className={"player-number" + (isOnePlayerClicked ? "" : " clicked")} onClick={()=>onMultiPlayerClick(false)}>{"Two players"}</button>
    </div>
  );
}

function LevelButtons({difficultyLevel, onLevelButtonsClick}) {
  return (
    <div className="level-buttons">
      <button className={"difficulty-level" + (difficultyLevel===1 ? " clicked" : "")} onClick={()=>onLevelButtonsClick(1)}>{"Easy"}</button>
      <button className={"difficulty-level" + (difficultyLevel===2 ? " clicked" : "")} onClick={()=>onLevelButtonsClick(2)}>{"Medium"}</button>
      <button className={"difficulty-level" + (difficultyLevel===3 ? " clicked" : "")} onClick={()=>onLevelButtonsClick(3)}>{"Hard"}</button>
    </div>
  );
}

function MultiPlayer() {
  const [isOnePlayerClicked, setIsOnePlayerClicked] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  function handleMultiPlayerClick(value) {
    setIsOnePlayerClicked(value);
  }

  function handleLevelButtonsClick(value) {
    setDifficultyLevel(value);
  }
  
  if (isOnePlayerClicked) {
    return (
      <>
        <MultiPlayerButtons isOnePlayerClicked={isOnePlayerClicked} onMultiPlayerClick={handleMultiPlayerClick} />
        <div className="level-buttons">
          <LevelButtons difficultyLevel={difficultyLevel} onLevelButtonsClick={handleLevelButtonsClick} />
        </div>
      </>
    );
  }

  return (
    <>
      <MultiPlayerButtons isOnePlayer={isOnePlayerClicked} onMultiPlayerClick={handleMultiPlayerClick} />
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length-1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    winningArr = Array(3).fill(null);
  }

  const moves = history.map((squares, move)=>{
    let description;
    if (move > 0) {
      description = "Go to move # " + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={()=>jumpTo(move)}>{description}</button>
      </li>
    );
  });

  /* -1 is undo, 0 is restart, 1 is redo*/
  function moveTo(num) {
    if (num === 0) {
      setCurrentMove(0);
      setHistory([Array(9).fill(null)]);
    } else if (currentMove + num >= 0 && currentMove + num < history.length) {
      setCurrentMove(currentMove + num);
    }
    winningArr = Array(3).fill(null);
  }

  return (
    <div className="game">
      <header>{"Tic-Tac-Toe"}</header>
      <div className="select-player-number">
        <MultiPlayer />
      </div>
      <div className="move-button">
        <button onClick={()=>moveTo(0)}>{"Restart"}</button>
        <button onClick={()=>moveTo(-1)}>{"Undo"}</button>
        <button onClick={()=>moveTo(1)}>{"Redo"}</button>
      </div>
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

/* helper functions */
function calculateWinner(squares) {
  const winningRows = [
    [0, 1, 2],    // horizontal rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],    // vertical rows
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],    // diagonals
    [2, 4, 6]
  ];
  for (let i = 0; i < winningRows.length; i++) {
    const [a, b, c] = winningRows[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winningArr = winningRows[i];
      return squares[a];
    }
  }
  return null;
}

function isFullBoard(squares) {
  const nullSquares = squares.filter(i => i === null);
  if (nullSquares.length === 0) {
    return true;
  }
  return false;
}