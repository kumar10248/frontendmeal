// pages/index.js
"use client"
// pages/index.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [currentTool, setCurrentTool] = useState('grass');
  const [worldSize, setWorldSize] = useState({ width: 20, height: 15 });
  const [world, setWorld] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [gameMode, setGameMode] = useState('create'); // 'create' or 'challenge'
  const [challenge, setChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [savedWorlds, setSavedWorlds] = useState([]);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const worldRef = useRef(null);
  
  // Element types with their properties
  const elementTypes = {
    empty: { name: 'Empty', color: '#87CEEB', emoji: '⬜', category: 'basic' },
    grass: { name: 'Grass', color: '#7CFC00', emoji: '🌱', category: 'nature' },
    water: { name: 'Water', color: '#1E90FF', emoji: '💧', category: 'nature' },
    mountain: { name: 'Mountain', color: '#A52A2A', emoji: '⛰️', category: 'nature' },
    tree: { name: 'Tree', color: '#228B22', emoji: '🌳', category: 'nature' },
    house: { name: 'House', color: '#CD853F', emoji: '🏠', category: 'building' },
    farm: { name: 'Farm', color: '#DAA520', emoji: '🌾', category: 'building' },
    mine: { name: 'Mine', color: '#708090', emoji: '⛏️', category: 'building' },
    castle: { name: 'Castle', color: '#808080', emoji: '🏰', category: 'building' },
    bridge: { name: 'Bridge', color: '#D2691E', emoji: '🌉', category: 'building' },
    road: { name: 'Road', color: '#696969', emoji: '🛣️', category: 'infrastructure' },
    fire: { name: 'Fire', color: '#FF4500', emoji: '🔥', category: 'special' },
    dragon: { name: 'Dragon', color: '#B22222', emoji: '🐉', category: 'creature' },
    unicorn: { name: 'Unicorn', color: '#DA70D6', emoji: '🦄', category: 'creature' },
    wizard: { name: 'Wizard', color: '#9370DB', emoji: '🧙', category: 'creature' },
    treasure: { name: 'Treasure', color: '#FFD700', emoji: '💰', category: 'special' },
    portal: { name: 'Portal', color: '#9932CC', emoji: '🌀', category: 'special' },
    crystal: { name: 'Crystal', color: '#E6E6FA', emoji: '💎', category: 'special' },
  };
  
  // Challenge templates
  const challengeTemplates = [
    {
      name: 'Fantasy Kingdom',
      description: 'Create a kingdom with at least 1 castle, 3 houses, and 2 farms surrounded by nature.',
      requirements: {
        castle: 1,
        house: 3,
        farm: 2,
        tree: 5,
        water: 8
      },
      timeLimit: 60
    },
    {
      name: 'Dragon\'s Lair',
      description: 'Build a mountain lair for a dragon with treasure and surrounded by fire.',
      requirements: {
        mountain: 10,
        dragon: 1,
        fire: 5,
        treasure: 3
      },
      timeLimit: 45
    },
    {
      name: 'Magical Forest',
      description: 'Create an enchanted forest with unicorns, wizards, and magical crystals.',
      requirements: {
        tree: 15,
        unicorn: 2,
        wizard: 1,
        crystal: 4,
        portal: 1
      },
      timeLimit: 50
    }
  ];
  
  // Initialize world grid
  useEffect(() => {
    if (gameStarted) {
      initializeWorld();
    }
  }, [gameStarted, worldSize]);
  
  // Timer for challenge mode
  useEffect(() => {
    let interval;
    
    if (gameStarted && gameMode === 'challenge' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            checkChallengeCompletion(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameStarted, gameMode, timeLeft]);
  
  // Initialize empty world
  const initializeWorld = () => {
    const newWorld = [];
    for (let y = 0; y < worldSize.height; y++) {
      const row = [];
      for (let x = 0; x < worldSize.width; x++) {
        row.push('empty');
      }
      newWorld.push(row);
    }
    setWorld(newWorld);
  };
  
  // Start game
  const startGame = () => {
    if (!username) return;
    setGameStarted(true);
  };
  
  // Handle cell click to place elements
  const handleCellClick = (x, y) => {
    const newWorld = [...world];
    newWorld[y][x] = currentTool;
    setWorld(newWorld);
    
    // Auto-check challenge completion when placing elements
    if (gameMode === 'challenge') {
      checkChallengeCompletion();
    }
  };
  
  // Start a challenge
  const startChallenge = (challengeTemplate) => {
    setChallenge(challengeTemplate);
    setGameMode('challenge');
    setTimeLeft(challengeTemplate.timeLimit);
    setScore(0);
    initializeWorld(); // Reset world for new challenge
  };
  
  // Check if challenge is completed
  const checkChallengeCompletion = (isTimeUp = false) => {
    if (!challenge) return;
    
    // Count all placed elements
    const elementCounts = {};
    for (const type in elementTypes) {
      elementCounts[type] = 0;
    }
    
    world.forEach(row => {
      row.forEach(cell => {
        elementCounts[cell]++;
      });
    });
    
    // Check if all requirements are met
    let allRequirementsMet = true;
    let totalScore = 0;
    
    for (const [element, requiredCount] of Object.entries(challenge.requirements)) {
      const actualCount = elementCounts[element];
      const requirementMet = actualCount >= requiredCount;
      
      if (!requirementMet) {
        allRequirementsMet = false;
      }
      
      // Calculate partial score based on percentage of requirements met
      const percentage = Math.min(actualCount / requiredCount, 1);
      totalScore += Math.round(percentage * 100 / Object.keys(challenge.requirements).length);
    }
    
    // Update score
    setScore(totalScore);
    
    // If all requirements are met or time is up, show results
    if (allRequirementsMet || isTimeUp) {
      alert(`Challenge ${allRequirementsMet ? 'completed' : 'time up'}! Your score: ${totalScore}%`);
      if (allRequirementsMet) {
        // Give bonus for completing before time is up
        const timeBonus = Math.round((timeLeft / challenge.timeLimit) * 20);
        setScore(totalScore + timeBonus);
        alert(`Time bonus: +${timeBonus} points! Total score: ${totalScore + timeBonus}%`);
      }
    }
  };
  
  // Save current world
  const saveWorld = () => {
    const worldName = prompt('Name your world:');
    if (!worldName) return;
    
    const newSavedWorld = {
      name: worldName,
      creator: username,
      date: new Date().toLocaleDateString(),
      data: [...world],
      size: {...worldSize}
    };
    
    setSavedWorlds([...savedWorlds, newSavedWorld]);
    alert(`World "${worldName}" saved!`);
  };
  
  // Load a saved world
  const loadWorld = (savedWorld) => {
    setWorld(savedWorld.data);
    setWorldSize(savedWorld.size);
    alert(`World "${savedWorld.name}" loaded!`);
  };
  
  // Handle camera movement
  const moveCamera = (dx, dy) => {
    setCameraOffset({
      x: cameraOffset.x + dx,
      y: cameraOffset.y + dy
    });
  };
  
  // Handle zoom
  const handleZoom = (factor) => {
    setZoom(prev => {
      const newZoom = prev * factor;
      return Math.min(Math.max(newZoom, 0.5), 2); // Limit zoom between 0.5x and 2x
    });
  };
  
  // Group elements by category for toolbar
  const elementsByCategory = Object.entries(elementTypes).reduce((acc, [id, element]) => {
    if (!acc[element.category]) {
      acc[element.category] = [];
    }
    acc[element.category].push({ id, ...element });
    return acc;
  }, {});
  
  return (
    <div className="container">
      <Head>
        <title>Pixel World Builder</title>
        <meta name="description" content="Build your own pixel world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {!gameStarted ? (
          <div className="start-screen">
            <h1 className="title">Pixel World Builder</h1>
            <p className="description">Create your own worlds, pixel by pixel!</p>
            
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="username-input"
              />
              
              <div className="world-size-controls">
                <label>World Size:</label>
                <div className="size-inputs">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={worldSize.width}
                    onChange={(e) => setWorldSize({...worldSize, width: parseInt(e.target.value) || 5})}
                  /> x 
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={worldSize.height}
                    onChange={(e) => setWorldSize({...worldSize, height: parseInt(e.target.value) || 5})}
                  />
                </div>
              </div>
              
              <button onClick={startGame} className="start-button">Start Building</button>
            </div>
          </div>
        ) : (
          <div className="game-container">
            <div className="header">
              <h1>Pixel World Builder</h1>
              <div className="user-info">
                <span>Builder: {username}</span>
                {gameMode === 'challenge' && (
                  <>
                    <span>Challenge: {challenge.name}</span>
                    <span>Time: {timeLeft}s</span>
                    <span>Score: {score}%</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="game-content">
              <div className="toolbar">
                <div className="tool-categories">
                  {Object.entries(elementsByCategory).map(([category, elements]) => (
                    <div key={category} className="tool-category">
                      <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                      <div className="tool-options">
                        {elements.map(element => (
                          <div
                            key={element.id}
                            className={`tool ${currentTool === element.id ? 'selected' : ''}`}
                            onClick={() => setCurrentTool(element.id)}
                            title={element.name}
                          >
                            <span>{element.emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="action-buttons">
                  <button onClick={saveWorld}>Save World</button>
                  <button onClick={() => setGameMode('create')}>Free Build</button>
                  <button onClick={() => {
                    const randomChallenge = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
                    startChallenge(randomChallenge);
                  }}>Random Challenge</button>
                </div>
              </div>
              
              <div className="world-viewport">
                <div className="camera-controls">
                  <button onClick={() => moveCamera(0, -1)}>↑</button>
                  <button onClick={() => moveCamera(-1, 0)}>←</button>
                  <button onClick={() => moveCamera(1, 0)}>→</button>
                  <button onClick={() => moveCamera(0, 1)}>↓</button>
                  <button onClick={() => handleZoom(1.2)}>+</button>
                  <button onClick={() => handleZoom(1/1.2)}>-</button>
                </div>
                
                <div className="world-container" ref={worldRef}>
                  <div
                    className="world-grid"
                    style={{
                      transform: `translate(${cameraOffset.x * 30}px, ${cameraOffset.y * 30}px) scale(${zoom})`,
                      width: `${worldSize.width * 30}px`,
                      height: `${worldSize.height * 30}px`
                    }}
                  >
                    {world.map((row, y) => (
                      <div key={y} className="world-row">
                        {row.map((cell, x) => (
                          <div
                            key={`${x}-${y}`}
                            className="world-cell"
                            style={{ 
                              backgroundColor: elementTypes[cell].color,
                              border: hoveredCell?.x === x && hoveredCell?.y === y ? '2px solid white' : '1px solid rgba(0,0,0,0.1)'
                            }}
                            onClick={() => handleCellClick(x, y)}
                            onMouseEnter={() => setHoveredCell({ x, y })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <span>{elementTypes[cell].emoji}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {gameMode === 'challenge' && (
                  <div className="challenge-info">
                    <h3>{challenge.name}</h3>
                    <p>{challenge.description}</p>
                    <div className="requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {Object.entries(challenge.requirements).map(([element, count]) => (
                          <li key={element}>
                            {elementTypes[element].emoji} {elementTypes[element].name}: {count}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {savedWorlds.length > 0 && (
              <div className="saved-worlds">
                <h3>Saved Worlds</h3>
                <div className="worlds-list">
                  {savedWorlds.map((savedWorld, index) => (
                    <div key={index} className="saved-world-item">
                      <div>
                        <strong>{savedWorld.name}</strong>
                        <span>by {savedWorld.creator} on {savedWorld.date}</span>
                      </div>
                      <button onClick={() => loadWorld(savedWorld)}>Load</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #121212;
          color: #eaeaea;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
          background: linear-gradient(45deg, #ff5f6d, #ffc371);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          color: #bbbbbb;
        }

        .start-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 2rem;
          width: 100%;
          max-width: 500px;
          background-color: #1e1e1e;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .input-container {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .username-input {
          padding: 0.8rem;
          font-size: 1rem;
          background-color: #2a2a2a;
          color: #eaeaea;
          border: 2px solid #444;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .world-size-controls {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        .size-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .size-inputs input {
          width: 60px;
          padding: 0.5rem;
          background-color: #2a2a2a;
          color: #eaeaea;
          border: 2px solid #444;
          border-radius: 4px;
        }

        .start-button {
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          background: linear-gradient(45deg, #ff5f6d, #ffc371);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .start-button:hover {
          transform: translateY(-2px);
        }

        .game-container {
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #1e1e1e;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .header h1 {
          font-size: 1.5rem;
          margin: 0;
          background: linear-gradient(45deg, #ff5f6d, #ffc371);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .user-info {
          display: flex;
          gap: 1rem;
        }

        .game-content {
          display: flex;
          gap: 1rem;
          height: 70vh;
        }

        .toolbar {
          width: 220px;
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .tool-categories {
          flex: 1;
          overflow-y: auto;
        }

        .tool-category {
          margin-bottom: 1rem;
        }

        .tool-category h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #bbbbbb;
          border-bottom: 1px solid #333;
          padding-bottom: 0.3rem;
        }

        .tool-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tool {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #2a2a2a;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: transform 0.1s;
        }

        .tool:hover {
          transform: scale(1.1);
        }

        .tool.selected {
          background-color: #3a3a3a;
          box-shadow: 0 0 0 2px #ff5f6d;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .action-buttons button {
          padding: 0.5rem;
          background-color: #2a2a2a;
          color: #eaeaea;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-buttons button:hover {
          background-color: #3a3a3a;
        }

        .world-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .camera-controls {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(3, 30px);
          grid-template-rows: repeat(3, 30px);
          gap: 2px;
        }

        .camera-controls button {
          width: 30px;
          height: 30px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(42, 42, 42, 0.7);
          color: #eaeaea;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .camera-controls button:nth-child(1) {
          grid-column: 2;
          grid-row: 1;
        }
        .camera-controls button:nth-child(2) {
          grid-column: 1;
          grid-row: 2;
        }
        .camera-controls button:nth-child(3) {
          grid-column: 3;
          grid-row: 2;
        }
        .camera-controls button:nth-child(4) {
          grid-column: 2;
          grid-row: 3;
        }
        .camera-controls button:nth-child(5) {
          grid-column: 3;
          grid-row: 1;
        }
        .camera-controls button:nth-child(6) {
          grid-column: 3;
          grid-row: 3;
        }

        .world-container {
          flex: 1;
          overflow: auto;
          position: relative;
          padding: 1rem;
        }

        .world-grid {
          position: relative;
          transition: transform 0.2s;
          transform-origin: center;
        }

        .world-row {
          display: flex;
        }

        .world-cell {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .challenge-info {
          padding: 1rem;
          background-color: rgba(42, 42, 42, 0.9);
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 250px;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .challenge-info h3 {
          margin: 0 0 0.5rem 0;
          color: #ff5f6d;
        }

        .challenge-info p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .requirements h4 {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #bbbbbb;
        }

        .requirements ul {
          margin: 0;
          padding-left: 1.5rem;
          font-size: 0.8rem;
        }

        .saved-worlds {
          margin-top: 1rem;
          width: 100%;
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 1rem;
        }

        .saved-worlds h3 {
          margin: 0 0 1rem 0;
          color: #bbbbbb;
        }

        .worlds-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .saved-world-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #2a2a2a;
          border-radius: 4px;
          width: calc(50% - 0.5rem);
        }

        .saved-world-item div {
          display: flex;
          flex-direction: column;
        }

        .saved-world-item span {
          font-size: 0.8rem;
          color: #bbbbbb;
        }

        .saved-world-item button {
          padding: 0.3rem 0.6rem;
          background-color: #3a3a3a;
          color: #eaeaea;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .game-content {
            flex-direction: column;
            height: auto;
          }
          
          .toolbar {
            width: 100%;
            height: 200px;
          }
          
          .world-viewport {
            height: 400px;
          }
          
          .saved-world-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}