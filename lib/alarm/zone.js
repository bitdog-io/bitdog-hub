
function Zone() {
    var _label = '';
    var _nodes = [];
    var _zwaveNodes = [];
    var _id = '';

    this.__defineGetter__("label", function () { return _label; });
    this.__defineSetter__("label", function (value) { _label = value; });
    this.__defineGetter__("id", function () { return _id; });
}

module.exports = Zone;