var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');

function Brain() {

}

util.inherits(Brain, EventProcessor);


Brain.prototype.onProcessMessage = function (message) {
   
}

module.exports = new Brain();