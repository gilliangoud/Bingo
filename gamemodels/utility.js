Game = require('./game.js');
Table = require('./table.js');
var uuid = require('node-uuid');
var tables = require('../models/tables');
var User = require('../models/user');

function Utility () {};

Utility.prototype.sendEventToAllPlayers = function(event,message,io,players) {
	for(var i = 0; i < players.length; i++){
		io.sockets.connected[players[i].id].emit(event, message);
	}
};

Utility.prototype.sendEventToAllPlayersButPlayer = function(event,message,io,players,player) {
	for(var i = 0; i < players.length; i++){
		if(players[i].id != player.id){
			io.sockets.connected[players[i].id].emit(event, message);
		}
	}	
};

Utility.prototype.sendEventToSpecificPlayer = function(event,message,io,player) {
	io.sockets.connected[player.id].emit(event,message);
};

Utility.prototype.sendEventToTable = function(event,message,io,table) {
	for(var i = 0; i < table.players.length; i++){
		io.sockets.connected[table.players[i].id].emit(event, message);
	}	
};

Utility.prototype.sendEventToTableInPlay = function(event,message,io,table) {
	for (var i = 0; i < table.players.length; i++) {
		message.userId = table.players[i].id;
		message.userCard = table.players[i].card;
		message.userCardInStraight = table.players[i].cardInStraight;
		io.sockets.connected[table.players[i].id].emit(event, message);
	};
};

Utility.prototype.sendEventToAllFreePlayers = function(event,message,io,players) {
	for(var i = 0; i < players.length; i++){
		if(players[i].status === "available"){
			io.sockets.connected[players[i].id].emit(event, message);
		}
	}
};

Utility.prototype.sendEventToAllFreePlayersButPlayer = function(event,message,io,players,player) {
	for(var i = 0; i < players.length; i++){
		if(players[i].status === "available" && players[i].id != player.id){
			io.sockets.connected[players[i].id].emit(event, message);
		}
	}
};

Utility.prototype.sendEventToSelectedPlayers = function(event,message,io,players) {
	for(var i = 0; i < players.length; i++){
		io.sockets.connected[players[i].id].emit(event, message);
	}
};

Utility.prototype.createSampleTables = function(tableListSize) {
	var tableList = [];
	for(var i = 0; i < tableListSize; i++){
		var game = new Game();
		var table = new Table(uuid.v4());
		table.setName("Room " + (i + 1));
		table.gameObj = game;
		table.state = "available";
		tableList.push(table);
	}
	return tableList;
};

Utility.prototype.loadTables = function(roomName) {
	var tableList = [];
	const regex = new RegExp(escapeRegex(roomName), 'gi');
	var query = { 'room': regex };
	tables.find(query, function(err, result) {
	    if (err) throw err;
	    for(var i = 0 ; i < result.length; i++){
	    	var game = new Game();
		    var table = new Table(result[i]._id);
		    table.setName(result[i].tableName);
		    table.gameObj = game;
		    let d = new Date();
		    let closeHour = result[i].closeHour;
		    if (result[i].closeHour == 0){
		    	closeHour = 24;
		    }
	    	switch(d.getDay()){
	    		case 0:
	    			if(result[i].dayOpen.sunday == true){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 1:
	    			if(result[i].dayOpen.monday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 2:
	    			if(result[i].dayOpen.tuesday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 3:
	    			if(result[i].dayOpen.wednesday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 4:
	    			if(result[i].dayOpen.thursday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 5:
	    			if(result[i].dayOpen.friday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    		case 6:
	    			if(result[i].dayOpen.saturday){
	    				if (checkTime(result[i].openHour, closeHour)){
			    			table.status = result[i].state;
			    		};
	    			}
	    			break;
	    	}

		    table.setPlayerLimit(result[i].playerLimit);
		    console.log(result[i]);
		    tableList.push(table);
	    }
	});
	return tableList;
};

function checkTime(openHour, closeHour) {
	let d = new Date();
	if (d.getHours() >= openHour && d.getHours() < closeHour){
		return true;
	} 
	return false;
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};

Utility.prototype.createTable = function(name, room, state, limit) {
	tables.findOne({ 'tableName': name}, function(err, user) {
		if (err){console.log('Error in creating Table: '+err);}
		if (user){console.log('Table already exists with name: '+name);}
		else {
			var newTable = new tables();
			newTable.tableName = name;
			newTable.room = room;
			newTable.state = "available";
			newTable.playerLimit = limit;

			newTable.save(function(err) {
                            if (err){
                                console.log('Error in saving table: '+err);  
                                throw err;  
                            }
                            console.log('Table registration succesful');    
                        });
		}
	}
)};

//Utility.prototype.updateTable = function(id,)


module.exports = Utility;