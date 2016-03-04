
function EventProcessor() {

}

EventProcessor.prototype.processMessage = function (message) {
    this.onProcessMessage(message);
}

EventProcessor.prototype.onProcessMessage = function (message) {

}

module.exports.EventProcessor = EventProcessor;