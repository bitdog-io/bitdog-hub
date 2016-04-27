var alarmMode = require('./alarmMode.js');

function Zone() {
    var _name = '';
    var _nodes = [];
    var _zwaveNodes = [];
    var _id = '';
    var _alarmMode = alarmMode.Disarmed;

    this.__defineGetter__("name", function () { return _name; });
    this.__defineSetter__("name", function (value) { _name = value; });
    this.__defineGetter__("id", function () { return _id; });
}

module.exports = Zone;