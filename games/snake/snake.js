// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
const gridSize = 20;
const tileCount = 30; // 600px / 20px = 30 tiles
let snake = [{x: 15, y: 15}];
let velocity = {x: 0, y: 0};
let food = {x: 10, y: 10};
let score = 0;
let gameLoop;
let gameSpeed = 100; // milliseconds

// Elements
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Initialize Game
function initGame() {
    document.addEventListener('keydown', changeDirection);
    restartBtn.addEventListener('click', restartGame);
    spawnFood();
    startGame();
}

// Start Game Loop
function startGame() {
    gameLoop = setInterval(updateGame, gameSpeed);
}

// Main Game Update
function updateGame() {
    // Move snake
    moveSnake();
    
    // Check collisions
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // Check food
    if (checkFood()) {
        score++;
        scoreDisplay.textContent = score;
        growSnake();
        spawnFood();
        
        // Speed up slightly every 5 points
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            startGame();
        }
    }
    
    // Draw everything
    draw();
}

// Move Snake
function moveSnake() {
    const head = {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y
    };
    
    snake.unshift(head);
    snake.pop();
}

// Grow Snake
function growSnake() {
    const tail = {...snake[snake.length - 1]};
    snake.push(tail);
}

// Change Direction
function changeDirection(e) {
    const key = e.key;
    
    // Prevent reverse direction
    if (key === 'ArrowUp' && velocity.y === 0) {
        velocity = {x: 0, y: -1};
    } else if (key === 'ArrowDown' && velocity.y === 0) {
        velocity = {x: 0, y: 1};
    } else if (key === 'ArrowLeft' && velocity.x === 0) {
        velocity = {x: -1, y: 0};
    } else if (key === 'ArrowRight' && velocity.x === 0) {
        velocity = {x: 1, y: 0};
    }
}

// Check Collision
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Check Food
function checkFood() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// Spawn Food
function spawnFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        
        // Check if food spawns on snake
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

// Draw Everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (optional)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head (brighter green)
            ctx.fillStyle = '#00ff00';
        } else {
            // Body (darker green)
            ctx.fillStyle = '#00cc00';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
        food.x * gridSize + 1,
        food.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    );
}

// End Game
function endGame() {
    clearInterval(gameLoop);
    finalScoreDisplay.textContent = score;
    gameOverDiv.classList.add('show');
}

// Restart Game
function restartGame() {
    // Reset variables
    snake = [{x: 15, y: 15}];
    velocity = {x: 0, y: 0};
    score = 0;
    gameSpeed = 100;
    
    // Update display
    scoreDisplay.textContent = score;
    gameOverDiv.classList.remove('show');
    
    // Restart
    spawnFood();
    startGame();
}

// Start the game
initGame();