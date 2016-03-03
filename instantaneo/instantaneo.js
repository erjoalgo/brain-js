var successAudio = new Audio("../sounds/success_beep.wav");
var failAudio = new Audio("../sounds/error_beep.wav");

function Game ( difficultyManager )	{
    this.cells = null;
    this.currNum = null;
    this.difficultyManager = difficultyManager;

    var self = this;
    var failSuccFuncMaker = function(fail){
	var audio = fail? failAudio : successAudio;
	var delay = difficultyManager[fail? "failureDelay" : "successDelay"];
	var fun = function(){
	    self.cells.map(function(cell){cell.disable()});
	    audio.play();
	    // playSound(wavFn);

	    var difficulty = self.difficultyManager[fail?"failure":"success"]();
	    if (difficulty  != null)	{
		sleep(!fail? delay/2: 0).then(function(){
		    self.cells.map(function(cell){cell.hide()});
		})
		
		sleep(delay).then(
		    function(){
			self.setupNextAndStart(difficulty);
		    });
	    }else 	{
		alert("game over");
	    }
	};
	return fun;
    }
    
    this.succFunc = failSuccFuncMaker(false);
    this.failureFunc = failSuccFuncMaker(true);
    
    this.setupNextAndStart = function(n){
	this.cells = getActivateCells(n);
	var perm = getPerm(n);
	for (var i = 0; i<n; i++)	{
	    
	    var celli = this.cells[i];
	    celli.number = perm[i];
	    assert(celli.number != null);
	    celli.unlocked = false;
	    celli.element.onclick = function(self){
		var celli = self.cells[i];
		var fun = function(){
		    if (celli.unlocked == false)	{
			console.log( "premature click" );
		    }else 	{
			// var source = event.target || event.srcElement;
			if (celli.number != self.currNum)	{
			    self.failureFunc();
			}else 	{
			    celli.show("blue");
			    celli.element.onclick = null;//this is too dramatic
			    if (self.currNum+1 != n)	{
				self.currNum++;
			    }else 	{
				self.succFunc();
			    }
			}
		    }
		};
		// fun.bind(self);
		return fun;
	    }(this);
	    // celli.show();
	}
	this.currNum = 0;

	
	// this.cells.map(Cell.prototype.show)
	this.cells.map(function(cell){cell.show()});

	sleep(this.difficultyManager.displayTime).then(
	    function(self){
		return function(cells){
		    // self.cells.map(Cell.prototype.hide);
		    self.cells.map(function(cell){
			cell.hide();
			cell.unlocked = true;
		    });
		}
	    }(this));
    }
    this.start = function(){
	this.setupNextAndStart(difficultyManager.start());
    }
}

function DifficultyManager (  )	{
    //below is the "api" implementation
    
    this.success = function(){
	this.consecSuccess++;
	this.consecFailure = 0;
	
	if (this.consecSuccess>=4)	{
	    this.levelDelta(1);
	}
	return this.gameCountCheck(this.currDifficulty);
    }
    this.failure = function(){
	this.consecFailure++;
	this.consecSuccess = 0;
	
	if (this.consecFailure>=3)	{
	    this.levelDelta(-1);
	}
	return this.gameCountCheck(this.currDifficulty);
    }
    this.start = function(){return 5;}
    this.failureDelay = 2000;//this is a penality. user does not like to wait
    this.successDelay = 200;//based on original "grandmother" settings. but it is too slow
    // this.displayTime = 1000;
    this.displayTime = 500;
    this.gameCount = 0;

    //now some internal variables/state
    this.consecSuccess = 0;
    this.currDifficulty = this.start();
    this.levelBoundsCheck = function(level){
	if (level<4)	{
	    return 4;
	}else if (level>9)	{
	    return 9;
	}else 	{
	    return level;
	}
    }
    
    this.levelDelta = function(delta){
	this.currDifficulty = this.levelBoundsCheck(this.currDifficulty+delta);
	this.consecSuccess = 0;
	this.consecFailure = 0;
    }
    this.maxGameCount = 20;
    this.gameCountCheck = function(level){
	this.gameCount++;
	return this.gameCount>this.maxGameCount? null: level;
    }
}

