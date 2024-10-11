import { backend } from 'declarations/backend';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

canvas.width = 400;
canvas.height = 600;

const ninja = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.6,
    jump: -10
};

let obstacles = [];
let score = 0;
let highScore = 0;
let gameLoop;
let gameActive = false;

function drawNinja() {
    ctx.fillStyle = 'black';
    ctx.fillRect(ninja.x, ninja.y, ninja.width, ninja.height);
}

function drawObstacles() {
    ctx.fillStyle = 'green';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateNinja() {
    ninja.velocity += ninja.gravity;
    ninja.y += ninja.velocity;

    if (ninja.y + ninja.height > canvas.height) {
        ninja.y = canvas.height - ninja.height;
        ninja.velocity = 0;
    }
}

function updateObstacles() {
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
        const gap = 150;
        const height = Math.floor(Math.random() * (canvas.height - gap));
        obstacles.push(
            { x: canvas.width, y: 0, width: 50, height: height },
            { x: canvas.width, y: height + gap, width: 50, height: canvas.height - height - gap }
        );
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= 2;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    return obstacles.some(obstacle =>
        ninja.x < obstacle.x + obstacle.width &&
        ninja.x + ninja.width > obstacle.x &&
        ninja.y < obstacle.y + obstacle.height &&
        ninja.y + ninja.height > obstacle.y
    );
}

function updateScore() {
    score++;
    scoreElement.textContent = score;
}

async function updateHighScore() {
    if (score > highScore) {
        highScore = await backend.updateHighScore(score);
        highScoreElement.textContent = highScore;
    }
}

function gameOver() {
    cancelAnimationFrame(gameLoop);
    gameActive = false;
    updateHighScore();
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

function startGame() {
    ninja.y = canvas.height / 2;
    ninja.velocity = 0;
    obstacles = [];
    score = 0;
    scoreElement.textContent = '0';
    gameOverElement.classList.add('hidden');
    gameActive = true;
    gameLoop = requestAnimationFrame(update);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateNinja();
    updateObstacles();
    drawNinja();
    drawObstacles();

    if (checkCollision()) {
        gameOver();
        return;
    }

    updateScore();
    gameLoop = requestAnimationFrame(update);
}

function jump() {
    if (gameActive) {
        ninja.velocity = ninja.jump;
    } else {
        startGame();
    }
}

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        jump();
    }
});

canvas.addEventListener('click', jump);
restartButton.addEventListener('click', startGame);

async function init() {
    highScore = await backend.getHighScore();
    highScoreElement.textContent = highScore;
    startGame();
}

init();
