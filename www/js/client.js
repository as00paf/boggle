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

	//User
    var userId = sessionStorage.getItem('userId');
    if(userId != undefined){
        console.log("Found userId : " + userId);
		socket.emit('rejoinGame', userId);
    }
	
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
		
		game.joinGame(socket);
	}
}






