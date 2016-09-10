function ZWaveScene(id, label) {
    var _id = id;
    var _label = label;


    this.__defineGetter__("id", function () { return _id; });
    this.__defineGetter__("label", function () { return _label; });
    this.__defineSetter__("label", function (value) { _label = value; });

}

module.exports = ZWaveScene;