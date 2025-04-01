"use client"

import { useState, useEffect } from 'react';

export default function FoodMemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [score, setScore] = useState(0);
  
  const foodEmojis = [
    '🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥪', '🌮', 
    '🌯', '🥙', '🥗', '🍝', '🍜', '🍲', '🍛', '🍤',
    '🍣', '🍱', '🥟', '🍚', '🍘', '🍙', '🍠', '🍢',
    '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🍮', '🎂',
    '🍭', '🍬', '🍫', '🍩', '🍪', '🥠', '🍯', '🥛'
  ];
  
  const difficultyConfig = {
    easy: { pairs: 6, time: 120, gridCols: 3 },
    medium: { pairs: 8, time: 100, gridCols: 4 },
    hard: { pairs: 12, time: 80, gridCols: 4 }
  };
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, [difficulty]);
  
  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setGameOver(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);
  
  // Check if game is over
  useEffect(() => {
    if (solved.length > 0 && solved.length === cards.length / 2) {
      setIsActive(false);
      setGameOver(true);
      
      // Calculate score based on moves, time and difficulty
      const timeBonus = timer * 10;
      const movesPenalty = moves * 5;
      const difficultyMultiplier = 
        difficulty === 'easy' ? 1 : 
        difficulty === 'medium' ? 2 : 3;
      
      const calculatedScore = Math.max(
        0, 
        (1000 + timeBonus - movesPenalty) * difficultyMultiplier
      );
      
      setScore(calculatedScore);
    }
  }, [solved, cards, timer, moves, difficulty]);
  
  const resetGame = () => {
    const config = difficultyConfig[difficulty];
    
    // Randomly select food emojis based on difficulty
    const randomFoodEmojis = [...foodEmojis]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.pairs);
    
    // Create pairs of cards
    const cardPairs = [...randomFoodEmojis, ...randomFoodEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        content: emoji,
        flipped: false,
        solved: false
      }));
      
    setCards(cardPairs);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setTimer(config.time);
    setGameOver(false);
    setIsActive(false);
    setScore(0);
  };
  
  const handleCardClick = (id) => {
    // Start timer on first card click
    if (!isActive && !gameOver) {
      setIsActive(true);
    }
    
    // Don't allow clicks if game is over or more than 2 cards are flipped
    if (gameOver || flipped.length >= 2) return;
    
    // Don't allow clicking already flipped or solved cards
    if (flipped.includes(id) || solved.some(solvedId => solvedId === id)) return;
    
    // Flip the card
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // If two cards are flipped, check if they match
    if (newFlipped.length === 2) {
      setMoves(moves => moves + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard.content === secondCard.content) {
        // Cards match, mark as solved
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);
      } else {
        // Cards don't match, flip back after a short delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  return (
    <div className="game-container">
      <h1 className="game-title">Delicious Memory Game</h1>
      
      <div className="game-dashboard">
        <div className="dashboard-item">
          <div className="dashboard-label">Time</div>
          <div className="dashboard-value">{formatTime(timer)}</div>
        </div>
        
        <div className="dashboard-item">
          <div className="dashboard-label">Moves</div>
          <div className="dashboard-value">{moves}</div>
        </div>
        
        <div className="dashboard-item">
          <div className="dashboard-label">Pairs</div>
          <div className="dashboard-value">{solved.length} / {cards.length / 2}</div>
        </div>
      </div>
      
      <div className="difficulty-controls">
        <button 
          onClick={() => changeDifficulty('easy')}
          className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
        >
          Easy
        </button>
        <button 
          onClick={() => changeDifficulty('medium')}
          className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
        >
          Medium
        </button>
        <button 
          onClick={() => changeDifficulty('hard')}
          className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
        >
          Hard
        </button>
        
        <button onClick={resetGame} className="reset-button">
          Reset Game
        </button>
      </div>
      
      {gameOver && (
        <div className="game-result">
          {solved.length === cards.length / 2 ? (
            <div>
              <h2 className="win-message">🎉 Congratulations! You won! 🎉</h2>
              <div className="result-details">
                <p>Time remaining: {formatTime(timer)}</p>
                <p>Total moves: {moves}</p>
                <p className="score">Your score: {score} points</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="lose-message">⏰ Time's up! ⏰</h2>
              <p className="result-details">You found {solved.length} out of {cards.length / 2} pairs.</p>
            </div>
          )}
          <button onClick={resetGame} className="play-again-button">
            Play Again
          </button>
        </div>
      )}
      
      <div 
        className="game-board"
        style={{ 
          gridTemplateColumns: `repeat(${difficultyConfig[difficulty].gridCols}, 1fr)` 
        }}
      >
        {cards.map(card => (
          <div 
            key={card.id}
            className={`game-card ${flipped.includes(card.id) ? 'flipped' : ''} ${solved.includes(card.id) ? 'solved' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-back">
                <span>🍽️</span>
              </div>
              <div className="card-front">
                <span>{card.content}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="game-instructions">
        <h3>How to Play</h3>
        <p>Find all matching pairs of food emojis before the time runs out!</p>
      </div>
      
      <style jsx>{`
        .game-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        }
        
        .game-title {
          text-align: center;
          color: #e74c3c;
          font-size: 2.5rem;
          margin-bottom: 20px;
        }
        
        .game-dashboard {
          display: flex;
          justify-content: space-between;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 15px;
        }
        
        .dashboard-item {
          text-align: center;
          flex: 1;
        }
        
        .dashboard-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #7f8c8d;
          margin-bottom: 5px;
        }
        
        .dashboard-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .difficulty-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .difficulty-button {
          background-color: #f7f7f7;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .difficulty-button.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .reset-button {
          background-color: #e67e22;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 10px;
        }
        
        .reset-button:hover {
          background-color: #d35400;
        }
        
        .game-result {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          padding: 30px;
          text-align: center;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          width: 90%;
          max-width: 500px;
        }
        
        .win-message {
          color: #27ae60;
          font-size: 1.8rem;
          margin-bottom: 20px;
        }
        
        .lose-message {
          color: #e74c3c;
          font-size: 1.8rem;
          margin-bottom: 20px;
        }
        
        .result-details {
          margin-bottom: 20px;
          font-size: 1.1rem;
          color: #2c3e50;
        }
        
        .score {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 10px;
        }
        
        .play-again-button {
          background-color: #2ecc71;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .play-again-button:hover {
          background-color: #27ae60;
        }
        
        .game-board {
          display: grid;
          gap: 12px;
          margin-bottom: 30px;
        }
        
        .game-card {
          aspect-ratio: 1;
          cursor: pointer;
          perspective: 1000px;
        }
        
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .game-card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        
        .game-card.solved .card-inner {
          transform: rotateY(180deg);
          box-shadow: 0 0 0 3px #2ecc71;
        }
        
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card-front {
          background-color: white;
          transform: rotateY(180deg);
          font-size: 2.5rem;
        }
        
        .card-back {
          background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
          font-size: 2rem;
        }
        
        .game-instructions {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .game-instructions h3 {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .game-instructions p {
          color: #7f8c8d;
          margin: 0;
        }
        
        @media (max-width: 600px) {
          .game-title {
            font-size: 2rem;
          }
          
          .game-dashboard {
            flex-direction: column;
            gap: 10px;
          }
          
          .dashboard-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .dashboard-label {
            margin-bottom: 0;
          }
          
          .difficulty-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .reset-button {
            margin-left: 0;
            margin-top: 10px;
          }
          
          .card-front {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
  
  function changeDifficulty(level) {
    if (level !== difficulty) {
      setDifficulty(level);
    }
  }
}