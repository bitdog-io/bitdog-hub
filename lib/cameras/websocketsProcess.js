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
var _url = '';
var _nodeId = '';
var _authKey = '';
var videoStreamerPort = 9000;
var _enableStream = false;

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
        _isRunning = true;

        _url = message.url;
        _nodeId = message.nodeId;
        _authKey = message.authKey;
        _enableStream = false;

        if (typeof message.videoStreamerPort !== typeof undefined)
            _videoStreamerPort = message.videoStreamerPort;

        startWebSocket();
        startHttpServer();
    }
}

function stop(message) {
    
    if (_isRunning === true) {
        _isRunning = false;
        _enalbeStream = false;
        
        if (_wsClient.readyState === ws.OPEN) {
            _wsClientOpen = false;
            _wsClient.close();
        }

        if (_httpServer !== null)
           _httpServer.close();
    }
}

function startWebSocket() {

    
    _wsClient = new ws(_url, { headers: { node_id: _nodeId, auth_key: _authKey } });
    
    _wsClient.on('open', function() {
        _wsClientOpen = true;
        process.send({ name: 'ws-connection-ready' });

    });
    
    _wsClient.on('message',  function (data) {
      
        try {

            data = JSON.parse(data);

            process.send({ name: 'ws-connection-data', data: data });

            switch (data.name) {
                case 'clientCount':
                    _enableStream = data.count > 0;
                    process.send({ name: 'ws-connection-sending-video', data: { enableStream: _enableStream } });
                    break;
                default:
                    process.send({ name: 'ws-connection-error', data: { message: 'unknown message name', name: data.name } });
                    break;
            }

        }
        catch (error) {
            process.send({ name: 'ws-connection-error', data: { url: _url, error: error, data: data } });
            restartWebSocket();
        }

    });
    
    _wsClient.on('close', function () {
        process.send({ name: 'ws-connection-lost' });
        restartWebSocket();
    });

    _wsClient.on('error', function (error)  {
        process.send({ name: 'ws-connection-error', data: { url: _url, error: error } });
        restartWebSocket();
    });
}

function restartWebSocket () {

    if (_wsClientOpen === true) {
        _wsClientOpen = false;

        _wsClient.removeAllListeners('open');
        _wsClient.removeAllListeners('message');
        _wsClient.removeAllListeners('error');
        _wsClient = null;

        if (_isRunning === true) {
            setTimeout(function () {
                if (_isRunning === true) {
                    if (_wsClient === null) {
                        process.send({ name: 'ws-connection-retry' });
                        startWebSocket();
                    }
                }
            }, 60000)
        }
    }

}

function startHttpServer() {

    _httpServer = http.createServer(function (req, res) {
        
        process.send({ name: 'http-connection-connected', host: req.socket.remoteAddress, port: req.socket.remotePort });

        req.on('data', function (data) {
            if (_wsClientOpen === true && _enableStream === true) {
                try {
                    _wsClient.send(data, { binary: true });
                }
                catch (error) {

                }
            }
        });
        
        req.on('end', function () {
            process.send({ name: 'http-connection-lost' });
            res.end();
        });


    }).listen(_videoStreamerPort, '127.0.0.1', function () {
        var address = _httpServer.address().address;
        var port = _httpServer.address().port;
        
        process.send({ name: 'http-server-ready', host: address, port: port });
    });
    
    _httpServer.on('close', function () {
       
        process.send({ name: 'http-server-stopped' });

    });
}



