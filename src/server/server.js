const app = require('express')();
const chalk = require('chalk');
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];
let userCount = 0;

let frames = [];
for (let i = 0; i < 360; i++) {
    frames.push({ id: i, rendered: false, rendering: false, image: '' })
}

console.log(frames)

const file = {
    title: '~/Movie_final-def_02_(edited)-final_export.mp4'
};

let chunk = 0;
let progress = 0;

const messages = {
    connected: 'a user connected',
    disconnected: 'a user disconnected'
}

io.sockets.on('connection', function (socket) {
    connect(socket);
});

setInterval(function () {
    io.sockets.emit('progress', progress);
}, 100)

function connect(socket) {

    socket.on('disconnect', function () {
        disconnect(socket);
    });

    socket.on('progress', function () {
        onProgress(socket);
    });

    socket.on('requestFrame', function () {
        onRequestFrame();
    });

    socket.on('completeFrame', function ( data ) {
        onCompleteFrame(data.id);
    });

    userCount++;
    registerUser(socket);

    io.sockets.emit('userCount', userCount);
    io.sockets.emit('users', users);
    // io.sockets.emit('file', file);
    // io.sockets.emit('chunk', chunk);

    io.sockets.emit('frame', file);

    // io.sockets.emit('progress', progress);
    // io.sockets.emit('message', messages.connected);

    log(chalk.green(messages.connected));
    log(chalk.blue('users: ' + userCount));
    log(chalk.green(getUnrenderedFrame().id));

}

function disconnect(socket) {

    userCount--;
    unregisterUser(socket)
    io.sockets.emit('userCount', userCount);
    io.sockets.emit('users', users);
    io.sockets.emit('message', messages.disconnected);

    log(chalk.red('a user disconnected'));
    log(chalk.blue('users: ' + userCount));

}

function registerUser(socket) {
    users.push({ id: socket.id, handshake: socket.handshake });
}

function unregisterUser(socket) {
    users = users.filter(s => socket.id !== s.id);
}

function onProgress(socket) {
    progress += increment;
    if (progress > 100) {
        chunk++;
        progress = 0;
        file.image = getGradient();

        io.sockets.emit('file', file);
        io.sockets.emit('chunk', chunk);
    }
}

function onRequestFrame() {
    const frame = getUnrenderedFrame();
    frame.rendering = true;
    return frame;
}

function onCompleteFrame(id) {
    const frame = getFrameByID(id);
    frame.rendering = false;
    frame.rendered = true;
}

function getUnrenderedFrame() {
    return frames.filter(frame => frame.rendered === false && frame.rendering === false)[0];
}

function getFrameByID(id) {
    return frames.filter(frame => frame.rendered === false && frame.rendering === false)[0];
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`)
}

http.listen(3000, function () {
    log(chalk.blue('listening on *:3000'));
});
