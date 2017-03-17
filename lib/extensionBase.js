//-----------------------------------------------------------------------------
//
//	extensionBase.js
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


function ExtensionBase() {


}

ExtensionBase.prototype._bitdogHub = null;

ExtensionBase.prototype.__defineGetter__('bitdogHub', function () { return this._bitdogHub; });

ExtensionBase.prototype.__defineSetter__('bitdogHub', function (value) {
    var self = this;
    this._bitdogHub = value;

    this._bitdogHub.on('message', function (message, configuration, logger) {
        self.processMessage(message, configuration, logger);
    });

    this._bitdogHub.on('system event', function (eventInfo) {
        self.processSystemEvent(eventInfo);
    });
});

ExtensionBase.prototype.onInitialize = function (configuration, logger) {
};

ExtensionBase.prototype.onMessage = function (message, configuration, logger) {
};

ExtensionBase.prototype.onSystemEvent = function (eventInfo) {
};

ExtensionBase.prototype.processMessage = function (message, configuration, logger) {
    this.onMessage(message, configuration, logger);
};

ExtensionBase.prototype.processSystemEvent = function (eventInfo) {
    this.onSystemEvent(eventInfo);
};

ExtensionBase.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback) {
    return this.bitdogHub.bitdogClient.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, false);
};

ExtensionBase.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback) {
    return this.bitdogHub.bitdogClient.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, false);
};

ExtensionBase.prototype.addData = function (name, messageSchema) {
    return this.bitdogHub.bitdogClient.addData(name, messageSchema, false);
};


ExtensionBase.prototype.createMessageSchema = function (name) {
    return this.bitdogHub.bitdogClient.createMessageSchema(name);
};

ExtensionBase.prototype.sendData = function (name, messageSchema, callback) {
    return this.bitdogHub.bitdogClient.sendData(name, messageSchema, callback);
};

ExtensionBase.prototype.sendIFTTTCommand = function (appId, name, callback) {
    return this._bitdogHub.bitdogClient.sendIFTTTCommand(appId, name, callback);
};

module.exports = ExtensionBase;