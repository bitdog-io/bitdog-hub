// Extension will inherit functions from ExtensionBase
// Make sure the path to extensionBase is correct 
var ExtensionBase = require('../lib/extensionBase.js');
var util = require('util');

function Extension() {
}
// Extension inherits from ExtensionBase
util.inherits(Extension, ExtensionBase);

Extension.prototype.onMessage = function (message, configuration, logger) {
};

Extension.prototype.onInitialize = function (configuration, logger) {
};

// Export your Extension class so it can be loaded by the framework
module.exports = Extension;



