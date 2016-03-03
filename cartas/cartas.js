var successAudio = new Audio("../sounds/success_beep.wav");
var failAudio = new Audio("../sounds/error_beep.wav");

var square = 100;

var mistakesLeftLab = document.getElementById("mistakesLeftLab");
var table = document.createElement("table");
table.align = "center";
table.style.border = "0px solid #fff";

document.body.appendChild(table);


function Cell ( imgSrc, parentTd )	{
    
    this.element = document.createElement("img");
    this.element.src = imgSrc;
    this.parentTd = parentTd;

    this.element.style.width = square;
    this.element.style.height = square;

    this.parentTd.appendChild(this.element);
    this.button = document.createElement("button");
    this.button.style.width = square;
    this.button.style.height = square;
    
    this.locked = false;
}

Cell.prototype.show = function(){
    // this.element.style.display = "block";
    // this.parentTd.removeChild(this.button);
    while (this.parentTd.firstChild)	{
	this.parentTd.removeChild(this.parentTd.firstChild);
    }
    this.parentTd.appendChild(this.element);
}
Cell.prototype.hide = function(){
    // this.element.style.display = "block";
    this.parentTd.removeChild(this.element);
    this.parentTd.appendChild(this.button);
}
Cell.prototype.remove = function(){
    while (this.parentTd.firstChild)	{
	this.parentTd.removeChild(this.parentTd.firstChild);
    }
    this.parentTd.appendChild(this.button);
    this.button.disabled = true;
    // this.button.style.backgroundColor = "#800000";
    this.button.style.backgroundColor = "white";
    // this.element.style.display = "none";
    // this.parentTd.removeChild(this.element);
}
function Game ( difficultyManager, imageSrcs )	{
    this.rows = difficultyManager.rows;
    this.cols = difficultyManager.cols;
    this.imageSrcs = imageSrcs;
    this.globalLock = false;

    
    this.pairsLeft = null;
    this.mistakesLeft = null;
    this.cells = null;
    this.start = function(){
	var n = this.rows*this.cols;
	assert(n%2 == 0, "n must be even");
	assert(this.imageSrcs.length>=n/2, "not enough images to play: "+this.imageSrcs.length);
	
	shuffle(this.imageSrcs);

	this.cells = new Array(n);
	var duplicated = new Array(n);
	for (var i = 0; i<n/2; i++)	{
	    var src = this.imageSrcs[i];
	    duplicated[2*i] = src;
	    duplicated[2*i+1] = src;
	}
	shuffle(duplicated);
	for (var r = 0; r<this.rows; r++)	{
	    var tr = document.createElement("tr");
	    
	    for (var c = 0; c<this.cols; c++)	{
		var td = document.createElement("td");
		td.style.border = "0px solid #fff";

		var i = r*this.cols+c;
		var cell = new Cell(duplicated[i], td);
		this.cells[i] = cell;
		tr.appendChild(td);
		var selfCell = cell;
		var selfGame = this;
		var fun = this.onclickForCell(cell);
		// cell.element.onclick = fun;
		cell.button.onclick = fun;
		
		cell.hide();
		table.appendChild(tr);
	    }
	}
	this.mistakesLeft = this.difficultyManager.mistakesAllowed;
	mistakesLeftLab.innerHTML = this.mistakesLeft;
	
	this.pairsLeft = n/2;
    }
    this.onclickForCell = function(cell){
	var selfCell = cell;
	var selfGame = this;
	return function(){
	    selfCell.parentTd.backgroundColor = "black";
	    if (!selfCell.locked && !selfGame.globalLock)	{
		if (selfGame.uncovered == null)	{
		    selfCell.show();
		    selfCell.locked = true;
		    selfGame.uncovered = selfCell;
		}else {
		    var correct = selfGame.uncovered.element.src == selfCell.element.src;
		    selfCell.show();
		    
		    var previous = selfGame.uncovered;
		    selfGame.uncovered = null;
		    
		    previous.lock = true;
		    selfCell.lock = true;

		    if (correct)	{
			successAudio.play();
			sleep(selfGame.difficultyManager.successDelay).then(function(){
			    selfCell.remove();
			    previous.remove();
			    selfGame.pairsLeft--;
			    if (selfGame.pairsLeft == 0)	{
				selfGame.gameOver();
			    }
			});
		    }else 	{
						    			    			    

			failAudio.play();

			selfGame.mistakesLeft--;
			updateMistakes(selfGame.mistakesLeft);
			
			if (selfGame.mistakesLeft<=0)	{
			    selfGame.gameOver();
			}else 	{
			    previous.show();
			    selfGame.globalLock = true;
			    sleep(selfGame.difficultyManager.failDelay).then(function(){
				selfCell.hide();
				previous.hide();
				
				previous.locked = false;
				selfCell.locked = false;
				selfGame.globalLock = false;
			    });
			}
			    
		    }
		    selfGame.answer(correct);
		}
	    }
	}
    }
    this.mistake = function(){
	
    }
    
    this.gameOver = function(){
	this.globalLock = true;
	alert("game over. score: "+this.mistakesLeft);
	this.cells.map(function(cell){cell.show()});
    }
	
    this.getShuffledImgSrcs = function(n){
	var srcs = new Array(n);
	for (var i = 0; i<n; i++)	{
	    srcs[i] = "images/emacs.png";
	}
	return srcs;
    }
    this.answer = function(correct){
    };
    this.difficultyManager = difficultyManager;
}
function DifficultyManager (  )	{
    this.rows = 4;
    this.cols = 5;
    this.failDelay = 250;
    this.successDelay = 1000;//does not lock the game
    this.mistakesAllowed = this.rows*this.cols*1.5;
}

function sleep ( ms )	{
    return (new Promise(function(resolve, reject){
	setTimeout(function(){resolve();}, ms);
    }));
}
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function updateMistakes ( count )	{
    mistakesLeftLab.innerHTML = count;
    mistakesLeftLab.style.color = "red";
    sleep(50).then(function(){mistakesLeftLab.style.color = "black";});
}
// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

// http://www.html5rocks.com/en/tutorials/es6/promises/
function GET(url) {
    return new Promise(function(resolve, reject) {
	var req = new XMLHttpRequest();
	req.open('GET', url);
	req.onload = function() {
	    if (req.status == 200) {
		resolve(req.response);
	    }
	    else {
		reject(Error(req.statusText));
	    }
	};

	req.onerror = function() {
	    reject(Error("Network Error"));
	};
	req.send();
    });
}

var game;
GET("hard-paths").then(function(response){
    var imageSrcs = response.split("\n");
    game = new Game(new DifficultyManager(), imageSrcs);
    game.start();
}, function(err){
    alert( "fatal: unable to read images" );
    console.log( err );
});
// document.body.bgColor = "#800000";
