let socket = null;

let online = false
let connected = false
let timerTimer = -1
let timeoutTimer = -1

let pingTimeoutInterval = 60000
let pingTimeoutTime = 10000


function updateStatus() {
    let ele = document.getElementById("status");
    if (ele != null) {
        if (!online && !connected) {
            ele.innerHTML = 'Connecting...';
            ele.className = "offline";
        }
        if (connected && !online) {
            ele.innerHTML = 'Offline';
            ele.className = "offline";
        }

        if (connected && online) {
            ele.innerHTML = 'online';
            ele.className = "online";
        }
    }
}

function stopTimer() {
    if (timerTimer != -1) {
        window.clearTimeout(timerTimer);
        timerTimer = -1;
    }
}

function setTimer() {
    if (timerTimer != -1) {
        stopTimer();
    }
    timerTimer = window.setTimeout(sendPing, pingTimeoutInterval);
}

function stopPingTimeout() {
    if (timeoutTimer != -1) {
        window.clearTimeout(timeoutTimer);
        timeoutTimer = -1;
    }
}

function pingTimeout()
{
    online = false;
    updateStatus();
}


function setPingTimeout() {
    if (timeoutTimer != -1) {
        stopTimeout();
    }
    timeoutTimer = window.setTimeout(pingTimeout, pingTimeoutTime);
}

function sendPing()
{
    socket.send(JSON.stringify({"action": "ping"}));
    setPingTimeout();
}


function tryConnect()  {
    socket = new WebSocket("wss://webhook.xtoys.app/Cvy54gIAxLFR");
    socket.onopen = function(event) {
        connected = true;
        updateStatus();
        setTimer();
    }
    
    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        if (data.event == "join" && data.uid == "InariWB") {
            online = true;
        }
        if (data.event == "leave" && data.uid == "InariWB") {
            online = false;
        }
        if (data.action == "pong") {
            stopPingTimeout();
            setTimer();
        }
        updateStatus();
    }
    
    socket.onclose = function(event) {
        connected = false;
        online = false;
        stopTimer();
        stopPingTimeout();
        updateStatus();
        tryConnect();
    }
    
    socket.onerror = function(event) {
        console.log("error: " + error);
        connected = false;
        online = false;
        stopTimer();
        stopPingTimeout();
        if (socket.readyState == socket.OPEN) {
            socket.close();
        } else {
            tryConnect();
        }
        updateStatus();
    }

    updateStatus();


}

window.addEventListener("DOMContentLoaded", function() {
    tryConnect();
})


