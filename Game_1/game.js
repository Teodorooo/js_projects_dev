const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let boxX = canvas.width / 2;
let boxY = (canvas.height / 2) + (canvas.height / 4);
const boxSize = 50;
const moveSpeed = 5;
let playerLives = 3;
let gameOver = false;
let gameWon = false;

const enemySize = 20;
const enemyMoveSpeed = 2;
const enemyCount = 6;
let enemies = [];

const bulletWidth = 4;
const bulletHeight = 10;
const bulletSpeed = 4;
let enemyBullets = [];
let playerBullets = [];

const shieldWidth = 70;
const shieldHeight = 20;
let shields = [
    { x: boxX - 150, y: boxY - 100, lives: 3 },
    { x: boxX + 80, y: boxY - 100, lives: 3 }
];

// Initialize enemies
for (let i = 0; i < enemyCount; i++) {
    enemies.push({
        x: Math.random() * (canvas.width - enemySize),
        y: Math.random() * (canvas.height / 2 - enemySize),
        moveDirection: 1
    });
}

function update() {
    if (gameOver) {
        ctx.font = '48px sans-serif';
        ctx.fillText('You Lose', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    if (gameWon) {
        ctx.font = '48px sans-serif';
        ctx.fillText('You Win', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player box
    ctx.fillStyle = 'black';
    ctx.fillRect(boxX, boxY, boxSize, boxSize);

    // Draw shields
    shields.forEach(shield => {
        if (shield.lives > 0) {
            ctx.fillStyle = 'grey';
            ctx.fillRect(shield.x, shield.y, shieldWidth, shieldHeight);
        }
    });

    // Draw and move enemies
    ctx.fillStyle = 'green';
    enemies.forEach((enemy, enemyIndex) => {
        enemy.x += enemyMoveSpeed * enemy.moveDirection;
        if (enemy.x <= 0 || enemy.x + enemySize >= canvas.width) {
            enemy.moveDirection *= -1; // Change direction
        }
        ctx.fillRect(enemy.x, enemy.y, enemySize, enemySize);

        // Enemy shooting logic
        if (Math.random() < 0.01) { // Random chance to shoot
            enemyBullets.push({
                x: enemy.x + enemySize / 2 - bulletWidth / 2,
                y: enemy.y + enemySize,
            });
        }

        // Check for enemy collision with player bullets
        playerBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemySize &&
                bullet.x + bulletWidth > enemy.x &&
                bullet.y < enemy.y + enemySize &&
                bullet.y + bulletHeight > enemy.y) {
                    enemies.splice(enemyIndex, 1);
                    playerBullets.splice(bulletIndex, 1);
            }
        });
    });

    // Draw and move enemy bullets
    ctx.fillStyle = 'red';
    enemyBullets.forEach((bullet, bulletIndex) => {
        bullet.y += bulletSpeed;
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);

        // Check for bullet collision with player
        if (bullet.x < boxX + boxSize &&
            bullet.x + bulletWidth > boxX &&
            bullet.y < boxY + boxSize &&
            bullet.y + bulletHeight > boxY) {
                playerLives--;
                enemyBullets.splice(bulletIndex, 1);
                if (playerLives <= 0) {
                    gameOver = true;
                }
        }

        // Check for bullet collision with shields
        shields.forEach(shield => {
            if (shield.lives > 0 && bullet.x < shield.x + shieldWidth &&
                bullet.x + bulletWidth > shield.x &&
                bullet.y < shield.y + shieldHeight &&
                bullet.y + bulletHeight > shield.y) {
                    shield.lives--;
                    enemyBullets.splice(bulletIndex, 1);
            }
        });

        // Remove bullet if it goes off the canvas
        if (bullet.y > canvas.height) {
            enemyBullets.splice(bulletIndex, 1);
        }
    });

    // Draw and move player bullets
    ctx.fillStyle = 'blue';
    playerBullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bulletSpeed;
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);

        // Remove bullet if it goes off the canvas
        if (bullet.y + bulletHeight < 0) {
            playerBullets.splice(bulletIndex, 1);
        }
    });

    // Check if all enemies are eliminated
    if (enemies.length === 0) {
        gameWon = true;
    }

    requestAnimationFrame(update);
}

document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowLeft':
            if (boxX - moveSpeed >= 0) {
                boxX -= moveSpeed;
            }
            break;
        case 'ArrowRight':
            if (boxX + boxSize + moveSpeed <= canvas.width) {
                boxX += moveSpeed;
            }
            break;
        case ' ':
            // Player shooting
            playerBullets.push({
                x: boxX + boxSize / 2 - bulletWidth / 2,
                y: boxY
            });
            break;
    }
});

update();