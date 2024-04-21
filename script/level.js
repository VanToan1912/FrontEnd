// Trần Văn Toàn
// DH21DTD
// 21130572
let container = document.getElementById("container");
let refreshbtn = document.getElementById("refresh");

//màn hình game
let board;
let boardWidth = 500;
let boardHeight = 650;
let context;

//người chơi
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 10;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//quả banh
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 6; 
let ballVelocityY = 4;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

//mục tiêu
let blockArray = [];
let blockWidth = 500; 
let blockHeight = 10;
let blockColumns = 8; 
let blockRows = 3; 
let blockCount = 0;

//mục tiêu đầu tiên sẽ được tạo ở góc trên bên trái
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
    context = board.getContext("2d");

    //vẽ người chơi trên canvas
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("mousemove", movePlayer);

    //tạo tất cả mục tiêu
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
        if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // vẽ người chơi
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // vẽ quả banh
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    handlePlayerBallCollision();

    handleBallBoardCollision();

    drawBlocks();

    handleBallBlockCollision();

    //Thắng game
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

    //Điểm
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

// function update vị trí người chơi
function movePlayer(e) {
    if (gameOver) {
        setTimeout(resetGame(), 3000);
        console.log("RESET");
        return;
    }
    // tính vị trí người chơi
    let mouseX = e.clientX - board.offsetLeft;
    let nextPlayerX = mouseX - player.width / 2;
    //giữ người chơi trong màn hình, không cho người chơi di chuyển khỏi màn hình
    if (nextPlayerX >= 0 && nextPlayerX <= boardWidth - player.width) {
        player.x = nextPlayerX;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //góc trên bên trái của a đụng góc trên bên phải của b
        a.x + a.width > b.x && //góc trên bên phải của a đụng góc trên bên trái của b
        a.y < b.y + b.height && //góc dưới bên trái của a đụng góc dưới bên phải của 
        a.y + a.height > b.y; //góc dưới bên phải của a đụng góc dưới bên trái của 
}

function handlePlayerBallCollision() {
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1; // đảo ngược chiều lên xuống của quả banh
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1; // đảo ngược chiều trái phải của quả banh
    }
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function handleBallBoardCollision() {
    if (ball.y <= 0) {
        // nếu banh đụng cạnh trên của màn hình
        ball.velocityY *= -1; //đảo ngược hướng
    } else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // nếu banh đụng cạnh trái hoặc cạnh phải của màn hình
        ball.velocityX *= -1; //đảo ngược hướng
    } else if (ball.y + ball.height >= boardHeight) {
        // nếu banh đụng cạnh dưới của màn hình (thua cuộcc)
        handleGameOver();
    }
}

function handleBallBlockCollision() {
    //nếu banh chạm mục tiêu, mục tiêu vỡ (ngưng vẽ mục tiêu) và cộng thêm điểm vào tổng điểm
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
    blockArray = []; //tạo mảng chứa các mục tiêu
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10, //vị trí theo chiều dọc của mục tiêu là c*10, các cột mục tiêu cách nhau 10px
                y: blockY + r * blockHeight + r * 10, //vị trí theo chiều ngang của mục tiêu là r*10, các hàng mục tiêu cách nhau 10px
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