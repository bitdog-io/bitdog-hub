//-----------------------------------------------------------------------------
//
//	videoStreamer.js
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

// modules
var childProcess = require('child_process');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var websocketsProcessPath = path.resolve(__dirname , './websocketsProcess.js');


function VideoStreamer(source) {
    var _websocketProcess = null;
    var _ffmpegProcess = null;

    this.__defineGetter__('source', function () { return source; });

    this.__defineGetter__('websocketProcess', function () { return _websocketProcess; });
    this.__defineSetter__('websocketProcess', function (value) { _websocketProcess = value; });

    this.__defineGetter__('ffmpegProcess', function () { return _ffmpegProcess; });
    this.__defineSetter__('ffmpegProcess', function (value) { _ffmpegProcess = value; });
}

util.inherits(VideoStreamer, EventEmitter);

VideoStreamer.prototype.start = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Starting websocket streamer to Bitdog Cloud for video ' + this.source);
    this.websocketProcess = childProcess.fork(websocketsProcessPath, [], { execArgv: [], cwd: process.cwd(), silent: true });
    
    this.websocketProcess.stdout.on("data", function (data) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, data);
    });
    
    this.websocketProcess.stderr.on("data", function (data) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, data);
    });
    
    this.websocketProcess.on('error', function (error) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Websocket streamer error', error);
    });
    
    this.websocketProcess.on('message', function (message) {
        
        if (typeof message != typeof undefined && typeof message.name != typeof undefined && message.name != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Received websocket streamer message', message);
            
            switch (message.name) {
                case 'http-connection-ready': {
                    var url = 'http://' + message.host + ':' + message.port;
                    
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Starting ffmpeg stream to', url);
                    var sourceInt = parseInt(this.source);
                    
                    if (isNaN(sourceInt) === false) {
                        this.ffmpegProcess = childProcess.spawn('ffmpeg' , ['-s', '640x480', '-f', 'video4linux2', '-i', '/dev/video' + sourceInt, '-f', 'mpeg1video', '-b:v', '800k', '-r', '30', url]);
                        
                        this.ffmpegProcess.stdout.on('data', function (data) {
           
                        });
                        
                        this.ffmpegProcess.stderr.on('data', function (data) {
            
                        });
                        
                        this.ffmpegProcess.on('close', function (code) {
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'ffmpeg process exited with code ' + code);
                        });
                    }
                }
                break;
                case 'http-connection-lost':
                    break;
                case 'ws-connection-lost':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Connection lost for websocket streamer for video');
                    break;
                case 'ws-connection-ready':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Connection lost for websocket streamer for video');
                    break;
            }
        }
    
    });
    
    this.websocketProcess.on('disconnected', function () { 
    
    });
    
    this.websocketProcess.send({ name: 'start', source: source, url: 'wss://hub.bitdog.io/api/video/source/' + source, nodeId: bitdogClient.configuration.nodeId, authKey: bitdogClient.configuration.authKey });
    
}

VideoStreamer.prototype.stop = function () {

};

module.exports = VideoStreamer;