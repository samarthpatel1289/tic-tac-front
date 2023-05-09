import React, { useState, useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';
import confettiConfig from './confettiConfig';
import xtype from 'xtypejs'

import axios from 'axios';
import './App.css';


const TicTacToe = () => {
  const [game, setGame] = useState(null);
  const [moves, setMoves] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeTakeforAPI, settimeTakeforAPI] = useState(parseInt('10'));
  const [selectedOption, setSelectedOption] = useState('node');
  const initialGameState = {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    currentPlayer: 'X',
    status: 'in_progress',
  };
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const apiUrl = selectedOption === 'node'
  ? 'http://localhost:3000/games'
  : `http://localhost:8000/api/games`;

  const createGame = async () => {
    try {
      const startTime = window.performance.now();
      const response = await axios.post(`${apiUrl}/`, {
        player_x: 'Player X',
        player_o: 'Player O',
      });
      const endTime = window.performance.now();
      const timeTaken = Math.floor(endTime - startTime);
      settimeTakeforAPI(timeTaken);
      console.log(`Time taken: ${timeTaken}ms`);
      setGame(response.data);
    } catch (error) {
      setErrorMsg('An error occurred while creating the game.');
      console.error(error);
    }
  };

  useEffect(() => {
    createGame();
  }, []);

  const getGame = async (id) => {
    try {
      const startTime = window.performance.now();
      const response = await axios.get(`${apiUrl}/${id}`);
      const endTime = window.performance.now();
      const timeTaken = Math.floor(endTime - startTime);
      settimeTakeforAPI(timeTaken);
      console.log(`Time taken: ${timeTaken}ms`);
      setGame(response.data);
      setMoves(response.data.moves);
    } catch (error) {
      setErrorMsg('An error occurred while getting the game.');
      console.error(error);
    }
  };

  const makeMove = async (x, y) => {
    // Check if the move already exists
    const moveExists = moves.some(move => move.x === x && move.y === y);
    if (moveExists) {
      return;
    }
    try {
      const player = moves.length % 2 === 0 ? 'X' : 'O';
      const startTime = window.performance.now();
      const response = await axios.post(`${apiUrl}/${game.id}/moves/`, {
        player,
        x,
        y,
      });
      const endTime = window.performance.now();
      const timeTaken = Math.floor(endTime - startTime);
      settimeTakeforAPI(timeTaken);
      console.log(`Time taken: ${timeTaken}ms`);
      if (typeof response.data.move === 'object')
      {
        console.log("Yes It is a object")
      }
      else{
        console.log("I dont think so it is a object");
      }
      setMoves([...moves, response.data.move]);

      setGame(prevGame => ({
        ...prevGame,
        status: response.data.game_status,
      }));

    } catch (error) {
      setErrorMsg('An error occurred while making the move.');
      console.error(error);
    }
  };

  const renderCell = (row, col) => {
    const move = moves.find(move => move.x === row && move.y === col);
    const value = move ? move.player : '';
    return (
      <button className="cell" onClick={() => makeMove(row, col)}>
        {value}
      </button>
    );
  };

  const renderBoard = () => (
    <div className="board">
      <div className="row">
        {renderCell(0, 0)}
        {renderCell(0, 1)}
        {renderCell(0, 2)}
      </div>
      <div className="row">
        {renderCell(1, 0)}
        {renderCell(1, 1)}
        {renderCell(1, 2)}
      </div>
      <div className="row">
        {renderCell(2, 0)}
        {renderCell(2, 1)}
        {renderCell(2, 2)}
      </div>
    </div>
  );

  const handleRestart = () => {
    setGame(initialGameState);
    setMoves([]);
  };
  
  const handleScreenClick = () => {
    if (game && (game.status === 'won' || game.status === 'draw')) {
      createGame();
      handleRestart();
    }
  };
  
  useEffect(() => {
    if (game && (game.status === 'won' || game.status === 'draw')) {
      // Add event listener to document
      document.addEventListener('click', handleScreenClick);
  
      // Remove event listener on cleanup
      return () => {
        document.removeEventListener('click', handleScreenClick);
      };
    }
  }, [game]);
  

  const renderResult = () => {
    if (game && game.status === 'won') {
      const winner = moves.length % 2 === 1 ? 'Player X' : 'Player O';
      canvasConfetti(confettiConfig);
      return <div className="result">{winner} has won! </div>;
    } else if (game && game.status === 'draw') {
      return <div className="result">It's a draw!</div>;
    }
    return null;
  };
  

  return (
    <div className="tic-tac-toe">
      <div>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="node"
            checked={selectedOption === 'node'}
            onChange={handleOptionChange}
          />
          Node.js
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="python"
            checked={selectedOption === 'python'}
            onChange={handleOptionChange}
          />
          Python
        </label>
      </div>
      <div>
      <label style={{ marginLeft: '10px' }}>
        Api took {timeTakeforAPI}ms </label>
      </div>
      {game && (
        <div>
          {renderBoard()}
          {renderResult()}
        </div>
      )}
    </div>
  );
  
};

export default TicTacToe;
