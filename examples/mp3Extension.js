// Extension will inherit functions from ExtensionBase
// Make sure the path to extensionBase is correct 
var ExtensionBase = require('../lib/extensionBase.js');
var util = require('util');
var child_process = require('child_process');


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

    // Create a custom message schema with one string property.
    var playMessageSchema = this.createMessageSchema('Play')
        .addStringProperty('sound', '');


    // Add a command to this hub that plays sound
    this.addCommand('Play Sound', playMessageSchema, function (message, configuration, logger) {
        var soundToPlay = message.sound;
         
    });


};

// Export your Extension class so it can be loaded by the framework
module.exports = Extension;



