const Letter = require('letter.js');
const Dictionnary = require('dictionnary.js');
const BoggleSolver = require('node-boggle-solver');

var express = require('express');
var searcher = require('find-in-files');
var app = express();
var counter = 0;
var WIDTH = 640;
var HEIGHT = 580;

var BOGGLE_DICE = ["LENUYG", "ELUPST", "ZDVNEA", "SDTNOE", "AMORIS", "FXRAOI", "MOQABJ", "FSHEEI", "HRSNEI", "ETNKOU", "TARILB", "TIEAOA", "ACEPDM", "RLASEC", "ULIWER", "VGTNIE"];
var TIMER_COUNT = 15;//180; //3 minutes
var INTERVAL = 1000; //1 second
var RESET_TIMEOUT = 5000; //3 seconds
var END_TIMEOUT = 3000; //3 seconds

//Static resources server
app.use(express.static(__dirname + '/www'));

var server = app.listen(process.env.PORT || 80, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

function GameServer(){
	this.gameState = "INIT";
	this.users = [];
	this.letters = [];
	this.currentTime = TIMER_COUNT;
	this.isGameStarted = false;
	//this.solver = BoggleSolver();//TODO : Separate french and english
	this.solver = BoggleSolver(new Dictionnary().words);//TODO : Separate french and english
	this.currentWords = [];
	
	console.log('Game Server Initiated\n');
}

GameServer.prototype = {
	//Game
	startGame: function(){
		console.log('Initiating Game');
		var g = this;
		this.currentTime = TIMER_COUNT;
		
		//Generate Letters
		this.currentLetters = genrateLetters();
		
		//Solve Grid
		var solveLetters = this.currentLetters.toString().replaceAll(",", "");
		console.log("Solving grid for letters : " + solveLetters);
		this.solver.solve(solveLetters, function(err, result) { 
			console.log("Grid Solved");
			if(err != null){
				console.log("Error : " + err);	
			}
			
			g.currentWords = result;
		
			//Start Game
			console.log('Starting Game');		
			//Send data to all users
			g.changeGameState("STARTED");
			
			//Start game 
			g.currentLoop = setInterval(function(){
				g.mainLoop();
			}, INTERVAL);
			this.isGameStarted = true;
			console.log("Game started")
		});		
	},
	
	mainLoop: function(){
		if(this.currentTime == 0){//End game
			this.endGame();
			return;
		}
		
		this.currentTime--;	
	},
	
	changeGameState: function(newState){
		this.gameState = newState;
		//client.emit('changeGameState', {state: this.gameState});
		//client.broadcast.emit('changeGameState', {state: this.gameState} );
	},

	endGame: function(){
		console.log("Game ended, starting a new one in " + RESET_TIMEOUT/1000 + " seconds");
		//Stop loop
		clearInterval(this.currentLoop);
		
		//Calculate winner
		
		//Send data to all users
		this.changeGameState("ENDED");
		
		//Restart Game
		var g = this;
		this.currentTime = RESET_TIMEOUT/1000;
		this.resetLoop = setInterval(function(){
			if(g.currentTime == 0){
				g.restartGame();
				clearInterval(g.resetLoop);
			}else{
				g.currentTime--;
			}
		}, INTERVAL);
	},
	
	restartGame: function(){
		//Reset values
		this.currentTime = 0;
		this.currentLetters = [];
		this.isGameStarted = false;
		this.users.forEach( function(user){
			user.score = 0;
		});
		
		//Send data to all users
		this.changeGameState("RESTARTING");
		
		var g = this;
		setTimeout(function(){
			g.startGame();
		}, END_TIMEOUT);
	},
	
	//Users
	addUser: function(user){
		this.users.push(user);
		console.log(user.name + ' joined the game');
	},

	removeUser: function(userId){
		//Remove user object
		console.log('User with id ' + userId + ' has left the game');
		this.users = this.users.filter( function(user){return user.id != userId} );
	},

	findUserById: function(userId){
		for(var i=0;i<this.users.length;i++){			
			var user = this.users[i];
			if(user.id == userId){
				return user;
			}
		}
		return null;
	},
	
	//Sync user with new data received from a client
	syncUser: function(newUserData){
		this.users.forEach( function(user){
			if(user.id == newUserData.id){
				//TODO : fixme
				//user.score = newUserData.score;
			}
		});
	},

	getData: function(){
		var gameData = {};
		gameData.isGameStarted = this.isGameStarted;
		gameData.users = this.users;
		gameData.currentTime = this.currentTime;
		gameData.currentLetters = this.currentLetters;
		gameData.state = this.gameState;

		return gameData;
	},
	
	validateWord: function (client, userId, word){
		//console.log("Validating word "  + word + " with " + game.possibleWords.length + " possibilities");
		var user = this.findUserById(userId);
		if(user == null){
			console.log("User not found with id " + clientId);
			return null;
		}
		
		var validated = this.currentWords.hasWord(word);
		var points = 0;
		if(validated == true){
			points = this.calculatePoints(word);
			user.score += points;
		}
		var result = {word: word, validated:validated, points:points, score:user.score};
		client.broadcast.emit('wordValidated', result);
		client.emit('wordValidated', result);
	},
	
	calculatePoints: function(word){
		if(word == null || word.length < 3) return 0;
		var points = 11;
		switch(word.length){
			case 3:
			case 4:
				points = 1;
				break;
			case 5:
			case 6:
				points = 3;
				break;
			case 7:
				points = 5;
				break;
		}
		
		return points
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

		client.emit('addUser', { id: userId, name: user.name, isLocal: true, score: 0, gameData:game.getData()});
		client.broadcast.emit('addUser', { id: userId, name: user.name, isLocal: false, score: 0} );

		game.addUser({ id: userId, name: user.name, score:0});
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
		game.validateWord(client, data.userId, data.word);
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
