"use client";
import { useState, useEffect } from 'react';

export default function PuzzleGame() {
  const [score, setScore] = useState({ player: 46, opponent: 30 });
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentLetter, setCurrentLetter] = useState('O');
  const [grid, setGrid] = useState(() => initialGrid());
  const [completedWords, setCompletedWords] = useState([]);

  // Handle cell selection
  const handleCellClick = (rowIndex, colIndex) => {
    // Only allow clicking empty cells or cells that are already highlighted
    if (!grid[rowIndex][colIndex].letter || grid[rowIndex][colIndex].highlighted) {
      setSelectedCell({ row: rowIndex, col: colIndex });
    }
  };

  // Place the current letter on the board
  const handleSubmit = () => {
    if (selectedCell && (!grid[selectedCell.row][selectedCell.col].letter || 
        grid[selectedCell.row][selectedCell.col].highlighted)) {
      
      const newGrid = JSON.parse(JSON.stringify(grid)); // Deep copy to avoid state mutation issues
      newGrid[selectedCell.row][selectedCell.col] = {
        ...newGrid[selectedCell.row][selectedCell.col],
        letter: currentLetter,
        highlighted: true,
        isNew: true
      };
      
      setGrid(newGrid);
      setSelectedCell(null);
      
      // Check for completed words
      checkCompletedWords(newGrid);
      
      // Increment score (simplified - in a real game you'd have more complex scoring)
      setScore({...score, player: score.player + 2});
      
      // Generate a new current letter (simplified)
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      setCurrentLetter(letters[Math.floor(Math.random() * letters.length)]);
    }
  };

  // Reset the "isNew" property after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (grid.some(row => row.some(cell => cell.isNew))) {
        const newGrid = JSON.parse(JSON.stringify(grid));
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c].isNew) {
              newGrid[r][c].isNew = false;
            }
          }
        }
        setGrid(newGrid);
      }
    }, 1000); // Duration of the animation
    
    return () => clearTimeout(timer);
  }, [grid]);

  // Check if placing the letter completed any words
  const checkCompletedWords = (newGrid) => {
    // This is a simplified implementation
    // In a real game, you would check rows and columns for completed words
    // and update scores accordingly
    
    // Just as an example - check if "CENTRE" is complete
    const checkCentre = () => {
      // Make sure all required cells exist before checking
      if (newGrid[5] && 
          newGrid[5][1] && newGrid[5][2] && newGrid[5][3] && 
          newGrid[5][4] && newGrid[5][5] && newGrid[5][6]) {
        
        const centreLetters = [
          newGrid[5][1].letter, 
          newGrid[5][2].letter, 
          newGrid[5][3].letter, 
          newGrid[5][4].letter, 
          newGrid[5][5].letter, 
          newGrid[5][6].letter
        ];
        
        if (centreLetters.join('') === 'CENTRE' && !completedWords.includes('CENTRE')) {
          setCompletedWords(prev => [...prev, 'CENTRE']);
        }
      }
    };
    
    // Check for word completions
    checkCentre();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white p-4">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button className="bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200">Puzzle 15</h1>
        <button className="bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Score Board */}
      <div className="w-full max-w-md bg-indigo-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <span className="text-indigo-200 mb-1">You</span>
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-xl rounded-lg w-16 h-16 flex items-center justify-center shadow-inner">
              {score.player}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-700 flex items-center justify-center mb-2">
              <span className="text-white font-bold text-lg">VS</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xl rounded-lg w-16 h-16 flex items-center justify-center shadow-inner">
              {score.opponent}
            </div>
            <span className="text-indigo-200 mt-1">Opponent</span>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="w-full max-w-md bg-indigo-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-7 gap-1">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`relative aspect-square flex items-center justify-center rounded-md transition-all duration-300 cursor-pointer
                  ${cell.highlighted ? 'bg-indigo-600' : 'bg-indigo-700'} 
                  ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'ring-2 ring-yellow-400 scale-105' : ''} 
                  ${cell.isNew ? 'animate-pulse bg-green-600' : ''}`}
              >
                {cell.clue && (
                  <span className="absolute top-0 left-0 text-xs text-yellow-300 font-light p-1 opacity-70">
                    {cell.clue.length > 5 ? cell.clue.substring(0, 5) + '...' : cell.clue}
                  </span>
                )}
                
                {cell.letter && (
                  <span className="text-white font-bold text-xl">{cell.letter}</span>
                )}
                
                {cell.icon && (
                  <span className="absolute bottom-0 right-0 text-xs">{cell.icon}</span>
                )}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Current Letter Display */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-bold">
          {currentLetter}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col space-y-4">
        <button 
          onClick={handleSubmit}
          disabled={!selectedCell}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg
            ${selectedCell 
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400' 
              : 'bg-gray-600 opacity-70 cursor-not-allowed'}`}
        >
          Submit
        </button>
        
        <div className="flex justify-center space-x-4">
          <button className="bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-4 shadow-lg transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="bg-indigo-700 hover:bg-indigo-600 text-white rounded-full p-4 shadow-lg transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Initial grid setup function
function initialGrid() {
  // Create a default empty grid
  const grid = Array(8).fill().map(() => Array(7).fill().map(() => ({
    letter: '',
    highlighted: false,
    clue: '',
    icon: null,
    isNew: false
  })));
  
  // Pre-fill the grid with the existing letters
  // Row 1
  grid[0][0] = { letter: 'I', highlighted: false, clue: 'x2', icon: '🏝️' };
  grid[0][1] = { letter: 'S', highlighted: false, clue: 'MAJOR' };
  grid[0][2] = { letter: 'L', highlighted: false, clue: '' };
  grid[0][3] = { letter: 'A', highlighted: false, clue: 'VAL__' };
  grid[0][4] = { letter: 'N', highlighted: false, clue: '', icon: '⚛️' };
  grid[0][5] = { letter: '', highlighted: false, clue: 'AFTER M' };
  grid[0][6] = { letter: '', highlighted: false, clue: 'VARIOUS', icon: '📱' };
  
  // Row 2
  grid[1][0] = { letter: 'M', highlighted: false, clue: 'GATHERING' };
  grid[1][1] = { letter: 'E', highlighted: false };
  grid[1][2] = { letter: 'E', highlighted: false };
  grid[1][3] = { letter: 'T', highlighted: false };
  grid[1][4] = { letter: 'I', highlighted: false, clue: 'I AM' };
  grid[1][5] = { letter: 'M', highlighted: false, clue: 'LOUD IN MUSIC' };
  grid[1][6] = { letter: '', highlighted: false };
  
  // Row 3
  grid[2][0] = { letter: 'P', highlighted: false, clue: 'OUTCOMES' };
  grid[2][1] = { letter: 'A', highlighted: false };
  grid[2][2] = { letter: 'Y', highlighted: false };
  grid[2][3] = { letter: 'O', highlighted: false };
  grid[2][4] = { letter: 'F', highlighted: false };
  grid[2][5] = { letter: 'F', highlighted: false };
  grid[2][6] = { letter: 'S', highlighted: false };
  
  // Row 4
  grid[3][0] = { letter: 'O', highlighted: false, clue: 'EITHER' };
  grid[3][1] = { letter: 'R', highlighted: false };
  grid[3][2] = { letter: '', highlighted: true, clue: 'FINANCE MINISTRY' };
  grid[3][3] = { letter: 'M', highlighted: false };
  grid[3][4] = { letter: 'F', highlighted: false, clue: 'GIGANTIC' };
  grid[3][5] = { letter: '', highlighted: false, icon: '🏡' };
  grid[3][6] = { letter: '', highlighted: false }; // Added missing cell
  
  // Row 5
  grid[4][0] = { letter: 'R', highlighted: false, clue: 'RECYCLED MATERIAL' };
  grid[4][1] = { letter: 'C', highlighted: true };
  grid[4][2] = { letter: '', highlighted: false };
  grid[4][3] = { letter: '', highlighted: false };
  grid[4][4] = { letter: 'R', highlighted: true, clue: 'REFERENCE CREATIVITY' };
  grid[4][5] = { letter: 'E', highlighted: false };
  grid[4][6] = { letter: 'F', highlighted: false, clue: '' };
  
  // Row 6
  grid[5][0] = { letter: 'T', highlighted: false, clue: 'BRITISH THEATER' };
  grid[5][1] = { letter: 'E', highlighted: false };
  grid[5][2] = { letter: 'T', highlighted: true };
  grid[5][3] = { letter: 'R', highlighted: false };
  grid[5][4] = { letter: 'E', highlighted: false };
  grid[5][5] = { letter: '', highlighted: false }; // Added missing cell
  grid[5][6] = { letter: '', highlighted: false }; // Added missing cell
  
  // Row 7
  grid[6][0] = { letter: 'A', highlighted: false, clue: 'ANSWER' };
  grid[6][1] = { letter: 'G', highlighted: false, clue: 'LEAF COLOR' };
  grid[6][2] = { letter: 'R', highlighted: false, clue: 'EACH' };
  grid[6][3] = { letter: 'E', highlighted: false };
  grid[6][4] = { letter: 'E', highlighted: false };
  grid[6][5] = { letter: '', highlighted: false }; // Added missing cell
  grid[6][6] = { letter: '', highlighted: false }; // Added missing cell
  
  // Row 8
  grid[7][0] = { letter: 'N', highlighted: false, clue: 'TIDY' };
  grid[7][1] = { letter: 'E', highlighted: false };
  grid[7][2] = { letter: 'A', highlighted: false };
  grid[7][3] = { letter: 'S', highlighted: false, clue: 'WEB PAGE' };
  grid[7][4] = { letter: 'T', highlighted: false, clue: 'NO CHARGE' };
  grid[7][5] = { letter: 'E', highlighted: false, clue: 'INITIAL' };
  grid[7][6] = { letter: 'C', highlighted: true };
  
  return grid;
}