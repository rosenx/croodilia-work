let crocodile;
let gravity = 0.1;
let maxSafeSpeed = 5; // 安全速度阈值
let upwardThrust = -2;
let horizontalSpeed = 2;
let gameFailed = false;
let gameSuccess = false;
let score = 0; // 初始化分数
let waterY;
let waterHeight = 150;
let splashParticles = [];
let splashTriggered = false;
let stars = []; // 存储星星的位置
let meteors = []; // 存储流星的位置和速度
let coins = []; // 存储金币的位置
let fireworks = []; // 存储烟花效果
let gameState = 'start'; // 设置游戏状态：'start'，'play'，'end'

function setup() {
    createCanvas(700, 800);
    waterY = height - 150;
    resetCrocodile();
    generateStars(10); // 生成 10 颗星星
    generateMeteors(20); // 生成 20 颗流星
    generateCoins(3); // 生成 3 个金币
}

function draw() {
    background(10, 10, 30); // 深色太空背景

    // 绘制流星效果
    drawMeteors();

    // 根据 gameState 显示不同的屏幕
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'play') {
        playGame();
        displaySpeed(); // 显示鳄鱼下降速度
        displayScore(); // 显示分数
    } else if (gameState === 'end') {
        drawEndScreen();
    }
}

function displaySpeed() {
    fill(255); // 白色文本
    textSize(16);
    textAlign(RIGHT, TOP);
    text("下降速度: " + nf(abs(crocodile.velocityY), 0, 2), width - 20, 20);
}

function displayScore() {
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text("分数: " + score, 20, 20);
}

function drawStartScreen() {
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("欢迎来到鳄鱼游戏！", width / 2, height / 2 - 20);
    textSize(20);
    text("按空格键开始游戏", width / 2, height / 2 + 20);
}

function playGame() {
    // 确保游戏状态切换时重置鳄鱼
    if (crocodile.y === undefined || crocodile.x === undefined) {
        resetCrocodile();
    }

    // Draw water with waves
    drawWater();

    // Apply gravity to the crocodile's vertical velocity
    crocodile.velocityY += gravity;

    // Update the crocodile's position
    crocodile.y += crocodile.velocityY;
    crocodile.x += crocodile.velocityX;

    // Keep crocodile within horizontal bounds
    crocodile.x = constrain(crocodile.x, 0, width);

    // Draw the crocodile
    drawCrocodile();

    // Draw stars and check for collision
    drawStars();
    checkStarCollision();

    // Draw coins and check for collision
    drawCoins();
    checkCoinCollision();

    // Check if the crocodile touches the water
    checkWaterContact();

    // Draw splash particles
    drawSplashParticles();

    // Display failure or success message and transition to end screen
    if (gameFailed || gameSuccess) {
        gameState = 'end';
    }
}

function drawEndScreen() {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER);
    if (gameFailed) {
        text("游戏失败！按 R 键重新开始", width / 2, height / 2);
    } else if (gameSuccess) {
        text("游戏成功！按 R 键重新开始", width / 2, height / 2);
        drawFireworks(); // 显示烟花效果
    }
}

function resetCrocodile() {
    crocodile = {
        x: 200,
        y: 50,
        velocityY: 0,
        velocityX: 0
    };
    gameFailed = false;
    gameSuccess = false;
    score = 0; // 重置分数
    splashParticles = [];
    splashTriggered = false;
    coins = [];
    generateCoins(3); // 重置金币
    fireworks = []; // 重置烟花效果
}

function generateStars(numStars) {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: random(width),
            y: random(100, waterY - 100), // 确保星星在水面上方
            size: random(20, 30) // 增大星星的尺寸
        });
    }
}

function generateMeteors(numMeteors) {
    meteors = [];
    for (let i = 0; i < numMeteors; i++) {
        meteors.push({
            x: random(width),
            y: random(-500, -50), // 初始位置在屏幕上方
            speed: random(2, 5), // 每颗流星的速度不同
            length: random(10, 20) // 流星长度
        });
    }
}

function generateCoins(numCoins) {
    for (let i = 0; i < numCoins; i++) {
        coins.push({
            x: random(50, width - 50),
            y: random(50, waterY - 150), // 确保金币在水面之上
            collected: false
        });
    }
}

function drawMeteors() {
    stroke(255, 255, 255, 150); // 半透明的白色
    strokeWeight(2);
    for (let meteor of meteors) {
        line(meteor.x, meteor.y, meteor.x - meteor.length, meteor.y + meteor.length); // 绘制斜向流星

        // 更新流星位置
        meteor.y += meteor.speed;
        meteor.x -= meteor.speed * 0.5;

        // 如果流星超出屏幕范围，重置到顶部
        if (meteor.y > height || meteor.x < 0) {
            meteor.y = random(-500, -50);
            meteor.x = random(width, width + 100);
            meteor.speed = random(2, 5);
        }
    }
}

function drawCoins() {
    fill(255, 215, 0); // 金黄色
    noStroke();
    for (let coin of coins) {
        if (!coin.collected) {
            ellipse(coin.x, coin.y, 20, 20); // 绘制金币
        }
    }
}

function checkCoinCollision() {
    for (let coin of coins) {
        if (!coin.collected && dist(crocodile.x, crocodile.y, coin.x, coin.y) < 20) {
            coin.collected = true;
            score += 10; // 每次收集一个金币增加10分
        }
    }
}