// utils
function getPerm ( n )	{
    var arr = new Array(n);
    for (var i = 0; i<n; i++)	{
	// arr.push(i);
	arr[i] = i;
    }
    for (var i = n-1; i>=0; i--)	{
	var kill = randN(i);
	var temp = arr[i];
	arr[i] = arr[kill];
	arr[kill] = temp;
    }
    return arr;
}

function randN ( i )	{
    return Math.floor(Math.random() * i);
}


function getActivateCells ( n, parentTable )	{
    var body = document.body;
    while (body.firstChild)	{
    	body.removeChild(body.firstChild);
    }
    var table = document.getElementsByTagName("table");
    if (table && table.length>0)	{
	for (var i = 0; i<table.length; i++)	{
	    table[i].parentElement.removChild(table[i]);
	}
    }
    
    table = document.createElement("table");
    // table.id = "grid";
    table.align = "center";
    // table.style="margin: 0px auto;";
    // var dims = getDims(n);
    var [rows, cols] = getDims(n);
    var cells = new Array(n);
    var i = 0;
    for (var r = 0; r<rows && i<n; r++)	{
	var row = document.createElement("tr");
	for (var c = 0; c<cols && i<n; c++)	{
	    cells[i] = new Cell(row);
	    i++;
	}
	table.appendChild(row);
    }
    // document.lastChild.appendChild(table);
    body.appendChild(table);
    return cells;
}

function getDims ( n )	{
    var dims = [];
    if (n < 4)	{
	throw new Error("invalid grid size: "+n)
    }else if (n == 4)	{
	dims.push(2);
	dims.push(2);
    }else if (n<=6)	{
	dims.push(2);
	dims.push(3);
    }else if (n<=8)	{
	dims.push(2);
	dims.push(4);
    }else if (n == 9)	{
	dims.push(3);
	dims.push(3);
    }else 	{
	throw new Error("invalid grid size: "+n)
    }
    return dims;
}

function Cell ( parent )	{
    this.number = null;
    
    var td = document.createElement("td");
    // td.style.border = "1px solid #000"
    parent.appendChild(td);
    
    this.element = document.createElement("button");
    
    td.appendChild(this.element);


    var cell = this.element;

    // cell.style.border = "1px solid #000"
    cell.style.border = "0px solid #fff";
    cell.style.width = "100px";
    cell.style.height = cell.style.width;
    cell.style.backgroundColor = "white";
    
    var lab = document.createElement("label");
    cell.appendChild(lab);
    
    cell.style.color = "black";
    cell.style.fontSize = "30px";
    cell.style.fontWeight = "bold";

    // cell.style.background
    
}

Cell.prototype.show = function(color){
    if (color)	{
	this.element.style.color = color;
    }
    assert(this.number != null);
    this.element.innerHTML = (this.number+1);
}

Cell.prototype.hide = function(){
    this.element.innerHTML = "";
}

Cell.prototype.disable = function(){
    this.element.disabled = true;
    this.element.style.backgroundColor = "gray";
    this.element.style.color = "white";
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

document.body.bgColor = "#d3d3d3";

var game = new Game(new DifficultyManager());
game.start();



// doesn't work and ugly.
// http://stackoverflow.com/questions/9078933/play-sound-with-javascript
/*function playSound(fn) {
    /*document.getElementById("dummy").innerHTML=
    "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";*/
/*
    var embed = document.createElement("embed")
    // embed.src = "/sounds/error_beep.wav";
    embed.src = "/sounds/"+fn;
    embed.hidden = true;
    embed.autostrat = true;
    embed.loop = false;
    document.getElementById("dummy").appendChild(embed);
}*/

// works but needs HTML5?
/*function playSound(soundfile) {
    var audio = new Audio(soundfile);
    audio.play();
}
*/
