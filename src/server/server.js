const app = require('express')();
const chalk = require('chalk');
const http = require('http').Server(app);
const io = require('socket.io')(http);

let count = 0;
let users = [];


const gradients = [
    [[0, 201, 255], [146, 254, 157]],
    [[255, 0, 255], [0, 219, 222]],
    [[254, 172, 94], [199, 121, 208]],
    [[199, 121, 208], [75, 192, 200]],
    [[67, 206, 162], [24, 90, 157]],
    [[53, 0, 51], [11, 135, 147]],
    [[225, 238, 195], [240, 80, 83]],
    [[34, 193, 195], [253, 187, 45]],
    [[255, 153, 102], [255, 94, 98]],
    [[127, 0, 255], [225, 0, 255]],
    [[58, 28, 113], [255, 175, 123]],
    [[239, 59, 54], [255, 255, 255]],
    [[195, 55, 100], [29, 38, 113]]
];

const file = {
    title: '~/Movie_final-dev 02 (edited).mp4',
    image: getGradient()
};

let chunk = 0;
let progress = 0;
const increment = .0306314159265359;

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

    count++;
    registerUser(socket);

    io.sockets.emit('count', count);
    io.sockets.emit('users', users);
    io.sockets.emit('file', file);
    io.sockets.emit('chunk', chunk);

    io.sockets.emit('progress', progress);
    // io.sockets.emit('message', messages.connected);

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

function getGradient() {
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    const lines = 100;
    let array = [];
    for (i = 0; i < lines; i++) {
        array.push({ id: i, rgb: pickHex(gradient[0], gradient[1], i / lines) })
    }
    return shuffle(array);
}

function pickHex(color1, color2, percent) {
    return [Math.round(color1[0] * percent + color2[0] * (1 - percent)),
    Math.round(color1[1] * percent + color2[1] * (1 - percent)),
    Math.round(color1[2] * percent + color2[2] * (1 - percent))];
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`)
}

http.listen(3000, function () {
    log(chalk.blue('listening on *:3000'));
});
