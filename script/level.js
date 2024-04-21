// Trần Văn Toàn
// DH21DTD
// 21130572
let container = document.getElementById("container");
let refreshbtn = document.getElementById("refresh");

//board
let board;
let boardWidth = 500;
let boardHeight = 650;
let context;

//players
let playerWidth = 500; //500 for testing, 80 normal
let playerHeight = 10;
let playerVelocityX = 10; //move 10 pixels each time

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 6; //15 for testing, 3 normal
let ballVelocityY = 4; //10 for testing, 2 normal

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 500; //50
let blockHeight = 10;
let blockColumns = 1; //8
let blockRows = 1; //3 //add more as game goes on
// let blockMaxRows = 10; //limit how many rows
let blockCount = 0;

//starting block corners top left
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

let button1 = document.getElementById("btn-1");
button1.addEventListener("click", level1);
function level1() {
    container.style.display = "none";
    refreshbtn.style.display = "block";

    board = document.getElementById("board");
    board.style.display = "block";
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("mousemove", movePlayer);

    //create blocks
    createBlocks();
}

let button2 = document.getElementById("btn-2");
let button3 = document.getElementById("btn-3");
let button4 = document.getElementById("btn-4");
let button5 = document.getElementById("btn-5");
let button6 = document.getElementById("btn-6");

[button2, button3, button4, button5, button6].forEach(function (element) {
    element.addEventListener("click", function () {
        window.alert("Level chưa được thêm");
    });
});

function update() {
    requestAnimationFrame(update);
    //stop drawing
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    handlePlayerBallCollision();

    handleBallBoardCollision();

    drawBlocks();

    handleBallBlockCollision();

    //game ended
    if (blockCount == 0) {
        context.font = "20px sans-serif";
        context.fillText("Bạn Đã Thắng! Quay Lại Màn Hình Chính", 80, 400);
        ball.velocityX = 0;
        ball.velocityY = 0;
        setTimeout(function () {
            console.log("Hi")
            window.location.reload();
        }, 3000)
    }

    //score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

// Update movePlayer to handle mouse movement
function movePlayer(e) {
    if (gameOver) {
        setTimeout(resetGame(), 3000);
        console.log("RESET");
        return;
    }
    // Calculate the new player position based on mouse movement
    let mouseX = e.clientX - board.offsetLeft;
    let nextPlayerX = mouseX - player.width / 2;
    // Ensure the player stays within the board boundaries
    if (nextPlayerX >= 0 && nextPlayerX <= boardWidth - player.width) {
        player.x = nextPlayerX;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && //a's top right corner passes b's top left corner
        a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}

function handlePlayerBallCollision() {
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1; // flip y direction up or down
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1; // flip x direction left or right
    }
}

function topCollision(ball, block) { //a is above b (ball is above block)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a is above b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { //a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a is right of b (ball is right of block)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function handleBallBoardCollision() {
    if (ball.y <= 0) {
        // if ball touches top of canvas
        ball.velocityY *= -1; //reverse direction
    } else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    } else if (ball.y + ball.height >= boardHeight) {
        // if ball touches bottom of canvas
        handleGameOver();
    }
}

function handleBallBlockCollision() {
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break && detectCollision(ball, block)) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                score += 100;
                blockCount--;
            } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1;
                score += 100;
                blockCount--;
            }
        }
    }
}


function handleGameOver() {
    context.font = "20px sans-serif";
    context.fillText("Bạn Đã Thua. Đợi 3 Giây Để Chơi Lại", 80, 400);
    gameOver = true;
}

function drawBlocks() {
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
}

function createBlocks() {
    blockArray = []; //clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10, //c*10 space 10 pixels apart columns
                y: blockY + r * blockHeight + r * 10, //r*10 space 10 pixels apart rows
                width: blockWidth,
                height: blockHeight,
                break: false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}