"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

export default function FoodMemoryGame() {
  // All the existing state variables remain the same
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [theme, setTheme] = useState('food'); // food, animals, sports, etc.
  const [showHint, setShowHint] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [comboCounter, setComboCounter] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // Sound refs remain the same
  const flipSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const victorySoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);
  
  // Theme emojis and difficulty config remain the same
  const themeEmojis = {
    food: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥪', '🌮', 
      '🌯', '🥙', '🥗', '🍝', '🍜', '🍲', '🍛', '🍤',
      '🍣', '🍱', '🥟', '🍚', '🍘', '🍙', '🍠', '🍢',
      '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🍮', '🎂',
      '🍭', '🍬', '🍫', '🍩', '🍪', '🥠', '🍯', '🥛'
    ],
    animals: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
      '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'
    ],
    sports: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
      '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃',
      '🥊', '🥋', '⛳', '🏹', '🎣', '🤿', '🎽', '🛹',
      '🛼', '🛷', '⛸️', '🥌', '🎯', '🪀', '🪁', '🎮'
    ]
  };
  
  // Updated difficulty config with mobile grid configurations
  const difficultyConfig = {
    easy: { 
      pairs: 6, 
      time: 120, 
      gridCols: 3, 
      mobileGridCols: 3, 
      hintPenalty: 5, 
      hintCount: 3 
    },
    medium: { 
      pairs: 8, 
      time: 100, 
      gridCols: 4, 
      mobileGridCols: 4, 
      hintPenalty: 10, 
      hintCount: 2 
    },
    hard: { 
      pairs: 12, 
      time: 80, 
      gridCols: 4, 
      mobileGridCols: 4, 
      hintPenalty: 15, 
      hintCount: 1 
    }
  };
  
  // Sound initialization remains the same
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Audio' in window) {
      try {
        flipSoundRef.current = new Audio('/sounds/flip.mp3');
        matchSoundRef.current = new Audio('/sounds/match.mp3');
        victorySoundRef.current = new Audio('/sounds/victory.mp3');
        timeoutSoundRef.current = new Audio('/sounds/timeout.mp3');
        
        flipSoundRef.current.load();
        matchSoundRef.current.load();
        victorySoundRef.current.load();
        timeoutSoundRef.current.load();
        
        const handleError = () => {};
        
        flipSoundRef.current.addEventListener('error', handleError);
        matchSoundRef.current.addEventListener('error', handleError);
        victorySoundRef.current.addEventListener('error', handleError);
        timeoutSoundRef.current.addEventListener('error', handleError);
        
        return () => {
          if (flipSoundRef.current) flipSoundRef.current.removeEventListener('error', handleError);
          if (matchSoundRef.current) matchSoundRef.current.removeEventListener('error', handleError);
          if (victorySoundRef.current) victorySoundRef.current.removeEventListener('error', handleError);
          if (timeoutSoundRef.current) timeoutSoundRef.current.removeEventListener('error', handleError);
        };
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    }
  }, []);
  
  // Sound playback function remains the same
  const playSound = useCallback((soundRef) => {
    if (!soundEnabled || !soundRef.current) return;
    
    try {
      soundRef.current.currentTime = 0;
      
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {});
      }
    } catch (error) {}
  }, [soundEnabled]);
  
  // Reset game function remains the same
  const resetGame = useCallback(() => {
    const config = difficultyConfig[difficulty];
    
    const emojiPool = themeEmojis[theme] || themeEmojis.food;
    const randomEmojis = [...emojiPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.pairs);
    
    const cardPairs = [...randomEmojis, ...randomEmojis]
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
    setShowHint(false);
    setHintsRemaining(config.hintCount);
    setIsPaused(false);
    setGameStarted(false);
    setComboCounter(0);
    setComboMultiplier(1);
  }, [difficulty, theme]);
  
  // Initialize game function remains the same
  useEffect(() => {
    resetGame();
    
    if (typeof window !== 'undefined') {
      try {
        const savedHighScores = localStorage.getItem('memoryGameHighScores');
        if (savedHighScores) {
          const parsedScores = JSON.parse(savedHighScores);
          if (parsedScores && typeof parsedScores === 'object' && 
              'easy' in parsedScores && 'medium' in parsedScores && 'hard' in parsedScores) {
            setHighScores(parsedScores);
          }
        }
      } catch (error) {
        console.error("Error loading high scores:", error);
      }
    }
  }, [difficulty, theme, resetGame]);
  
  // Timer logic remains the same
  useEffect(() => {
    let interval = null;
    
    if (isActive && timer > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setGameOver(true);
      playSound(timeoutSoundRef);
    }
    
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isActive, timer, isPaused, playSound]);
  
  // Game over handler remains the same
  useEffect(() => {
    if (!gameStarted || solved.length === 0) return;
    
    if (solved.length === cards.length && cards.length > 0) {
      setIsActive(false);
      setGameOver(true);
      playSound(victorySoundRef);
      
      const timeBonus = timer * 10;
      const movesPenalty = moves * 5;
      const comboBonus = comboCounter * 20;
      const difficultyMultiplier = 
        difficulty === 'easy' ? 1 : 
        difficulty === 'medium' ? 2 : 3;
      
      const calculatedScore = Math.max(
        0, 
        (1000 + timeBonus + comboBonus - movesPenalty) * difficultyMultiplier
      );
      
      setScore(calculatedScore);
      
      if (calculatedScore > highScores[difficulty] && typeof window !== 'undefined') {
        const newHighScores = {
          ...highScores,
          [difficulty]: calculatedScore
        };
        
        setHighScores(newHighScores);
        
        try {
          localStorage.setItem('memoryGameHighScores', JSON.stringify(newHighScores));
        } catch (error) {
          console.error("Error saving high scores:", error);
        }
      }
    }
  }, [solved, cards, timer, moves, difficulty, highScores, comboCounter, playSound, gameStarted]);
  
  // Card click handler remains the same
  const handleCardClick = useCallback((id) => {
    if (gameOver || isPaused) return;
    
    if (flipped.includes(id) || solved.includes(id)) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      setIsActive(true);
    }
    
    if (flipped.length >= 2) return;
    
    playSound(flipSoundRef);
    
    setFlipped(prevFlipped => [...prevFlipped, id]);
    
    if (flipped.length === 1) {
      const firstId = flipped[0];
      const secondId = id;
      
      setMoves(prevMoves => prevMoves + 1);
      
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        setSolved(prevSolved => [...prevSolved, firstId, secondId]);
        setFlipped([]);
        playSound(matchSoundRef);
        
        const newComboCounter = comboCounter + 1;
        setComboCounter(newComboCounter);
        
        if (newComboCounter % 3 === 0) {
          setComboMultiplier(prev => Math.min(prev + 0.5, 3));
        }
      } else {
        const timer = setTimeout(() => {
          setFlipped([]);
          setComboCounter(0);
          setComboMultiplier(1);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameOver, isPaused, flipped, solved, gameStarted, cards, comboCounter, playSound]);
  
  // Format time function remains the same
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Difficulty change handler remains the same
  const changeDifficulty = useCallback((level) => {
    if (level !== difficulty) {
      setDifficulty(level);
      setTimeout(resetGame, 0);
    }
  }, [difficulty, resetGame]);
  
  // Theme change handler remains the same
  const changeTheme = useCallback((newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      setTimeout(resetGame, 0);
    }
  }, [theme, resetGame]);
  
  // Other action functions remain the same
  const togglePause = useCallback(() => {
    if (isActive && !gameOver) {
      setIsPaused(prevPaused => !prevPaused);
    }
  }, [isActive, gameOver]);
  
  const showHintAction = useCallback(() => {
    if (hintsRemaining > 0 && !showHint && !gameOver && isActive) {
      setShowHint(true);
      setHintsRemaining(prevHints => prevHints - 1);
      
      const hintPenalty = difficultyConfig[difficulty].hintPenalty;
      setScore(prev => Math.max(0, prev - hintPenalty));
      
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hintsRemaining, showHint, gameOver, isActive, difficulty]);
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(prevSound => !prevSound);
  }, []);
  
  // Improved mobile detection with viewport height tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
      setViewportHeight(window.innerHeight);
    };
    
    // Initial check
    checkViewport();
    
    // Add listener for window resize and orientation change
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);
  
  // Calculate optimal card size based on available space
  const calculateCardSize = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const config = difficultyConfig[difficulty];
    const numCols = isMobile ? config.mobileGridCols : config.gridCols;
    const numRows = Math.ceil((config.pairs * 2) / numCols);
    
    // Account for other UI elements (approximated heights)
    const nonGameBoardHeight = isMobile ? 370 : 300; // Adjust based on your UI
    
    // Calculate available height for game board
    const maxBoardHeight = viewportHeight - nonGameBoardHeight;
    
    // Determine card size: account for gaps (10px between cards)
    const maxPossibleCardSize = Math.floor(maxBoardHeight / numRows) - 10;
    
    // Ensure the cards are not too large on desktop
    const cardSize = isMobile 
      ? Math.min(maxPossibleCardSize, (window.innerWidth - 40) / numCols - 10) // Subtract padding and gaps
      : Math.min(100, maxPossibleCardSize); // Maximum size of 100px on desktop
      
    return {
      width: `${cardSize}px`,
      height: `${cardSize}px`
    };
  }, [difficulty, isMobile, viewportHeight]);
  
  // Calculate grid styles
  const getGridStyles = useCallback(() => {
    const config = difficultyConfig[difficulty];
    const numCols = isMobile ? config.mobileGridCols : config.gridCols;
    
    return {
      gridTemplateColumns: `repeat(${numCols}, 1fr)`,
      gap: isMobile ? '5px' : '10px'
    };
  }, [difficulty, isMobile]);
  
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
          <div className="dashboard-value">{solved.length / 2} / {cards.length / 2}</div>
        </div>
        
        {gameStarted && (
          <div className="dashboard-item">
            <div className="dashboard-label">Combo</div>
            <div className="dashboard-value">{comboCounter} <span className="multiplier">x{comboMultiplier.toFixed(1)}</span></div>
          </div>
        )}
      </div>
      
      <div className="game-controls">
        <div className="control-group">
          <label className="control-label">Difficulty:</label>
          <div className="button-group">
            <button 
              onClick={() => changeDifficulty('easy')}
              className={`control-button ${difficulty === 'easy' ? 'active' : ''}`}
            >
              Easy
            </button>
            <button 
              onClick={() => changeDifficulty('medium')}
              className={`control-button ${difficulty === 'medium' ? 'active' : ''}`}
            >
              Medium
            </button>
            <button 
              onClick={() => changeDifficulty('hard')}
              className={`control-button ${difficulty === 'hard' ? 'active' : ''}`}
            >
              Hard
            </button>
          </div>
        </div>
        
        <div className="control-group">
          <label className="control-label">Theme:</label>
          <div className="button-group">
            <button 
              onClick={() => changeTheme('food')}
              className={`control-button ${theme === 'food' ? 'active' : ''}`}
            >
              Food
            </button>
            <button 
              onClick={() => changeTheme('animals')}
              className={`control-button ${theme === 'animals' ? 'active' : ''}`}
            >
              Animals
            </button>
            <button 
              onClick={() => changeTheme('sports')}
              className={`control-button ${theme === 'sports' ? 'active' : ''}`}
            >
              Sports
            </button>
          </div>
        </div>
      </div>
      
      <div className="game-action-buttons">
        <button onClick={resetGame} className="action-button reset-button">
          New Game
        </button>
        
        {gameStarted && !gameOver && (
          <>
            <button onClick={togglePause} className="action-button">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button 
              onClick={showHintAction} 
              className={`action-button hint-button ${hintsRemaining <= 0 ? 'disabled' : ''}`}
              disabled={hintsRemaining <= 0}
            >
              Hint ({hintsRemaining})
            </button>
          </>
        )}
        
        <button onClick={toggleSound} className="action-button sound-button">
          {soundEnabled ? '🔊 On' : '🔇 Off'}
        </button>
      </div>
      
      {isPaused && (
        <div className="game-overlay">
          <div className="pause-menu">
            <h2>Game Paused</h2>
            <button onClick={togglePause} className="resume-button">Resume</button>
            <button onClick={resetGame} className="new-game-button">New Game</button>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className="game-overlay">
          <div className="game-result">
            {solved.length === cards.length ? (
              <div>
                <h2 className="win-message">🎉 Congratulations! 🎉</h2>
                <div className="result-details">
                  <p>Time remaining: {formatTime(timer)}</p>
                  <p>Total moves: {moves}</p>
                  <p>Best combo: {comboCounter}</p>
                  <p className="score">Score: {score} points</p>
                  {score > highScores[difficulty] && (
                    <p className="high-score">New High Score! 🏆</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="lose-message">⏰ Time&apos;s up! ⏰</h2>
                <p className="result-details">You found {solved.length / 2} out of {cards.length / 2} pairs.</p>
              </div>
            )}
            <div className="high-scores">
              <h3>High Scores</h3>
              <div className="high-score-list">
                {Object.entries(highScores).map(([level, score]) => (
                  <div key={level} className="high-score-item">
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}:</span>
                    <span>{score}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        </div>
      )}
      
      <div 
        className="game-board"
        style={getGridStyles()}
      >
        {cards.map(card => (
          <div 
            key={card.id}
            className={`game-card ${flipped.includes(card.id) ? 'flipped' : ''} ${solved.includes(card.id) ? 'solved' : ''} ${showHint && !solved.includes(card.id) && !flipped.includes(card.id) ? 'hint' : ''}`}
            onClick={() => handleCardClick(card.id)}
            style={calculateCardSize()}
          >
            <div className="card-inner">
              <div className="card-back">
                <span>{theme === 'food' ? '🍽️' : theme === 'animals' ? '🐾' : '🏆'}</span>
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
        <p>Find all matching pairs before time runs out! Get combos by finding matches consecutively.</p>
        <p><strong>Tip:</strong> Use hints when you&apos;re stuck, but they will cost you points!</p>
      </div>
      
      <style jsx>{`
        .game-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          font-display: swap;
          overflow-x: hidden;
          touch-action: manipulation;
        }
        
        .game-title {
          text-align: center;
          color: #e74c3c;
          font-size: ${isMobile ? '1.3rem' : '2rem'};
          margin-bottom: ${isMobile ? '10px' : '15px'};
        }
        
        .game-dashboard {
          display: flex;
          justify-content: space-between;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: ${isMobile ? '10px' : '15px'};
          padding: ${isMobile ? '8px' : '12px'};
        }
        
        .dashboard-item {
          text-align: center;
          flex: 1;
        }
        
        .dashboard-label {
          font-size: ${isMobile ? '0.7rem' : '0.9rem'};
          text-transform: uppercase;
          color: #7f8c8d;
          margin-bottom: 2px;
        }
        
        .dashboard-value {
          font-size: ${isMobile ? '1rem' : '1.3rem'};
          font-weight: bold;
          color: #2c3e50;
        }
        
        .multiplier {
          font-size: ${isMobile ? '0.7rem' : '0.9rem'};
          color: #e67e22;
        }
        
        .game-controls {
          margin-bottom: ${isMobile ? '10px' : '15px'};
        }
        
        .control-group {
          margin-bottom: ${isMobile ? '6px' : '10px'};
        }
        
        .control-label {
          display: block;
          font-size: ${isMobile ? '0.8rem' : '0.9rem'};
          color: #7f8c8d;
          margin-bottom: ${isMobile ? '3px' : '5px'};
        }
        
        .button-group {
          display: flex;
          gap: ${isMobile ? '3px' : '5px'};
        }
        
        .control-button {
          background-color: #f7f7f7;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: ${isMobile ? '4px 6px' : '6px 10px'};
          font-size: ${isMobile ? '0.75rem' : '0.85rem'};
          flex: 1;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        
        .control-button.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .game-action-buttons {
          display: flex;
          gap: ${isMobile ? '5px' : '8px'};
          margin-bottom: ${isMobile ? '10px' : '15px'};
          flex-wrap: wrap;
        }
        
        .action-button {
          background-color: #f7f7f7;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: ${isMobile ? '6px 8px' : '8px 12px'};
          font-size: ${isMobile ? '0.8rem' : '0.9rem'};
          flex: 1;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        
        .reset-button {
          background-color: #e67e22;
          color: white;
          border-color: #e67e22;
        }
        
        .reset-button:hover, .reset-button:active {
          background-color: #d35400;
          border-color: #d35400;
        }
        
        .hint-button {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .hint-button:hover, .hint-button:active {
          background-color: #2980b9;
          border-color: #2980b9;
        }
        
        .hint-button.disabled {
          background-color: #bdc3c7;
          border-color: #bdc3c7;
          color: #7f8c8d;
          cursor: not-allowed;
        }
        
        .game-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        
        .pause-menu {
          background-color: white;
          border-radius: 10px;
          padding: ${isMobile ? '15px' : '20px'};
          text-align: center;
          width: 90%;
          max-width: 400px;
        }
        
        .pause-menu h2 {
          margin-bottom: ${isMobile ? '15px' : '20px'};
          color: #2c3e50;
          font-size: ${isMobile ? '1.3rem' : '1.5rem'};
        }
        
        .resume-button, .new-game-button {
          display: block;
          width: 100%;
          padding: ${isMobile ? '8px' : '10px'};
          margin-bottom: ${isMobile ? '8px' : '10px'};
          border-radius: 6px;
          border: none;
          font-size: ${isMobile ? '0.9rem' : '1rem'};
          cursor: pointer;
        }
        
        .resume-button {
          background-color: #3498db;
          color: white;
        }
        
        .new-game-button {
          background-color: #e67e22;
          color: white;
        }
        
       .game-result {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: ${isMobile ? '15px' : '20px'};
  text-align: center;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.win-message {
  color: #27ae60;
  font-size: ${isMobile ? '1.2rem' : '1.5rem'};
  margin-bottom: ${isMobile ? '10px' : '15px'};
}

.lose-message {
  color: #e74c3c;
  font-size: ${isMobile ? '1.2rem' : '1.5rem'};
  margin-bottom: ${isMobile ? '10px' : '15px'};
}

.result-details {
  margin-bottom: ${isMobile ? '10px' : '15px'};
  font-size: ${isMobile ? '0.85rem' : '1rem'};
}

.result-details p {
  margin: ${isMobile ? '5px 0' : '8px 0'};
}

.score {
  font-size: ${isMobile ? '1.1rem' : '1.3rem'};
  font-weight: bold;
  color: #2c3e50;
}

.high-score {
  color: #e74c3c;
  font-weight: bold;
  font-size: ${isMobile ? '1rem' : '1.2rem'};
}

.high-scores {
  margin: ${isMobile ? '10px 0' : '15px 0'};
  border-top: 1px solid #eee;
  padding-top: ${isMobile ? '10px' : '15px'};
}

.high-scores h3 {
  margin-bottom: ${isMobile ? '8px' : '10px'};
  color: #2c3e50;
  font-size: ${isMobile ? '1rem' : '1.2rem'};
}

.high-score-list {
  display: flex;
  flex-direction: column;
  gap: ${isMobile ? '5px' : '8px'};
}

.high-score-item {
  display: flex;
  justify-content: space-between;
  font-size: ${isMobile ? '0.85rem' : '0.95rem'};
}

.play-again-button {
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  padding: ${isMobile ? '8px 15px' : '10px 20px'};
  font-size: ${isMobile ? '0.9rem' : '1rem'};
  cursor: pointer;
  margin-top: ${isMobile ? '15px' : '20px'};
}

.game-board {
  display: grid;
  margin: 0 auto;
  margin-bottom: ${isMobile ? '15px' : '20px'};
  width: 100%;
  max-width: ${isMobile ? '100%' : '600px'};
  max-height: ${isMobile ? 'calc(100vh - 380px)' : 'auto'};
  justify-content: center;
}

.game-card {
  perspective: 1000px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.2s ease-in-out;
  aspect-ratio: 1;
  -webkit-tap-highlight-color: transparent;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.5s;
  transform-style: preserve-3d;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.game-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: ${isMobile ? 'clamp(16px, 8vw, 32px)' : 'clamp(24px, 4vw, 48px)'};
}

.card-back {
  background-color: #3498db;
  color: white;
}

.card-front {
  background-color: #fff;
  transform: rotateY(180deg);
}

.game-card.solved .card-inner {
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  animation: pulse 2s infinite;
}

.game-card.hint .card-inner {
  box-shadow: 0 0 15px rgba(241, 196, 15, 0.8);
  animation: hint-pulse 1s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
}

@keyframes hint-pulse {
  0% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(241, 196, 15, 0); }
  100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); }
}

.game-instructions {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: ${isMobile ? '10px' : '15px'};
  margin-top: ${isMobile ? '10px' : '20px'};
  font-size: ${isMobile ? '0.75rem' : '0.9rem'};
  color: #7f8c8d;
}

.game-instructions h3 {
  font-size: ${isMobile ? '0.9rem' : '1.1rem'};
  color: #2c3e50;
  margin-bottom: ${isMobile ? '5px' : '8px'};
}

.game-instructions p {
  margin: ${isMobile ? '5px 0' : '8px 0'};
}

/* Mobile Optimization Enhancements */
@media (max-width: 768px) {
  .game-container {
    padding: 5px;
  }
  
  /* Auto adjust font size based on viewport width for cards */
  .card-front span, .card-back span {
    font-size: min(8vw, 28px);
  }
  
  /* Ensure controls are compact but usable */
  .game-controls, .game-action-buttons {
    gap: 4px;
  }
  
  .control-button, .action-button {
    padding: 5px;
    font-size: 0.7rem;
  }

  /* Optimize dashboard for smaller screens */
  .dashboard-item {
    padding: 3px;
  }
  
  /* Ensure game board fits in viewport without scrolling */
  .game-board {
    margin-top: 5px;
    gap: 4px !important;
    max-height: min(calc(100vh - 280px), 400px);
  }
  
  /* Make game instructions more compact */
  .game-instructions {
    padding: 8px;
    margin-top: 8px;
  }
  
  /* Reduce overall spacing */
  .game-title, .game-dashboard, .game-controls, .game-action-buttons {
    margin-bottom: 8px;
  }
  
  /* Adjust card sizes dynamically based on available space and difficulty */
  .game-card {
    min-width: 10px;
    min-height: 10px;
  }
}

/* Portrait-specific adjustments for very small screens */
@media (max-width: 380px) and (max-height: 700px) {
  .game-title {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .dashboard-label {
    font-size: 0.65rem;
  }
  
  .dashboard-value {
    font-size: 0.85rem;
  }
  
  .control-button, .action-button {
    font-size: 0.65rem;
    padding: 4px;
  }
  
  .game-instructions {
    font-size: 0.7rem;
  }
  
  .game-instructions h3 {
    font-size: 0.8rem;
  }
  
  /* Ensure cards are small enough */
  .game-card {
    transform: scale(0.95);
  }
}

/* Landscape mode optimizations */
@media (max-width: 850px) and (max-height: 450px) and (orientation: landscape) {
  .game-container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .game-title {
    width: 100%;
    font-size: 1rem;
    margin-bottom: 3px;
  }
  
  .game-dashboard {
    width: 30%;
    flex-direction: column;
    margin-right: 5px;
  }
  
  .game-controls, .game-action-buttons {
    width: 30%;
    flex-direction: column;
  }
  
  .game-board {
    width: 65%;
    max-height: calc(100vh - 30px);
    order: 4;
  }
  
  .game-instructions {
    display: none; /* Hide instructions in landscape to save space */
  }
  
  /* Make cards smaller in landscape */
  .card-front span, .card-back span {
    font-size: min(4vw, 24px);
  }
}
      `}</style>
    </div>
  );
}