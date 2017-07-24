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

process.on('message', function (message) {
    if (typeof message != typeof undefined && typeof message.name != typeof undefined && message.name != null) {
        switch (message.name) {

        }
    }
});

_wsClient = new ws('wss://hub.bitdog.io/api/video/source');

_wsClient.on('open', function open() {
    wsClientOpen = true;
    console.log('WebSocket client connected to hub');
});

_wsClient.on('message', function incoming(data)  {

});

_wsClient.on('close', function incoming(data)  {
    console.log('WebSocket client closed');
});

// HTTP server to accept incoming MPEG1 stream
_httpServer = http.createServer(function (req, res) {
    
    console.log('HTTP MPEG Stream Connected: ' + req.socket.remoteAddress + ':' + req.socket.remotePort);
    
    req.on('data', function (data) {
        if (wsClientOpen == true) {
            wsClient.send(data, { binary: true });
        }
    });
    
    req.on('end', function () {
       console.log('No more data in response.');
    });


}).listen(0, '127.0.0.1', function () {
    var address = _httpServer.address().address;
    var dynamicPort = _httpServer.address().port;
    console.log('HTTP server listening for video stream on port ' + host + ':' + dynamicPort);
});

httpServer.on('close', function () {
    console.log('HTTP server closed ' + dynamicPort);

});