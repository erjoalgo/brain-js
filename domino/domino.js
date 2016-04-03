var successAudio = new Audio("../sounds/success_beep.wav");
var failAudio = new Audio("../sounds/error_beep.wav");

// <canvas id="myCanvas" width="200" height="100" style="border:1px solid #000000;"></canvas>

function paintDominoTile ( canvas, topNum, botNum )	{
    var g2 = canvas.getContext("2d");
    var square = canvas.width;
    assert(canvas.height == canvas.width*2);
    var space = square/7;
    var third = (square-2*space)/2;
    var radius = square/15;
    
    g2.beginPath();
    g2.rect(0,0,square, square*2);
    g2.rect(0,0,square, square);
    g2.stroke();


    for (var i = 0; i<2; i++)	{
	var offset = square*i;
	var number = i == 0? topNum: botNum;
	var balls = ballsForNumber[number];
	assert(balls);
	for (var b = 0; b<balls.length; b++)	{
	    var r = Math.floor(balls[b]/3);
	    var c = Math.floor(balls[b]%3);
	    g2.beginPath();
	    g2.arc(third*c+space,offset + third*r+ space,radius,0,2*Math.PI);
	    g2.fill();
	}
    }
    return canvas;
}

var ballsForNumber = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 6, 8, 4],
    6: [0, 2, 6, 8, 3, 5],
    7: [0, 2, 6, 8, 3, 5, 4],
    8: [0, 2, 6, 8, 3, 5, 1, 7],
    9: [0, 2, 6, 8, 3, 5, 1, 7, 4],
}

function randN ( i )	{
    return Math.floor(Math.random() * i);
}
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function sleep ( ms )	{
    return (new Promise(function(resolve, reject){
	setTimeout(function(){resolve();}, ms);
    }));
}

function formatSecs ( secs )	{
    var mins = Math.floor(secs/60);
    var secs = secs%60;
    return mins+":"+(secs<10? "0":"")+secs;
}
function Game ( difficultyManager )	{
    this.setupAndStart = function(nTiles){
	if (!this.isGameOver)	{
	    
	    var total = 0;
	    this.removeTiles();
	    for (var i = 0; i<nTiles; i++)	{
		var canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 200;
		var topNum = 1+randN(9);
		var botNum = 1+randN(9);
		paintDominoTile(canvas, topNum, botNum);
		total += topNum + botNum;
		var td = document.createElement("td");
		td.appendChild(canvas);
		tilesRow.appendChild(td);
	    }
	    this.currTotal = total;
	    
	    // inputBox.select();
	    inputBox.value = "";
	    inputBox.focus();
	}
    }

    this.removeTiles = function(){
	while (tilesRow.firstChild)	{
	    tilesRow.removeChild(tilesRow.firstChild);
	}
    }

    var self = this;
    inputBox.onkeydown = function(event){
	if (event.keyCode==13 || event.keyCode == 9) {
	    var number = parseInt(inputBox.value);
	    if (isNaN(number) || number-Math.floor(number) != 0)	{
		alert("bad input: "+number);
	    }else 	{
		self.answer(number == self.currTotal);
	    }
	    event.preventDefault();
	}
    }
    this.answer = function(correct){
	(correct? successAudio: failAudio).play();
	var nTiles = this.difficultyManager.answer(correct);
	this.removeTiles();
	sleep(this.difficultyManager[correct? "correctDelay": "failDelay"]).then(
	    function(){
		self.setupAndStart(nTiles);
	    });
    }
    this.difficultyManager = difficultyManager;
    this.start = function(){
	this.setupAndStart(this.difficultyManager.start)
	this.startClock(this.difficultyManager.totalSecs, this.gameOver);
    };
    this.startClock = function(totalSecs, doneFunc){
	// clock.innerText = totalSecs;
	// clock.innerHTML = totalSecs+"s";
	clock.innerHTML = formatSecs(totalSecs);
	if (totalSecs>0)	{
	    setTimeout(function(){
		self.startClock(totalSecs-1, doneFunc);
	    }, 1000);
	}else 	{
	    doneFunc();
	}
    }
    this.gameOver = function(){
	this.isGameOver = true;
	alert("game over");
    }

    this.isGameOver = false;
}

function DifficultyManager (  )	{
    this.answer = function(correct){
	if (correct)	{
	    this.consecCorrect++;
	    if (this.consecCorrect>=5)	{
		this.consecCorrect = 0;
		this.nTiles++;
	    }
	}else 	{
	    this.consecCorrect = 0;
	}
	return this.nTiles;
    }
    this.consecCorrect = 0;
    this.correctDelay = 0;
    this.failDelay = 0;
    // this.failDelay = 50;
    this.start = 1;
    this.nTiles = this.start;
    // this.totalSecs = 15;
    this.totalSecs = 60*2;
}
var inputBox = document.getElementById("inputBox");
var table = document.createElement("table");
table.align = "center";
table.id = "dominoTable";
document.body.appendChild(table);

var tilesRow = document.createElement("tr");
tilesRow.id = "tilesRow";
table.appendChild(tilesRow);

var clock = document.getElementById("clock");
var game = new Game(new DifficultyManager());
game.start();

document.body.onload = function(){
    inputBox.focus();
}
