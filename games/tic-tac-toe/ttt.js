// Game State
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// Winning Combinations
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Elements
const cells = document.querySelectorAll('.cell');
const turnDisplay = document.getElementById('turnDisplay');
const restartBtn = document.getElementById('restartBtn');

// Initialize Game
function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    restartBtn.addEventListener('click', restartGame);
}

// Handle Cell Click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell already taken or game not active
    if (gameBoard[clickedIndex] !== '' || !gameActive) {
        return;
    }

    // Update game state
    gameBoard[clickedIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('taken');

    // Check for winner or draw
    checkResult();
}

// Check Game Result
function checkResult() {
    let roundWon = false;
    let winningCombination = [];

    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        const a = gameBoard[condition[0]];
        const b = gameBoard[condition[1]];
        const c = gameBoard[condition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombination = condition;
            break;
        }
    }

    if (roundWon) {
        // Highlight winning cells
        winningCombination.forEach(index => {
            cells[index].classList.add('winning');
        });
        
        turnDisplay.textContent = `Player ${currentPlayer} Wins! 🎉`;
        gameActive = false;
        return;
    }

    // Check for draw
    if (!gameBoard.includes('')) {
        turnDisplay.textContent = 'Draw! 🤝';
        gameActive = false;
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnDisplay.textContent = `Player ${currentPlayer} Turn`;
}

// Restart Game
function restartGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    turnDisplay.textContent = 'Player X Turn';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'winning');
    });
}

// Start the game
initGame();