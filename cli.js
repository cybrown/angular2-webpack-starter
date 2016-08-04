const child_process = require('child_process');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ss = require('socket.io-stream');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

function spawnTask(socket) {
    const childProcess = child_process.spawn(process.cwd() + '/node_modules/.bin/webpack-dev-server.cmd', ['--config', 'config/webpack.dev.js', '--progress', '--profile', '--colors', '--watch', '--display-error-details', '--display-cached', '--content-base src/']);

	ss(socket).on('new', function(stream, options) {
		childProcess.stdout.pipe(stream).pipe(childProcess.stdin);
	});

    childProcess.stdout.on('data', (data) => {
        socket.emit('stdout', data);
    });

    childProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });

    childProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    });

    childProcess.on('error', err => {
        console.log(err.stack);
    });
}

app.use(express.static('.'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index-dev.html');
});

io.on('connection', function (socket) {
    spawnTask(socket);
});

server.listen(8080);
