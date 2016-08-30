function ExtensionBase() {
    var _bitdogHub = null;
    var self = this;

    this.__defineGetter__('bitdogHub', function () { return _bitdogHub; });
    this.__defineSetter__('bitdogHub', function (value) {
        _bitdogHub = value;
        _bitdogHub.on('message', function (message, configuration, logger) {
            self.onProcessMessage(message, configuration, logger);
        });
    });
}

ExtensionBase.prototype.onInitialize = function (configuration, logger) {
};

ExtensionBase.prototype.onProcessMessage = function (message, configuration, logger) {
    console.log("base method called - onProcessMessage")
    this.onMessage(message, configuration, logger);
};

ExtensionBase.prototype.onMessage = function (message, configuration, logger) {
    console.log("base method called - onMessage")

};

ExtensionBase.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback) {
    return this.bitdogHub.bitdogClient.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, false);
};

ExtensionBase.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback) {
    return this.bitdogHub.bitdogClient.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, false)
};

ExtensionBase.prototype.createMessageSchema = function (name) {
    return this.bitdogHub.bitdogClient.createMessageSchema(name);
}

module.exports = ExtensionBase;