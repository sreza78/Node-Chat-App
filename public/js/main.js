$(document).ready(function() {
    var socket = io.connect();
    var me;
    var notification = new Audio("../sounds/ring.mp3");

    var userFormArea = $("#userFormArea");
    var userForm = $("#userForm");
    var username = $("#username");

    var messageArea = $("#messageArea");
    var users = $("#users");
    var messageForm = $(".messages");
    var text = $("#text");
    var sendmsg = $(".send");
    var image = $("#image");
    var time = $("#time")

    userForm.submit(function(e) {
        e.preventDefault();
        socket.emit("new user", username.val(), function(data) {
            if (data) {
                userFormArea.hide();
                messageArea.fadeIn(500)
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

    sendmsg.click(function(e) {
        e.preventDefault();
        if (text.val() != "")
            socket.emit("send message", text.val());
        text.val("")
        notification.currentTime = 0;
        text.focus();
    })

    socket.on("new message", function(data) {
        if (data.user == me) {
            messageForm.append('<li class="i"><div class="message"><div class="head"><span class="name">' + data.user +
                '</span></div><div class="txt">' + data.msg + '</div><div class="time">' + data.time + '</div></div></li>')
        } else {
            messageForm.append('<li class="friend-with-a-SVAGina"><div class="message"><div class="head"><span class="name">' + data.user +
                '</span></div><div class="txt">' + data.msg + '</div><div class="time">' + data.time + '</div></div></li>')
            notification.play();
        }
        messageForm.animate({ scrollTop: messageForm.prop("scrollHeight") }, 500);
    })

    image.change(function(e) {
        e.preventDefault();
        if (image.val().length) {
            var fReader = new FileReader();
            fReader.readAsDataURL(e.target.files[0]);
            fReader.onloadend = function(event) {

                socket.emit("send image", event.target.result);
                image.val("");
                notification.currentTime = 0;
            }
        }
    })


    socket.on("new image", function(data) {
        if (data.image) {
            var img = new Image();
            img.src = data.buffer;
            if (data.user == me) {
                messageForm.append('<li class="i"><div class="message"><div class="head"><span class="name">' + data.user +
                    '</span></div><img src="' + img.src + '" class="img-thumbnail"><div class="time">' + data.time + '</div></div></li>')
            } else {
                messageForm.append('<li class="friend-with-a-SVAGina"><div class="message"><div class="head"><span class="name">' + data.user +
                    '</span></div><img src="' + img.src + '" class="img-thumbnail"><div class="time">' + data.time + '</div></div></li>')
                notification.play();
            }
            messageForm.animate({ scrollTop: messageForm.prop("scrollHeight") }, 500);
        }
    });

    socket.on('get users', function(data) {
        var html = "";
        for (i = 0; i < data.length; i++) {
            if (data[i].username == me) {
                html += '<li><div class="info"><div class="user">' + data[i].username + '</div><div class="status off">' + data[i].ip + '</div>' +
                    '</div></li>'
            } else {
                html += '<li><div class="info"><div class="user">' + data[i].username + '</div><div class="status on">' + data[i].ip + '</div>' +
                    '</div></li>'
            }
        }
        users.html(html);
    })



    conf = {
        cursorcolor: "#696c75",
        cursorwidth: "4px",
        cursorborder: "none"
    };

    lol = {
        cursorcolor: "#cdd2d6",
        cursorwidth: "4px",
        cursorborder: "none"
    };

    claerResizeScroll = function() {
        $("#text").val("");
        $(".messages").getNiceScroll(0).resize();
        return $(".messages").getNiceScroll(0).doScrollTop(999999, 999);
    };
    $(".list-friends").niceScroll(conf);
    $(".messages").niceScroll(lol);

})