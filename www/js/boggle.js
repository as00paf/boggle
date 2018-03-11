var DEBUG = true;
var INTERVAL = 1000;

function Game(arenaId, w, h, socket){
	this.users = []; //Users (other than the local user)
	this.width = w;
	this.height = h;
	this.$arena = $(arenaId);
	this.$arena.css('width', w);
	this.$arena.css('height', h);
	this.socket = socket;
	this.currentTime = 180;
	this.currentLetters = [];
	this.possibleWords = [];
	
	var g = this;
	g.startGame();
}

Game.prototype = {
	startGame: function(){		
		var g = this;
		
		this.currentLoop = setInterval(function(){
			g.mainLoop();
		}, INTERVAL);
	},

	endGame: function(){
		clearInterval(this.currentLoop)
		this.currentTime = 0;
	},

	addUser: function(id, name, isLocal){
		var user = new User(id, name, this.$arena, this, isLocal);
		if(isLocal){
			this.localUser = user;
			this.startGame();
		}else{
			this.users.push(user);
		}
	},

	removeUser: function(userId){
		//Remove user object
		this.users = this.users.filter( function(u){return u.id != userId} );
		//remove user from dom
		$('#' + userId).remove();
	},

	mainLoop: function(){
		if(this.localUser != undefined){
			//send data to server about local user
			this.sendData();
		}
		
		this.refreshUI();
	},
	
	refreshUI: function(){	
		var minutes = Math.floor(this.currentTime/60);
		var seconds = this.currentTime % 60;
		if(seconds < 10){
			seconds = "0" + seconds;
		}
		var time = minutes + ":" + seconds;
		//debug("Current time is : " + time + " or " + this.currentTime)
		
		//Timer
		this.$arena.find('.game-timer').val(time);
		
	},
	
	sendData: function(){
		//Send local data to server
		var gameData = {};

		//Send user data
		var u = {
			id: this.localUser.id,
			score: this.localUser.score
		};
		gameData.user = u;
		gameData.currentTime = this.currentTime;
		
		this.socket.emit('sync', gameData);
	},

	receiveData: function(serverData){
		//debug("Received Server Data ! State : " + serverData.state);
		//debug(serverData)
		var game = this;

		//Update game data
		game.currentTime = serverData.currentTime;
		game.isGameStarted = serverData.isGameStarted;
		
		//Update game state
		var newState = serverData.state;
		
		if(game.state != newState){
			console.log("New state : " + newState);
			switch(newState){
				case "STARTED":
					this.addLettersToGrid(serverData);
					break;
				case "RESTARTING":
					//this.showWaitPopup();
					break;
				case "ENDED":
					//this.showEndedPopup();
					//this.showResults();
					break;
			}
		}else{
			this.updateScores(serverData);
		}
		game.state = newState;
	},
	
	addLettersToGrid: function(serverData){
		game.currentLetters = generateLetterObjects(serverData.currentLetters);
		
		//Adding Letters to grid
		console.log("Adding letters to grid : " + this.currentLetters);
		for(var i = 0; i<this.currentLetters.length;i++){
			var id = "#grid-item-" + (i+1); 
			$(id).text(this.currentLetters[i]);
		}
	},
	
	updateScores: function(serverData){
		serverData.users.forEach( function(serverUser){
			//Update local user stats
			if(game.localUser !== undefined && serverUser.id == game.localUser.id){
				game.localUser.score = serverUser.score;
				game.localUser.refresh();
			}

			//Update foreign users
			var found = false;
			game.users.forEach( function(clientUser){
				//update foreign users
				if(clientUser.id === serverUser.id){
					clientUser.score = serverUser.score;
					clientUser.refresh();
					found = true;
				}
			});
			if(!found &&
				(game.localUser == undefined || serverUser.id != game.localUser.id)){
				//I need to create it
				game.addUser(serverUser.id, serverUser.name, false);
			}
		});
	}
}

function findUnusedNeighbour(letter, usedLetters){
	if(letter == null) return null;
	
	var neighbour = null;
	//console.log("Finding unused neighbour for " + letter);
	for(var i = 0; i < letter.neighbours.length; i++){
		neighbour = letter.neighbours[i];
		if(usedLetters.indexOf(neighbour) == -1){
			//console.log("Found unused neighbour : " + neighbour);
			return neighbour;
		}
	}
	
	return neighbour;
}

function User(id, name, $arena, game, isLocal){
	this.id = id;
	this.name= name;
	this.score = 0;
	this.$arena = $arena;
	this.game = game;
	this.isLocal = isLocal;

	this.materialize();
}

User.prototype = {

	materialize: function(){
		debug("Adding user to list : " + this.name);
		//TODO : add bold if user.isLocal == true
		$('#leaderboard').append('<li id="user-label-' + this.id +'"><div class="user-label">' + this.name + ' (' + this.score +' pts)</div></li>');
		this.game.refreshUI();
	},

	refresh: function(){
		//TODO : Update score
		//debug("Updating user score : " + this.toString());
		//debug('<div class="user-label">' + this.name + ' (' + this.score +' pts)</div>');
				
		$('#user-label-' + this.id).html('<div class="user-label">' + this.name + ' (' + this.score +' pts)</div>');	
	},
	
	toString: function(){
		return "[User] " + this.id + " " + this.name + " score : " + this.score + " isLocal : " + this.isLocal;
	}
}

function generateLetterObjects(letters){
	var objects = [];
	for(var i = 0; i<letters.length;i++){
		var letter = new Letter(i, letters[i], false);
		objects.push(letter);
	}
	
	var dimensionalLetters = [
		[objects[0], objects[1], objects[2], objects[3]],
		[objects[4], objects[5], objects[6], objects[7]],
		[objects[8], objects[9], objects[10], objects[11]],
		[objects[12], objects[13], objects[14], objects[15]]
	];
	
	for(var i = 0; i<objects.length;i++){
		objects[i].neighbours = getNeighboursForItemAt(dimensionalLetters, i);
	}
	
	return objects;
}

function getNeighboursForItemAt	(letters, index){
	var result = [];

	var j = index % 4;
	var i = Math.floor(index / 4);
	
	
	for(var x = Math.max(0, i-1); x <= Math.min(i+1, 3); x++) {
		for(var y = Math.max(0, j-1); y <= Math.min(j+1, 3); y++) {
		  if(x !== i || y !== j) {
			result.push(letters[x][y]);
		  }
		}
	}

	return result;
}

function debug(msg){
	if(DEBUG){
		console.log(msg);
	}
}