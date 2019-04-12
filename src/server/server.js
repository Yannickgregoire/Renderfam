const app = require('express')();
const chalk = require('chalk');
const http = require('http').Server(app);
const io = require('socket.io')(http);

let count = 0;
let users = [];

const messages = {
    connected: 'a user connected',
    disconnected: 'a user disconnected'
}

io.sockets.on('connection', function (socket) {
    connect(socket);
    socket.on('disconnect', function () {
        disconnect(socket);
    });
});

function connect(socket) {

    count++;
    registerUser(socket);

    io.sockets.emit('count', count);
    console.log(users)
    io.sockets.emit('users', users);
    io.sockets.emit('message', messages.connected);

    log(chalk.green(messages.connected));
    log(chalk.blue('users: ' + count));

}

function disconnect(socket) {

    count--;
    unregisterUser(socket)
    io.sockets.emit('count', count);
    io.sockets.emit('users', users);
    io.sockets.emit('message', messages.disconnected);

    log(chalk.red('a user disconnected'));
    log(chalk.blue('users: ' + count));

}

function registerUser(socket) {
    users.push({ id: socket.id, handshake: socket.handshake });
}

function unregisterUser(socket) {
    users = users.filter(s => socket.id !== s.id);
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`)
}

http.listen(3000, function () {
    log(chalk.blue('listening on *:3000'));
});
