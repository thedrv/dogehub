#!/usr/bin/env node

var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.OPENSHIFT_NODEJS_PORT || 8080
  , ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"
  , doges = [];

try {

app.use(express.static(__dirname + '/static/'));

var server = http.createServer(app);
server.listen(port, ip);

console.log('wow http on %d:%d', ip,port);

var wss = new WebSocketServer({server: server});

wss.on('connection', function (socket) {
	console.log("wow doge is connect");
	var doge = {
		id: Math.floor(Math.random() * 1000000),
		x: 0,
		y: 0,
		name: "",
		wow: false
	};
	doges.push(doge);

	socket.on('close', function() {
		clearInterval(emitter);
		console.log('wow doge is disconnect');
		doge.dead = true;
	});

	socket.on('message', function (data) {
		var data = JSON.parse(data);

		if("x" in data) {
			doge.x = data.x;
			doge.y = data.y;
		}
		if("name" in data) doge.name = escapeHtml(data.name);
		doge.wow = data.wow || false;

		if("msg" in data) {
			doge.msg = data.msg;
			doge.msgDate = new Date();
		}
	});

	var emitter = setInterval(function(){
		if(socket.readyState != 1) return;
		socket.send(JSON.stringify({
			you: doge,
			doges: doges
		}));
	}, 50);
});

setInterval(cleanupDoges, 50);
function cleanupDoges() {
	doges.forEach(function(doge, index) {
		if(doge.dead) doges.splice(index, 1);
	});
}

setInterval(cleanupMessages, 2000);
function cleanupMessages() {
	var d = new Date();
	doges.forEach(function(doge, index) {
		if(doge.msgDate < d - 2000) doge.msg = "";
	});
}

function escapeHtml(text) {
	if(!text) return false;
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

} catch(e) {
	console.error(e);
}