function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function drawStars() {
    fill(255, 223, 0); // 黄色的星星
    noStroke();
    for (let star of stars) {
        drawStar(star.x, star.y, star.size * 0.4, star.size, 5); // 绘制五角星
    }
}

function checkStarCollision() {
    for (let star of stars) {
        let d = dist(crocodile.x, crocodile.y, star.x, star.y);
        if (d < star.size + 15) { // 增加星星的碰撞体积
            gameFailed = true;
            break;
        }
    }
}

function drawCrocodile() {
    push();
    translate(crocodile.x, crocodile.y);

    // Body
    fill(107, 142, 35); // Green color
    noStroke();
    rect(0, 0, 80, 30, 10); // Body rectangle

    // Tail
    arc(40, 5, 40, 30, -PI / 2, PI / 2); // Tail curve

    // Head
    ellipse(-35, 0, 40, 25); // Head shape

    // Eyes
    fill(255);
    ellipse(-45, -10, 10, 10); // Left eye
    ellipse(-25, -10, 10, 10); // Right eye
    fill(0);
    ellipse(-45, -10, 5, 5); // Left pupil
    ellipse(-25, -10, 5, 5); // Right pupil

    // Mouth
    stroke(0);
    strokeWeight(2);
    noFill();
    arc(-35, 8, 25, 10, 0, PI / 2); // Smiling mouth

    // Scales or spikes on the back
    fill(0, 100, 0); // Darker green for scales
    triangle(0, -10, 10, -10, 5, -20);
    triangle(15, -10, 25, -10, 20, -20);
    triangle(30, -10, 40, -10, 35, -20);

    pop();
}

function drawWater() {
    fill(0, 191, 255, 200); // Semi-transparent blue
    rectMode(CENTER);
    rect(width / 2, waterY + waterHeight / 2, width, waterHeight);

    // Draw waves on the water
    stroke(255, 255, 255, 150); // Light blue waves
    strokeWeight(2);
    for (let i = 0; i < width; i += 20) {
        line(i, waterY, i + 10, waterY - 5); // Small wave segments
        line(i + 10, waterY - 5, i + 20, waterY); // Downward wave segments
    }
}

function checkWaterContact() {
    if (crocodile.y + 10 >= waterY) {
        if (Math.abs(crocodile.velocityY) > maxSafeSpeed) {
            gameFailed = true; // 速度超过10，游戏失败
        } else if (!splashTriggered) {
            if (score === 30) {
                gameSuccess = true; // 分数达到30，且安全降落
            } else {
                gameSuccess = false; // 分数不足，不能成功
            }
            createSplash(crocodile.x, waterY); // 生成溅水效果
            splashTriggered = true;
        }
        crocodile.velocityY *= 0.5; // Slow down crocodile if it touches water at safe speed
        crocodile.y = constrain(crocodile.y, 0, waterY - 10);
    } else {
        splashTriggered = false; // Reset splash trigger when above water
    }
}

function keyPressed() {
    if (gameState === 'start' && (key === ' ' || key === 'Space')) {
        gameState = 'play'; // 按空格键进入游戏
        resetCrocodile(); // 确保每次游戏开始时重置鳄鱼
    } else if (gameState === 'end' && (key === 'r' || key === 'R')) {
        resetCrocodile();
        gameState = 'start'; // 重新开始游戏，返回开始屏幕
    } else if (gameState === 'play') {
        if (key === 'ArrowUp') {
            crocodile.velocityY = upwardThrust; // Apply upward thrust
            createSplash(crocodile.x, crocodile.y + 20); // Small splash under the crocodile
        } else if (key === 'ArrowLeft') {
            crocodile.velocityX = -horizontalSpeed; // Move left
        } else if (key === 'ArrowRight') {
            crocodile.velocityX = horizontalSpeed; // Move right
        }
    }
}

function keyReleased() {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        crocodile.velocityX = 0; // Stop horizontal movement when arrow key is released
    }
}

function createSplash(x, y) {
    for (let i = 0; i < 10; i++) {
        splashParticles.push({
            x: x,
            y: y,
            size: random(5, 10),
            speedX: random(-1, 1),
            speedY: random(-2, 0),
            lifetime: 30
        });
    }
}

function drawSplashParticles() {
    for (let i = splashParticles.length - 1; i >= 0; i--) {
        let particle = splashParticles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.lifetime--;

        noStroke();
        fill(173, 216, 230, map(particle.lifetime, 0, 30, 0, 255)); // Fading effect
        ellipse(particle.x, particle.y, particle.size);

        if (particle.lifetime <= 0) {
            splashParticles.splice(i, 1);
        }
    }
}

function createFirework(x, y) {
    for (let i = 0; i < 100; i++) {
        fireworks.push({
            x: x,
            y: y,
            speedX: random(-2, 2),
            speedY: random(-2, 2),
            lifetime: 50
        });
    }
}

function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let firework = fireworks[i];
        firework.x += firework.speedX;
        firework.y += firework.speedY;
        firework.lifetime--;

        noStroke();
        fill(255, random(100, 255), random(100, 255), map(firework.lifetime, 0, 50, 0, 255)); // 渐变效果
        ellipse(firework.x, firework.y, 5);

        if (firework.lifetime <= 0) {
            fireworks.splice(i, 1);
        }
    }
    if (fireworks.length === 0) {
        createFirework(random(width), random(height)); // 生成随机位置的烟花
    }
}
