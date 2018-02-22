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
	this.findAllWordsHasBeenCalled = false;
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
			seconds = "0" + seconds
		}
		var time = minutes + ":" + seconds
		//debug("Current time is : " + time + " or " + this.currentTime)
		
		//Timer
		this.$arena.find('.game-timer').val(time)
		
		//Letters
		for(var i = 0; i<this.currentLetters.length;i++){
			var id = "#grid-item-" + (i+1); 
			$(id).text(this.currentLetters[i]);
		}
		
		if(this.findAllWordsHasBeenCalled == false && game.currentLetters.length > 0){
			//findAllWords();
			this.findAllWordsHasBeenCalled = true;
		}
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
		//debug("Received Server Data ! " + serverData);
		//debug(serverData)
		var game = this;

		//Update game data
		game.currentTime = serverData.currentTime;
		game.isGameStarted = serverData.isGameStarted;
		game.currentLetters = serverData.currentLetters;
		
		serverData.users.forEach( function(serverUser){
			//Update local user stats
			if(game.localUser !== undefined && serverUser.id == game.localUser.id){
				game.localUser.score = serverUser.score;
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

function findAllWords(){
	var possibleWords = [];
	console.log("game.currentLetters : " + game.currentLetters);
	
	for(var i=0; i < 1/*game.currentLetters.length*/; i++){
		var depth = 2;
		var currentLetters = [];
		var firstLetter = game.currentLetters[i];
		console.log("firstLetter : " + firstLetter);
		console.log("neighbours : " + firstLetter.neighbours);
	
		currentLetters = [firstLetter];
		for(var j = 0; j < firstLetter.neighbours.length; j++){
			var secondLetter = firstLetter.neighbours[j];
			console.log("secondLetter : " + secondLetter);
			console.log("secondLetter neighbours : " + secondLetter.neighbours);
			
			currentLetters = [firstLetter, secondLetter];
			
			for(var k = 0; k < secondLetter.neighbours.length; k++){
				var thirdLetter = secondLetter.neighbours[k];
				if(currentLetters.indexOf(thirdLetter) == -1){
					//console.log("thirdLetter : " + thirdLetter);
					
					currentLetters[depth] = thirdLetter;
					var currentWord = currentLetters.join().replace(/,/g, "");
					if(possibleWords.indexOf(currentWord) == -1){
						possibleWords.push(currentWord);
						//console.log("Adding word : " + currentWord);
					}
					
					depth = 3;
				}else{
					//console.log("letter " + thirdLetter + " is already used");
				}
				
				var currentLetter = thirdLetter;
				while(depth < game.currentLetters.length){
					var nextLetter = findUnusedNeighbour(currentLetter, currentLetters);
					//console.log("depth : " + depth);
					
					if(nextLetter != null){
						currentLetters[depth] = nextLetter;
						//console.log("nextLetter : " + nextLetter);
					}

					var currentWord = currentLetters.join().replace(/,/g, "");
					if(possibleWords.indexOf(currentWord) == -1){
						possibleWords.push(currentWord);
						//console.log("Adding word : " + currentWord);
					}
					
					currentLetter = nextLetter;
					depth ++;
				}
				
				currentLetters = [firstLetter, secondLetter];
				depth = 2;
			}
			
			/*while(depth < game.currentLetters.length){
				var nextLetter = findUnusedNeighbour(thirdLetter, currentLetters);
				console.log("depth : " + depth);
				
				if(nextLetter != null){
					currentLetters[depth] = nextLetter;
					console.log("nextLetter : " + nextLetter);
				}

				if(currentLetters.length >= 3 && possibleWords.indexOf(currentLetters.join()) == -1){
					possibleWords.push(currentLetters.join());
				}
				
				depth ++;
			}*/
			
			depth = 2;
			firstLetter = currentLetters[0];
		}
		
		
		
		/*for(var j = 0; j < currentLetter.neighbours.length; j++){
			var neighbour = currentLetter.neighbours[j];
			console.log("neighbour : " + neighbour);
		}
	
		while(depth < game.currentLetters.length){
			currentLetters.push(currentLetter);
			
			if(currentLetters.length >= 3){
				possibleWords.push(currentLetters.join());
			}
			
			currentLetter = findUnusedNeighbour(currentLetter, currentLetters);
			console.log("currentLetter : " + currentLetter);
			depth ++;
		}*/
	}
	
	//Print results
	console.log("possibleWords (" + possibleWords.length + ")");
	for(var z=0;z<possibleWords.length;z++){
		console.log(possibleWords[z]);
	}
	
	this.game.possibleWords = possibleWords;
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
		//TODO : Add user dom element to list
		debug("Adding user to list : " + this.name)
		$('#leaderboard').append('<li id="user-label-' + this.id +'"><div class="user-label">' + this.name + ' (' + this.score +' pts)</div></li>');
	},

	refresh: function(){
		//TODO : Update core
		//this.$info.find('.hp-bar').css('width', this.hp + 'px');
		//debug("Updating user score : " + this.name + ": " + this.id + " " + this.score + " pts")
	
		//$('#user-label-' + this.id).text('<div class="user-label">' + this.name + ' (' + this.score +' pts)</div>');
	}
}

function Letter(index, letter, isInCurrentWord){
	this.index = index;
	this.letter = letter;
	this.isInCurrentWord = isInCurrentWord;
	this.neighbours = Array();
}

Letter.prototype = {
	getNeighboursWithLetter:function(nLetter){
		nLetter = nLetter.toUpperCase();
		
		var res = new Array();
		for ( var i = 0; i < this.neighbours.length; i++ ){
			if ( ( this.neighbours[i].letter == nLetter ) && !this.neighbours[i].isInCurrentWord ){
				res.push ( this.neighbours[i] );
			}	
		}
		
		//console.log(res);
		
		return res;
	},
	
	toString:function(){
		return this.letter;
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