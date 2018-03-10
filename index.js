const Letter = require('letter.js');
const Dictionnary = require('dictionnary.js');
const BoggleSolver = require('node-boggle-solver');

var keypress = require('keypress');
var express = require('express');
var searcher = require('find-in-files');
var app = express();
var counter = 0;
var WIDTH = 640;
var HEIGHT = 580;

var BOGGLE_DICE = ["LENUYG", "ELUPST", "ZDVNEA", "SDTNOE", "AMORIS", "FXRAOI", "MOQABJ", "FSHEEI", "HRSNEI", "ETNKOU", "TARILB", "TIEAOA", "ACEPDM", "RLASEC", "ULIWER", "VGTNIE"];
var TIMER_COUNT = 180; //3 minutes
var INTERVAL = 1000; //1 second
var RESET_TIMEOUT = 3000; //3 seconds

//Static resources server
app.use(express.static(__dirname + '/www'));

var server = app.listen(process.env.PORT || 80, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);
var isRestarting = false;

// listen for the "keypress" event 
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
  if(isRestarting == true){
	  if(key.name == 'return'){
		  return;
	  }
	  if(key.name == 'y'){
		console.log("Restarting game");  
		game.restartGame();
	  }else{
		  console.log("Restart cancelled");
	  }
	  
	  isRestarting = false;
  }
  
  if(key.name == 'r'){
	  isRestarting = true;
  }
  
  if (key && key.ctrl && key.name == 'c') {
	process.stdin.pause();
  }
});

function GameServer(){
	this.users = [];
	this.letters = [];
	this.currentTime = TIMER_COUNT;
	this.isGameStarted = false;
	//this.solver = BoggleSolver();//TODO : Separate french and english
	this.solver = BoggleSolver(new Dictionnary().words);//TODO : Separate french and english
	this.currentWords = [];
	
	console.log('Game Server Initiated');
	console.log('Starting Game\n');
}

GameServer.prototype = {
	//Game
	startGame: function(){		
		var g = this;
		this.currentTime = TIMER_COUNT;
		//Generate Letters
		if(this.currentLetters == null || this.currentLetters == []){
			this.currentLetters = genrateLetters();
		} 
		
		//Solve Grid
		var solveLetters = this.currentLetters.toString().replaceAll(",", "");
		console.log("Solving grid for letters : " + solveLetters);
		this.solver.solve(solveLetters, function(err, result) { 
			console.log("Grid Solved");
			console.log("Error : " + err);
			
			g.currentWords = result;
			console.log("Has word 'are' : " + g.currentWords.hasWord("are"));
		});
		
		//Start game 
		this.currentLoop = setInterval(function(){
			g.mainLoop();
		}, INTERVAL);
		this.isGameStarted = true;
		console.log("Game started")
	},
	
	mainLoop: function(){
		this.currentTime--;
		
		//End game
		if(this.currentTime <= 0){
			this.endGame()
		}
	},

	endGame: function(){
		//Stop loop
		clearInterval(this.currentLoop)
		
		//Calculate winner
		
		//Reset values
		this.currentTime = 0;
		this.currentLetters = [];
		this.isGameStarted = false;
		this.users.forEach( function(user){
			user.score = 0;
		});
		
		console.log("Game ended, starting a new one in " + RESET_TIMEOUT/1000 + " seconds")
		var g = this;
		this.resetLoop = setTimeout(function(){
			g.startGame();
		}, RESET_TIMEOUT);
	},
	
	restartGame: function(){
		console.log("Are you sure you want to restart the current game? Y/N");
	},
	
	//Users
	addUser: function(user){
		this.users.push(user);
		console.log(user.name + ' joined the game');
		if(this.isGameStarted == false){
			this.startGame();	
		}
	},

	removeUser: function(userId){
		//Remove user object
		console.log('User with id ' + userId + ' has left the game');
		this.users = this.users.filter( function(user){return user.id != userId} );
	},

	//Sync user with new data received from a client
	syncUser: function(newUserData){
		this.users.forEach( function(user){
			if(user.id == newUserData.id){
				user.score = newUserData.score;
			}
		});
	},

	//Check if word matches
	matchWord: function(word){
		var self = this;
		//TODO : match word against dictionary
	},

	getData: function(){
		var gameData = {};
		gameData.isGameStarted = this.isGameStarted;
		gameData.users = this.users;
		gameData.currentTime = this.currentTime;
		gameData.currentLetters = this.currentLetters;

		return gameData;
	},
	
	validateWord: function (client, word){
		//console.log("Validating word "  + word + " with " + game.possibleWords.length + " possibilities");
		var validated = this.currentWords.hasWord(word);
		var result = {word: word, validated:validated, points:5, score:10};
		client.broadcast.emit('wordValidated', result);
		client.emit('wordValidated', result);
	}
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

/* Connection events */

io.on('connection', function(client) {
	client.on('joinGame', function(user){
		var userId = guid();

		client.emit('addUser', { id: userId, name: user.name, isLocal: true});
		client.broadcast.emit('addUser', { id: userId, name: user.name, isLocal: false} );

		game.addUser({ id: userId, name: user.name});
	});

	client.on('sync', function(data){
		//Receive data from clients
		if(data.user != undefined){
			game.syncUser(data.user);
		}
		
		//Broadcast data to clients
		client.emit('sync', game.getData());
		client.broadcast.emit('sync', game.getData());

		counter ++;
	});

	client.on('validateWord', function(data){
		game.validateWord(client, data.word);
	});

	client.on('leaveGame', function(userId){
		game.removeUser(userId);
		client.broadcast.emit('removeUser', userId);
	});

});

//Boggle stuff
function genrateLetters(){
	var letters = []
	var shuffledDice = shuffle(BOGGLE_DICE)
	//debug("shuffledDice : " + shuffledDice)
	for(var i in shuffledDice){
		var die = shuffledDice[i]
		var charIndex = Math.round(Math.random() * (die.length - 1));
		letters[i] = die.charAt(charIndex);
		//debug("Index was " + charIndex + " from " + die + " " + die.charAt(charIndex))
	}
	
	return letters;
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var game = new GameServer();
game.startGame();