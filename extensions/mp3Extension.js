//-----------------------------------------------------------------------------
//
//	mp3Extension.js
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
//-----------------------------------------------------------------------------


// Extension will inherit functions from ExtensionBase
// Make sure the path to extensionBase is correct 
var ExtensionBase = require('../lib/extensionBase.js');
var util = require('util');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

// Create a class called Extension
function Extension() {
}

// Extension inherits from ExtensionBase
util.inherits(Extension, ExtensionBase);

// Messages from and to this hub will pass through this function. 
// A good spot to watch for Z-Wave messages
Extension.prototype.onMessage = function (message, configuration, logger) {

    // Messages will go through here, check them and do something.
    //logger.log('User', 'Got message and handling', message);

};

// This function will be called once during initialization.
// Setup command and data capture here.
Extension.prototype.onInitialize = function (configuration, logger) {
    var self = this;
    var filePath = path.resolve(path.dirname(__filename), './mp3');
    logger.logProcessEvent('mp3Extension', 'Loading files from file path', filePath);
    var files = fs.readdirSync(filePath);
    logger.logProcessEvent('mp3Extension', 'Found files', files);

    // Create a custom message schema with one string property.
    // add a list of values to the property that are file names
    var playMessageSchema = this.createMessageSchema('Play')
        .addStringProperty('sound', '', { values: files }, 'The file to play','Sound' );


    // Add a command to this hub that plays sound
    this.addCommand('Play Sound', playMessageSchema, function (message, configuration, logger) {
        var soundToPlay = message.sound;
        
        if (typeof soundToPlay !== typeof undefined && soundToPlay !== null && soundToPlay !== '') {
            var fileToPlay = path.resolve(filePath, soundToPlay);
            child_process.spawn('omxplayer', [fileToPlay]);
        }
         
    });


};

// Export your Extension class so it can be loaded by the framework
module.exports = Extension;



