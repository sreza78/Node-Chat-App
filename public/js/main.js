$(document).ready(function() {
    var socket = io.connect();
    var messageForm = $("#messageForm");
    var message = $("#message");
    var chat = $("#chat");
    var messageArea = $("#messageArea");
    var userFormArea = $("#userFormArea");
    var userForm = $("#userForm");
    var users = $("#users");
    var username = $("#username");
    var me;

    userForm.submit(function(e) {
        e.preventDefault();
        socket.emit("new user", username.val(), function(data) {
            if (data) {
                userFormArea.hide();
                messageArea.show();
            }
        });
        me = username.val();
        username.val("")
    })

    /*message.keydown(function(e) {
        if (e.keyCode == 13) {
            socket.emit("send message", message.val());
            e.preventDefault();
            message.val("")
        }
    })*/

    messageForm.submit(function(e) {
        e.preventDefault();
        if(message.val() != "")
            socket.emit("send message", message.val());
        message.val("")
    })

    socket.on("new message", function(data) {
        if (data.user == me) {
            chat.append('<div class="chatbox"><strong>' + data.user + '</strong><p>' + data.msg + '</p></div>')
        } else {
            chat.append('<div class="chatbox other"><strong>' + data.user + '</strong><p>' + data.msg + '</p></div>')
        }
        chat.animate({ scrollTop: chat.prop("scrollHeight") }, 500);
    })

    socket.on('get users', function(data) {
        var html = "";
        for (i = 0; i < data.length; i++) {
            html += "<li class='list-group-item'>" + data[i] + "</li>"
        }
        users.html(html);
    })
})