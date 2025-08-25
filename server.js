
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');


const app = express();

app.use(cors({
	origin: 'https://cron-job.org'
}));

// Маршрут для "пробуждения" сервера
app.get('/wake-up', (req, res) => {
	//console.log('Server woke up!');
	res.send('Server is awake!');
});





// Создаем HTTP сервер
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });






wsServer.on('connection', function (socket) {
	console.log("A client just connected");
	
	let pingInterval = setInterval(() => {
		socket.send('p');
		socket.pingTimeout = setTimeout(() => {
			console.log("No response to ping, closing connection");
			socket.terminate();
		}, 5000); // таймаут на ответ
	}, 20000); // каждые 20 секунд отправляем ping-message
	
	socket.on('message', function (_msg) {
		
		if (_msg[0] == "p") {
			clearTimeout(socket.pingTimeout);
		}
		else if (_msg[0] == "m" || _msg[0] == 109) {
			msg = _msg.slice(1);
			socket.send("m" + msg);
		}
	});
	
	socket.on('close', function () {
		clearInterval(pingInterval);
		
		console.log("Client disconnected");
	});
	
	socket.on('error', (err) => {
		console.log('Socket error: ', err);
		
		socket.terminate();
	});
});

const listener = server.listen(process.env.PORT, () => {
	console.log('Your server is listening on port ' + listener.address().port);
});

//21.04.23