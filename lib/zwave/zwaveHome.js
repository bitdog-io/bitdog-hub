var ZWaveNode = require('./zwaveNode.js');

function ZWaveHome() {
    var _homeId = "";
    var _nodes = [];
    
    this.createNode = function (nodeId) {
        var zwaveNode = new ZWaveNode(nodeId, _homeId);
        _nodes.push(zwaveNode);

        return zwaveNode;
    };

    this.updateValue = function (nodeId, zwaveValueInfo) {
        var zwaveNode = getZWaveNode(nodeId);
        return zwaveNode.updateValue(zwaveValueInfo);
    };

    this.removeValue = function (nodeId, commandClassId, instanceId, index) {
        var zwaveNode = getZWaveNode(nodeId);
        zwaveNode.removeValue(commandClassId, instanceId, index);
    };

    this.setNodeInformation = function (nodeId, zwaveNodeInfo) {
        var zwaveNode = getZWaveNode(nodeId);
        
        if (zwaveNode !== null)
            zwaveNode.setNodeInformation(zwaveNodeInfo);

        return zwaveNode;
    };
    
    function getZWaveNode(nodeId) {
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id === nodeId)
                return _nodes[index];
        }

        return null;
    };

    this.__defineGetter__("homeId", function () { return _homeId; });
    this.__defineSetter__("homeId", function (homeId) { _homeId = homeId; });
    this.__defineGetter__("nodes", function () { return _nodes; });
}

module.exports = ZWaveHome