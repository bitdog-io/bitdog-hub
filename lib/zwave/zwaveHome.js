var ZWaveNode = require('./zwaveNode.js');

function ZWaveHome() {
    var _homeId = "";
    var _nodes = [];
    
    this.createNode = function (nodeId) {
        var zwaveNode = new ZWaveNode(nodeId, this.homeId);
        _nodes.push(zwaveNode);

        return zwaveNode;
    };

    this.updateValue = function (zwaveValueInfo) {
        var zwaveNode = getZWaveNode(zwaveValueInfo.node_id);
        return zwaveNode.updateValue(zwaveValueInfo);
    };

    this.removeValue = function (nodeId, commandClassId, instanceId, index) {
        var zwaveNode = getZWaveNode(nodeId);
        zwaveNode.removeValue(commandClassId, instanceId, index);
    };

    this.setNodeInformation = function (nodeId, zwaveNodeInfo) {
        var zwaveNode = getZWaveNode(nodeId);
        
        if (typeof zwaveNode !== typeof undefined)
            zwaveNode.setNodeInformation(zwaveNodeInfo);

        return zwaveNode;
    };
    
    function getZWaveNode(nodeId) {
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id == nodeId)
                return _node[index];
        }
    };

    this.__defineGetter__("homeId", function () { return _homeId; });
    this.__defineGetter__("nodes", function () { return _nodes; });
}

module.exports = ZWaveHome