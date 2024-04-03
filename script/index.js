//board
let board;
let boardWidth = 500;
let boardHeight = 600;
let context;

//player
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 20;

let player = {
  x: boardWidth / 2 - playerWidth / 2,
  y: boardHeight - playerHeight - 5,
  width: playerWidth,
  height: playerHeight,
  velocityX: playerVelocityX,
};

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3; //as the game progress, add more
let blockMaxRows = 10;
let blockCount = 0;
//starting block corner top left
let blockX = 15;
let blockY = 45;

//scores
let score = 0;

//game over
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  //draw player
  context.fillStyle = "lightgreen";
  context.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(update);
  document.addEventListener("keydown", movePlayer);

  //create blocks
  createBlocks();
};

function update() {
  requestAnimationFrame(update);
  //stop re-drawing when you lose
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

  //bounce the ball off the player
  if (topCollison(ball, player) || bottomCollison(ball, player)) {
    ball.velocityY *= -1;
  }
  if (leftCollison(ball, player) || rightCollison(ball, player)) {
    ball.velocityX *= -1;
  }

  // ball bouncing
  if (ball.y <= 0) {
    // if ball touches top of canvas
    ball.velocityY *= -1; //reverse direction
  } else if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
    // if ball touches left or right of canvas
    ball.velocityX *= -1; //reverse direction
  } else if (ball.y + ball.height >= boardHeight) {
    //ball touches the bottom
    //game over
    context.font = "20px sans-serif";
    context.fillText("Game Over. Press 'Space' to Restart", 80, 400);
    gameOver = true;
  }

  //draw the blocks
  context.fillStyle = "skyblue";
  for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];
    if (!block.break) {
      if (topCollison(ball, block) || bottomCollison(ball, block)) {
        block.break = true;
        ball.velocityY *= -1;
        blockCount -= 1;
        score += 50;
      } else if (leftCollison(ball, block) || rightCollison(ball, block)) {
        block.break = true;
        ball.velocityX *= -1;
        blockCount -= 1;
        score += 50;
      }
      context.fillRect(block.x, block.y, block.width, block.height);
    }
  }

  //next level
  if (blockCount == 0) {
    score += 50 * blockRows * blockColumns;
    blockRows = Math.min(blockRows + 1, blockMaxRows);
    createBlocks();
  }

  //scores
  context.font = "20px sans-serif";
  context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + playerWidth > boardWidth;
}

function movePlayer(e) {
  if (gameOver) {
    if ((e.code = "Space")) {
      resetGame();
    }
  }

  if (e.code == "ArrowLeft") {
    let nextPlayerX = player.x - playerVelocityX;
    if (!outOfBounds(nextPlayerX)) {
      player.x = nextPlayerX;
    }
  } else if (e.code == "ArrowRight") {
    let nextPlayerX = player.x + playerVelocityX;
    if (!outOfBounds(nextPlayerX)) {
      player.x = nextPlayerX;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y //a's bottom left corner passes b's top left corner
  ); 
}

function topCollison(ball, block) {
  //a is above b
  return detectCollision(ball, block) && ball.y + ball.height >= block.y;
}

function bottomCollison(ball, block) {
  //a is below b
  return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollison(ball, block) {
  //a is left to b
  return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollison(ball, block) {
  //a is right to b
  return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

function createBlocks() {
  blockArray = [];
  for (let c = 0; c < blockColumns; c++) {
    for (let r = 0; r < blockRows; r++) {
      let block = {
        x: blockX + c * blockWidth + c * 10,
        y: blockY + r * blockHeight + r * 10,
        width: blockWidth,
        height: blockHeight,
        break: false,
      };
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
    velocityX: playerVelocityX,
  };

  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
  };

  blockArray = [];
  blockRows = 3;
  score = 0;
  createBlocks();
}
