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
	console.log("word validated : " + data.word + " " + data.validated)
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
});

$(window).on('beforeunload', function(){
	return 'Are you sure you want to leave?';
});

$(window).on('unload', function(){
	socket.emit('leaveGame', userId);
});

function joinGame(userName, socket){
	if(userName != ''){
		$('#prompt').hide();
		socket.emit('joinGame', {name: userName});
		$('#word').focus()
		
		$('#word').keyup( function(e){
			var typedLetters = $('#word').val();
			var k = e.keyCode || e.which;
			
			switch(k){
				case 13://enter
					$('#word').val("");
					validateWord(typedLetters, socket);
					$('#word').val("");
					$('#word').focus("");
					usedLetters = [];
					refreshUI();
					break;
				case 9 : //TAB
					break;
				case 8 : 
				case 46 : //backspace
					usedLetters.reverse();
					usedLetters.pop();//todo: fixme
					usedLetters.reverse();
					validateWord(typedLetters, socket);
					$('#word').focus("");
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
		});
	}
}

function validateWord(word, socket){
	var currentLetterString = this.game.currentLetters.join();
	var currentLetter = word.charAt(word.length - 1);
	var currentLetterIndex = this.game.currentLetters.indexOf(currentLetter);

	//Check if all typed letters match letters on grid
	for(var index = 0, character=''; character = word.charAt(index); index++){ 
		var isCharacterInCurrentLetters = currentLetterString.toLowerCase().includes(character.toLowerCase());
		if(isCharacterInCurrentLetters == false){
			console.log("Character " + character + " is not on grid (" + currentLetterString + ")");
			$('#error-message').text(ERROR_MESSAGE_NOT_ON_GRID);
			return;
		}
	};
	
	//Check if last typed letter is adjacent to last one
	var adjacentLettersString = getAdjacentLetters(currentLetterIndex).join();
	var letter = word.charAt(word.length - 1);
	var neighbours = getAdjacentLetters(currentLetterIndex)
	//console.log("Character " + letter + " adjacent letters are " + neighbours);
	
	
	//Reset error message
	$('#error-message').text("");
	
	//Send validation
	socket.emit('validateWord', {word : word, userId: userId});
}

function getAdjacentLetters(letterIndex){
	var adjacentLetters = [];
	
	var width = 4;
	var height = 4;
	
	var x = letterIndex % 4;
	var y = Math.floor(letterIndex / 4);
	
	//console.log("Getting adjacent letters for " + this.game.currentLetters[letterIndex] + "("+x+"," + y + ") @" + letterIndex);
	
	var dimensionalLetters = [
		[this.game.currentLetters[0], this.game.currentLetters[1], this.game.currentLetters[2], this.game.currentLetters[3]],
		[this.game.currentLetters[4], this.game.currentLetters[5], this.game.currentLetters[6], this.game.currentLetters[7]],
		[this.game.currentLetters[8], this.game.currentLetters[9], this.game.currentLetters[10], this.game.currentLetters[11]],
		[this.game.currentLetters[12], this.game.currentLetters[13], this.game.currentLetters[14], this.game.currentLetters[15]]
	];
	
	adjacentLetters = findingNeighbors(dimensionalLetters, x, y);
	
	//console.log("Found neighbours for letter : " + this.game.currentLetters[letterIndex] + " at position " + letterIndex + " : " + adjacentLetters);
	
	return adjacentLetters;
}

function getAdjacentLetterIndices(letterIndex){
	var adjacentLetters = [];
	
	var width = 4;
	var height = 4;
	
	var x = letterIndex % 4;
	var y = Math.floor(letterIndex / 4);
	
	//console.log("Getting adjacent letters for " + this.game.currentLetters[letterIndex] + "("+x+"," + y + ") @" + letterIndex);
	
	var dimensionalLetters = [
		[this.game.currentLetters[0], this.game.currentLetters[1], this.game.currentLetters[2], this.game.currentLetters[3]],
		[this.game.currentLetters[4], this.game.currentLetters[5], this.game.currentLetters[6], this.game.currentLetters[7]],
		[this.game.currentLetters[8], this.game.currentLetters[9], this.game.currentLetters[10], this.game.currentLetters[11]],
		[this.game.currentLetters[12], this.game.currentLetters[13], this.game.currentLetters[14], this.game.currentLetters[15]]
	];
	
	adjacentLetters = findingNeighborIndices(dimensionalLetters, x, y);
	
	//console.log("Found neighbour indices for letter : " + this.game.currentLetters[letterIndex] + " at index " + letterIndex + " : " + adjacentLetters);
	
	return adjacentLetters;
}

function findingNeighbors(myArray, j, i) {
  var rowLimit = myArray.length-1;
  var columnLimit = myArray[0].length-1;

  var result = [];
  
  for(var x = Math.max(0, i-1); x <= Math.min(i+1, rowLimit); x++) {
    for(var y = Math.max(0, j-1); y <= Math.min(j+1, columnLimit); y++) {
      if(x !== i || y !== j) {
        result.push(myArray[x][y]);
      }
    }
  }
  
  return result;
}

function findingNeighborIndices(myArray, j, i) {
  var rowLimit = myArray.length-1;
  var columnLimit = myArray[0].length-1;

  var result = [];
  
  for(var x = Math.max(0, i-1); x <= Math.min(i+1, rowLimit); x++) {
    for(var y = Math.max(0, j-1); y <= Math.min(j+1, columnLimit); y++) {
      if(x !== i || y !== j) {
		  var index = y + (x * 4);
		  result.push(index);
      }
    }
  }
  
  return result;
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function getLetterPositionsInNeighbours(nextLetter, letterNeighbours, letterNeighbourIndices){
	var result = [];
	
	for(var i = 0;i < letterNeighbours.length;i++){
		
	}
	
	return result;
}

function highlightLetters(word){
	if(word.length > 1){
		var newUsedLetters = [];
		var error = false;
		//while(newUsedLetters.length !=  word.length || error == true){
			var lastEnteredLetter = word.charAt(word.length - 1).toUpperCase();//e
			console.clear();
			console.log("Last entered letter : " + lastEnteredLetter);
			var lastEnteredLetterPossibleGridIndices = getAllIndexes(this.game.currentLetters, lastEnteredLetter);//5, 7
			console.log("Possible positions for letter " + lastEnteredLetter + " : " + lastEnteredLetterPossibleGridIndices);
			
			for(var i = 0; i < lastEnteredLetterPossibleGridIndices.length; i++){
				var currentPossibleGridIndex = lastEnteredLetterPossibleGridIndices[i];//5, 7
				console.log("Current possible position for letter " + lastEnteredLetter + " : " + currentPossibleGridIndex);
				newUsedLetters = [currentPossibleGridIndex];
				
				var currentGridItemIndex = currentPossibleGridIndex;//5, 7
				var testedPositions = [];
				
				//console.log("word.length : " +  word.length);
				for(var j = 0; j < word.length-1; j++){//0..5
					//console.log("currentGridItemIndex : " + currentGridItemIndex);
					if(currentGridItemIndex > -1){
						var letter = word.charAt(word.length - (j + 1)).toUpperCase();//e,i,r,e,u,t
						var letterNeighbours = getAdjacentLetters(currentGridItemIndex);
						var letterNeighbourIndices = getAdjacentLetterIndices(currentGridItemIndex);
						
						var nextLetter = word.charAt(word.length - (j + 2)).toUpperCase();
						var letterPosition = letterNeighbours.indexOf(nextLetter);
						var letterGridIndex = letterNeighbourIndices[letterPosition];
						var nextLetterPositionsInNeighbours = getAllIndexes(letterNeighbours, nextLetter).map(index => letterNeighbourIndices[index]);//0,2		0,1		3,5		6,9		2,6
						
						var positions = [];
						
						for(var m = 0; m < nextLetterPositionsInNeighbours.length; m++){
							var position = letterNeighbourIndices[nextLetterPositionsInNeighbours[m]];
							positions.push(position);
						}
						
						positions = nextLetterPositionsInNeighbours;
						
						console.log("Neighbours of " + letter + " at position " + currentGridItemIndex + 
									" are " + letterNeighbours + 
									" or " + letterNeighbourIndices + 
									" and they include the letter " + nextLetter + " " + 
									nextLetterPositionsInNeighbours.length + "x " +
									"at position(s) " + nextLetterPositionsInNeighbours);
									
						if(nextLetterPositionsInNeighbours.length > 0){
							for(var n = 0; n < nextLetterPositionsInNeighbours.length; n++){
								var position = nextLetterPositionsInNeighbours[n];
								var isPositionUsed = newUsedLetters.indexOf(position) > -1;	
								var hasPositionBeenTested = testedPositions.indexOf(position) > -1;
								console.log("Has Position " + position + " been tested :  "+ hasPositionBeenTested);
								
								if(isPositionUsed == false){
									console.log("Adding letter " + nextLetter + " with position " + position + " to new used letters, proceeding to next letter");
									newUsedLetters.push(position);
									currentGridItemIndex = position;
									console.log("newUsedLetters : " + newUsedLetters);
									break; 
								}else{
									console.log("Letter " + letter + " with position " + position + " is already used.");
									console.log("usedLetters : " + usedLetters);
								}
							}
						}else{
							var lastPosition = newUsedLetters[newUsedLetters.length -1];
							console.log("Need to backtrack, remove last position from new used letters and use different position for previous letter because last position " +
										lastPosition + " is wrong.");
							if(testedPositions.indexOf(lastPosition) == -1){
								testedPositions.push(lastPosition);
							}
							newUsedLetters.pop();//Remove last position form new used letters
							console.log("newUsedLetters : " + newUsedLetters);
							//Go use next index
							//currentGridItemIndex = lastEnteredLetterPossibleGridIndices[i + 1];
							
							//Find previous letter index and its neighbours
							var prevLetterIndex = newUsedLetters[newUsedLetters.length - 1];
							var prevLetterNeighbours = getAdjacentLetters(prevLetterIndex);
							var prevLetterNeighbourIndices = getAdjacentLetterIndices(prevLetterIndex);
							var prevLetterPositionsInNeighbours = getAllIndexes(prevLetterNeighbours, letter).map(index => prevLetterNeighbourIndices[index]);
							console.log("prevLetterPositionsInNeighbours " + prevLetterPositionsInNeighbours.length);
							var newGridItemIndex = currentGridItemIndex;
							
							// Find next position that has not been tested 
							for(var p = 0; p < prevLetterPositionsInNeighbours.length; p++){
								if(testedPositions.indexOf(prevLetterPositionsInNeighbours[p]) == -1 &&
									newUsedLetters.indexOf(prevLetterPositionsInNeighbours[p]) == -1){
									newGridItemIndex = prevLetterPositionsInNeighbours[p];
									break;
								} 
							}
							
							console.log("Should now test with letter "+ this.game.currentLetters[newUsedLetters[newUsedLetters.length - 1]] + " at index " + prevLetterIndex);
							//console.log("Should now test with letter "+ letter + " at index " + newGridItemIndex);
							//Update currentGridItemIndex
							currentGridItemIndex = newGridItemIndex;
							//currentGridItemIndex = prevLetterIndex;
							
							console.log("Letter should be " + word.charAt(word.length - (j + 1)).toUpperCase() + " on next iteration of j");
							console.log("j < word.length-1 " + (word.length-1));
							
							//Repeat letter 
							if(prevLetterPositionsInNeighbours.length > 0){
								console.log("j : " + j);
								console.log("newUsedLetters : " + newUsedLetters);
								console.log("testedPositions : " + testedPositions);
								//j = testedPositions.length;
								//j=0;
								//j--;
								console.log("backtracking");
								console.log("j : " + j);
								newUsedLetters.push(newGridItemIndex);
								//console.log("newUsedLetters " + newUsedLetters);
								continue;
							}else{
								//break
								console.log("break");
								break;
							}
						}
					}					
				}
				
				if(newUsedLetters.length == word.length){
					console.log("break2");
					break;
				}
			}
		//}
		
		if(newUsedLetters.length != word.length){
			console.error("Could not find a valid path");
			newUsedLetters = [];
		}
		
		console.log("newUsedLetters " + newUsedLetters.reverse());
		
		usedLetters = newUsedLetters.reverse();
	}else{
		var currentLetter = word.charAt(word.length -1).toUpperCase();
		var currentLetterIndex = this.game.currentLetters.indexOf(currentLetter);
		if(currentLetterIndex > -1){		
			console.log("Adding first letter " + currentLetter);
			usedLetters.push(currentLetterIndex)	
		}else{
			console.error("Letter " + currentLetter + " was not found on the grid");
			$('#error-message').text(ERROR_MESSAGE_RULE);
			return;
		}
	}

	refreshUI();
}

function refreshUI(){
	for(var i = 0; i < this.game.currentLetters.length;i++){
		var itemId = "#grid-item-" + (i + 1);
		if(usedLetters.indexOf(i) > -1){
			$(itemId).css("background-color", "blue");
		}else{
			$(itemId).css("background-color", "#white");
		}
	}		
}







