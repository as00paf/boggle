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
	this.triedWords = [];
	
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

	joinGame: function(socket){
		$('#word').focus();
		var g = this;
		$('#word').keyup( function(e){
			var typedLetters = $('#word').val();
			var k = e.keyCode || e.which;
			
			switch(k){
				case 13://enter
					validateWord(typedLetters, socket);
					$('#word').val("");
					$('#word').focus("");
					usedLetters = [];
					g.refreshUI();
					break;
				case e.altKey:
					e.preventDefault();
					e.stopPropagation();
					break;
				default:
					highlightLetters(typedLetters);
					break;
			}
			
			if(k > 65 || k < 90){
				//highlightLetters(typedLetters);
			}			
		});
	},

	addUser: function(id, name, isLocal){
		var user = new User(id, name, this.$arena, this, isLocal);
		if(isLocal){
			this.localUser = user;
			this.startGame();
		}
		
		this.users.push(user);
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
		//Timer
		var minutes = Math.floor(this.currentTime/60);
		var seconds = this.currentTime % 60;
		if(seconds < 10){
			seconds = "0" + seconds;
		}
		var time = minutes + ":" + seconds;
		//debug("Current time is : " + time + " or " + this.currentTime)
		
		this.$arena.find('.game-timer').val(time);
	
		//Highlight Letters
		for(var i = 0; i < this.currentLetters.length;i++){
			var itemId = "#grid-item-" + (i + 1);
			var letter = this.currentLetters[i];
			if(usedLetters.indexOf(letter) > -1){
				$(itemId).css("background-color", "blue");
			}else{
				$(itemId).css("background-color", "#white");
			}
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
		//debug("Received Server Data ! State : " + serverData.state);
		//debug(serverData)
		var game = this;

		//Update game data
		game.currentTime = serverData.currentTime;
		game.isGameStarted = serverData.isGameStarted;
		
		//Update game state
		var newState = serverData.state;
		
		if(game.state != newState){
			switch(newState){
				case "STARTED":
					this.addLettersToGrid(serverData);
					$("#word").prop("disabled",false);
					//$('#word').focus();
					break;
				case "ENDED":
					$("#word").prop("disabled",true);
					//this.showEndedPopup();
					//this.showResults();
					break;
				case "RESTARTING":
					//Clear Answerboard
					$("#answerboard").html("");
					
					//this.showWaitPopup();
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
		//console.log("Adding letters to grid : " + this.currentLetters);
		for(var i = 0; i<this.currentLetters.length;i++){
			var id = "#grid-item-" + (i+1); 
			$(id).text(this.currentLetters[i]);
		}
	},
	
	updateScores: function(serverData){
		//Update scores
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
		
		//Sort leaderboard
		$(".leaderboard li")/*.sort(this.sortUsersByName)*/
							.sort(this.sortUsersByScore)
							.appendTo('.leaderboard');
	},
	
	sortUsersByScore: function(a, b){
		var aId = a.id.replace("user-label-", "");
		var playerA = game.findUserById(aId);
		
		var bId = b.id.replace("user-label-", "");
		var playerB = game.findUserById(bId);

		if(playerB.score < playerA.score) return -1;    
		if(playerB.score > playerA.score) return 1;    
		return 0;    
	},
	
	sortUsersByName: function(a, b){
		var aId = a.id.replace("user-label-", "");
		var playerA = game.findUserById(aId);
		
		var bId = b.id.replace("user-label-", "");
		var playerB = game.findUserById(bId);

		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;		
	},
	
	findUserById: function(userId){
		for(var i=0;i<game.users.length;i++){			
			var user = game.users[i];
			if(user.id == userId){
				return user;
			}
		}
		return null;
	},
	
	wordValidated: function(word, isValid, points, reason){
		//console.log("Word validated : " + word + " " + isValid + " points : " + points + " " + reason);
		var divClass = "word-label";
		var suffix = ' (' + points +' pts)';
		if(isValid == false){
			divClass += " wrong-word-label";
			suffix = ' (' + reason +')';
			$('#error-message').text(reason);
		}
		$("#answerboard").append('<li><div class="' + divClass + '">' + word + suffix + '</div></li>');
		this.triedWords.push(word);
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
		
		var divClass = "user-label";
		if(this.isLocal == true){
			divClass += " local-user-label";
			console.log("isLocal " + this.name);
		}
		$('#leaderboard').append('<li id="user-label-' + this.id +'"><div class="' + divClass + '">' + this.name + ' (' + this.score +' pts)</div></li>');
		this.game.refreshUI();
	},

	refresh: function(){
		//TODO : Update score
		//debug("Updating user score : " + this.toString());
		//debug('<div class="user-label">' + this.name + ' (' + this.score +' pts)</div>');
		var divClass = "user-label";
		if(this.isLocal == true){
			divClass += " local-user-label";
		}
		
		$('#user-label-' + this.id).html('<div class="' + divClass + '">' + this.name + ' (' + this.score +' pts)</div>');	
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


function validateWord(word, socket){
	//Reset error message
	$('#error-message').text("");
	
	if(usedLetters.length > 0){
		if(word.length >= 3){
			if(game.triedWords.indexOf(word) == -1){
				//Send validation
				socket.emit('validateWord', {word : word, userId: userId});
			}else{
				game.wordValidated(word, false, 0, "Already tried " + word);
			}
		}else{
			game.wordValidated(word, false, 0, word + " is too small");
		}
	}else{
		game.wordValidated(word, false, 0, word + " not on grid");
	}
}

function searchLetter ( nLetter ){
  var res = new Array();
  nLetter = nLetter.toUpperCase();
  for ( var i = 0; i < this.game.currentLetters.length; i++ ){
	if ( this.game.currentLetters[i] == nLetter ){
		res.push(this.game.currentLetters[i]);
	}
  }
    
  return res;
}

function highlightLetters(word){
	$('#error-message').text("");
	
	if ( ( word == null ) || ( word.length == 0 ) ){
		//console.error("Word is null or empty");
	}
	
	var objects = generateLetterObjects(this.game.currentLetters);
	
	for(var i = 0;i<this.game.currentLetters.length;i++){
		this.game.currentLetters[i].isInCurrentWord = false;
	}
	
	usedLetters = [];
	
	var currentRes         = new Array();
	var currentLetterIndex = 0;
	currentRes[0] = this.searchLetter ( word.substring(0,1) );

	while((currentLetterIndex >= 0) && (currentLetterIndex < word.length)){
		if(currentRes[currentLetterIndex].length > 0){
		  var currentCase = currentRes[currentLetterIndex][0];
		  //console.log("currentCase : " + currentCase);
		  currentCase.isInCurrentWord = true;
		  currentLetterIndex++;
		  if ( currentLetterIndex < word.length ){
			currentRes[currentLetterIndex] = currentCase.getNeighboursWithLetter(word.substring(currentLetterIndex,currentLetterIndex+1));  
		  }
		}else{  
		  currentLetterIndex--;
		  if ( currentLetterIndex >= 0 ){
			currentRes[currentLetterIndex][0].isInCurrentWord = false;
			currentRes[currentLetterIndex].shift();
		  }
		}
	}

	if ( currentLetterIndex <= 0 ){
		usedLetters = [];
	}else{
		var sRes = new Array();
		for ( i = 0; i < currentRes.length; i++ ){
			sRes[i] = currentRes[i][0];
		}
		
		usedLetters = sRes;
		//console.log("New letters : " + usedLetters);
	}

	//Add to used letters
	game.refreshUI();
}


function debug(msg){
	if(DEBUG){
		console.log(msg);
	}
}