var ZWaveNode = require('./zwaveNode.js');

function ZWaveHome() {
    this.homeId = "";
    this.zwaveNodes = {};

    this.createNode = function (nodeId) {
        var zwaveNode = this.zwaveNodes[nodeId] = new ZWaveNode(nodeId, this.homeId);
        return zwaveNode;
    };

    this.updateValue = function (zwaveValueInfo) {
        var zwaveNode = this.zwaveNodes[zwaveValueInfo.node_id];
        
        if (typeof zwaveNode !== typeof undefined)
            return zwaveNode.updateValue(zwaveValueInfo);
        else
            return false;
    };

    this.removeValue = function (nodeId, commandClassId, instanceId, index) {
        var zwaveNode = this.zwaveNodes[nodeId];
        
        if (typeof zwaveNode != typeof undefined) {
            zwaveNode.removeValue(commandClassId, instanceId, index);
        }
    };

    this.setNodeInformation = function (nodeId, zwaveNodeInfo) {
        var zwaveNode = this.zwaveNodes[nodeId];
        
        if (typeof zwaveNode !== typeof undefined)
            zwaveNode.setNodeInformation(zwaveNodeInfo);

        return zwaveNode;
    };
}

module.exports = ZWaveHome