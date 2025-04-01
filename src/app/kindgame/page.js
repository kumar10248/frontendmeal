// pages/index.js
"use client"
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function EnhancedSnakeGame() {
  // Game constants
  const GRID_SIZE = 20;
  const CELL_SIZE = 24;
  const INITIAL_SPEED = 130;
  
  // Game state
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [food, setFood] = useState({ x: 5, y: 5, type: 'regular' });
  const [obstacles, setObstacles] = useState([]);
  const [portals, setPortals] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);
  const [theme, setTheme] = useState('cyber');
  const [effects, setEffects] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [gameMode, setGameMode] = useState('classic');
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Refs for game loop
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(nextDirection);
  const gameLoopRef = useRef(null);
  const effectsTimerRef = useRef(null);
  const powerUpTimerRef = useRef(null);
  const activePowerUpsRef = useRef(activePowerUps);
  const obstaclesRef = useRef(obstacles);
  const portalsRef = useRef(portals);
  
  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
    nextDirectionRef.current = nextDirection;
    activePowerUpsRef.current = activePowerUps;
    obstaclesRef.current = obstacles;
    portalsRef.current = portals;
  }, [direction, nextDirection, activePowerUps, obstacles, portals]);
  
  // Themes definition
  const themes = {
    cyber: {
      background: 'bg-gradient-to-br from-gray-900 to-blue-900',
      gridBg: 'bg-gray-800',
      gridLines: 'border-blue-900',
      snake: {
        head: 'bg-cyan-300',
        body: 'bg-cyan-500',
        tail: 'bg-cyan-600'
      },
      food: {
        regular: 'bg-pink-500',
        special: 'bg-purple-400',
        extraLife: 'bg-red-500'
      },
      obstacle: 'bg-gray-700',
      portal: 'bg-indigo-600',
      text: 'text-cyan-300',
      buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700',
      buttonSecondary: 'bg-pink-600 hover:bg-pink-700',
      scoreBoard: 'bg-gray-800 bg-opacity-70 text-cyan-300',
      effectNeon: 'cyan'
    },
    retrowave: {
      background: 'bg-gradient-to-br from-purple-900 to-pink-800',
      gridBg: 'bg-black',
      gridLines: 'border-purple-800',
      snake: {
        head: 'bg-yellow-300',
        body: 'bg-yellow-400',
        tail: 'bg-yellow-500'
      },
      food: {
        regular: 'bg-pink-500',
        special: 'bg-purple-500',
        extraLife: 'bg-red-500'
      },
      obstacle: 'bg-gray-800',
      portal: 'bg-blue-600',
      text: 'text-pink-400',
      buttonPrimary: 'bg-pink-600 hover:bg-pink-700',
      buttonSecondary: 'bg-purple-600 hover:bg-purple-700',
      scoreBoard: 'bg-black bg-opacity-70 text-pink-400',
      effectNeon: 'pink'
    },
    jungle: {
      background: 'bg-gradient-to-br from-green-900 to-yellow-800',
      gridBg: 'bg-green-900',
      gridLines: 'border-green-800',
      snake: {
        head: 'bg-green-300',
        body: 'bg-green-500',
        tail: 'bg-green-700'
      },
      food: {
        regular: 'bg-red-500',
        special: 'bg-yellow-400',
        extraLife: 'bg-pink-500'
      },
      obstacle: 'bg-green-800',
      portal: 'bg-blue-500',
      text: 'text-green-300',
      buttonPrimary: 'bg-green-600 hover:bg-green-700',
      buttonSecondary: 'bg-yellow-600 hover:bg-yellow-700',
      scoreBoard: 'bg-green-900 bg-opacity-70 text-green-300',
      effectNeon: 'green'
    }
  };
  
  const currentTheme = themes[theme];
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Snake Bytes!",
      text: "This advanced version of the classic Snake game features multiple game modes, power-ups and special obstacles.",
      image: "snake"
    },
    {
      title: "Controls",
      text: "Use arrow keys to control the snake. Press Space to pause the game. Press Esc to return to the menu.",
      image: "controls"
    },
    {
      title: "Food Types",
      text: "Regular food gives you points. Special food grants power-ups or extra points. Red hearts give you an extra life!",
      image: "food"
    },
    {
      title: "Power-ups",
      text: "Speed boost, invincibility, score multiplier and more! Watch for their timers at the bottom of the screen.",
      image: "powerups"
    },
    {
      title: "Obstacles & Portals",
      text: "Avoid obstacles, they'll cost you a life! Portals teleport you to another location on the grid.",
      image: "obstacles"
    }
  ];
  
  // Generate random position that doesn't overlap with snake, obstacles, or portals
  const getRandomPosition = () => {
    let newPos;
    let valid = false;
    
    while (!valid) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      
      // Check if position overlaps with snake
      const snakeOverlap = snake.some(segment => 
        segment.x === newPos.x && segment.y === newPos.y
      );
      
      // Check if position overlaps with obstacles
      const obstacleOverlap = obstacles.some(obstacle => 
        obstacle.x === newPos.x && obstacle.y === newPos.y
      );
      
      // Check if position overlaps with portals
      const portalOverlap = portals.some(portal => 
        portal.x === newPos.x && portal.y === newPos.y
      );
      
      // Check if position overlaps with food
      const foodOverlap = food && food.x === newPos.x && food.y === newPos.y;
      
      // Check if position overlaps with power-ups
      const powerUpOverlap = powerUps.some(powerUp => 
        powerUp.x === newPos.x && powerUp.y === newPos.y
      );
      
      valid = !snakeOverlap && !obstacleOverlap && !portalOverlap && !foodOverlap && !powerUpOverlap;
    }
    
    return newPos;
  };

  // Generate food
  const generateFood = () => {
    const position = getRandomPosition();
    const foodTypes = ['regular', 'regular', 'regular', 'special', 'extraLife'];
    const randomType = foodTypes[Math.floor(Math.random() * foodTypes.length)]; 
    
    // Extra life is rare
    const type = randomType === 'extraLife' && Math.random() > 0.2 ? 'regular' : randomType;
    
    setFood({ ...position, type });
  };
  
  // Generate obstacles based on level and game mode
  const generateObstacles = () => {
    if (gameMode === 'classic') return [];
    
    const obstacles = [];
    const obstacleCount = Math.min(5, Math.floor(level / 2) + 1);
    
    for (let i = 0; i < obstacleCount; i++) {
      const position = getRandomPosition();
      obstacles.push(position);
    }
    
    return obstacles;
  };
  
  // Generate portals
  const generatePortals = () => {
    if (gameMode === 'classic') return [];
    if (Math.random() > 0.4) return []; // Don't always generate portals
    
    const portal1 = getRandomPosition();
    let portal2;
    
    do {
      portal2 = getRandomPosition();
    } while (portal2.x === portal1.x && portal2.y === portal1.y);
    
    return [
      { ...portal1, id: 1 },
      { ...portal2, id: 1 }
    ];
  };
  
  // Generate power-up on the grid
  const generatePowerUp = () => {
    if (Math.random() > 0.3) return; // 30% chance to generate a power-up
  
    const types = ['speedBoost', 'invincibility', 'scoreMultiplier', 'ghostMode', 'shrink'];
    const type = types[Math.floor(Math.random() * types.length)];
    const position = getRandomPosition();
    
    setPowerUps(prev => [...prev, { ...position, type }]);
  };
  
  // Apply power-up effect
  const applyPowerUp = (type) => {
    const now = Date.now();
    
    switch(type) {
      case 'speedBoost':
        setSpeed(prev => Math.max(prev - 40, 50));
        setActivePowerUps(prev => [...prev, { type, expires: now + 8000 }]);
        setTimeout(() => {
          setSpeed(INITIAL_SPEED - (level - 1) * 10);
        }, 8000);
        break;
      case 'invincibility':
        setActivePowerUps(prev => [...prev, { type, expires: now + 10000 }]);
        break;
      case 'scoreMultiplier':
        setActivePowerUps(prev => [...prev, { type, expires: now + 12000 }]);
        break;
      case 'ghostMode':
        setActivePowerUps(prev => [...prev, { type, expires: now + 7000 }]);
        break;
      case 'shrink':
        setSnake(prev => {
          if (prev.length <= 3) return prev;
          return prev.slice(0, Math.max(3, Math.floor(prev.length / 2)));
        });
        break;
      default:
        break;
    }
  };

  // Initialize or restart the game
  const initGame = (mode = 'classic') => {
    // Clear any existing game loops
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (effectsTimerRef.current) clearInterval(effectsTimerRef.current);
    if (powerUpTimerRef.current) clearInterval(powerUpTimerRef.current);
    
    setGameMode(mode);
    setCountdown(3);
    setIsCountingDown(true);
    
    // Begin countdown
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setIsCountingDown(false);
          startGame(mode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Actually start the game after countdown
  const startGame = (mode) => {
    setSnake([{ x: 8, y: 8 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setLives(mode === 'hardcore' ? 1 : 3);
    setEffects([]);
    setPowerUps([]);
    setActivePowerUps([]);
    
    // Generate initial food
    generateFood();
    
    // Generate obstacles and portals based on game mode
    const newObstacles = mode === 'adventure' ? generateObstacles() : [];
    setObstacles(newObstacles);
    
    const newPortals = mode === 'adventure' ? generatePortals() : [];
    setPortals(newPortals);
    
    setGameStarted(true);
    setIsPaused(false);
    
    // Start effects timer
    effectsTimerRef.current = setInterval(() => {
      // Update and remove expired effects
      setEffects(prev => prev.filter(effect => effect.life > 0).map(effect => ({
        ...effect,
        life: effect.life - 1
      })));
    }, 100);
    
    // Power-up timer for cleaning up expired power-ups
    powerUpTimerRef.current = setInterval(() => {
      const now = Date.now();
      setActivePowerUps(prev => prev.filter(powerUp => powerUp.expires > now));
    }, 1000);
  };
  
  // Create visual effect at position
  const createEffect = (x, y, type) => {
    setEffects(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type,
      life: 10
    }]);
  };
  
  // Handle direction change on key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (tutorial) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          setTutorial(false);
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
          setTutorialStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
        } else if (e.key === 'ArrowLeft') {
          setTutorialStep(prev => Math.max(prev - 1, 0));
        }
        return;
      }
      
      if (isCountingDown) return;
      
      if (!gameStarted) {
        if (e.key === 'Enter') initGame('classic');
        return;
      }
      
      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }
      
      if (e.key === 'Escape') {
        setGameStarted(false);
        setGameOver(false);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (effectsTimerRef.current) clearInterval(effectsTimerRef.current);
        if (powerUpTimerRef.current) clearInterval(powerUpTimerRef.current);
        return;
      }
      
      if (isPaused || gameOver) return;
      
      const current = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
          if (current !== 'DOWN') {
            setNextDirection('UP');
            nextDirectionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
          if (current !== 'UP') {
            setNextDirection('DOWN');
            nextDirectionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
          if (current !== 'RIGHT') {
            setNextDirection('LEFT');
            nextDirectionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
          if (current !== 'LEFT') {
            setNextDirection('RIGHT');
            nextDirectionRef.current = 'RIGHT';
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, isPaused, gameOver, isCountingDown, tutorial]);
  
  // Handle mobile touch controls
  const handleTouchStart = (direction) => {
    if (isPaused || gameOver || !gameStarted) return;
    
    const current = directionRef.current;
    
    switch (direction) {
      case 'UP':
        if (current !== 'DOWN') {
          setNextDirection('UP');
          nextDirectionRef.current = 'UP';
        }
        break;
      case 'DOWN':
        if (current !== 'UP') {
          setNextDirection('DOWN');
          nextDirectionRef.current = 'DOWN';
        }
        break;
      case 'LEFT':
        if (current !== 'RIGHT') {
          setNextDirection('LEFT');
          nextDirectionRef.current = 'LEFT';
        }
        break;
      case 'RIGHT':
        if (current !== 'LEFT') {
          setNextDirection('RIGHT');
          nextDirectionRef.current = 'RIGHT';
        }
        break;
      default:
        break;
    }
  };
  
  // Game loop
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused || isCountingDown) return;
    
    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        // Update direction from nextDirection
        if (nextDirectionRef.current !== directionRef.current) {
          directionRef.current = nextDirectionRef.current;
          setDirection(nextDirectionRef.current);
        }
        
        // Move head based on direction
        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
          default:
            break;
        }
        
        // Check for ghost mode (passing through walls)
        const hasGhostMode = activePowerUpsRef.current.some(p => p.type === 'ghostMode');
        
        // Check if snake hit the wall
        if (!hasGhostMode && (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE)) {
          handleCollision();
          return prevSnake;
        } else if (hasGhostMode) {
          // Wrap around for ghost mode
          if (head.x < 0) head.x = GRID_SIZE - 1;
          if (head.x >= GRID_SIZE) head.x = 0;
          if (head.y < 0) head.y = GRID_SIZE - 1;
          if (head.y >= GRID_SIZE) head.y = 0;
        }
        
        // Check if snake hit an obstacle
        const hitObstacle = obstaclesRef.current.some(
          obstacle => obstacle.x === head.x && obstacle.y === head.y
        );
        
        if (hitObstacle) {
          const hasInvincibility = activePowerUpsRef.current.some(p => p.type === 'invincibility');
          if (!hasInvincibility) {
            handleCollision();
            return prevSnake;
          }
          // If invincible, destroy the obstacle
          setObstacles(prev => prev.filter(
            obstacle => !(obstacle.x === head.x && obstacle.y === head.y)
          ));
          createEffect(head.x, head.y, 'explosion');
        }
        
        // Check if snake hit a portal
        const hitPortal = portalsRef.current.find(
          portal => portal.x === head.x && portal.y === head.y
        );
        
        if (hitPortal) {
          // Find the other portal
          const exitPortal = portalsRef.current.find(
            portal => portal.id === hitPortal.id && (portal.x !== hitPortal.x || portal.y !== hitPortal.y)
          );
          
          if (exitPortal) {
            head.x = exitPortal.x;
            head.y = exitPortal.y;
            createEffect(exitPortal.x, exitPortal.y, 'teleport');
          }
        }
        
        // Check if snake hit itself
        const hasInvincibility = activePowerUpsRef.current.some(p => p.type === 'invincibility');
        if (!hasInvincibility && newSnake.some((segment, index) => 
          index !== 0 && segment.x === head.x && segment.y === head.y
        )) {
          handleCollision();
          return prevSnake;
        }
        
        // Check if snake ate a power-up
        const eatenPowerUp = powerUps.find(pu => pu.x === head.x && pu.y === head.y);
        if (eatenPowerUp) {
          setPowerUps(prev => prev.filter(pu => !(pu.x === head.x && pu.y === head.y)));
          applyPowerUp(eatenPowerUp.type);
          createEffect(head.x, head.y, 'powerup');
        }
        
        // Check if snake ate the food
        if (food && food.x === head.x && food.y === head.y) {
          // Add to score based on food type
          let pointsToAdd = 10;
          
          if (food.type === 'special') {
            pointsToAdd = 25;
          }
          
          // Apply score multiplier if active
          const hasMultiplier = activePowerUpsRef.current.some(p => p.type === 'scoreMultiplier');
          if (hasMultiplier) {
            pointsToAdd *= 2;
          }
          
          setScore(prevScore => {
            const newScore = prevScore + pointsToAdd;
            // Update high score if needed
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            
            // Level up logic - every 100 points
            const newLevel = Math.floor(newScore / 100) + 1;
            if (newLevel > level) {
              setLevel(newLevel);
              setSpeed(prev => Math.max(prev - 10, 60)); // Speed up
              
              // Generate new obstacles on level up for adventure mode
              if (gameMode === 'adventure') {
                setObstacles(generateObstacles());
                setPortals(generatePortals());
              }
            }
            
            return newScore;
          });
          
          // Handle extra life
          if (food.type === 'extraLife') {
            setLives(prev => prev + 1);
            createEffect(head.x, head.y, 'extraLife');
          } else {
            createEffect(head.x, head.y, 'eat');
          }
          
          // Don't remove the tail to make snake grow
          newSnake.unshift(head);
          
          // Generate new food
          generateFood();
          
          // Maybe generate a power-up
          if (Math.random() < 0.2) {
            generatePowerUp();
          }
          
          return newSnake;
        }
        
        // Regular move - add new head, remove tail
        newSnake.unshift(head);
        newSnake.pop();
        return newSnake;
      });
    };
    
    gameLoopRef.current = setInterval(moveSnake, speed);
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, gameStarted, isPaused, isCountingDown, food, speed, level, highScore, gameMode, powerUps]);
  
  // Handle collision with obstacle or self
  const handleCollision = () => {
    createEffect(snake[0].x, snake[0].y, 'collision');
    
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        // Update high score if needed
        if (score > highScore) {
          setHighScore(score);
        }
      }
      return newLives;
    });
  };
  
  // Determine snake segment appearance
  const getSnakeSegmentClass = (index, total) => {
    if (index === 0) {
      return currentTheme.snake.head;
    } else if (index === total - 1) {
      return currentTheme.snake.tail;
    } else {
      return currentTheme.snake.body;
    }
  };
  
  // Get food class based on type
  const getFoodClass = (type) => {
    switch(type) {
      case 'regular': return currentTheme.food.regular;
      case 'special': return currentTheme.food.special;
      case 'extraLife': return currentTheme.food.extraLife;
      default: return currentTheme.food.regular;
    }
  };
  
  // Get power-up class
  const getPowerUpClass = (type) => {
    switch(type) {
      case 'speedBoost': return 'bg-yellow-400';
      case 'invincibility': return 'bg-blue-400';
      case 'scoreMultiplier': return 'bg-green-400';
      case 'ghostMode': return 'bg-indigo-400';
      case 'shrink': return 'bg-orange-400';
      default: return 'bg-purple-400';
    }
  };
  
  // Power-up icon
  const getPowerUpIcon = (type) => {
    switch(type) {
      case 'speedBoost': return '⚡';
      case 'invincibility': return '🛡️';
      case 'scoreMultiplier': return '×2';
      case 'ghostMode': return '👻';
      case 'shrink': return '↓';
      default: return '?';
    }
  };
  
  // Format time remaining for power-ups
  const formatTimeRemaining = (expires) => {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((expires - now) / 1000));
    return `${remaining}s`;
  };
  
  // Render game
  const renderGrid = () => {
    const grid = [];
    
    // Render grid cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push(
          <div
            key={`cell-${x}-${y}`}
            className={`absolute border ${showGrid ? currentTheme.gridLines : 'border-transparent'}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: x * CELL_SIZE,
              top: y * CELL_SIZE
            }}
          ></div>
        );
      }
    }
    
    // Render obstacles
    obstacles.forEach((obstacle, index) => {
      grid.push(
        <div
          key={`obstacle-${index}`}
          className={`absolute ${currentTheme.obstacle} rounded`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: obstacle.x * CELL_SIZE,
            top: obstacle.y * CELL_SIZE
          }}
        ></div>
      );
    });
    
    // Render portals
    portals.forEach((portal, index) => {
      grid.push(
        <div
          key={`portal-${index}`}
          className={`absolute ${currentTheme.portal} rounded-full animate-pulse`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: portal.x * CELL_SIZE,
            top: portal.y * CELL_SIZE
          }}
        ></div>
      );
    });
    
    // Render power-ups
    powerUps.forEach((powerUp, index) => {
      grid.push(
        <div
          key={`powerup-${index}`}
          className={`absolute ${getPowerUpClass(powerUp.type)} rounded-md flex items-center justify-center animate-pulse`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: powerUp.x * CELL_SIZE,
            top: powerUp.y * CELL_SIZE,
            fontSize: `${CELL_SIZE * 0.6}px`
          }}
        >
          {getPowerUpIcon(powerUp.type)}
        </div>
      );
    });
    
    // Render food
    if (food) {
      let foodElement;
      
      if (food.type === 'extraLife') {
        foodElement = (
          <div
            key="food"
            className={`absolute ${getFoodClass(food.type)} flex items-center justify-center rounded-full animate-pulse`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              fontSize: `${CELL_SIZE * 0.7}px`
            }}
          >
            ❤️
          </div>
        );
      } else {
        foodElement = (
          <div
            key="food"
            className={`absolute ${getFoodClass(food.type)} rounded-full ${food.type === 'special' ? 'animate-pulse' : ''}`}
            style={{
              width: CELL_SIZE * 0.8,
              height: CELL_SIZE * 0.8,
              left: food.x * CELL_SIZE + CELL_SIZE * 0.1,
              top: food.y * CELL_SIZE + CELL_SIZE * 0.1
            }}
          ></div>
        );
      }
      
      grid.push(foodElement);
    }
    
    // Render snake
    snake.forEach((segment, index) => {
        grid.push(
            <div
              key={`snake-${index}`}
              className={`absolute ${getSnakeSegmentClass(index, snake.length)} rounded-sm`}
              style={{
                width: index === 0 ? CELL_SIZE : CELL_SIZE * 0.9,
                height: index === 0 ? CELL_SIZE : CELL_SIZE * 0.9,
                left: segment.x * CELL_SIZE + (index === 0 ? 0 : CELL_SIZE * 0.05),
                top: segment.y * CELL_SIZE + (index === 0 ? 0 : CELL_SIZE * 0.05),
                zIndex: 10
              }}
            ></div>
          );
        });
        
        // Render effects
        effects.forEach((effect) => {
          let effectElement;
          
          switch(effect.type) {
            case 'eat':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className={`absolute text-${currentTheme.effectNeon}-400 text-opacity-${effect.life * 10}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: effect.x * CELL_SIZE,
                    top: effect.y * CELL_SIZE,
                    fontSize: `${CELL_SIZE * 0.7}px`,
                    transform: `scale(${1 + (10 - effect.life) / 5})`,
                    zIndex: 20
                  }}
                >
                  +{food && food.type === 'special' ? '25' : '10'}
                </div>
              );
              break;
            case 'collision':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className="absolute"
                  style={{
                    width: CELL_SIZE * 2,
                    height: CELL_SIZE * 2,
                    left: effect.x * CELL_SIZE - CELL_SIZE / 2,
                    top: effect.y * CELL_SIZE - CELL_SIZE / 2,
                    zIndex: 20
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-red-500 bg-opacity-${effect.life * 8} animate-ping`}></div>
                </div>
              );
              break;
            case 'explosion':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className="absolute"
                  style={{
                    width: CELL_SIZE * 3,
                    height: CELL_SIZE * 3,
                    left: effect.x * CELL_SIZE - CELL_SIZE,
                    top: effect.y * CELL_SIZE - CELL_SIZE,
                    zIndex: 20
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-yellow-500 bg-opacity-${effect.life * 5} animate-ping`}></div>
                </div>
              );
              break;
            case 'teleport':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className="absolute"
                  style={{
                    width: CELL_SIZE * 2,
                    height: CELL_SIZE * 2,
                    left: effect.x * CELL_SIZE - CELL_SIZE / 2,
                    top: effect.y * CELL_SIZE - CELL_SIZE / 2,
                    zIndex: 20
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-indigo-500 bg-opacity-${effect.life * 8} animate-ping`}></div>
                </div>
              );
              break;
            case 'powerup':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className="absolute"
                  style={{
                    width: CELL_SIZE * 2,
                    height: CELL_SIZE * 2,
                    left: effect.x * CELL_SIZE - CELL_SIZE / 2,
                    top: effect.y * CELL_SIZE - CELL_SIZE / 2,
                    zIndex: 20
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-purple-500 bg-opacity-${effect.life * 8} animate-ping`}></div>
                </div>
              );
              break;
            case 'extraLife':
              effectElement = (
                <div
                  key={`effect-${effect.id}`}
                  className={`absolute text-red-500 text-opacity-${effect.life * 10} font-bold`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: effect.x * CELL_SIZE,
                    top: effect.y * CELL_SIZE - (10 - effect.life) * 3,
                    fontSize: `${CELL_SIZE * 0.7}px`,
                    zIndex: 20
                  }}
                >
                  +1 ❤️
                </div>
              );
              break;
            default:
              effectElement = null;
          }
          
          if (effectElement) grid.push(effectElement);
        });
        
        return grid;
      };
      
      // Render tutorial
      const renderTutorial = () => {
        const currentStep = tutorialSteps[tutorialStep];
        
        return (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text}`}>{currentStep.title}</h2>
              
              <div className="mb-6 h-32 flex items-center justify-center">
                {currentStep.image === 'snake' && (
                  <div className="flex space-x-1">
                    <div className={`w-6 h-6 ${currentTheme.snake.head} rounded-sm`}></div>
                    <div className={`w-6 h-6 ${currentTheme.snake.body} rounded-sm`}></div>
                    <div className={`w-6 h-6 ${currentTheme.snake.body} rounded-sm`}></div>
                    <div className={`w-6 h-6 ${currentTheme.snake.tail} rounded-sm`}></div>
                  </div>
                )}
                {currentStep.image === 'controls' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <div className={`w-10 h-10 border ${currentTheme.text} border-opacity-50 flex items-center justify-center rounded`}>↑</div>
                    <div></div>
                    <div className={`w-10 h-10 border ${currentTheme.text} border-opacity-50 flex items-center justify-center rounded`}>←</div>
                    <div className={`w-10 h-10 border ${currentTheme.text} border-opacity-50 flex items-center justify-center rounded`}>↓</div>
                    <div className={`w-10 h-10 border ${currentTheme.text} border-opacity-50 flex items-center justify-center rounded`}>→</div>
                  </div>
                )}
                {currentStep.image === 'food' && (
                  <div className="flex space-x-4">
                    <div className={`w-6 h-6 ${currentTheme.food.regular} rounded-full`}></div>
                    <div className={`w-6 h-6 ${currentTheme.food.special} rounded-full animate-pulse`}></div>
                    <div className={`w-6 h-6 ${currentTheme.food.extraLife} rounded-full flex items-center justify-center text-xs`}>❤️</div>
                  </div>
                )}
                {currentStep.image === 'powerups' && (
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center">⚡</div>
                    <div className="w-8 h-8 bg-blue-400 rounded-md flex items-center justify-center">🛡️</div>
                    <div className="w-8 h-8 bg-green-400 rounded-md flex items-center justify-center">×2</div>
                    <div className="w-8 h-8 bg-indigo-400 rounded-md flex items-center justify-center">👻</div>
                  </div>
                )}
                {currentStep.image === 'obstacles' && (
                  <div className="flex space-x-4">
                    <div className={`w-8 h-8 ${currentTheme.obstacle} rounded`}></div>
                    <div className={`w-8 h-8 ${currentTheme.portal} rounded-full animate-pulse`}></div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 mb-6">{currentStep.text}</p>
              
              <div className="flex justify-between text-sm">
                <button 
                  className={`${currentTheme.buttonSecondary} px-3 py-1 rounded ${tutorialStep > 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => setTutorialStep(prev => Math.max(prev - 1, 0))}
                  disabled={tutorialStep === 0}
                >
                  Previous
                </button>
                
                <span className="text-gray-400">
                  {tutorialStep + 1} / {tutorialSteps.length}
                </span>
                
                <button 
                  className={`${currentTheme.buttonPrimary} px-3 py-1 rounded`}
                  onClick={() => {
                    if (tutorialStep < tutorialSteps.length - 1) {
                      setTutorialStep(prev => prev + 1);
                    } else {
                      setTutorial(false);
                    }
                  }}
                >
                  {tutorialStep < tutorialSteps.length - 1 ? 'Next' : 'Start Game'}
                </button>
              </div>
            </div>
          </div>
        );
      };
      
      // Start screen
      const renderStartScreen = () => (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-30">
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 ${currentTheme.text}`}>
            Snake Bytes
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              className={`${currentTheme.buttonPrimary} py-3 px-6 rounded-lg font-bold text-white`}
              onClick={() => initGame('classic')}
            >
              Classic Mode
            </button>
            <button 
              className={`${currentTheme.buttonPrimary} py-3 px-6 rounded-lg font-bold text-white`}
              onClick={() => initGame('adventure')}
            >
              Adventure Mode
            </button>
            <button 
              className={`${currentTheme.buttonPrimary} py-3 px-6 rounded-lg font-bold text-white`}
              onClick={() => initGame('hardcore')}
            >
              Hardcore Mode
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              className={`${currentTheme.buttonSecondary} py-2 px-4 rounded-lg text-white`}
              onClick={() => setTutorial(true)}
            >
              How to Play
            </button>
            <button 
              className={`${currentTheme.buttonSecondary} py-2 px-4 rounded-lg text-white`}
              onClick={() => setTheme(prevTheme => {
                const themes = ['cyber', 'retrowave', 'jungle'];
                const currentIndex = themes.indexOf(prevTheme);
                return themes[(currentIndex + 1) % themes.length];
              })}
            >
              Change Theme
            </button>
            <button 
              className={`${currentTheme.buttonSecondary} py-2 px-4 rounded-lg text-white`}
              onClick={() => setShowGrid(prev => !prev)}
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
          </div>
          
          <div className="text-gray-400 text-center max-w-md px-4">
            <p className="mb-2">Use arrow keys or touch controls to navigate the snake.</p>
            <p>Press SPACE to pause. ESC to return to menu.</p>
          </div>
        </div>
      );
      
      // Game over screen
      const renderGameOverScreen = () => (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-30">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${currentTheme.text}`}>
            Game Over
          </h2>
          
          <div className="text-xl text-white mb-8">
            <p>Final Score: <span className="font-bold">{score}</span></p>
            <p>High Score: <span className="font-bold">{highScore}</span></p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className={`${currentTheme.buttonPrimary} py-2 px-6 rounded-lg font-bold text-white`}
              onClick={() => initGame(gameMode)}
            >
              Try Again
            </button>
            <button 
              className={`${currentTheme.buttonSecondary} py-2 px-6 rounded-lg text-white`}
              onClick={() => {
                setGameStarted(false);
                setGameOver(false);
              }}
            >
              Main Menu
            </button>
          </div>
        </div>
      );
      
      // Countdown screen
      const renderCountdown = () => (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-30">
          <div className={`${currentTheme.text} text-6xl md:text-8xl font-bold animate-pulse`}>
            {countdown}
          </div>
        </div>
      );
      
      // Mobile controls
      const renderMobileControls = () => (
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-20 md:hidden">
          <button 
            className="w-12 h-12 bg-gray-800 bg-opacity-70 rounded-lg mb-2 flex items-center justify-center text-white"
            onClick={() => handleTouchStart('UP')}
          >
            ↑
          </button>
          <div className="flex space-x-4">
            <button 
              className="w-12 h-12 bg-gray-800 bg-opacity-70 rounded-lg flex items-center justify-center text-white"
              onClick={() => handleTouchStart('LEFT')}
            >
              ←
            </button>
            <button 
              className="w-12 h-12 bg-gray-800 bg-opacity-70 rounded-lg flex items-center justify-center text-white"
              onClick={() => handleTouchStart('DOWN')}
            >
              ↓
            </button>
            <button 
              className="w-12 h-12 bg-gray-800 bg-opacity-70 rounded-lg flex items-center justify-center text-white"
              onClick={() => handleTouchStart('RIGHT')}
            >
              →
            </button>
          </div>
        </div>
      );
    
      return (
        <div className={`min-h-screen ${currentTheme.background} flex flex-col items-center justify-center p-4`}>
          <Head>
            <title>Snake Bytes | Advanced Snake Game</title>
            <meta name="description" content="An enhanced version of the classic Snake game with multiple modes, power-ups and special features" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          
          <main className="flex flex-col items-center">
            {/* Game title and score */}
            <div className={`${currentTheme.scoreBoard} mb-2 p-4 rounded-lg w-full max-w-md flex justify-between items-center`}>
              <div>
                <h1 className="text-xl font-bold">Snake Bytes</h1>
                <p className="text-sm opacity-75">{gameMode === 'classic' ? 'Classic Mode' : gameMode === 'adventure' ? 'Adventure Mode' : 'Hardcore Mode'}</p>
              </div>
              <div className="text-right">
                <p>Score: <span className="font-bold">{score}</span></p>
                <p>High: <span className="font-bold">{highScore}</span></p>
              </div>
            </div>
            
            {/* Game board */}
            <div 
              className={`relative ${currentTheme.gridBg} rounded-lg overflow-hidden`}
              style={{ 
                width: GRID_SIZE * CELL_SIZE, 
                height: GRID_SIZE * CELL_SIZE 
              }}
            >
              {renderGrid()}
              
              {!gameStarted && renderStartScreen()}
              {gameOver && renderGameOverScreen()}
              {isCountingDown && renderCountdown()}
              {tutorial && renderTutorial()}
              
              {gameStarted && !gameOver && renderMobileControls()}
              
              {/* Pause button (mobile) */}
              {gameStarted && !gameOver && !isCountingDown && (
                <button 
                  className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gray-800 bg-opacity-70 flex items-center justify-center z-20 md:hidden"
                  onClick={() => setIsPaused(prev => !prev)}
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
              )}
              
              {/* Menu button (mobile) */}
              {gameStarted && !gameOver && !isCountingDown && (
                <button 
                  className="absolute top-2 left-2 w-10 h-10 rounded-full bg-gray-800 bg-opacity-70 flex items-center justify-center text-white z-20 md:hidden"
                  onClick={() => {
                    setGameStarted(false);
                    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                    if (effectsTimerRef.current) clearInterval(effectsTimerRef.current);
                    if (powerUpTimerRef.current) clearInterval(powerUpTimerRef.current);
                  }}
                >
                  ⇦
                </button>
              )}
              
              {/* Pause screen */}
              {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-30">
                  <h2 className={`text-4xl font-bold mb-8 ${currentTheme.text}`}>Paused</h2>
                  <div className="flex space-x-4">
                    <button 
                      className={`${currentTheme.buttonPrimary} py-2 px-6 rounded-lg font-bold text-white`}
                      onClick={() => setIsPaused(false)}
                    >
                      Resume
                    </button>
                    <button 
                      className={`${currentTheme.buttonSecondary} py-2 px-6 rounded-lg text-white`}
                      onClick={() => {
                        setGameStarted(false);
                        setIsPaused(false);
                        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                        if (effectsTimerRef.current) clearInterval(effectsTimerRef.current);
                        if (powerUpTimerRef.current) clearInterval(powerUpTimerRef.current);
                      }}
                    >
                      Main Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Game info bar */}
            <div className={`${currentTheme.scoreBoard} mt-2 p-2 rounded-lg w-full max-w-md flex justify-between items-center`}>
              <div className="flex items-center">
                <span className="mr-2">Level: {level}</span>
                <span>Lives: {[...Array(Math.max(0, lives))].map((_, i) => <span key={i}>❤️</span>)}</span>
              </div>
              <div>
                {gameStarted && !gameOver && 
                  <button 
                    className={`${currentTheme.buttonSecondary} py-1 px-3 text-sm rounded text-white`}
                    onClick={() => setIsPaused(prev => !prev)}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                }
              </div>
            </div>
            
            {/* Active power-ups display */}
            {activePowerUps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center w-full max-w-md">
                {activePowerUps.map((powerUp, index) => (
                  <div 
                    key={`active-${index}`} 
                    className={`${getPowerUpClass(powerUp.type)} px-2 py-1 rounded flex items-center text-xs`}
                  >
                    <span className="mr-1">{getPowerUpIcon(powerUp.type)}</span>
                    <span>{formatTimeRemaining(powerUp.expires)}</span>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      );
    }