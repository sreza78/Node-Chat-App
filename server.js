const express = require('express');
var app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs')
const moment = require('moment');
const requestIp = require('request-ip');
users = [];
connections = [];

server.listen(80);
console.log('server is running at port 80');

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

    socket.on('send video', function(data) {
        io.sockets.emit('new video', { video: true, buffer: data, user:socket.username , time: moment().format("hh:mm a")});
    })

    socket.on('send file', function(data) {
        io.sockets.emit('new file', { file: true, buffer: data, user:socket.username , time: moment().format("hh:mm a")});
    })

    socket.on("new user", function(data, callback) {        
        socket.username = data;
        user ={
            ip: socket.handshake.address.split(':')[3] ? socket.handshake.address.split(':')[3] : "127.0.0.1",
            username: socket.username
        }
        if(!users.find(function(element) {
          return element.username == user.username; 
        })){
        	users.push(user);
        	UpdateUsername();
            callback(true);
    	}
        callback(false);
    })

    function UpdateUsername() {
        io.sockets.emit("get users", users)
    }
})