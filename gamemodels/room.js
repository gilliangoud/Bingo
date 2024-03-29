var utility = require('./utility.js');

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
function Room(name){
	this.players = [];
	this.tables = [];
	this.name = name;
};

Room.prototype.addPlayer = function(player) {
	this.players.push(player);
};

Room.prototype.removePlayer = function(player) {
	var playerIndex = -1;
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id == player.id){
			playerIndex = i;
			break;
		}
	}
	this.players.remove(playerIndex);
};

Room.prototype.addTable = function(table) {
	this.tables.push(table);
};

Room.prototype.refreshTables = function() {
	this.tables = utility.loadTables(this.name);
}

Room.prototype.removeTable = function(table) {
	var tableIndex = -1;
	for(var i = 0; i < this.tables.length; i++){
		if(this.tables[i].id == table.id){
			tableIndex = i;
			break;
		}
	}
	this.tables.remove(tableIndex);
};

Room.prototype.getPlayer = function(playerId) {
	var player = null;
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id == playerId){
			player = this.players[i];
			break;
		}
	}
	return player;
};

Room.prototype.getTable = function(tableId) {
	var table = null;
	for(var i = 0; i < this.tables.length; i++){
		if(this.tables[i].id == tableId){
			table = this.tables[i];
			break;
		}
	}
	return table;
};

Room.prototype.getTableMessage = function() {
	var tableMessageList = [];
	for (var i = 0; i < this.tables.length; i++) {
		tableMessageList.push(this.tables[i].createMessageObject());
	};
	return tableMessageList;
};

module.exports = Room;