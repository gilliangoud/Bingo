var socket = io();
var isCardShown = false;
$(document).ready(function(){
	$("#gamePage").hide();
	$(".backToRoomPage").click(function(){
		socket.emit('userLeaveFromTable',{});
		isCardShown = false;
		for(var i = 0; i < 9; i++){
			for(var j = 0; j < 3; j++){
				var className = (j + 1) + "_row_" + (i + 1) + "_column";
				$("." + className).empty();
			}
		}
		$("#gameFinishedSpan").text("");
	});
});

$(function () {
	$('form').submit(function(){
		let message = $('#m').val();
		socket.emit('sendChatMessage', { message : message });
		$('#m').val('');
		return false;
	});
});

socket.on('userSendChatMessage',function(data){
    $('#messages').append($('<li>').text(data.username + ": " + data.message));
    updateScroll();
});

function updateScroll(){
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
}

socket.on('userOnline', function (data) {
//connect to the game server and let the username be known
	console.log('connecting to the server');
	$.getJSON("api/user_id", function(data) {
    // Make sure the data contains the username as expected before using it
	    if (data.hasOwnProperty('id')) {
	        let clientId = data.id;
	        let usernam = data.username;
	        socket.emit('connectToServer', { username : usernam, id : clientId });
	    }
	});
});

socket.on('newUserOnline',function(data){
	//Write on the user log that a new user has come to room
	$('#messages').append($('<li>').text(data.message + data.username));
	updateScroll();
});

socket.on('tableList',function(data){
	var html = "";
	for(var i = 0; i < data.tableList.length; i++){
		if(data.tableList[i].status != "available"){
			html += "<a href='#' onclick='return false' style='font-weight:200;' class='showGamePage list-group-item list-group-item-action disabled' data-id='' >"+ data.tableList[i].name +"</br><B>("
			 + data.tableList[i].players.length +"/"+ data.tableList[i].playerLimit + ")</B></a>"
		} else {
			html += "<a href='#' style='font-weight:200;' class='showGamePage list-group-item list-group-item-action' data-id='"+ data.tableList[i].id +"'>"+ data.tableList[i].name +"</br><B>("
			 + data.tableList[i].players.length +"/"+ data.tableList[i].playerLimit + ")</B></a>"
		}
	}
	$('#roomList').empty();
	$('#roomList').append(html);

	$("#onlineUserCount").empty();
	$("#onlineUserCount").text("| Users online: " + data.playerCount );

	$('.showGamePage').click(function(){
		var selectedTableId = $(this).attr('data-id');
		if(selectedTableId != ''){
			socket.emit('connectToTable', {tableID: selectedTableId});
		}
	});
});

socket.on('connectedToTable',function(data){
	$('#messages').empty();
	$("#roomPage").hide();
	$("#gamePage").show()
	$('#messages').append($('<li>').text("Welcome to the table"));
	updateScroll();
});

socket.on('playerDisconnectedFromTable',function(data){
	$('#messages').empty();
	$('#playersIn').empty();
	$("#gamePage").hide();
	$("#roomPage").show();
});

socket.on('userConnectedToTable',function(data){
	//Write on the user log that a new user has come to table
	$('#messages').append($('<li>').text(data.username + data.message));
	updateScroll();
	$('#playersIn').empty();
	$('#playersIn').append($('<li>').text(data.players));
});

socket.on('userDisconnectedFromTable',function(data){
	//Write on the user log that a user has disconnected from table
	$('#messages').append($('<li>').text(data.username + data.message));
	updateScroll();
	$('#playersIn').empty();
	$('#playersIn').append($('<li>').text(data.players));
});

socket.on('userDisconnectedFromGame',function(data){
	//Write on the user log that a user has disconnected
	$('#messages').append($('<li>').text(data.message + data.username));
	updateScroll();
});

socket.on('errorEvent',function(data){
	console.log(data);
});








socket.on('userSentChatMessageToUser',function(data){
	console.log(data);
});
socket.on('gameFinished',function(data){
	$("#gameFinishedSpan").text("Game is Finished");
});
socket.on('bingoWinner',function(data){
	$("#gameFinishedSpan").text("You are the Bingo Winner");
});
socket.on('gameRestarted',function(data){
	console.log(data);
});
socket.on('gameStarted',function(data){
	console.log("A new game is started");
	console.log(data);
	//Draw card and start playing
});
socket.on('numberChosen',function(data){
	console.log(data);
	//Draw chosen number and if number is on the card, then fill the chosen number on the card
	$("#chosenNumberSpan").text(data.chosenNumber);
	if(!isCardShown){
		for(var i = 0; i < data.userCard.length; i++){
			for(var j = 0; j < data.userCard[i].length; j++){
				var className = (j + 1) + "_row_" + (i + 1) + "_column";
				$("." + className).empty();
				$("." + className).append(data.userCard[i][j]);
			}
		}
		isCardShown = true;
	}
	else{
		for(var i = 0; i < data.userCard.length; i++){
			for(var j = 0; j < data.userCard[i].length; j++){
				var className = (j + 1) + "_row_" + (i + 1) + "_column";
				if(parseInt($("." + className).text()) == data.chosenNumber){
					$("." + className).empty();
					$("." + className).append("X");
					break;
				}
			}
		}		
	}
});