function ExtensionBase() {


}

ExtensionBase.prototype._bitdogHub = null;

ExtensionBase.prototype.__defineGetter__('bitdogHub', function () { return this._bitdogHub; });

ExtensionBase.prototype.__defineSetter__('bitdogHub', function (value) {
    this._bitdogHub = value;
    this._bitdogHub.on('message', this.processMessage);
});

ExtensionBase.prototype.onInitialize = function (configuration, logger) {
};

ExtensionBase.prototype.processMessage = function (message, configuration, logger) {
    logger.log('User', 'base method called - processMessage');
    this.onMessage(message, configuration, logger);
};

ExtensionBase.prototype.onMessage = function (message, configuration, logger) {
    logger.log('User', 'base method called - onMessage');

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