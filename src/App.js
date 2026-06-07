import './App.css';
import { useState, useEffect, useCallback } from 'react';

let winningArr = Array(3).fill(null);

function Square({value, onSquareClick, isWinning}) {
  return (
    <button className={"square" + (isWinning ? " winning" : "")} onClick={onSquareClick}>
      {value}
    </button>
  );
}

/* creates game board and checks for winner */
function Board({xIsNext, squares, onPlay, isOnePlayer, difficultyLevel}) {
  const winner = calculateWinner(squares, true);
  const fullBoard = isFullBoard(squares);
  
  const playMove = useCallback((i)=>{
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }, [squares, xIsNext, onPlay]);

  /* two players */
  function handleClick(i) {
    if (fullBoard || winner || squares[i]) {
      return null;
    }
    if (isOnePlayer && !xIsNext) {
      return null;
    }
    playMove(i);
  }

  /* one player */
  useEffect(()=>{
    if (isOnePlayer && !xIsNext && !winner && !fullBoard) {
      setTimeout(()=>{
        const move = computerMove(squares, difficultyLevel);
        playMove(move);
      }, 1000);
    }
  }, [isOnePlayer, xIsNext, winner, fullBoard, squares, difficultyLevel, playMove]);

  let status;
  if (winner === null && fullBoard) {
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

/* sets number of players and difficulty level */
function MultiPlayer({isOnePlayerClicked, onMultiPlayerClick, difficultyLevel, onLevelButtonsClick}) {
  if (isOnePlayerClicked) {
    return (
      <>
        <MultiPlayerButtons isOnePlayerClicked={isOnePlayerClicked} onMultiPlayerClick={onMultiPlayerClick} />
        <div className="level-buttons">
          <LevelButtons difficultyLevel={difficultyLevel} onLevelButtonsClick={onLevelButtonsClick} />
        </div>
      </>
    );
  }
  return (
    <>
      <MultiPlayerButtons isOnePlayerClicked={isOnePlayerClicked} onMultiPlayerClick={onMultiPlayerClick} />
    </>
  );
}

/* DEFAULT EXPORT FUNCTION */
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove]; /* most updated state of board */
  const [isOnePlayerClicked, setIsOnePlayerClicked] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length-1);
  }
  
  const winner = calculateWinner(currentSquares, true);
  const emptyBoard = isEmptyBoard(currentSquares);
  const fullBoard = isFullBoard(currentSquares);

  function handleMultiPlayerClick(value) {
    if (winner === null && !emptyBoard && !fullBoard) {
      return null;
    }
    moveTo(0);
    setIsOnePlayerClicked(value);
  }

  function handleLevelButtonsClick(value) {
    if (winner === null && !emptyBoard && !fullBoard) {
      return null;
    }
    moveTo(0);
    setDifficultyLevel(value);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    winningArr = Array(3).fill(null);
  }

  const moves = history.map((squares, move)=>{
    /* skips button to navigate to computer's move */
    const isLastMove = move === history.length - 1;
    if (isOnePlayerClicked && move % 2 === 1 && !isLastMove) {
      return null;
    }

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

  /* skips computer move when undo/redo clicked */
  let location = 1;
  if (isOnePlayerClicked) {
    if ((winner === null && !fullBoard) || winner === "O") {
      location = 2;
    }
  }

  /* -1 is undo, 0 is restart, 1 is redo */
  function moveTo(num) {
    if (isOnePlayerClicked && winner === null && !fullBoard && !xIsNext) {
      return null;
    }
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
        <MultiPlayer isOnePlayerClicked={isOnePlayerClicked} onMultiPlayerClick={handleMultiPlayerClick} difficultyLevel={difficultyLevel} onLevelButtonsClick={handleLevelButtonsClick}/>
      </div>
      <div className="move-button">
        <button onClick={()=>moveTo(0 * location)}>{"Restart"}</button>
        <button onClick={()=>moveTo(-1 * location)}>{"Undo"}</button>
        <button onClick={()=>moveTo(1 * location)}>{"Redo"}</button>
      </div>
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} isOnePlayer={isOnePlayerClicked} difficultyLevel={difficultyLevel} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

/* HELPER FUNCTIONS */

let winningRows = [
    [0, 1, 2],    // horizontal rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],    // vertical rows
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],    // diagonals
    [2, 4, 6]
];

/* finds winner and updates winningArr with winning line if highlightLine is true*/
function calculateWinner(squares, highlightLine) {
  for (let i = 0; i < winningRows.length; i++) {
    const [a, b, c] = winningRows[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      if (highlightLine) {
        winningArr = winningRows[i];
      }
      return squares[a];
    }
  }
  return null;
}

/* checks if board is full */
function isFullBoard(squares) {
  const nullSquares = squares.filter(i => i === null);
  if (nullSquares.length === 0) {
    return true;
  }
  return false;
}

/* checks if board is empty */
function isEmptyBoard(squares) {
  const nullSquares = squares.filter(i => i === null);
  if (nullSquares.length === squares.length) {
    return true;
  }
  return false;
}

/* COMPUTER MOVE LOGIC */
function computerMove(squares, difficultyLevel){
  /* returns winning move if possible */
  function makeWinningMove(squares) {
    for (let i = 0; i < winningRows.length; i++) {
      const [a, b, c] = winningRows[i];
      if (squares[a] === "O" && squares[a] === squares[b] && !squares[c]) {
        return c;
      } else if (squares[a]  === "O" && squares[a] === squares[c] && !squares[b]) {
        return b;
      } else if (!squares[a] && squares[b] === "O" && squares[b] === squares[c]) {
        return a;
      }
    }
    return null;
  }

  /* returns random move */
  function makeEasyMove(squares) {
    let openSquares = [];
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        openSquares.push(i);
      }
    }
    let index = Math.floor(Math.random() * openSquares.length);
    return openSquares[index];
  }

  /* blocks lines that are one move away from winning */
  function makeMediumMove(squares) {
    for (let i = 0; i < winningRows.length; i++) {
      const [a, b, c] = winningRows[i];
      if (squares[a] && squares[a] === squares[b] && !squares[c]) {
        return c;
      } else if (squares[a] && squares[a] === squares[c] && !squares[b]) {
        return b;
      } else if (!squares[a] && squares[b] && squares[b] === squares[c]) {
        return a;
      }
    }
    return null;
  }

  /* returns the value of squares,
  where isMax === true is the computer's turn */
  function minimax(squares, depth, isMax) {
    let newSquares = squares.slice();
    let winner = calculateWinner(squares, false);
    if (winner === "X") {
      return -10 + depth;
    }
    if (winner === "O") {
      return 10 - depth;
    } 
    if (isFullBoard(newSquares) && winner === null) {
      return 0;
    }
    
    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < newSquares.length; i++) {
        if (!newSquares[i]) {
          newSquares[i] = "O";
          best = Math.max(best, minimax(newSquares, depth + 1, !isMax));
          newSquares[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < newSquares.length; i++) {
        if (!newSquares[i]) {
          newSquares[i] = "X";
          best = Math.min(best, minimax(newSquares, depth + 1, !isMax));
          newSquares[i] = null;
        }
      }
      return best;
    }
  }

  function makeHardMove(squares) {
    let bestVal = -Infinity;
    let bestMove = -1;
    let newSquares = squares.slice();

    for (let i = 0; i < newSquares.length; i++) {
      if (!newSquares[i]) {
        newSquares[i] = "O";
        let moveVal = minimax(newSquares, 0, false);
        newSquares[i] = null;
        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  let winningMove = makeWinningMove(squares);
  if (winningMove != null) {
    return winningMove;
  }
  if (difficultyLevel === 1) {
    return makeEasyMove(squares);
  } else if (difficultyLevel === 2) {
    let mediumMove = makeMediumMove(squares);
    if (mediumMove != null) {
      return mediumMove;
    }
    return makeEasyMove(squares); /* maybe can move this back into makeMediumMove() */
  } else {
    return makeHardMove(squares);
  }
}