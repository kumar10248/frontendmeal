"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

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
  
  // Refs for sound effects - keeping these even if files don't exist
  const flipSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const victorySoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);
  
  // Theme emojis
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
  
  const difficultyConfig = {
    easy: { pairs: 6, time: 120, gridCols: 3, hintPenalty: 5, hintCount: 3 },
    medium: { pairs: 8, time: 100, gridCols: 4, hintPenalty: 10, hintCount: 2 },
    hard: { pairs: 12, time: 80, gridCols: 4, hintPenalty: 15, hintCount: 1 }
  };
  
  // Fix 1: Safely initialize sounds only in browser environment
  // with better error handling and silent failure
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Create sounds only if Audio API is available
    if ('Audio' in window) {
      try {
        // Using try-catch to handle missing audio files
        // In a real app, these files need to exist in the public directory
        flipSoundRef.current = new Audio('/sounds/flip.mp3');
        matchSoundRef.current = new Audio('/sounds/match.mp3');
        victorySoundRef.current = new Audio('/sounds/victory.mp3');
        timeoutSoundRef.current = new Audio('/sounds/timeout.mp3');
        
        // Fix: Preload sounds for better performance
        flipSoundRef.current.load();
        matchSoundRef.current.load();
        victorySoundRef.current.load();
        timeoutSoundRef.current.load();
        
        // Fix: Handle errors silently
        const handleError = () => {
          // console.warn("Audio file not found or cannot be played");
        };
        
        flipSoundRef.current.addEventListener('error', handleError);
        matchSoundRef.current.addEventListener('error', handleError);
        victorySoundRef.current.addEventListener('error', handleError);
        timeoutSoundRef.current.addEventListener('error', handleError);
        
        // Clean up
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
  
  // Fix 2: Improved sound playback with better error handling
  const playSound = useCallback((soundRef) => {
    if (!soundEnabled || !soundRef.current) return;
    
    try {
      // Reset playback position
      soundRef.current.currentTime = 0;
      
      // Use promise-based play with catch
      const playPromise = soundRef.current.play();
      
      // Modern browsers return a promise from play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Silence errors like "play() request was interrupted"
          // which happens when rapidly clicking cards
          // console.warn("Sound playback error:", error.message);
        });
      }
    } catch (error) {
      // Fail silently - sound is not critical for gameplay
      // console.error("Error playing sound:", error);
    }
  }, [soundEnabled]);
  
  // Fix 3: Reset game function with proper dependencies
  const resetGame = useCallback(() => {
    const config = difficultyConfig[difficulty];
    
    // Randomly select emojis based on theme and difficulty
    const emojiPool = themeEmojis[theme] || themeEmojis.food;
    const randomEmojis = [...emojiPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.pairs);
    
    // Create pairs of cards
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
  
  // Fix 4: Initialize game with better SSR handling 
  useEffect(() => {
    resetGame();
    
    // Only attempt localStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        const savedHighScores = localStorage.getItem('memoryGameHighScores');
        if (savedHighScores) {
          const parsedScores = JSON.parse(savedHighScores);
          // Validate the structure of saved scores before using
          if (parsedScores && typeof parsedScores === 'object' && 
              'easy' in parsedScores && 'medium' in parsedScores && 'hard' in parsedScores) {
            setHighScores(parsedScores);
          }
        }
      } catch (error) {
        console.error("Error loading high scores:", error);
        // If there's an error, just use the default scores
      }
    }
  }, [difficulty, theme, resetGame]); 
  
  // Fix 5: Improved timer with better cleanup
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
    
    // Proper cleanup to prevent memory leaks
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isActive, timer, isPaused, playSound]);
  
  // Fix 6: Improved game over handler with better state management
  useEffect(() => {
    // Only process if there are solved cards and the game has started
    if (!gameStarted || solved.length === 0) return;
    
    // Check for game completion
    if (solved.length === cards.length && cards.length > 0) {
      setIsActive(false);
      setGameOver(true);
      playSound(victorySoundRef);
      
      // Calculate score based on moves, time, combos and difficulty
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
      
      // Update high scores if needed
      if (calculatedScore > highScores[difficulty] && typeof window !== 'undefined') {
        const newHighScores = {
          ...highScores,
          [difficulty]: calculatedScore
        };
        
        setHighScores(newHighScores);
        
        try {
          localStorage.setItem('memoryGameHighScores', JSON.stringify(newHighScores));
        } catch (error) {
          // Handle localStorage errors (e.g., in incognito mode)
          console.error("Error saving high scores:", error);
        }
      }
    }
  }, [solved, cards, timer, moves, difficulty, highScores, comboCounter, playSound, gameStarted]);
  
  // Fix 7: Improved card click handler with better state management
  const handleCardClick = useCallback((id) => {
    // Don't process clicks if game is over or paused
    if (gameOver || isPaused) return;
    
    // Don't allow clicking already flipped or solved cards
    if (flipped.includes(id) || solved.includes(id)) return;
    
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true);
      setIsActive(true);
    }
    
    // Don't allow more than 2 cards to be flipped at once
    if (flipped.length >= 2) return;
    
    // Play flip sound
    playSound(flipSoundRef);
    
    // Flip the card
    setFlipped(prevFlipped => [...prevFlipped, id]);
    
    // Check for matches when 2 cards are flipped
    if (flipped.length === 1) {
      const firstId = flipped[0];
      const secondId = id;
      
      // Increment moves counter
      setMoves(prevMoves => prevMoves + 1);
      
      // Find the corresponding card objects
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      // Check if cards match
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Cards match, mark as solved
        setSolved(prevSolved => [...prevSolved, firstId, secondId]);
        setFlipped([]);
        playSound(matchSoundRef);
        
        // Increment combo counter and update multiplier
        const newComboCounter = comboCounter + 1;
        setComboCounter(newComboCounter);
        
        // Update multiplier every 3 combos
        if (newComboCounter % 3 === 0) {
          setComboMultiplier(prev => Math.min(prev + 0.5, 3));
        }
      } else {
        // Cards don't match, flip back after a short delay
        const timer = setTimeout(() => {
          setFlipped([]);
          // Reset combo counter on mismatch
          setComboCounter(0);
          setComboMultiplier(1);
        }, 1000);
        
        // Clean up timer if component unmounts
        return () => clearTimeout(timer);
      }
    }
  }, [gameOver, isPaused, flipped, solved, gameStarted, cards, comboCounter, playSound]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Fix 8: Improved difficulty change handler 
  const changeDifficulty = useCallback((level) => {
    if (level !== difficulty) {
      setDifficulty(level);
      // Reset the game when difficulty changes
      setTimeout(resetGame, 0);
    }
  }, [difficulty, resetGame]);
  
  // Fix 9: Improved theme change handler
  const changeTheme = useCallback((newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      // Reset the game when theme changes
      setTimeout(resetGame, 0);
    }
  }, [theme, resetGame]);
  
  const togglePause = useCallback(() => {
    if (isActive && !gameOver) {
      setIsPaused(prevPaused => !prevPaused);
    }
  }, [isActive, gameOver]);
  
  const showHintAction = useCallback(() => {
    if (hintsRemaining > 0 && !showHint && !gameOver && isActive) {
      setShowHint(true);
      setHintsRemaining(prevHints => prevHints - 1);
      
      // Reduce score for hint usage
      const hintPenalty = difficultyConfig[difficulty].hintPenalty;
      setScore(prev => Math.max(0, prev - hintPenalty));
      
      // Automatically hide hint after 1 second
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 1000);
      
      // Clean up timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [hintsRemaining, showHint, gameOver, isActive, difficulty]);
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(prevSound => !prevSound);
  }, []);
  
  // Fix 10: Improved mobile detection with better event handling
  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') return;
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up listener to prevent memory leaks
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
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
        style={{ 
          gridTemplateColumns: `repeat(${isMobile && difficulty === 'hard' ? 3 : difficultyConfig[difficulty].gridCols}, 1fr)` 
        }}
      >
        {cards.map(card => (
          <div 
            key={card.id}
            className={`game-card ${flipped.includes(card.id) ? 'flipped' : ''} ${solved.includes(card.id) ? 'solved' : ''} ${showHint && !solved.includes(card.id) && !flipped.includes(card.id) ? 'hint' : ''}`}
            onClick={() => handleCardClick(card.id)}
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
          padding: 15px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          font-display: swap;
          overflow-x: hidden;
          touch-action: manipulation;
        }
        
        .game-title {
          text-align: center;
          color: #e74c3c;
          font-size: 2rem;
          margin-bottom: 15px;
        }
        
        .game-dashboard {
          display: flex;
          justify-content: space-between;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 15px;
          padding: 12px;
        }
        
        .dashboard-item {
          text-align: center;
          flex: 1;
        }
        
        .dashboard-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #7f8c8d;
          margin-bottom: 3px;
        }
        
        .dashboard-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .multiplier {
          font-size: 0.9rem;
          color: #e67e22;
        }
        
        .game-controls {
          margin-bottom: 15px;
        }
        
        .control-group {
          margin-bottom: 10px;
        }
        
        .control-label {
          display: block;
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 5px;
        }
        
        .button-group {
          display: flex;
          gap: 5px;
        }
        
        .control-button {
          background-color: #f7f7f7;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.85rem;
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
          gap: 8px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .action-button {
          background-color: #f7f7f7;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.9rem;
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
          padding: 20px;
          text-align: center;
          width: 90%;
          max-width: 400px;
        }
        
        .pause-menu h2 {
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .resume-button, .new-game-button {
          display: block;
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 6px;
          border: none;
          font-size: 1rem;
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          padding: 25px 15px;
          text-align: center;
          width: 90%;
          max-width: 500px;
        }
        
        .win-message {
          color: #27ae60;
          font-size: 1.6rem;
          margin-bottom: 15px;
        }
        
        .lose-message {
          color: #e74c3c;
          font-size: 1.6rem;
          margin-bottom: 15px;
        }
        
        .result-details {
          margin-bottom: 15px;
          font-size: 1rem;
          color: #2c3e50;
        }
        
        .score {
          font-size: 1.3rem;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 8px;
        }
        
        .high-score {
          font-size: 1.3rem;
          font-weight: bold;
          color: #f39c12;
          margin-top: 8px;
        }
        
        .high-scores {
          background-color: #f7f9fa;
          border-radius: 8px;
          padding: 10px;
          margin: 15px 0;
        }
        
        .high-scores h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .high-score-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .high-score-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dashed #ecf0f1;
        }
        
        .high-score-item:last-child {
          border-bottom: none;
        }
        
        .play-again-button {
          background-color: #2ecc71;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        
        .play-again-button:hover, .play-again-button:active {
          background-color: #27ae60;
        }
        
        .game-board {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
          width: 100%;
        }
        
        .game-card {
          aspect-ratio: 1;
          cursor: pointer;
          perspective: 1000px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .game-card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        
        .game-card.solved .card-inner {
          transform: rotateY(180deg);
          box-shadow: 0 0 0 3px #2ecc71;
        }
        
        .game-card.hint .card-inner {
          box-shadow: 0 0 0 3px #f39c12;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
        }
        
        .card-front {
          background-color: white;
          transform: rotateY(180deg);
        }
        
        .card-back {
          background-color: #3498db;
          color: white;
        }
        
        .game-instructions {
          background-color: #f7f9fa;
          border-radius: 10px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .game-instructions h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }
        
        .game-instructions p {
          margin: 10px 0 0;
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .game-title {
            font-size: 1.5rem;
          }
          
          .dashboard-label {
            font-size: 0.75rem;
          }
          
          .dashboard-value {
            font-size: 1.1rem;
          }
          
          .control-button, .action-button {
            padding: 8px 5px;
            font-size: 0.8rem;
          }
          
          .card-front, .card-back {
            font-size: 1.5rem;
          }
          
          .game-instructions h3 {
            font-size: 1rem;
          }
          
          .game-instructions p {
            font-size: 0.8rem;
          }
        }
      `}</style>
      
      <footer className="game-footer">
        <p>Memory Game © 2025 | Made with 💖 and React</p>
      </footer>
    </div>
  );
}