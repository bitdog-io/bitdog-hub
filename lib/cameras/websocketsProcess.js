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
var _settings = { enableStream: false };

process.on('message', function (message) {
    if (typeof message != typeof undefined && typeof message.name != typeof undefined && message.name != null) {
        message.settings = _settings;
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
        startWebSocket(message);
        startHttpServer(message);
    }
}

function stop(message) {
    
    if (_isRunning === true) {
        _isRunning = false;
        
        if (_wsClient.readyState === ws.OPEN) {
            _wsClientOpen = false;
            _wsClient.close();
        }

        if (_httpServer !== null)
           _httpServer.close();
    }
}

function startWebSocket(message) {
    var url = message.url;
    var nodeId = message.nodeId;
    var authKey = message.authKey;
    
    _wsClient = new ws(url, { headers: { node_id: nodeId, auth_key: authKey } });
    
    _wsClient.on('open', function() {
        _wsClientOpen = true;
        process.send({ name: 'ws-connection-ready' });

    });
    
    _wsClient.on('message',  function (data) {

        process.send({ name: 'ws-connection-data', data: data });

        try {
            if (typeof data !== typeof undefined && data !== null) {
                switch (data.name) {
                    case 'clientCount':
                        if (typeof data.count !== typeof undefined && data.count !== null) {
                            _settings.enableStream = data.count > 0;
                            break;
                        }
                }
            }
        }
        catch (error) {
            process.send({ name: 'ws-connection-error', data: { url: url, error: error } });
        }

    });
    
    _wsClient.on('close', function()  {
        _wsClientOpen = false;
        process.send({ name: 'ws-connection-lost' });

        _wsClient.removeAllListeners('open');
        _wsClient.removeAllListeners('message');
        _wsClient.removeAllListeners('error');
        _wsClient = null;

        if (_isRunning === true) {
            setTimeout(function () {
                if (_isRunning === true) {
                    process.send({ name: 'ws-connection-retry' });
                    startWebSocket({ url: url, nodeId: nodeId, authKey: authKey });
                }
            }, 60000)
        }
    });

    _wsClient.on('error', function (error)  {
        process.send({ name: 'ws-connection-error', data: { url: url, error: error } });
    });
}

function startHttpServer(message) {
    var videoStreamerPort = 9000;
    
    if (message.videoStreamerPort !== typeof undefined)
        videoStreamerPort = message.videoStreamerPort;

    _httpServer = http.createServer(function (req, res) {
        
        process.send({ name: 'http-connection-connected', host: req.socket.remoteAddress, port: req.socket.remotePort });

        req.on('data', function (data) {
            if (_wsClientOpen === true ) {
                _wsClient.send(data, { binary: true });
            }
        });
        
        req.on('end', function () {
            process.send({ name: 'http-connection-lost' });
            res.end();
        });


    }).listen(videoStreamerPort, '127.0.0.1', function () {
        var address = _httpServer.address().address;
        var port = _httpServer.address().port;
        
        process.send({ name: 'http-server-ready', host: address, port: port });
    });
    
    _httpServer.on('close', function () {
       
        process.send({ name: 'http-server-stopped' });

    });
}



