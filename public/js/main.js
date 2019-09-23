$(document).ready(function() {
    var socket = io.connect();
    var me;
    var notification = new Audio("../sounds/ring.mp3");
    var volume = $("#volume");

    var userFormArea = $("#userFormArea");
    var userForm = $("#userForm");
    var username = $("#username");

    var messageArea = $("#messageArea");
    var users = $("#users");
    var messageForm = $(".messages");
    var text = $("#text");
    var sendmsg = $(".send");
    var image = $("#image");
    var video = $("#video");
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

    /*message.keydown(function(e) {
        if (e.keyCode == 13) {
            socket.emit("send message", message.val());
            e.preventDefault();
            message.val("")
        }
    })*/

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

    video.change(function(e) {
        e.preventDefault();
        if (video.val().length) {
            var fReader = new FileReader();
            fReader.readAsDataURL(e.target.files[0]);
            fReader.onloadend = function(event) {

                socket.emit("send video", event.target.result);
                video.val("");
                notification.currentTime = 0;
            }
        }
    })

    socket.on("new video", function(data) {
        if (data.video) {
            var vid = $("#videoPlayer");
            vid.src = data.buffer;
            if (data.user == me) {
                messageForm.append('<li class="i"><div class="message"><div class="head">'+
                    '<span class="name">'+data.user+'</span></div><div class="player"><video id="videoPlayer" src="'+vid.src+
                    '"controls></video></div><div class="time">'+data.time+'</div></div></li>')
            } else {
                messageForm.append('<li class="friend-with-a-SVAGina"><div class="message"><div class="head">'+
                    '<span class="name">'+data.user+'</span></div><div class="player"><video id="videoPlayer" src="'+vid.src+
                    '"controls></video></div><div class="time">'+data.time+'</div></div></li>')
                notification.play();
            }
            messageForm.animate({ scrollTop: messageForm.prop("scrollHeight") }, 500);
        }
    });


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

    if (document.cookie.split('=')[1] == 'off') {
        notification.muted = true;
        document.cookie = "notification=off";
        volume.html("");
        volume.html('<i class="fa fa-volume-off"></i>')
        volume.css({ 'background-position': '0 -100%', 'color': '#2590EB' });
    } else if (document.cookie.split('=')[1] == 'on') {
        notification.muted = false;
        document.cookie = "notification=on";
        volume.html("");
        volume.html('<i class="fa fa-volume-up"></i>')
        volume.css({ 'background-position': '0 0%', 'color': '#2590EB' });
    }
    volume.click(function() {
        if (notification.muted == true) {
            notification.muted = false;
            document.cookie = "notification=on";
            volume.html("");
            volume.html('<i class="fa fa-volume-up"></i>')
            $(this).css({ 'background-position': '0 0%', 'color': '#2590EB' });
        } else {
            notification.muted = true;
            document.cookie = "notification=off";
            volume.html("");
            volume.html('<i class="fa fa-volume-off"></i>')
            $(this).css({ 'background-position': '0 -100%', 'color': '#2590EB' });
        }
    })

})