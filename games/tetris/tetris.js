// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// Game Constants
const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;

// Tetromino Shapes
const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Game Variables
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameLoop = null;
let gameActive = false;
let dropSpeed = 1000;
let playerName = '';

// Elements
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const linesDisplay = document.getElementById('lines');
const finalScoreDisplay = document.getElementById('finalScore');
const finalLinesDisplay = document.getElementById('finalLines');
const gameOverDiv = document.getElementById('gameOver');
const playerNameInput = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Mobile Control Buttons
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const rotateBtn = document.getElementById('rotateBtn');
const dropBtn = document.getElementById('dropBtn');
const clearLeaderboardBtn = document.getElementById('clearLeaderboard');

// Initialize Game
function initGame() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Mobile controls
    leftBtn.addEventListener('click', () => movePiece(-1, 0));
    rightBtn.addEventListener('click', () => movePiece(1, 0));
    downBtn.addEventListener('click', () => movePiece(0, 1));
    rotateBtn.addEventListener('click', rotatePiece);
    dropBtn.addEventListener('click', hardDrop);
    
    // Game controls
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    clearLeaderboardBtn.addEventListener('click', clearLeaderboard);
    
    // Load and display leaderboard
    displayLeaderboard();
}

// Start Game
function startGame() {
    playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Sila masukkan nama anda!');
        return;
    }
    
    // Disable name input and start button
    playerNameInput.disabled = true;
    startBtn.disabled = true;
    
    // Initialize game state
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropSpeed = 1000;
    gameActive = true;
    
    updateDisplay();
    
    // Create first pieces
    nextPiece = createPiece();
    spawnPiece();
    
    // Start game loop
    gameLoop = setInterval(gameStep, dropSpeed);
}

// Create Random Piece
function createPiece() {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
        shape: SHAPES[randomShape],
        color: COLORS[randomShape],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

// Spawn New Piece
function spawnPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();
    
    drawNextPiece();
    
    // Check if game over
    if (checkCollision(currentPiece)) {
        endGame();
    }
}

// Game Step
function gameStep() {
    if (!gameActive) return;
    
    if (!movePiece(0, 1)) {
        lockPiece();
        clearLines();
        spawnPiece();
    }
    
    draw();
}

// Move Piece
function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    
    if (checkCollision(currentPiece)) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        return false;
    }
    
    draw();
    return true;
}

// Rotate Piece
function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const backup = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (checkCollision(currentPiece)) {
        currentPiece.shape = backup;
    }
    
    draw();
}

// Hard Drop
function hardDrop() {
    while (movePiece(0, 1)) {}
    lockPiece();
    clearLines();
    spawnPiece();
}

// Check Collision
function checkCollision(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x;
                const newY = piece.y + y;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Lock Piece to Board
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// Clear Completed Lines
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check same row again
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        
        // Scoring: 100, 300, 500, 800
        const points = [0, 100, 300, 500, 800][linesCleared] * level;
        score += points;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        dropSpeed = Math.max(100, 1000 - (level - 1) * 100);
        
        // Restart game loop with new speed
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, dropSpeed);
        
        updateDisplay();
    }
}

// Handle Keyboard
function handleKeyPress(e) {
    if (!gameActive) return;
    
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            hardDrop();
            break;
    }
}

// Draw Everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    // Draw locked pieces
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE + 1,
                        (currentPiece.y + y) * BLOCK_SIZE + 1,
                        BLOCK_SIZE - 2,
                        BLOCK_SIZE - 2
                    );
                }
            }
        }
    }
}

// Draw Next Piece
function drawNextPiece() {
    nextCtx.fillStyle = '#2a2a2a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * 30) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * 30) / 2;
        
        nextCtx.fillStyle = nextPiece.color;
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextCtx.fillRect(
                        offsetX + x * 30 + 1,
                        offsetY + y * 30 + 1,
                        28,
                        28
                    );
                }
            }
        }
    }
}

// Update Display
function updateDisplay() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    linesDisplay.textContent = lines;
}

// End Game
function endGame() {
    gameActive = false;
    clearInterval(gameLoop);
    
    finalScoreDisplay.textContent = score;
    finalLinesDisplay.textContent = lines;
    gameOverDiv.classList.add('show');
    
    // Save to leaderboard
    saveToLeaderboard(playerName, score, lines);
}

// Restart Game
function restartGame() {
    gameOverDiv.classList.remove('show');
    playerNameInput.disabled = false;
    startBtn.disabled = false;
    playerNameInput.value = playerName;
    playerNameInput.focus();
}

// Cookie Functions
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Leaderboard Functions
function saveToLeaderboard(name, score, lines) {
    let leaderboard = getLeaderboard();
    
    // Add new entry
    leaderboard.push({
        name: name,
        score: score,
        lines: lines,
        date: new Date().toISOString()
    });
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    leaderboard = leaderboard.slice(0, 10);
    
    // Save to cookie
    setCookie('tetrisLeaderboard', JSON.stringify(leaderboard));
    
    // Update display
    displayLeaderboard();
}

function getLeaderboard() {
    const data = getCookie('tetrisLeaderboard');
    return data ? JSON.parse(data) : [];
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const container = document.getElementById('leaderboard');
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No records yet. Be the first!</p>';
        return;
    }
    
    let html = '';
    leaderboard.forEach((entry, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        html += `
            <div class="leaderboard-item ${rankClass}">
                <span class="leaderboard-rank">${medal || (index + 1)}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function clearLeaderboard() {
    if (confirm('Adakah anda pasti mahu padam semua rekod?')) {
        setCookie('tetrisLeaderboard', '', -1);
        displayLeaderboard();
    }
}

// Start the game
initGame();