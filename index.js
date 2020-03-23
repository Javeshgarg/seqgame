const path = require('path');
const express = require('express');
const app = new express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;
const public = path.join(__dirname, 'public');
const filesFromWebpack = path.join(__dirname, 'static');

app.use('/static', express.static(filesFromWebpack));
app.use('/static', express.static(public));

app.get(['/', '/room/:room'], (req, res) => {
	res.sendFile(path.join(public, 'index.html'));
});

app.use('/api', require('./server/api'));
server.listen(port, () => {
	console.log(`http and socket listening on port ${port}`);
});

io.on('connection', socket => {
	console.log('client-connected');
	socket.on('server_play', data => {
		io.emit('client_update_game', data);
	});
	socket.on('server_chat', data => {
		io.emit('client_update_chat', data);
	});
	socket.on('disconnect', () => {
		console.log('client-disconnected');
	});
});
