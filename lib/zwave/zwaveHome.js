//-----------------------------------------------------------------------------
//
//	zwaveHome.js
//
//	Copyright (c) 2016 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------


var ZWaveNode = require('./zwaveNode.js');

function ZWaveHome() {
    var _homeId = "";
    var _nodes = [];

    
    this.createNode = function (nodeId, zwave) {
        var zwaveNode = new ZWaveNode(nodeId, zwave);
        _nodes.push(zwaveNode);

        return zwaveNode;
    };
    
    this.removeNode = function (nodeId) {
        var zwaveNode = null;
        for (var index = 0; index < _nodes.length; index++) {
            if (_nodes[index].id === nodeId) {
                zwaveNode = _nodes[index];
                _nodes.splice(index, 1);
                break;
            }
        }

        return zwaveNode;
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