var ZWaveNode = require('./zwaveNode.js');

function ZWaveHome() {
    var _homeId = "";
    var _nodes = [];

    
    this.createNode = function (nodeId) {
        var zwaveNode = new ZWaveNode(nodeId);
        _nodes.push(zwaveNode);

        return zwaveNode;
    };
    
    this.removeNode = function (nodeId) {
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id === nodeId) {
                _nodes.splice(index, 1);
                break;
            }
        }
    };

    this.updateValue = function (nodeId, zwaveValueInfo) {
        var zwaveNode = this.getNode(nodeId);
        return zwaveNode.updateValue(zwaveValueInfo);
    };

    this.removeValue = function (nodeId, commandClassId, instanceId, index) {
        var zwaveNode = this.getNode(nodeId);
        zwaveNode.removeValue(commandClassId, instanceId, index);
    };
    
    this.getValue = function (nodeId, commandClassId, instanceId, indexId) {
        var zwaveNode = this.getNode(nodeId);

        if (zwaveNode != null)
            return zwaveNode.getValue(commandClassId, instanceId, indexId);
        else
            return null;
    }

    this.setNodeInformation = function (nodeId, zwaveNodeInfo, ready) {
        var zwaveNode = this.getNode(nodeId);
        
        if (zwaveNode !== null)
            zwaveNode.setNodeInformation(zwaveNodeInfo,ready);

        return zwaveNode;
    };
    
    this.getNode = function (nodeId) {
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id === nodeId)
                return _nodes[index];
        }

        return null;
    };
    
    this.setNodeStatus = function (nodeId, status) {
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id === nodeId) {
                _nodes[index].status = status;
                break;
            }
        }
    };

    this.__defineGetter__("homeId", function () { return _homeId; });
    this.__defineSetter__("homeId", function (homeId) { _homeId = homeId; });
    this.__defineGetter__("nodes", function () { return _nodes; });
}

module.exports = ZWaveHome