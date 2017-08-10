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
var url = require('url');

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var websocketsProcessPath = path.resolve(__dirname , './websocketsProcess.js');


function VideoStreamer(videoHubUrl, sourcePath) {
    var _websocketProcess = null;
    var _ffmpegProcess = null;
    var _stopping = false;

    
    this.__defineGetter__('stopping', function () { return _stopping; });
    this.__defineSetter__('stopping', function (value) { _stopping = value; });

    this.__defineGetter__('source', function () { return sourcePath; });
    
    this.__defineGetter__('url', function () { return videoHubUrl; });

    this.__defineGetter__('websocketProcess', function () { return _websocketProcess; });
    this.__defineSetter__('websocketProcess', function (value) { _websocketProcess = value; });

    this.__defineGetter__('ffmpegProcess', function () { return _ffmpegProcess; });
    this.__defineSetter__('ffmpegProcess', function (value) { _ffmpegProcess = value; });
}

util.inherits(VideoStreamer, EventEmitter);

VideoStreamer.prototype.start = function () {
    var self = this;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Starting websocket streamer to Bitdog Cloud for ' + this.source);
    
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
                    
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Local HTTP connection ready for video', url);

                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Starting ffmpeg stream to', url);
               
                    this.ffmpegProcess = childProcess.spawn('ffmpeg' , ['-s', '640x480', '-f', 'video4linux2', '-i', self.source, '-f', 'mpeg1video', '-b:v', '800k', '-r', '30', url]);
                    
                    this.ffmpegProcess.stdout.on('data', function (data) {
           
                    });
                    
                    this.ffmpegProcess.stderr.on('data', function (data) {
            
                    });
                    
                    this.ffmpegProcess.on('close', function (code) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'ffmpeg process exited with code ' + code);
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Stopping video streamer because of ffmpeg failure');

                        self.ffmpegProcess = null;
                        self.stop();
                    });
                   
                }
                break;
                case 'http-connection-lost':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Local HTTP connection lost for video');
                    break;
                case 'ws-connection-lost':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Cloud websocket connection lost for video');
                    break;
                case 'ws-connection-ready':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Cloud websocket connection ready for video');
                    break;
                case 'ws-connection-retry':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Cloud websocket connection reconecting for video');
                    break;
                case 'ws-connection-error':
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Cloud websocket connection error', message.data);
                    break;

            }
        }
    
    });
    
    this.websocketProcess.on('disconnected', function () { 
    
    });
    
    this.websocketProcess.send({ name: 'start', source: this.source, url: this.url + '/source/' + encodeURI(this.source.replace('/','\\')), nodeId: bitdogClient.configuration.nodeId, authKey: bitdogClient.configuration.authKey });
    
}

VideoStreamer.prototype.stop = function () {
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Stopping websocket streamer to Bitdog Cloud for ' + this.source);

    if (this.stopping !== true) {
        this.stopping = true;
        
        if (this.ffmpegProcess !== null) {
            this.ffmpegProcess.kill();
            this.ffmpegProcess = null;
        }
        
        this.websocketProcess.send({ name: 'stop' });
    }
};

module.exports = VideoStreamer;