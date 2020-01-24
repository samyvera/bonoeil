const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/../client'));

const users = new Map();
const individuals = [{
        genes: "",
        nickname: "Lilith"
    }
];

io.on('connection', socket => {
    users.set(socket.id, {
        color: 'hsl(' + 360 * Math.random() + ', 100%, ' + (50 + 25 * Math.random()) + '%)'
    });

    socket.on('newMessage', text => {
        if (!users.has(socket.id)) socket.disconnect();
        else io.emit('newMessage', {
            text: text,
            color: users.get(socket.id).color
        });
    });

    socket.on('disconnect', () => {
        if (!users.has(socket.id)) socket.disconnect();
        else users.delete(socket.id);
    });
});

http.listen(process.env.PORT || 3000);