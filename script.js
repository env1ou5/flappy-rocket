

let starttext = document.querySelector("#StartText");
let scoretext = document.querySelector("#Score");

let score = 0; 
let board;
let context;

let boardWidth = 1200;
let boardHeight = 800;

//explosion 

let explosionimage;

//rocket

let rocketX = boardWidth/8;
let rocketY = boardHeight/2;
let rocketWidth = 150;;
let rocketHeight = 150;

let fakerocket;
let rocket = {
    x : rocketX,
    y : rocketY,
    Width : rocketWidth,
    Height : rocketHeight,
};

//pipes 

let pipesHolder = [];
let pipeWidth = 256;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let TopPipeImage;
let BottomPipeImage;

//physics

let velX = -2;
let velY = 0;
let gravity = 0.1;

// game

let gamestarted = false; 
let gameover = false; 
let speed = 10;
let pipespawner;
let backgroundpos = 0;

function update(dt) {

    context.clearRect(0,0,board.width,board.height);

    velY += gravity;
    rocket.y = Math.max(rocket.y + velY, rocket.Height/4);
    rocket.y = Math.min(rocket.y, boardHeight - rocket.Height/4);
    
    let boardpos = board.getBoundingClientRect();
    
    fakerocket.style.top = boardpos.top + rocket.y - rocket.Height/2 + "px";
    fakerocket.style.left = boardpos.left + rocket.x + "px";
    fakerocket.style.rotate = Math.min(velY*4,40)+"deg"

    for (let i = 0; i < pipesHolder.length; i++) {
        
        let pipe = pipesHolder[i];

        if (pipe.x <= -pipe.width) {
            pipesHolder.splice(i, 1)
            i-=1;
        } else {
            pipe.x += velX - speed/100;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }

        let onPipeX = (rocket.x - rocket.Width/2 <= pipe.x + pipe.width/2) && (rocket.x - rocket.Width/2 >= pipe.x - pipe.width/2);
        let onPipeY = (rocket.y <= pipe.y + pipe.height) && (rocket.y >= pipe.y); 

        if (onPipeX && onPipeY) {
            gameover = true;
        } else if (rocket.x >= pipe.x + pipe.width/2 && pipe.passed == false) {
            score += 1;
            speed += 10
            
            scoretext.innerHTML = "SCORE: " + score;
            pipe.passed = true; 

            let scoresound = new Audio()
            scoresound.volume = 0.25
            scoresound.src = "sounds/score.wav"
            scoresound.play()
        }
    }

    board.style["background-position"] =  backgroundpos + "px 0px"
    backgroundpos -= 1 + speed/100

    if (rocket.y == boardHeight - rocket.Height/4 || gameover) {

        gameover = true;
        gamestarted = false;

        fakerocket.style.visibility = "hidden";

        let explosion = new Audio()
        explosion.volume = 0.25
        explosion.src = "sounds/explosion.wav"
        explosion.play()

        starttext.style.visibility = "visible";

        explosionimage = new Image();
        explosionimage.className = "Explosion";
        explosionimage.src = "images/explosion.png";
        explosionimage.style.top = boardpos.top + rocket.y - rocket.Height/2 + "px";
        explosionimage.style.left = boardpos.left + rocket.x + "px";

        document.body.appendChild(explosionimage);

        clearInterval(pipespawner);

    } else {
        requestAnimationFrame(update);
    }
}

function DrawPipes() {
    
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let gapspace = board.height/2;

    let TopPipe = {
        img : TopPipeImage,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed :  false
    };

    let BottomPipe = {
        img : BottomPipeImage,
        x : pipeX,
        y : randomPipeY + pipeHeight + gapspace,
        width : pipeWidth,
        height : pipeHeight,
    };

    pipesHolder.push(TopPipe);
    pipesHolder.push(BottomPipe);

    clearInterval(pipespawner);
    pipespawner = setInterval(DrawPipes, 15000/(10+(speed-10)*0.01));
}

function OnClick() {

    if (!gamestarted) {

        pipesHolder = []

        score = 0;
        gameover = false;
        gamestarted = true;
        starttext.style.visibility = "hidden";
        scoretext.style.visibility = "visible";
        scoretext.innerHTML = "SCORE: " + score;

        if (explosionimage) {
            document.body.removeChild(explosionimage);
        }

        rocket.x = boardWidth/8;
        rocket.y = boardHeight/2;
        fakerocket.style.visibility = "visible";

        requestAnimationFrame(update)

        pipespawner = setInterval(DrawPipes, 15000/(10+(speed-10)*0.01));
    }

    if (!gameover) {
        let jumpsound = new Audio()
        jumpsound.volume = 0.25
        jumpsound.src = "sounds/jump.wav"
        jumpsound.play()

        velY = -6;
    }
}

window.onload = function() {

    board = document.getElementById("board");
    board.height = boardHeight
    board.width = boardWidth

    let boardpos = board.getBoundingClientRect();

    context = board.getContext("2d");
    context.fillStyle = "green";
    context.imageSmoothingEnabled = false;

    TopPipeImage = new Image();
    TopPipeImage.src = "images/topPipe.png";

    BottomPipeImage = new Image();
    BottomPipeImage.src = "images/bottomPipe.png";

    fakerocket = new Image();
    fakerocket.width = rocket.Width
    fakerocket.height = rocket.Height
    fakerocket.src = "images/rocket.png";
    fakerocket.className = "rocket";
    fakerocket.style.top = boardpos.top + rocket.y - rocket.Height/2 + "px";
    fakerocket.style.left = boardpos.left + rocket.x + "px";

    document.body.appendChild(fakerocket)
}


document.addEventListener("click", OnClick);