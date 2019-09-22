const express = require('express');
var app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs')
const moment = require('moment');
const requestIp = require('request-ip');
users = [];
connections = [];

server.listen(2020);
console.log('server is running at port 2020');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use(requestIp.mw())
 
app.use(function(req, res) {
    const ip = req.clientIp;
    res.end(ip);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})


io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log("Connected: %s users connected", connections.length);

    socket.on('disconnect', function(data) {
        //if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
        UpdateUsername();
        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnect: %s users connected", connections.length);
    })

    socket.on('send message', function(data) {
        io.sockets.emit("new message", { msg: data, user: socket.username, time: moment().format("hh:mm a") })
    })

    socket.on('send image', function(data) {
        io.sockets.emit('new image', { image: true, buffer: data, user:socket.username , time: moment().format("hh:mm a")});
    })

    socket.on("new user", function(data, callback) {
        callback(true);
        socket.username = data;
        user ={
            ip : socket.handshake.address.split(':')[3],
            username: socket.username
        }
        users.push(user);
        UpdateUsername();
    })

    function UpdateUsername() {
        io.sockets.emit("get users", users)
    }
})