//-----------------------------------------------------------------------------
//
//	websocketsProcess.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
// Code for this file was inspired by project http://drejkim.com/projects/edi-cam/ 
//-----------------------------------------------------------------------------
var http = require('http');
var ws = require('ws');;

var _wsClientOpen = false;
var _wsClient = null;
var _httpServer = null;
var _isRunning = false;

process.on('message', function (message) {
    if (typeof message != typeof undefined && typeof message.name != typeof undefined && message.name != null) {
        switch (message.name) {
            case 'start':
                start(message);
                break;
            case 'stop':
                stop(message);
                break;
        }
    }
});

function start(message) {
    if (_isRunning === false) {
        startWebSocket(message);
        startHttpServer(message);
    }
}

function stop(message) {
    
    if (_wsClient.readyState === ws.OPEN) {
        _wsClientOpen = false;
        _wsClient.close();
    }
    
    _httpServer.close();
}

function startWebSocket(message) {
    var url = message.url;
    var nodeId = message.nodeId;
    var authKey = message.authKey;
    
    _wsClient = new ws(url, { headers: { node_id: nodeId, auth_key: authKey } });
    
    _wsClient.on('open', function open() {
        _wsClientOpen = true;
        process.send({ name: 'ws-connection-ready' });
        console.log('WebSocket client connected to hub');

    });
    
    _wsClient.on('message', function incoming(data)  {

    });
    
    _wsClient.on('close', function incoming(data)  {
        _wsClientOpen = false;
        process.send({ name: 'ws-connection-lost' });
        console.log('WebSocket client closed');
    });
}

function startHttpServer(message) {
    _httpServer = http.createServer(function (req, res) {
        
        console.log('HTTP MPEG Stream Connected: ' + req.socket.remoteAddress + ':' + req.socket.remotePort);
        
        req.on('data', function (data) {
            if (_wsClientOpen == true) {
                _wsClient.send(data, { binary: true });
            }
        });
        
        req.on('end', function () {
            console.log('No more data in response.');
        });


    }).listen(0, '127.0.0.1', function () {
        var address = _httpServer.address().address;
        var dynamicPort = _httpServer.address().port;
        
        console.log('HTTP server listening for video stream on port ' + address + ':' + dynamicPort);
        process.send({ name: 'http-connection-ready', host: address, port: dynamicPort });
    });
    
    _httpServer.on('close', function () {
        var address = _httpServer.address().address;
        var dynamicPort = _httpServer.address().port;
        
        console.log('HTTP server closed for ' + address + ':' + dynamicPort);
        process.send({ name: 'http-connection-lost' });

    });
}


// HTTP server to accept incoming MPEG1 stream
