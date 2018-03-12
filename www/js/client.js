var WIDTH = 640;
var HEIGHT = 580;

// This IP is hardcoded to my server, replace with your own
var socket = io.connect('localhost');

var game = new Game('#arena', WIDTH, HEIGHT, socket);
var userName = '';
var userId = '';
var usedLetters = [];

var ERROR_MESSAGE_NOT_ON_GRID = "Une des lettres que vous avez tapé n'est pas sur la grille"
var ERROR_MESSAGE_RULE = "Les lettres doivent être adjacentes et utilisées qu'une seule fois par mots"

socket.on('addUser', function(user){
	game.addUser(user.id, user.name, user.isLocal);
	if(user.isLocal == true){
		userId = user.id;
	}
});

socket.on('sync', function(gameServerData){
	game.receiveData(gameServerData);
});

socket.on('removeUser', function(userId){
	game.removeUser(userId);
});

socket.on('wordValidated', function(data){
	//console.log("word validated : " + data.word + " " + data.validated + ", score : " + data.score);
	game.localUser.score = data.score;
	game.wordValidated(data.word, data.validated, data.points, data.reason);
});

$(document).ready( function(){
	var width = $(document).width() / 2
	var height = $(document).height() * 0.65

	$('#user-name').focus()

	$('#join').click( function(){
		userName = $('#user-name').val();
		joinGame(userName, socket);
	});

	$('#user-name').keyup( function(e){
		userName = $('#user-name').val();
		var k = e.keyCode || e.which;
		if(k == 13){
			joinGame(userName, socket);
		}
	});
	
	$('#word').on('input', function(e){
		var newValue = $('#word').val().replace(/[^a-z-A-Z]/,"").toUpperCase();
		$('#word').val(newValue);
	});
});

$(window).on('beforeunload', function(){
	return 'Are you sure you want to leave?';
});

$(window).on('unload', function(){
	console.log("leaveGame : " + userId);
	socket.emit('leaveGame', userId);
});

function joinGame(userName, socket){
	if(userName != ''){
		$('#prompt').hide();
		socket.emit('joinGame', {name: userName});
		$('#word').focus();
		
		$('#word').keyup( function(e){
			var typedLetters = $('#word').val();
			var k = e.keyCode || e.which;
			
			switch(k){
				case 13://enter
					validateWord(typedLetters, socket);
					$('#word').val("");
					$('#word').focus("");
					usedLetters = [];
					refreshUI();
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
	}
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
	refreshUI();
}

function refreshUI(){
	for(var i = 0; i < this.game.currentLetters.length;i++){
		var itemId = "#grid-item-" + (i + 1);
		var letter = this.game.currentLetters[i];
		if(usedLetters.indexOf(letter) > -1){
			$(itemId).css("background-color", "blue");
		}else{
			$(itemId).css("background-color", "#white");
		}
	}		
}






